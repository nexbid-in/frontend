import React, { useEffect, useRef } from "react";
import { KLineChartPro } from "@klinecharts/pro";
import "@klinecharts/pro/dist/klinecharts-pro.css";
import { useAppSelector } from "@/store/hooks";
import { NexbidRealtimeDatafeed } from "../services/klineDatafeed";
import type { TickListener } from "../services/klineDatafeed";

interface TradingViewChartProps {
    symbol: string;
    exchange?: string;
    stockName?: string;
    onPriceTick?: TickListener;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
    symbol,
    exchange = "NSE",
    stockName,
    onPriceTick,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<KLineChartPro | null>(null);
    const theme = useAppSelector((state) => state.ui.theme);
    const isDark = theme !== "light";

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Clear previous chart container DOM
        container.innerHTML = "";

        const datafeed = new NexbidRealtimeDatafeed(onPriceTick);

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
            period: { multiplier: 15, timespan: "minute", text: "15m" },
            periods: [
                { multiplier: 1, timespan: "minute", text: "1m" },
                { multiplier: 5, timespan: "minute", text: "5m" },
                { multiplier: 15, timespan: "minute", text: "15m" },
                { multiplier: 1, timespan: "hour", text: "1h" },
                { multiplier: 1, timespan: "day", text: "1D" },
                { multiplier: 1, timespan: "week", text: "1W" },
            ],
            drawingBarVisible: true,
            timezone: "Asia/Kolkata",
            mainIndicators: ["MA", "EMA"],
            subIndicators: ["VOL", "MACD"],
            datafeed,
        });

        chartInstanceRef.current = chart;

        return () => {
            container.innerHTML = "";
            chartInstanceRef.current = null;
        };
    }, [symbol, exchange, stockName, isDark, onPriceTick]);

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
