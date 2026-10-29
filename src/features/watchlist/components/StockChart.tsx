import React, { useEffect, useRef, useCallback, useState } from "react";
import { KLineChartPro, type Period } from "@klinecharts/pro";
import "@klinecharts/pro/dist/klinecharts-pro.css";
import "../services/klineLocales";
import { init as initKLineChart, type Chart, type OverlayCreate, type OverlayRemove, type DeepPartial, type Styles, ActionType, CandleType, YAxisType } from "klinecharts";
import { useAppSelector } from "@/store/hooks";
import { NexbidRealtimeDatafeed } from "../services/klineDatafeed";
import type { TickListener } from "../services/klineDatafeed";

interface SavedChartSettings {
    mainIndicators: string[];
    subIndicators: string[];
    period?: Period;
    timezone?: string;
    styles?: DeepPartial<Styles>;
}

const DEFAULT_MODAL_STYLES: DeepPartial<Styles> = {
    candle: {
        type: CandleType.CandleSolid,
        priceMark: {
            last: { show: true },
            high: { show: true },
            low: { show: true },
        },
    },
    indicator: {
        lastValueMark: { show: false },
    },
    grid: {
        show: true,
    },
    yAxis: {
        type: YAxisType.Normal,
        reverse: false,
    },
};

const DEFAULT_CHART_SETTINGS: SavedChartSettings = {
    mainIndicators: [],
    subIndicators: ["VOL"],
    period: { multiplier: 15, timespan: "minute", text: "15m" },
    timezone: "Asia/Kolkata",
    styles: DEFAULT_MODAL_STYLES,
};

function loadSavedSettings(key: string): SavedChartSettings {
    if (typeof window === "undefined") return DEFAULT_CHART_SETTINGS;
    try {
        const raw = localStorage.getItem(key);
        if (raw) {
            const parsed = JSON.parse(raw);
            return {
                mainIndicators: Array.isArray(parsed.mainIndicators) ? parsed.mainIndicators : DEFAULT_CHART_SETTINGS.mainIndicators,
                subIndicators: Array.isArray(parsed.subIndicators) ? parsed.subIndicators : DEFAULT_CHART_SETTINGS.subIndicators,
                period: parsed.period && typeof parsed.period === "object" ? parsed.period : DEFAULT_CHART_SETTINGS.period,
                timezone: typeof parsed.timezone === "string" ? parsed.timezone : DEFAULT_CHART_SETTINGS.timezone,
                styles: parsed.styles && typeof parsed.styles === "object" ? parsed.styles : DEFAULT_MODAL_STYLES,
            };
        }
    } catch (err) {
        console.warn("[StockChart] Failed to load settings from localStorage:", err);
    }
    return DEFAULT_CHART_SETTINGS;
}

function saveChartSettings(key: string, settings: SavedChartSettings) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(key, JSON.stringify(settings));
    } catch (err) {
        console.warn("[StockChart] Failed to save settings to localStorage:", err);
    }
}

function getSymbolDrawingsKey(baseKey: string): string {
    return `${baseKey}_drawings`;
}

function loadSymbolDrawings(baseKey: string, symbol: string): OverlayCreate[] {
    if (typeof window === "undefined" || !symbol) return [];
    try {
        const raw = localStorage.getItem(getSymbolDrawingsKey(baseKey));
        if (raw) {
            const allDrawings = JSON.parse(raw) as Record<string, OverlayCreate[]>;
            return Array.isArray(allDrawings[symbol]) ? allDrawings[symbol] : [];
        }
    } catch (err) {
        console.warn("[StockChart] Failed to load drawings for", symbol, err);
    }
    return [];
}

function saveSymbolDrawings(baseKey: string, symbol: string, overlays: OverlayCreate[]) {
    if (typeof window === "undefined" || !symbol) return;
    try {
        const drawingsKey = getSymbolDrawingsKey(baseKey);
        const raw = localStorage.getItem(drawingsKey);
        const allDrawings: Record<string, OverlayCreate[]> = raw ? (JSON.parse(raw) as Record<string, OverlayCreate[]>) : {};
        allDrawings[symbol] = overlays;
        localStorage.setItem(drawingsKey, JSON.stringify(allDrawings));
    } catch (err) {
        console.warn("[StockChart] Failed to save drawings for", symbol, err);
    }
}

