import React, { useEffect, useRef, useCallback } from "react";
import { KLineChartPro, type Period } from "@klinecharts/pro";
import "@klinecharts/pro/dist/klinecharts-pro.css";
import { init as initKLineChart, type Chart } from "klinecharts";
import { useAppSelector } from "@/store/hooks";
import { NexbidRealtimeDatafeed } from "../services/klineDatafeed";
import type { TickListener } from "../services/klineDatafeed";

interface SavedChartSettings {
    mainIndicators: string[];
    subIndicators: string[];
    period?: Period;
    timezone?: string;
}

const DEFAULT_CHART_SETTINGS: SavedChartSettings = {
    mainIndicators: [],
    subIndicators: ["VOL"],
    period: { multiplier: 15, timespan: "minute", text: "15m" },
    timezone: "Asia/Kolkata",
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

    // Persist active settings to localStorage
    const persistSettings = useCallback(() => {
        const chartPro = chartInstanceRef.current;
        const chartImp = underlyingChartRef.current;
        if (!chartPro) return;

        const indicators = extractActiveIndicators(chartImp);
        const period = chartPro.getPeriod();
        const timezone = chartPro.getTimezone();

        const currentSettings: SavedChartSettings = {
            mainIndicators: indicators?.mainIndicators ?? [],
            subIndicators: indicators?.subIndicators ?? ["VOL"],
            period,
            timezone,
        };

        saveChartSettings(storageKeyRef.current, currentSettings);
    }, []);

    // 1. Mount and initialize KLineChartPro once on component mount with saved settings
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.innerHTML = "";

        // Read saved preferences from localStorage (or sensible clean defaults)
        const initialSettings = loadSavedSettings(storageKeyRef.current);

        const datafeed = new NexbidRealtimeDatafeed((price, change, changePercent) => {
            onPriceTickRef.current?.(price, change, changePercent);
        });

        const chart = new KLineChartPro({
            container,
            watermark: "",
            theme: isDark ? "dark" : "light",
            locale: "en-US",
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

        // Retrieve underlying Chart instance for indicator inspection
        const widget = container.querySelector<HTMLElement>("[k-line-chart-id]");
        if (widget) {
            const chartId = widget.getAttribute("k-line-chart-id");
            if (chartId) {
                widget.id = chartId;
                underlyingChartRef.current = initKLineChart(widget);
            }
        }

        return () => {
            container.innerHTML = "";
            chartInstanceRef.current = null;
            underlyingChartRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. Debounced persistence on user interaction (adding/removing indicators, timeframe click)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let debounceTimer: number | null = null;
        const triggerPersist = () => {
            if (debounceTimer) window.clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(() => {
                persistSettings();
            }, 400);
        };

        container.addEventListener("click", triggerPersist);
        document.addEventListener("click", triggerPersist);

        const handleBeforeUnload = () => {
            persistSettings();
        };
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            if (debounceTimer) window.clearTimeout(debounceTimer);
            container.removeEventListener("click", triggerPersist);
            document.removeEventListener("click", triggerPersist);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            persistSettings();
        };
    }, [persistSettings]);

    // 3. Switch symbol dynamically without destroying the chart or resetting user indicators
    useEffect(() => {
        if (!chartInstanceRef.current) return;
        if (currentSymbolRef.current === symbol) return;

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
    }, [symbol, exchange, stockName]);

    // 4. Update theme dynamically without tearing down chart state
    useEffect(() => {
        if (!chartInstanceRef.current) return;
        chartInstanceRef.current.setTheme(isDark ? "dark" : "light");
    }, [isDark]);

    return (
        <div className="w-full h-full flex flex-col bg-dash-panel relative overflow-hidden select-none">
            <div
                ref={containerRef}
                className="w-full h-full flex-1"
                style={{ width: "100%", height: "100%" }}
            />
        </div>
    );
};
