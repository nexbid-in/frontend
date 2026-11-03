import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createWidget, type Widget } from "openalgo-charts/widget";
import type { Bar } from "openalgo-charts";
import "openalgo-charts/indicators";
import "openalgo-charts/draw";
import { useAppSelector } from "@/store/hooks";
import {
    NexbidOpenAlgoDataFeed,
    type TickListener,
} from "../services/openAlgoDatafeed";
import { formatINR, getStockMarketQuote } from "../utils/stockPriceHelper";
import { registerCustomDrawingTools } from "../utils/customDrawingTools";

// Register enhanced right-aligned horizontal line & ray price badges
registerCustomDrawingTools();

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

function formatVolume(vol?: number): string {
    if (!vol || vol <= 0) return "0";
    if (vol >= 10_000_000) return `${(vol / 10_000_000).toFixed(2)}Cr`;
    if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(2)}M`;
    if (vol >= 1_000) return `${(vol / 1_000).toFixed(2)}K`;
    return vol.toLocaleString("en-IN");
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
    const [isVolOpen, setIsVolOpen] = useState<boolean>(true);

    // Fullscreen state management & topbar Portal target
    const [topbarElement, setTopbarElement] = useState<HTMLElement | null>(null);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [isFallbackMaximized, setIsFallbackMaximized] = useState<boolean>(false);
    const isMaximized = isFullscreen || isFallbackMaximized;

    // Adjust bar states during render when symbol prop changes
    const [prevSymbol, setPrevSymbol] = useState(symbol);
    if (prevSymbol !== symbol) {
        setPrevSymbol(symbol);
        setHoverBar(null);
        setLatestBar(null);
    }

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
            datafeedRef.current = feed;

            // Create full OpenAlgo Trading Terminal Widget
            try {
                const widget = createWidget(container, {
                    feed,
                    symbol: activeSymbolRef.current,
                    exchange: activeExchangeRef.current,
                    interval: "15m",
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
                    priceFormatter: standardPriceFormatter,
                    priceScale: {
                        minPrecision: 2,
                        minMove: 0.05,
                    },
                });

                // Enforce 0.00 price format across price scales, crosshairs & badges
                try {
                    widget.chart.setPriceFormatter(standardPriceFormatter);
                } catch (e) {
                    console.warn("[StockChart] Error attaching price formatter:", e);
                }

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
                        try {
                            widget.chart.setPriceFormatter(standardPriceFormatter);
                        } catch {
                            // ignore
                        }
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
                widgetRef.current.chart.setPriceFormatter(standardPriceFormatter);
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
    // Must NEVER change when the user moves the crosshair over historical candles.
    const currentMarketPrice = latestBar ? latestBar.close : fallbackQuote.price;

    // Crosshair hover bar or latest bar for top-left OHLC historical inspection readout
    const activeBar = hoverBar || latestBar;

    const openVal = activeBar ? activeBar.open : fallbackQuote.price;
    const highVal = activeBar ? activeBar.high : fallbackQuote.price;
    const lowVal = activeBar ? activeBar.low : fallbackQuote.price;
    const closeVal = activeBar ? activeBar.close : fallbackQuote.price;
    const volumeVal = activeBar?.volume ?? 0;

    const diff = activeBar ? closeVal - openVal : fallbackQuote.change;
    const diffPercent = activeBar
        ? openVal > 0
            ? (diff / openVal) * 100
            : 0
        : fallbackQuote.changePercent;
    const isUp = diff >= 0;
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
                    </div>

                    {/* OHLC and Change Values (TradingView Format) */}
                    <div className="flex items-center gap-2.5 font-mono text-[13px] tabular-nums tracking-tight">
                        <div className="flex items-center gap-0.5">
                            <span className="text-[#787b86] text-[12px] font-sans font-medium">O</span>
                            <span className={valueColor}>{formatPrice(openVal)}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <span className="text-[#787b86] text-[12px] font-sans font-medium">H</span>
                            <span className={valueColor}>{formatPrice(highVal)}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <span className="text-[#787b86] text-[12px] font-sans font-medium">L</span>
                            <span className={valueColor}>{formatPrice(lowVal)}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <span className="text-[#787b86] text-[12px] font-sans font-medium">C</span>
                            <span className={valueColor}>{formatPrice(closeVal)}</span>
                        </div>
                        <div className={`font-semibold ${valueColor}`}>
                            {isUp ? `+${diff.toFixed(2)}` : diff.toFixed(2)}{" "}
                            ({isUp ? `+${diffPercent.toFixed(2)}%` : `${diffPercent.toFixed(2)}%`})
                        </div>
                    </div>
                </div>

                {/* 2. Quick Trading Buttons (Sell / Spread / Buy) */}
                {canTrade && (
                    <div className="pointer-events-auto flex items-center gap-2 mt-0.5">
                        {/* SELL Button (Matching Topbar Red-Orange Color) */}
                        <button
                            type="button"
                            onClick={onSell}
                            title={`Sell ${symbol}`}
                            className="flex flex-col items-center justify-center px-3 py-1 min-w-[76px] rounded-md border border-[#c83200] bg-[#c83200]/10 hover:bg-[#c83200]/20 active:scale-95 transition-all cursor-pointer shadow-xs group"
                        >
                            <span className="font-mono text-xs font-bold text-[#c83200] group-hover:brightness-110">
                                {formatINR(currentMarketPrice)}
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
                            onClick={onBuy}
                            title={`Buy ${symbol}`}
                            className="flex flex-col items-center justify-center px-3 py-1 min-w-[76px] rounded-md border border-[#00873e] bg-[#00873e]/10 hover:bg-[#00873e]/20 active:scale-95 transition-all cursor-pointer shadow-xs group"
                        >
                            <span className="font-mono text-xs font-bold text-[#00873e] group-hover:brightness-110">
                                {formatINR(currentMarketPrice)}
                            </span>
                            <span className="text-[10px] font-bold text-[#00873e] tracking-wider">
                                BUY
                            </span>
                        </button>
                    </div>
                )}

                {/* 3. Volume Row (collapsible via chevron below) */}
                {isVolOpen && (
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#787b86] mt-0.5">
                        <span>
                            Vol{" "}
                            <span className="font-semibold text-[#089981]">
                                {formatVolume(volumeVal)}
                            </span>
                        </span>
                    </div>
                )}

                {/* 4. Collapse / Expand Volume Chevron (TradingView style below Vol) */}
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={() => setIsVolOpen((prev) => !prev)}
                        className={`pointer-events-auto p-1 rounded border transition-colors cursor-pointer ${
                            isDark
                                ? "bg-[#1e222d] border-[#363a45] text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39]"
                                : "bg-[#f0f3fa] border-[#e0e3eb] text-[#787b86] hover:text-[#131722] hover:bg-[#e0e3eb]"
                        }`}
                        title={isVolOpen ? "Hide Volume" : "Show Volume"}
                    >
                        <svg
                            className={`w-3 h-3 transition-transform duration-200 ${
                                isVolOpen ? "rotate-0" : "rotate-180"
                            }`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="18 15 12 9 6 15" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