interface InternalChartStore {
    _chartStore?: {
        getOverlayStore?: () => {
            getInstances?: () => OverlayCreate[];
        };
    };
}

function getActiveOverlays(chart: Chart | null): OverlayCreate[] {
    if (!chart) return [];
    try {
        const internalChart = chart as unknown as InternalChartStore;
        const overlayStore = internalChart._chartStore?.getOverlayStore?.();
        if (!overlayStore || typeof overlayStore.getInstances !== "function") return [];
        const instances = overlayStore.getInstances();
        return (instances || [])
            .filter((ins) => ins && ins.name && Array.isArray(ins.points) && ins.points.length > 0)
            .map((ins) => ({
                name: ins.name,
                points: ins.points,
                styles: ins.styles,
                lock: ins.lock,
                mode: ins.mode,
                visible: ins.visible,
                extendData: ins.extendData,
                groupId: "drawing_tools",
            }));
    } catch {
        return [];
    }
}

function extractActiveIndicators(chartImp: Chart | null): { mainIndicators: string[]; subIndicators: string[] } | null {
    if (!chartImp) return null;
    try {
        const allPanes = chartImp.getIndicatorByPaneId() as Map<string, Map<string, { name: string }>> | undefined;
        if (!allPanes || typeof allPanes.forEach !== "function") return null;

        const mainIndicators: string[] = [];
        const subIndicators: string[] = [];

        allPanes.forEach((indicatorsMap, paneId) => {
            indicatorsMap.forEach((ind) => {
                if (!ind || !ind.name) return;
                if (paneId === "candle_pane") {
                    if (!mainIndicators.includes(ind.name)) mainIndicators.push(ind.name);
                } else {
                    if (!subIndicators.includes(ind.name)) subIndicators.push(ind.name);
                }
            });
        });

        return { mainIndicators, subIndicators };
    } catch (err) {
        console.warn("[StockChart] Error reading active indicators:", err);
        return null;
    }
}

interface StockChartProps {
    symbol: string;
    exchange?: string;
    stockName?: string;
    onPriceTick?: TickListener;
}

