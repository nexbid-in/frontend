import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createWidget, type Widget } from "openalgo-charts/widget";
import type { Bar } from "openalgo-charts";
import { registeredIndicators } from "openalgo-charts";
import "openalgo-charts/indicators";
import "openalgo-charts/draw";
import { useAppSelector } from "@/store/hooks";
import {
    NexbidOpenAlgoDataFeed,
    type TickListener,
    type DataFeedStatus,
} from "../services/openAlgoDatafeed";
import { formatINR, getStockMarketQuote } from "../utils/stockPriceHelper";
import { registerCustomDrawingTools } from "../utils/customDrawingTools";

// Register enhanced right-aligned horizontal line & ray price badges
registerCustomDrawingTools();

/**
 * Format volume in standard Fyers / TradingView compact style:
 * - >= 1 Billion: 1.25B
 * - >= 1 Million: 27.74M
 * - >= 1 Thousand: 520.15K
 * - < 1000: 450
 */
function formatFyersVolume(val: number): string {
    if (!Number.isFinite(val)) return "";
    const abs = Math.abs(val);
    if (abs >= 1e9) return (val / 1e9).toFixed(2) + "B";
    if (abs >= 1e6) return (val / 1e6).toFixed(2) + "M";
    if (abs >= 1e3) return (val / 1e3).toFixed(2) + "K";
    return Math.round(val).toString();
}

// Patch built-in OpenAlgo Volume indicator descriptor so both the legend (e.g. "Volume 20 27.74M")
// and the volume pane Y-axis use the compact Fyers / TradingView format
const volumeIndicatorDef = registeredIndicators().find((ind) => ind.id === "volume");
if (volumeIndicatorDef) {
    volumeIndicatorDef.plots.forEach((plot) => {
        plot.priceFormat = {
            type: "custom",
            formatter: formatFyersVolume,
        };
    });
}

export type { TickListener };

export interface StockChartProps {
    symbol: string;
    exchange?: string;
    stockName?: string;
    isTradable?: boolean;
    stockType?: string;
    onPriceTick?: TickListener;
    onSymbolChange?: (symbol: string, exchange?: string) => void;
    onBuy?: () => void;
    onSell?: () => void;
}

