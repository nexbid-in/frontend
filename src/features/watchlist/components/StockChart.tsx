import React, { useEffect, useRef } from "react";
import { createWidget, type Widget } from "openalgo-charts/widget";
import "openalgo-charts/indicators";
import "openalgo-charts/draw";
import { useAppSelector } from "@/store/hooks";
import {
    NexbidOpenAlgoDataFeed,
    type TickListener,
} from "../services/openAlgoDatafeed";

export type { TickListener };

export interface StockChartProps {
    symbol: string;
    exchange?: string;
    stockName?: string;
    onPriceTick?: TickListener;
    onSymbolChange?: (symbol: string, exchange?: string) => void;
}

/**
 * Production-ready TradingView-style financial charting terminal powered by OpenAlgo Charts.
 * - Out-of-the-box topbar, left drawing rail (87 tools), 112 indicators, bottom timezone & range bar
 * - Multi-pane indicator support with parameter dialogs
 * - Seamless symbol switching, theme reactivity, and IST timezone configuration
 * - Automatic IndexedDB layout & drawing persistence
 */
export const StockChart: React.FC<StockChartProps> = ({
    symbol,
    exchange = "NSE",
    onPriceTick,
    onSymbolChange,
}) => {
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
                    persist: userId ? `nexbid-${userId}` : "nexbid-guest",
                    mobile: "auto",
                    topbar: true,
                    rail: true,
                    bottombar: true,
                    statusline: true,
                    indicators: true,
                    symbolSearch: (query, ctx) => feed.searchSymbols({ query, signal: ctx?.signal }),
                });

                widgetRef.current = widget;

                // Sync symbol if user picks a new symbol via widget topbar search
                widget.on("symbol", (ev) => {
                    if (ev && typeof ev.symbol === "string") {
                        const newSym = ev.symbol.toUpperCase();
                        const newExch = typeof ev.exchange === "string" ? ev.exchange.toUpperCase() : "NSE";
                        activeSymbolRef.current = newSym;
                        activeExchangeRef.current = newExch;
                        onSymbolChangeRef.current?.(newSym, newExch);
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

    return (
        <div
            ref={containerRef}
            className={`w-full h-full min-h-[450px] relative overflow-hidden select-none transition-colors ${
                isDark ? "bg-[#131722]" : "bg-[#ffffff]"
            }`}
            style={{ width: "100%", height: "100%" }}
        />
    );
};