export const StockChart: React.FC<StockChartProps> = ({
    symbol,
    exchange = "NSE",
    stockName,
    onPriceTick,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<KLineChartPro | null>(null);
    const underlyingChartRef = useRef<Chart | null>(null);

    // Guard flag: only auto-fit Y-axis and scroll to real-time once when switching symbols or mounting
    const shouldCenterOnDataRef = useRef<boolean>(true);

    // TradingView-style state: track whether the user is scrolled away inspecting historical data
    const [isScrolledToHistory, setIsScrolledToHistory] = useState<boolean>(false);

    // Scoped storage key by authenticated user ID (or guest)
    const userId = useAppSelector((state) => state.auth.user?.id);
    const storageKey = userId ? `nexbid_chart_settings_${userId}` : "nexbid_chart_settings_guest";
    const storageKeyRef = useRef(storageKey);
    useEffect(() => {
        storageKeyRef.current = storageKey;
    }, [storageKey]);

    // Keep tick listener callback updated without recreating the datafeed or chart
    const onPriceTickRef = useRef(onPriceTick);
    useEffect(() => {
        onPriceTickRef.current = onPriceTick;
    }, [onPriceTick]);

    const theme = useAppSelector((state) => state.ui.theme);
    const isDark = theme !== "light";

    // Track the active symbol to avoid redundant updates on mount
    const currentSymbolRef = useRef(symbol);

    // Persist active settings and symbol drawings to localStorage
    const persistSettings = useCallback(() => {
        const chartPro = chartInstanceRef.current;
        const chartImp = underlyingChartRef.current;
        if (!chartPro) return;

        const indicators = extractActiveIndicators(chartImp);
        const period = chartPro.getPeriod();
        const timezone = chartPro.getTimezone();

        let stylesToSave: DeepPartial<Styles> | undefined;
        if (chartImp) {
            const currentStyles = chartImp.getStyles();
            stylesToSave = {
                candle: {
                    type: currentStyles.candle?.type,
                    priceMark: {
                        last: { show: currentStyles.candle?.priceMark?.last?.show },
                        high: { show: currentStyles.candle?.priceMark?.high?.show },
                        low: { show: currentStyles.candle?.priceMark?.low?.show },
                    },
                },
                indicator: {
                    lastValueMark: { show: currentStyles.indicator?.lastValueMark?.show },
                },
                grid: {
                    show: currentStyles.grid?.show,
                },
                yAxis: {
                    type: currentStyles.yAxis?.type,
                    reverse: currentStyles.yAxis?.reverse,
                },
            };
        }

        const currentSettings: SavedChartSettings = {
            mainIndicators: indicators?.mainIndicators ?? [],
            subIndicators: indicators?.subIndicators ?? ["VOL"],
            period,
            timezone,
            styles: stylesToSave,
        };

        saveChartSettings(storageKeyRef.current, currentSettings);

        // Also persist drawings for the currently active stock
        if (chartImp && currentSymbolRef.current) {
            const overlays = getActiveOverlays(chartImp);
            saveSymbolDrawings(storageKeyRef.current, currentSymbolRef.current, overlays);
        }
    }, []);

    // 1. Mount and initialize KLineChartPro once on component mount with saved settings
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.innerHTML = "";

        // Read saved preferences from localStorage (or sensible clean defaults)
        const initialSettings = loadSavedSettings(storageKeyRef.current);

        const datafeed = new NexbidRealtimeDatafeed((price, change, changePercent, ticker) => {
            onPriceTickRef.current?.(price, change, changePercent, ticker);
        });

        const chart = new KLineChartPro({
            container,
            watermark: "",
            theme: isDark ? "dark" : "light",
            locale: "en-US",
            styles: initialSettings.styles,
            symbol: {
                ticker: symbol,
                name: stockName || symbol,
                shortName: symbol,
                exchange: exchange,
                market: "stocks",
                pricePrecision: 2,
                volumePrecision: 0,
                priceCurrency: "INR",
                type: "stock",
            },
            period: initialSettings.period || DEFAULT_CHART_SETTINGS.period!,
            periods: [
                { multiplier: 1, timespan: "minute", text: "1m" },
                { multiplier: 5, timespan: "minute", text: "5m" },
                { multiplier: 15, timespan: "minute", text: "15m" },
                { multiplier: 1, timespan: "hour", text: "1h" },
                { multiplier: 1, timespan: "day", text: "1D" },
                { multiplier: 1, timespan: "week", text: "1W" },
            ],
            drawingBarVisible: true,
            timezone: initialSettings.timezone || "Asia/Kolkata",
            mainIndicators: initialSettings.mainIndicators,
            subIndicators: initialSettings.subIndicators,
            datafeed,
        });

        chartInstanceRef.current = chart;
        currentSymbolRef.current = symbol;
        shouldCenterOnDataRef.current = true;

        // Retrieve underlying Chart instance for indicator & drawing inspection
        const widget = container.querySelector<HTMLElement>("[k-line-chart-id]");
        if (widget) {
            const chartId = widget.getAttribute("k-line-chart-id");
            if (chartId) {
                widget.id = chartId;
                const chartImp = initKLineChart(widget);
                underlyingChartRef.current = chartImp;

                if (chartImp) {
                    if (initialSettings.styles) {
                        chartImp.setStyles(initialSettings.styles);
                    }

                    // Intercept removeOverlay so that toolbar remove requests clear ALL overlays unconditionally
                    const origRemoveOverlay = chartImp.removeOverlay.bind(chartImp);
                    chartImp.removeOverlay = (remove?: unknown) => {
                        if (!remove || (typeof remove === "object" && (remove as { groupId?: string }).groupId === "drawing_tools")) {
                            origRemoveOverlay();
                            saveSymbolDrawings(storageKeyRef.current, currentSymbolRef.current, []);
                            return;
                        }
                        origRemoveOverlay(remove as OverlayRemove);
                    };

                    // Auto-fit Y-axis and scroll to real time ONLY on symbol switch or initial data arrival
                    chartImp.subscribeAction(ActionType.OnDataReady, () => {
                        if (shouldCenterOnDataRef.current) {
                            shouldCenterOnDataRef.current = false;
                            chartImp.scrollToRealTime();
                        }
                    });

                    // Track whether user has scrolled into history to display the "Jump to Live" button
                    chartImp.subscribeAction(ActionType.OnVisibleRangeChange, (data: unknown) => {
                        const range = data as { to?: number };
                        const dataList = chartImp.getDataList();
                        if (!dataList || dataList.length === 0 || typeof range?.to !== "number") return;
                        const isAtRightEdge = range.to >= dataList.length - 3;
                        setIsScrolledToHistory(!isAtRightEdge);
                    });

                    // Restore initial drawings for this symbol
                    const initialDrawings = loadSymbolDrawings(storageKeyRef.current, symbol);
                    if (initialDrawings && initialDrawings.length > 0) {
                        initialDrawings.forEach((ov) => {
                            try {
                                chartImp.createOverlay({
                                    name: ov.name,
                                    points: ov.points,
                                    styles: ov.styles,
                                    lock: ov.lock,
                                    mode: ov.mode,
                                    visible: ov.visible,
                                    extendData: ov.extendData,
                                    groupId: "drawing_tools",
                                });
                            } catch (err) {
                                console.warn("[StockChart] Failed to restore overlay:", err);
                            }
                        });
                    }
                }
            }
        }

        return () => {
            container.innerHTML = "";
            chartInstanceRef.current = null;
            underlyingChartRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. Debounced persistence on user interaction (adding/removing indicators, timeframe click, drawings)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let debounceTimer: number | null = null;
        const triggerPersist = (event?: MouseEvent) => {
            if (debounceTimer) window.clearTimeout(debounceTimer);
            const target = event?.target as HTMLElement | null;
            const isToolbarAction = target?.closest?.(".klinecharts-pro-drawing-bar") !== null;
            // Immediate persist (50ms) for toolbar button clicks (e.g. Delete, Lock, Visibility); 250ms for canvas clicks
            const delay = isToolbarAction ? 50 : 250;
            debounceTimer = window.setTimeout(() => {
                persistSettings();
            }, delay);
        };

        container.addEventListener("click", triggerPersist);
        document.addEventListener("click", triggerPersist);

        // Capture clicks on the drawing bar trash icon to force immediate canvas clear & localStorage sync
        const handleTrashClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            const trashBtn = target?.closest?.(".klinecharts-pro-drawing-bar .item:last-child");
            if (trashBtn) {
                const chartImp = underlyingChartRef.current;
                if (chartImp) {
                    chartImp.removeOverlay();
                }
                saveSymbolDrawings(storageKeyRef.current, currentSymbolRef.current, []);
            }
        };
        container.addEventListener("click", handleTrashClick, true);

        // Capture clicks on the chart settings modal "Reset to Default" button
        const handleResetClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            const modal = target?.closest?.(".klinecharts-pro-modal");
            const isSettingsModal = modal?.querySelector?.(".klinecharts-pro-setting-modal-content") !== null;
            const resetBtn = target?.closest?.(".klinecharts-pro-button");

            if (isSettingsModal && resetBtn) {
                const chartImp = underlyingChartRef.current;
                const chartPro = chartInstanceRef.current;
                if (chartImp) {
                    chartImp.setStyles(DEFAULT_MODAL_STYLES);
                }
                if (chartPro) {
                    chartPro.setStyles(DEFAULT_MODAL_STYLES);
                }
                const saved = loadSavedSettings(storageKeyRef.current);
                saveChartSettings(storageKeyRef.current, {
                    ...saved,
                    styles: DEFAULT_MODAL_STYLES,
                });

                // Also execute after the current event loop in case SolidJS onRestoreDefault attempted to apply undefined/stale styles
                window.setTimeout(() => {
                    const imp = underlyingChartRef.current;
                    const pro = chartInstanceRef.current;
                    if (imp) imp.setStyles(DEFAULT_MODAL_STYLES);
                    if (pro) pro.setStyles(DEFAULT_MODAL_STYLES);
                    const current = loadSavedSettings(storageKeyRef.current);
                    saveChartSettings(storageKeyRef.current, {
                        ...current,
                        styles: DEFAULT_MODAL_STYLES,
                    });
                }, 40);
            }
        };
        container.addEventListener("click", handleResetClick, true);
        document.addEventListener("click", handleResetClick, true);

        const handleBeforeUnload = () => {
            persistSettings();
        };
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            if (debounceTimer) window.clearTimeout(debounceTimer);
            container.removeEventListener("click", handleTrashClick, true);
            container.removeEventListener("click", handleResetClick, true);
            document.removeEventListener("click", handleResetClick, true);
            container.removeEventListener("click", triggerPersist);
            document.removeEventListener("click", triggerPersist);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            persistSettings();
        };
    }, [persistSettings]);

    // 3. Switch symbol dynamically with overlay isolation, Y-axis auto-fit, and real-time centering (ONCE per switch)
    useEffect(() => {
        if (!chartInstanceRef.current) return;
        if (currentSymbolRef.current === symbol) return;

        const prevSymbol = currentSymbolRef.current;
        const chartImp = underlyingChartRef.current;

        // 1. Save previous symbol's drawings before leaving
        if (chartImp && prevSymbol) {
            const activeOverlays = getActiveOverlays(chartImp);
            saveSymbolDrawings(storageKeyRef.current, prevSymbol, activeOverlays);
        }

        // 2. Clear canvas overlays so previous stock's lines do not bleed or distort Y-axis scaling
        chartImp?.removeOverlay();

        // 3. Request auto-center for the new symbol's initial history payload
        shouldCenterOnDataRef.current = true;
        setIsScrolledToHistory(false);

        // 4. Switch the symbol on KLineChartPro
        currentSymbolRef.current = symbol;
        chartInstanceRef.current.setSymbol({
            ticker: symbol,
            name: stockName || symbol,
            shortName: symbol,
            exchange: exchange,
            market: "stocks",
            pricePrecision: 2,
            volumePrecision: 0,
            priceCurrency: "INR",
            type: "stock",
        });

        // 5. Restore saved drawings for the newly active symbol (if any exist)
        if (chartImp) {
            const savedDrawings = loadSymbolDrawings(storageKeyRef.current, symbol);
            if (savedDrawings && savedDrawings.length > 0) {
                savedDrawings.forEach((ov) => {
                    try {
                        chartImp.createOverlay({
                            name: ov.name,
                            points: ov.points,
                            styles: ov.styles,
                            lock: ov.lock,
                            mode: ov.mode,
                            visible: ov.visible,
                            extendData: ov.extendData,
                            groupId: "drawing_tools",
                        });
                    } catch (err) {
                        console.warn("[StockChart] Failed to restore overlay for", symbol, err);
                    }
                });
            }

            // Fallback timeout in case OnDataReady executed synchronously before listener check
            const fallbackTimer = window.setTimeout(() => {
                if (shouldCenterOnDataRef.current) {
                    shouldCenterOnDataRef.current = false;
                    chartImp.scrollToRealTime();
                }
            }, 120);

            return () => {
                window.clearTimeout(fallbackTimer);
            };
        }
    }, [symbol, exchange, stockName]);

    // 4. Update theme dynamically without tearing down chart state
    useEffect(() => {
        if (!chartInstanceRef.current) return;
        chartInstanceRef.current.setTheme(isDark ? "dark" : "light");
    }, [isDark]);

    const handleJumpToLive = () => {
        const chartImp = underlyingChartRef.current;
        if (!chartImp) return;
        chartImp.scrollToRealTime();
        setIsScrolledToHistory(false);
    };

    return (
        <div className="w-full h-full flex flex-col bg-dash-panel relative overflow-hidden select-none">
            <div
                ref={containerRef}
                className="w-full h-full flex-1"
                style={{ width: "100%", height: "100%" }}
            />

            {/* TradingView-style Floating 'Jump to Live Price' pill button when scrolled back in time */}
            {isScrolledToHistory && (
                <button
                    type="button"
                    onClick={handleJumpToLive}
                    className="absolute bottom-9 right-16 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181a20]/95 hover:bg-[#22252d] border border-dash-border text-xs font-medium text-dash-text hover:text-primary-green shadow-xl backdrop-blur-xs transition-all cursor-pointer animate-in fade-in zoom-in-95 duration-200"
                    title="Jump to latest live price"
                >
                    <span className="text-[11px] font-semibold tracking-wide">Live Price</span>
                    <svg className="w-3.5 h-3.5 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                </button>
            )}
        </div>
    );
};
