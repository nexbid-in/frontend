import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";

export type TickListener = (price: number, change: number, changePercent: number, ticker?: string) => void;

export interface StockChartProps {
    symbol: string;
    exchange?: string;
    stockName?: string;
    onPriceTick?: TickListener;
}

export const StockChart: React.FC<StockChartProps> = ({
    symbol,
    exchange = "NSE",
    stockName,
}) => {
    const theme = useAppSelector((state) => state.ui.theme);
    const isDark = theme !== "light";

    // One-time cleanup of legacy KLineCharts and related settings from localStorage
    useEffect(() => {
        try {
            if (typeof window !== "undefined") {
                const keysToRemove: string[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (key.startsWith("nexbid_chart_settings") || key.toLowerCase().includes("kline"))) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach((key) => {
                    localStorage.removeItem(key);
                });
            }
        } catch (err) {
            console.warn("[StockChart] Failed to clean up legacy chart localStorage:", err);
        }
    }, []);

    return (
        <div
            className={`w-full h-full flex flex-col items-center justify-center relative select-none rounded-lg border transition-colors ${
                isDark
                    ? "bg-[#131722] border-[#2a2e39] text-gray-300"
                    : "bg-white border-gray-200 text-gray-700"
            }`}
        >
            {/* Header info */}
            <div
                className={`absolute top-4 left-4 flex items-center gap-2.5 px-3 py-1.5 rounded-md border backdrop-blur-sm ${
                    isDark
                        ? "bg-[#1e222d]/80 border-[#2a2e39]"
                        : "bg-gray-100/80 border-gray-200"
                }`}
            >
                <span className="font-bold text-sm tracking-wide text-blue-500">{symbol}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">
                    {exchange}
                </span>
                {stockName && (
                    <span className="text-xs opacity-60 truncate max-w-[200px]">
                        {stockName}
                    </span>
                )}
            </div>

            {/* Central Placeholder State */}
            <div className="flex flex-col items-center text-center max-w-sm px-6">
                <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border ${
                        isDark
                            ? "bg-[#1e222d] border-[#2a2e39] text-blue-400"
                            : "bg-blue-50 border-blue-100 text-blue-600"
                    }`}
                >
                    <svg
                        className="w-7 h-7"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                </div>
                <h3 className="text-base font-semibold mb-1">Cleaned & Ready for Chart Integration</h3>
                <p className="text-xs opacity-60 leading-relaxed">
                    KLineCharts dependencies and legacy storage entries have been purged. Ready for OpenAlgo Charts integration.
                </p>
            </div>
        </div>
    );
};