function formatPrice(num: number): string {
    return num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/**
 * Uniform 2-decimal price formatter (0.00 format) for OpenAlgo price scales,
 * crosshairs, horizontal lines, and price badges (matching Fyers & TradingView).
 */
function standardPriceFormatter(price: number): string {
    if (!Number.isFinite(price)) return "";
    return price.toFixed(2);
}

/**
 * Enforce formatters on chart price scales:
 * 1. Primary stock candle scale (Pane 0) strictly gets 2-decimal format (e.g. 23,810.85).
 * 2. Volume indicator pane and its scales strictly get compact Fyers format (e.g. 27.74M).
 */
function enforceChartPriceFormatters(widget: Widget | null): void {
    if (!widget || !widget.chart) return;
    try {
        const chartAny = widget.chart as unknown as {
            panes?: () => Array<{
                priceScale?: { setPriceFormatter: (fn: (v: number) => string) => void };
                scales?: () => Array<{ setPriceFormatter: (fn: (v: number) => string) => void }>;
            }>;
            indicators?: () => Array<{ indicatorId?: string; paneIndex?: number }>;
            primarySeries?: () => {
                priceScale?: () => { setPriceFormatter: (fn: (v: number) => string) => void };
            } | null;
        };

        const panes = chartAny.panes?.() || [];

        // 1. Enforce 0.00 price format strictly on primary stock candle price scale (Pane 0)
        if (panes[0]?.priceScale) {
            panes[0].priceScale.setPriceFormatter(standardPriceFormatter);
            if (panes[0].scales) {
                for (const s of panes[0].scales()) {
                    s.setPriceFormatter(standardPriceFormatter);
                }
            }
        }
        chartAny.primarySeries?.()?.priceScale?.()?.setPriceFormatter(standardPriceFormatter);

        // 2. Enforce compact Fyers volume format on volume indicator pane and scales
        const indicators = chartAny.indicators?.() || [];
        for (const ind of indicators) {
            if (ind.indicatorId === "volume" && typeof ind.paneIndex === "number") {
                const volPane = panes[ind.paneIndex];
                if (volPane) {
                    volPane.priceScale?.setPriceFormatter(formatFyersVolume);
                    if (volPane.scales) {
                        for (const s of volPane.scales()) {
                            s.setPriceFormatter(formatFyersVolume);
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.warn("[StockChart] Error enforcing chart price formatters:", e);
    }
}

/**
 * Production-ready TradingView-style financial charting terminal powered by OpenAlgo Charts.
 * - Out-of-the-box topbar, left drawing rail (87 tools), 112 indicators, bottom timezone & range bar
 * - Top-left TradingView-style interactive legend with dynamic OHLCV & real-time crosshair inspection
 * - On-chart quick Buy / Sell floating trading widget matching TradingView layout
 * - Bottom statusline disabled to keep the canvas clean and distraction-free
 * - Fullscreen toggle button matching Fyers / TradingView topbar layout ([Settings] [Fullscreen] [Camera])
 * - Automatic IndexedDB layout & drawing persistence
 */
export const StockChart: React.FC<StockChartProps> = ({
    symbol,
    exchange = "NSE",
    stockName,
    isTradable = true,
    stockType,
    onPriceTick,
    onSymbolChange,
    onBuy,
    onSell,
}) => {
    const outerContainerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<Widget | null>(null);
    const datafeedRef = useRef<NexbidOpenAlgoDataFeed | null>(null);

    const theme = useAppSelector((state) => state.ui.theme);
    const isDark = theme !== "light";
    const isDarkRef = useRef(isDark);
    useEffect(() => {
        isDarkRef.current = isDark;
    }, [isDark]);

    const userId = useAppSelector((state) => state.auth.user?.id);

    // Keep active symbol tracked
    const activeSymbolRef = useRef(symbol.toUpperCase());
    const activeExchangeRef = useRef(exchange.toUpperCase());

    // Interactive bar & crosshair states
    const [hoverBar, setHoverBar] = useState<Bar | null>(null);
    const [latestBar, setLatestBar] = useState<Bar | null>(null);
    const [activeInterval, setActiveInterval] = useState<string>("15m");

    // Production loading & error state management (Zerodha / Fyers style)
    const [isChartLoading, setIsChartLoading] = useState<boolean>(true);
    const [chartError, setChartError] = useState<string | null>(null);
    const [isStaleData, setIsStaleData] = useState<boolean>(false);
    const [isChartEmpty, setIsChartEmpty] = useState<boolean>(false);
    const [isRetrying, setIsRetrying] = useState<boolean>(false);
    const isRetryingRef = useRef<boolean>(false);

    // Fullscreen state management & topbar Portal target
    const [topbarElement, setTopbarElement] = useState<HTMLElement | null>(null);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [isFallbackMaximized, setIsFallbackMaximized] = useState<boolean>(false);
    const isMaximized = isFullscreen || isFallbackMaximized;

    // Adjust bar & loading states during render when symbol prop changes
    const [prevSymbol, setPrevSymbol] = useState(symbol);
    if (prevSymbol !== symbol) {
        setPrevSymbol(symbol);
        setHoverBar(null);
        setLatestBar(null);
        setIsChartLoading(true);
        setChartError(null);
        setIsStaleData(false);
        setIsChartEmpty(false);
        setIsRetrying(false);
    }

    // Reset retry ref whenever active symbol changes
    useEffect(() => {
        isRetryingRef.current = false;
    }, [symbol]);

    // Keep callbacks updated on datafeed instance
    const onPriceTickRef = useRef(onPriceTick);
    useEffect(() => {
        onPriceTickRef.current = onPriceTick;
        if (datafeedRef.current) {
            datafeedRef.current.setOnTickCallback(onPriceTick);
        }
    }, [onPriceTick]);

    const onSymbolChangeRef = useRef(onSymbolChange);
    useEffect(() => {
        onSymbolChangeRef.current = onSymbolChange;
    }, [onSymbolChange]);

    // ==========================================
    // Fullscreen Toggle & Event Synchronization
    // ==========================================
    const getFullscreenElement = (): Element | null => {
        const doc = document as unknown as {
            fullscreenElement?: Element | null;
            webkitFullscreenElement?: Element | null;
            mozFullScreenElement?: Element | null;
            msFullscreenElement?: Element | null;
        };
        return (
            doc.fullscreenElement ||
            doc.webkitFullscreenElement ||
            doc.mozFullScreenElement ||
            doc.msFullscreenElement ||
            null
        );
    };

    const toggleFullscreen = useCallback(async () => {
        const el = outerContainerRef.current;
        if (!el) return;

        // 1. If currently in CSS fallback maximization, exit fallback
        if (isFallbackMaximized) {
            setIsFallbackMaximized(false);
            requestAnimationFrame(() => {
                window.dispatchEvent(new Event("resize"));
            });
            return;
        }

        // 2. If currently in native fullscreen, exit native fullscreen
        const fsElement = getFullscreenElement();
        if (fsElement) {
            try {
                const doc = document as unknown as {
                    exitFullscreen?: () => Promise<void>;
                    webkitExitFullscreen?: () => Promise<void>;
                    mozCancelFullScreen?: () => Promise<void>;
                    msExitFullscreen?: () => Promise<void>;
                };
                if (doc.exitFullscreen) {
                    await doc.exitFullscreen();
                } else if (doc.webkitExitFullscreen) {
                    await doc.webkitExitFullscreen();
                } else if (doc.mozCancelFullScreen) {
                    await doc.mozCancelFullScreen();
                } else if (doc.msExitFullscreen) {
                    await doc.msExitFullscreen();
                }
            } catch (err) {
                console.warn("[StockChart] Error exiting native fullscreen:", err);
                setIsFullscreen(false);
            }
            return;
        }

        // 3. Otherwise enter fullscreen (try HTML5 Fullscreen API first, fallback to viewport maximization)
        try {
            const elWithPrefix = el as unknown as {
                requestFullscreen?: () => Promise<void>;
                webkitRequestFullscreen?: () => Promise<void>;
                mozRequestFullScreen?: () => Promise<void>;
                msRequestFullscreen?: () => Promise<void>;
            };

            if (elWithPrefix.requestFullscreen) {
                await elWithPrefix.requestFullscreen();
            } else if (elWithPrefix.webkitRequestFullscreen) {
                await elWithPrefix.webkitRequestFullscreen();
            } else if (elWithPrefix.mozRequestFullScreen) {
                await elWithPrefix.mozRequestFullScreen();
            } else if (elWithPrefix.msRequestFullscreen) {
                await elWithPrefix.msRequestFullscreen();
            } else {
                setIsFallbackMaximized(true);
            }
        } catch (err) {
            console.info("[StockChart] Native fullscreen unavailable/denied, falling back to viewport maximization:", err);
            setIsFallbackMaximized(true);
        }
    }, [isFallbackMaximized]);

    // Sync native fullscreen state changes (Esc key, browser back, F11, etc.)
    useEffect(() => {
        const handleFullscreenChange = () => {
            const fsEl = getFullscreenElement();
            const active = fsEl === outerContainerRef.current;
            setIsFullscreen(active);
            requestAnimationFrame(() => {
                window.dispatchEvent(new Event("resize"));
                setTimeout(() => {
                    window.dispatchEvent(new Event("resize"));
                }, 150);
            });
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
        document.addEventListener("mozfullscreenchange", handleFullscreenChange);
        document.addEventListener("MSFullscreenChange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
            document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
            document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
        };
    }, []);

    // Handle fallback maximization: Escape key to exit & lock background body scroll
    useEffect(() => {
        if (!isFallbackMaximized) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsFallbackMaximized(false);
                requestAnimationFrame(() => {
                    window.dispatchEvent(new Event("resize"));
                });
            }
        };

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);
        requestAnimationFrame(() => {
            window.dispatchEvent(new Event("resize"));
        });

        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener("keydown", handleKeyDown);
            requestAnimationFrame(() => {
                window.dispatchEvent(new Event("resize"));
            });
        };
    }, [isFallbackMaximized]);

    // Keyboard shortcut: Alt+F or Shift+F to toggle fullscreen (matching TradingView)
    useEffect(() => {
        const handleGlobalShortcuts = (e: KeyboardEvent) => {
            const isTargetEditable =
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target instanceof HTMLElement && e.target.isContentEditable);

            if (!isTargetEditable && (e.altKey || e.shiftKey) && (e.key === "f" || e.key === "F")) {
                e.preventDefault();
                toggleFullscreen();
            }
        };

        window.addEventListener("keydown", handleGlobalShortcuts);
        return () => {
            window.removeEventListener("keydown", handleGlobalShortcuts);
        };
    }, [toggleFullscreen]);

    // Watchdog timeout: Show clean error with retry option if request hangs (>12s)
    useEffect(() => {
        if (!isChartLoading) return;
        const timer = window.setTimeout(() => {
            if (isChartLoading) {
                setIsChartLoading(false);
                setChartError(
                    "Market data request timed out. Please check your connection and retry."
                );
            }
        }, 12000);
        return () => window.clearTimeout(timer);
    }, [isChartLoading, symbol]);

    // Retry callback for user to re-trigger chart loading on error or timeout without UI flicker
    const handleRetry = useCallback(() => {
        if (isRetryingRef.current) return;
        isRetryingRef.current = true;
        setIsRetrying(true);
        const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 500));

        if (datafeedRef.current) {
            datafeedRef.current.clearCache(activeSymbolRef.current);
        }
        if (widgetRef.current) {
            try {
                const w = widgetRef.current as Widget & { reload?: () => Promise<void> };
                if (typeof w.reload === "function") {
                    Promise.allSettled([w.reload(), minDelayPromise]).finally(() => {
                        isRetryingRef.current = false;
                        setIsRetrying(false);
                    });
                } else {
                    w.setSymbol(activeSymbolRef.current, activeExchangeRef.current);
                    minDelayPromise.then(() => {
                        isRetryingRef.current = false;
                        setIsRetrying(false);
                    });
                }
                enforceChartPriceFormatters(widgetRef.current);
            } catch (err) {
                console.warn("[StockChart] Error retrying chart load:", err);
                minDelayPromise.then(() => {
                    isRetryingRef.current = false;
                    setIsRetrying(false);
                });
            }
        } else {
            minDelayPromise.then(() => {
                isRetryingRef.current = false;
                setIsRetrying(false);
            });
        }
    }, []);

    // ==========================================
    // 1. Initialize Widget on Mount
    // ==========================================
    useEffect(() => {
        let isCancelled = false;
        let animationFrameId: number | null = null;

        const initChart = () => {
            const container = containerRef.current;
            if (!container || isCancelled) return;

            // Edge Case: Container has not yet measured dimensions (e.g. during initial layout compute)
            if (container.clientWidth === 0 || container.clientHeight === 0) {
                animationFrameId = requestAnimationFrame(initChart);
                return;
            }

            // Cleanup any preexisting widget/DOM nodes from React StrictMode double invocation
            if (widgetRef.current) {
                try {
                    widgetRef.current.destroy();
                } catch (e) {
                    console.warn("[StockChart] Previous widget destroy notice:", e);
                }
                widgetRef.current = null;
            }
            container.replaceChildren();

            // Create shared DataFeed instance
            const feed = new NexbidOpenAlgoDataFeed(onPriceTickRef.current);
            feed.setOnBarListener((bar) => {
                setLatestBar(bar);
            });
            feed.setOnStatusListener((status: DataFeedStatus) => {
                if (status.symbol === activeSymbolRef.current) {
                    if (status.isLoading) {
                        // If retry is in flight, do NOT clear existing chartError to keep Error Card rock-solid
                        if (!isRetryingRef.current) {
                            setIsChartLoading(true);
                            setChartError(null);
                        }
                        return;
                    }

                    // Request finished (success or failure)
                    setIsChartLoading(false);
                    setChartError(status.error);
                    setIsStaleData(Boolean(status.isStale));
                    setIsChartEmpty(!status.error && status.barCount === 0);
                    if (!status.error) {
                        enforceChartPriceFormatters(widgetRef.current);
                    }
                }
            });
            datafeedRef.current = feed;

            // Create full OpenAlgo Trading Terminal Widget
            try {
                const widget = createWidget(container, {
                    feed,
                    symbol: activeSymbolRef.current,
                    exchange: activeExchangeRef.current,
                    interval: "15m",
                    lookbackBars: 2500,
                    theme: isDarkRef.current ? "dark" : "light",
                    timezone: "Asia/Kolkata", // Native Indian Standard Time (IST)
                    branding: false, // Hide OpenAlgo corner watermark logo
                    persist: userId ? `nexbid-${userId}` : "nexbid-guest",
                    mobile: "auto",
                    topbar: true,
                    rail: true,
                    bottombar: true,
                    statusline: false, // 👈 Disabled: removed bottom status line showing O, H, L, C, Vol
                    panels: false, // Disable docked Objects and Data panels
                    indicators: true,
                    typingNavigation: false, // Disable keyboard jumping to symbol search
                    priceFormatter: standardPriceFormatter, // Enforce standard 0.00 format on initial load
                    priceScale: {
                        minPrecision: 2,
                        minMove: 0.05,
                    },
                });

                // Enforce 0.00 price format strictly on primary stock scale, and Fyers volume on volume pane
                enforceChartPriceFormatters(widget);

                widgetRef.current = widget;

                // Capture .oac-topbar for React Portal fullscreen button mounting
                const topbar = container.querySelector<HTMLElement>(".oac-topbar");
                if (topbar) {
                    // OpenAlgo native order: Camera is appended first, then Settings is appended.
                    // In TradingView & Fyers: Settings -> Fullscreen -> Camera.
                    // We visually order them with flex order: Settings (90), Fullscreen (91), Camera (92).
                    const iconButtons = topbar.querySelectorAll<HTMLElement>(".oac-btn--icon");
                    iconButtons.forEach((btn) => {
                        const title = (btn.getAttribute("title") || btn.getAttribute("aria-label") || "").toLowerCase();
                        const innerHTML = btn.innerHTML.toLowerCase();
                        if (title.includes("settings") || innerHTML.includes("settings")) {
                            btn.style.order = "90";
                        } else if (title.includes("capture") || innerHTML.includes("camera") || innerHTML.includes("capture")) {
                            btn.style.order = "92";
                        }
                    });
                    setTopbarElement(topbar);
                }

                // Sync symbol if user picks a new symbol via widget topbar search
                widget.on("symbol", (ev) => {
                    if (ev && typeof ev.symbol === "string") {
                        const newSym = ev.symbol.toUpperCase();
                        const newExch = typeof ev.exchange === "string" ? ev.exchange.toUpperCase() : "NSE";
                        activeSymbolRef.current = newSym;
                        activeExchangeRef.current = newExch;
                        setHoverBar(null);
                        setLatestBar(null);
                        setIsChartLoading(true);
                        setChartError(null);
                        setIsStaleData(false);
                        setIsChartEmpty(false);
                        setIsRetrying(false);
                        isRetryingRef.current = false;
                        enforceChartPriceFormatters(widget);
                        onSymbolChangeRef.current?.(newSym, newExch);
                    }
                });

                // Sync active interval when user switches timeframe (e.g. 5m, 15m, 1h, D)
                widget.on("interval", (ev) => {
                    if (ev && typeof ev.interval === "string") {
                        setActiveInterval(ev.interval);
                    }
                });

                // Track crosshair position for TradingView-style top-left OHLC live readout
                widget.chart.on("crosshair:move", (ev) => {
                    if (ev && ev.bar) {
                        setHoverBar(ev.bar);
                    } else {
                        setHoverBar(null);
                    }
                });
            } catch (err) {
                console.error("[StockChart] Failed to initialize OpenAlgo widget:", err);
            }
        };

        // Trigger initialization
        initChart();

        // Teardown on unmount
        return () => {
            isCancelled = true;
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
            }

            setTopbarElement(null);

            if (widgetRef.current) {
                try {
                    widgetRef.current.destroy();
                } catch (e) {
                    console.warn("[StockChart] Error on unmount widget destroy:", e);
                }
                widgetRef.current = null;
            }

            if (datafeedRef.current) {
                datafeedRef.current.destroy();
                datafeedRef.current = null;
            }
        };
    }, [userId]); // Re-create widget if authenticated user changes

    // ==========================================
    // 2. React to Symbol / Exchange Changes
    // ==========================================
    useEffect(() => {
        const sym = symbol.toUpperCase().trim();
        const exch = (exchange || "NSE").toUpperCase().trim();

        if (
            widgetRef.current &&
            (activeSymbolRef.current !== sym || activeExchangeRef.current !== exch)
        ) {
            activeSymbolRef.current = sym;
            activeExchangeRef.current = exch;
            try {
                widgetRef.current.setSymbol(sym, exch);
                enforceChartPriceFormatters(widgetRef.current);
            } catch (err) {
                console.warn("[StockChart] Error calling setSymbol on widget:", err);
            }
        }
    }, [symbol, exchange]);

    // ==========================================
    // 3. React to Theme Changes (Light / Dark)
    // ==========================================
    useEffect(() => {
        if (widgetRef.current) {
            try {
                widgetRef.current.setTheme(isDark ? "dark" : "light");
            } catch (err) {
                console.warn("[StockChart] Error switching theme on widget:", err);
            }
        }
    }, [isDark]);

    // ==========================================
    // Calculate Active Candle Data for Overlay & Trade Buttons
    // ==========================================
    const fallbackQuote = getStockMarketQuote(symbol);

    // Live market price / last traded price (LTP) strictly for BUY & SELL execution buttons.
    // When chart is empty or in hard error with no data, price is null to avoid deceptive fake quotes.
    const currentMarketPrice = latestBar
        ? latestBar.close
        : isChartEmpty || chartError
        ? null
        : fallbackQuote.price;

    // Crosshair hover bar or latest bar for top-left OHLC historical inspection readout
    const activeBar = hoverBar || latestBar;

    const openVal = activeBar ? activeBar.open : null;
    const highVal = activeBar ? activeBar.high : null;
    const lowVal = activeBar ? activeBar.low : null;
    const closeVal = activeBar ? activeBar.close : null;

    const diff = activeBar && openVal !== null && closeVal !== null ? closeVal - openVal : null;
    const diffPercent = activeBar && openVal && diff !== null
        ? (diff / openVal) * 100
        : null;
    const isUp = (diff ?? 0) >= 0;
    const valueColor = isUp ? "text-[#22c55e]" : "text-[#ef4444]";

    const canTrade = stockType !== "INDEX" && isTradable;

    return (
        <div
            ref={outerContainerRef}
            className={`w-full h-full min-h-[450px] relative overflow-hidden select-none transition-colors ${
                isDark ? "bg-[#131722]" : "bg-[#ffffff]"
            } ${isFallbackMaximized ? "!fixed !inset-0 !z-[9999] !w-screen !h-screen !m-0 !p-0" : ""}`}
            style={{ width: "100%", height: "100%" }}
        >
            {/* Chart mount container strictly dedicated for OpenAlgo widget */}
            <div
                ref={containerRef}
                className="w-full h-full"
                style={{ width: "100%", height: "100%" }}
            />

            {/* Zerodha & Fyers Production Loading / Error Fallback Overlay */}
            {(isChartLoading || chartError) && (
                <div
                    className={`absolute inset-0 z-40 flex items-center justify-center select-none backdrop-blur-xs transition-colors duration-150 ${
                        isDark ? "bg-[#131722]/90" : "bg-white/90"
                    }`}
                >
                    {isChartLoading && !chartError ? (
                        /* Minimalist clean spinner only on initial load (TradingView & Fyers style) */
                        <div className="relative w-10 h-10 flex items-center justify-center animate-in fade-in duration-150">
                            <div className="w-10 h-10 rounded-full border-3 border-emerald-500/20" />
                            <div className="absolute inset-0 w-10 h-10 rounded-full border-3 border-transparent border-t-emerald-500 animate-spin" />
                        </div>
                    ) : (
                        <div
                            className={`flex flex-col items-center justify-center p-6 rounded-2xl border shadow-2xl max-w-sm w-full mx-4 text-center ${
                                isDark
                                    ? "bg-[#1e222d] border-white/10 text-white"
                                    : "bg-white border-gray-200 text-gray-900"
                            }`}
                        >
                            {/* Alert/Warning Icon */}
                            <div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-3">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            </div>

                            <h3 className="text-sm font-semibold mb-1">Unable to Load Chart</h3>
                            <p className="text-xs text-[#787b86] mb-4 leading-relaxed">
                                {chartError || "Failed to retrieve market candles for this stock."}
                            </p>

                            <button
                                type="button"
                                disabled={isRetrying}
                                onClick={handleRetry}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-75 disabled:cursor-wait active:scale-95 transition-all shadow-md cursor-pointer"
                            >
                                {isRetrying ? (
                                    <>
                                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Retrying...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                                        </svg>
                                        <span>Retry Loading</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Centered Intentional Empty State (When stock genuinely has 0 candles) */}
            {isChartEmpty && !isChartLoading && !chartError && (
                <div className="absolute inset-0 z-30 flex items-center justify-center select-none pointer-events-none">
                    <div
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border shadow-xl max-w-sm w-full mx-4 text-center pointer-events-auto animate-in fade-in zoom-in-95 duration-150 ${
                            isDark
                                ? "bg-[#1e222d]/95 border-white/10 text-white"
                                : "bg-white/95 border-gray-200 text-gray-900"
                        }`}
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="20" x2="18" y2="10" />
                                <line x1="12" y1="20" x2="12" y2="4" />
                                <line x1="6" y1="20" x2="6" y2="14" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-semibold mb-1">No Trading Data for {symbol}</h3>
                        <p className="text-xs text-[#787b86] mb-2 leading-relaxed">
                            There are no historical trades recorded for the {activeInterval} timeframe.
                        </p>
                        <p className="text-[11px] text-[#787b86]/80 mb-4">
                            Try switching to a higher timeframe like 1D or check another symbol.
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    if (widgetRef.current) {
                                        widgetRef.current.setInterval("1D");
                                        setActiveInterval("1D");
                                    }
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-md cursor-pointer"
                            >
                                <span>Switch to 1D</span>
                            </button>
                            <button
                                type="button"
                                disabled={isRetrying}
                                onClick={handleRetry}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#787b86] hover:text-white bg-white/5 hover:bg-white/10 disabled:opacity-60 disabled:cursor-wait active:scale-95 transition-all cursor-pointer"
                            >
                                {isRetrying ? (
                                    <>
                                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Checking...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                                        </svg>
                                        <span>Check Again</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Topbar Fullscreen Button Portal (TradingView & Fyers layout) */}
            {topbarElement &&
                createPortal(
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="oac-btn oac-btn--icon flex items-center justify-center cursor-pointer transition-colors"
                        style={{ order: 91 }}
                        title={
                            isMaximized
                                ? "Exit Fullscreen (Esc)"
                                : "Fullscreen mode (Alt+F)"
                        }
                        aria-label={
                            isMaximized ? "Exit Fullscreen" : "Fullscreen mode"
                        }
                    >
                        <span
                            className="oac-glyph oac-glyph--chrome flex items-center justify-center"
                            aria-hidden="true"
                        >
                            {isMaximized ? (
                                <svg
                                    className="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                                    <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                                    <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                                    <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                                </svg>
                            ) : (
                                <svg
                                    className="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M3 8V5a2 2 0 0 1 2-2h3" />
                                    <path d="M16 3h3a2 2 0 0 1 2 2v3" />
                                    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                                    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                                </svg>
                            )}
                        </span>
                    </button>,
                    topbarElement
                )}

            {/* ======================================================== */}
            {/* TradingView Top-Left Floating Info & Quick Trading Bar   */}
            {/* ======================================================== */}
            <div
                className="absolute top-[48px] left-[52px] pointer-events-none flex flex-col gap-1.5 select-none font-sans drop-shadow-md"
                style={{ zIndex: 35 }}
            >
                {/* 1. Header Line: Title, Interval, Exchange, Badge & OHLC */}
                <div className="flex items-center gap-2.5 flex-wrap text-sm">
                    {/* Symbol / Stock Identity */}
                    <div className="flex items-center gap-1.5 font-bold tracking-tight">
                        <span className={`truncate max-w-[380px] text-sm font-bold ${isDark ? "text-[#d1d4dc]" : "text-[#131722]"}`}>
                            {stockName || symbol}
                        </span>
                        <span className="text-[#787b86] font-normal text-sm">·</span>
                        <span className="font-mono text-[#787b86] font-semibold text-[13px]">
                            {activeInterval}
                        </span>
                        <span className="text-[#787b86] font-normal text-sm">·</span>
                        <span className="text-[#787b86] font-mono font-medium uppercase text-[13px]">
                            {exchange}
                        </span>
                        {/* Fyers Market Status Dash Icon */}
                        <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                                isDark ? "bg-[#2a2e39]" : "bg-[#e0e3eb]"
                            }`}
                            title="Market Status"
                        >
                            <span
                                className={`w-2 h-[3px] rounded-full ${
                                    isDark ? "bg-[#9598a1]" : "bg-[#787b86]"
                                }`}
                            />
                        </span>

                        {/* Stale / Offline Mode Badge */}
                        {isStaleData && (
                            <div
                                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 border border-amber-500/25 text-amber-400 select-none animate-in fade-in"
                                title="Market data feed is temporarily unreachable. Displaying cached historical candles."
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                <span>Cached (Offline)</span>
                            </div>
                        )}
                    </div>

                    {/* OHLC and Change Values (TradingView Format) */}
                    <div className="flex items-center gap-2.5 font-mono text-[13px] tabular-nums tracking-tight">
                        <div className="flex items-center gap-0.5">
                            <span className="text-[#787b86] text-[12px] font-sans font-medium">O</span>
                            <span className={openVal !== null ? valueColor : "text-[#787b86]"}>
                                {openVal !== null ? formatPrice(openVal) : "—"}
                            </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <span className="text-[#787b86] text-[12px] font-sans font-medium">H</span>
                            <span className={highVal !== null ? valueColor : "text-[#787b86]"}>
                                {highVal !== null ? formatPrice(highVal) : "—"}
                            </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <span className="text-[#787b86] text-[12px] font-sans font-medium">L</span>
                            <span className={lowVal !== null ? valueColor : "text-[#787b86]"}>
                                {lowVal !== null ? formatPrice(lowVal) : "—"}
                            </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <span className="text-[#787b86] text-[12px] font-sans font-medium">C</span>
                            <span className={closeVal !== null ? valueColor : "text-[#787b86]"}>
                                {closeVal !== null ? formatPrice(closeVal) : "—"}
                            </span>
                        </div>
                        {diff !== null && diffPercent !== null && (
                            <div className={`font-semibold ${valueColor}`}>
                                {isUp ? `+${diff.toFixed(2)}` : diff.toFixed(2)}{" "}
                                ({isUp ? `+${diffPercent.toFixed(2)}%` : `${diffPercent.toFixed(2)}%`})
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Quick Trading Buttons (Sell / Spread / Buy) */}
                {canTrade && (
                    <div className="pointer-events-auto flex items-center gap-2 mt-0.5">
                        {/* SELL Button (Matching Topbar Red-Orange Color) */}
                        <button
                            type="button"
                            disabled={currentMarketPrice === null}
                            onClick={onSell}
                            title={currentMarketPrice === null ? "Market data unavailable" : `Sell ${symbol}`}
                            className={`flex flex-col items-center justify-center px-3 py-1 min-w-[76px] rounded-md border border-[#c83200] bg-[#c83200]/10 hover:bg-[#c83200]/20 active:scale-95 transition-all shadow-xs group ${
                                currentMarketPrice === null ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                            }`}
                        >
                            <span className="font-mono text-xs font-bold text-[#c83200] group-hover:brightness-110">
                                {currentMarketPrice !== null ? formatINR(currentMarketPrice) : "₹ —"}
                            </span>
                            <span className="text-[10px] font-bold text-[#c83200] tracking-wider">
                                SELL
                            </span>
                        </button>

                        {/* Bid-Ask Spread between SELL and BUY (Fyers Style) */}
                        <span
                            className="font-mono text-xs font-semibold text-[#787b86] px-0.5 select-none"
                            title="Bid-Ask Spread"
                        >
                            0.00
                        </span>

                        {/* BUY Button (Matching Topbar Green Color) */}
                        <button
                            type="button"
                            disabled={currentMarketPrice === null}
                            onClick={onBuy}
                            title={currentMarketPrice === null ? "Market data unavailable" : `Buy ${symbol}`}
                            className={`flex flex-col items-center justify-center px-3 py-1 min-w-[76px] rounded-md border border-[#00873e] bg-[#00873e]/10 hover:bg-[#00873e]/20 active:scale-95 transition-all shadow-xs group ${
                                currentMarketPrice === null ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                            }`}
                        >
                            <span className="font-mono text-xs font-bold text-[#00873e] group-hover:brightness-110">
                                {currentMarketPrice !== null ? formatINR(currentMarketPrice) : "₹ —"}
                            </span>
                            <span className="text-[10px] font-bold text-[#00873e] tracking-wider">
                                BUY
                            </span>
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};
