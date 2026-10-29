import React, { useMemo } from "react";
import type { WatchlistItemDTO } from "../types";
import {
    getStockMarketQuote,
    getStockFundamentals,
    formatINR,
    formatVolume,
} from "../utils/stockPriceHelper";

interface StockOverviewPanelProps {
    item: WatchlistItemDTO;
    onOpenChart: (item: WatchlistItemDTO) => void;
    onBuy: (item: WatchlistItemDTO) => void;
    onSell: (item: WatchlistItemDTO) => void;
}

export const StockOverviewPanel: React.FC<StockOverviewPanelProps> = ({
    item,
    onOpenChart,
    onBuy,
    onSell,
}) => {
    const stock = item.stock;
    const isIndex = stock.type === "INDEX";
    const quote = useMemo(() => getStockMarketQuote(stock.symbol), [stock.symbol]);
    const fundamentals = useMemo(() => getStockFundamentals(stock.symbol), [stock.symbol]);

    // Calculate percentage positions for range slider markers
    const dayRangePercent = useMemo(() => {
        const span = fundamentals.dayHigh - fundamentals.dayLow;
        if (span <= 0) return 50;
        const pct = ((quote.price - fundamentals.dayLow) / span) * 100;
        return Math.min(100, Math.max(0, Math.round(pct)));
    }, [quote.price, fundamentals.dayLow, fundamentals.dayHigh]);

    const week52RangePercent = useMemo(() => {
        const span = fundamentals.week52High - fundamentals.week52Low;
        if (span <= 0) return 50;
        const pct = ((quote.price - fundamentals.week52Low) / span) * 100;
        return Math.min(100, Math.max(0, Math.round(pct)));
    }, [quote.price, fundamentals.week52Low, fundamentals.week52High]);

    return (
        <div className="w-full h-full overflow-y-auto custom-scrollbar p-6 space-y-6">
            {/* Top Identity & Action Header */}
            <div className="bg-dash-card border border-dash-border rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-dash-text tracking-tight">
                            {stock.symbol}
                        </h2>
                        <span className="text-xs font-mono uppercase px-2 py-0.5 rounded border border-dash-border text-dash-text-muted bg-dash-panel">
                            {stock.exchange}
                        </span>
                        {isIndex && (
                            <span className="text-xs uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                                Index
                            </span>
                        )}
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary-green/10 text-primary-green border border-primary-green/20">
                            {stock.isTradable ? "Tradable" : "Read-only"}
                        </span>
                    </div>
                    <p className="text-xs text-dash-text-muted mt-1">
                        {stock.name} {stock.sector ? `• ${stock.sector}` : ""}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => onOpenChart(item)}
                        className="px-3.5 py-1.5 text-xs font-medium text-dash-text bg-dash-panel hover:bg-dash-panel-2 border border-dash-border rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                        <svg className="w-4 h-4 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <line x1="18" y1="20" x2="18" y2="10" />
                            <line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                        <span>Interactive Chart</span>
                    </button>

                    {!isIndex && stock.isTradable && (
                        <>
                            <button
                                type="button"
                                onClick={() => onBuy(item)}
                                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg transition-colors shadow-xs cursor-pointer"
                            >
                                BUY
                            </button>
                            <button
                                type="button"
                                onClick={() => onSell(item)}
                                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] rounded-lg transition-colors shadow-xs cursor-pointer"
                            >
                                SELL
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Performance Sliders: Day High/Low & 52-Week High/Low (Zerodha Kite Style) */}
            <div className="bg-dash-card border border-dash-border rounded-xl p-5 space-y-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-dash-text-muted">
                    Price Performance & Ranges
                </h3>

                {/* Day Range Slider */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <div className="text-left">
                            <span className="text-dash-text-muted">Today&apos;s Low</span>
                            <p className="font-mono font-semibold text-dash-text mt-0.5">
                                ₹{formatINR(fundamentals.dayLow)}
                            </p>
                        </div>

                        <div className="text-center">
                            <span className="text-[11px] text-dash-text-muted">Current LTP</span>
                            <p className="font-mono font-bold text-dash-text mt-0.5">
                                ₹{formatINR(quote.price)}
                            </p>
                        </div>

                        <div className="text-right">
                            <span className="text-dash-text-muted">Today&apos;s High</span>
                            <p className="font-mono font-semibold text-dash-text mt-0.5">
                                ₹{formatINR(fundamentals.dayHigh)}
                            </p>
                        </div>
                    </div>

                    {/* Progress Track with Marker Pin */}
                    <div className="relative w-full h-2 bg-dash-panel-2 rounded-full overflow-visible">
                        <div
                            className="h-full rounded-full bg-linear-to-r from-[#ef4444] via-amber-400 to-[#22c55e]"
                            style={{ width: "100%" }}
                        />
                        {/* Glowing Position Marker Pin */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-primary-green rounded-full shadow-md -ml-1.5 transition-all duration-300"
                            style={{ left: `${dayRangePercent}%` }}
                            title={`Current: ₹${formatINR(quote.price)} (${dayRangePercent}%)`}
                        />
                    </div>
                </div>

                <div className="border-t border-dash-border/60" />

                {/* 52-Week Range Slider */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <div className="text-left">
                            <span className="text-dash-text-muted">52-Week Low</span>
                            <p className="font-mono font-semibold text-dash-text mt-0.5">
                                ₹{formatINR(fundamentals.week52Low)}
                            </p>
                        </div>

                        <div className="text-center">
                            <span className="text-[11px] text-dash-text-muted">Range Position</span>
                            <p className="font-mono font-semibold text-primary-green mt-0.5">
                                {week52RangePercent}%
                            </p>
                        </div>

                        <div className="text-right">
                            <span className="text-dash-text-muted">52-Week High</span>
                            <p className="font-mono font-semibold text-dash-text mt-0.5">
                                ₹{formatINR(fundamentals.week52High)}
                            </p>
                        </div>
                    </div>

                    {/* Progress Track with Marker Pin */}
                    <div className="relative w-full h-2 bg-dash-panel-2 rounded-full overflow-visible">
                        <div
                            className="h-full rounded-full bg-linear-to-r from-dash-panel-2 via-primary-green/60 to-primary-green"
                            style={{ width: "100%" }}
                        />
                        {/* Glowing Position Marker Pin */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-primary-green rounded-full shadow-md -ml-1.5 transition-all duration-300"
                            style={{ left: `${week52RangePercent}%` }}
                            title={`Current: ₹${formatINR(quote.price)} (${week52RangePercent}%)`}
                        />
                    </div>
                </div>
            </div>

            {/* Key Market Fundamentals Grid */}
            <div className="bg-dash-card border border-dash-border rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-dash-text-muted">
                    Key Market Statistics
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="bg-dash-panel p-3.5 rounded-lg border border-dash-border">
                        <span className="text-[11px] text-dash-text-muted">Open Price</span>
                        <p className="text-sm font-mono font-semibold text-dash-text mt-1">
                            ₹{formatINR(fundamentals.open)}
                        </p>
                    </div>

                    <div className="bg-dash-panel p-3.5 rounded-lg border border-dash-border">
                        <span className="text-[11px] text-dash-text-muted">Previous Close</span>
                        <p className="text-sm font-mono font-semibold text-dash-text mt-1">
                            ₹{formatINR(fundamentals.prevClose)}
                        </p>
                    </div>

                    <div className="bg-dash-panel p-3.5 rounded-lg border border-dash-border">
                        <span className="text-[11px] text-dash-text-muted">Traded Volume</span>
                        <p className="text-sm font-mono font-semibold text-dash-text mt-1">
                            {formatVolume(fundamentals.volume)} shares
                        </p>
                    </div>

                    <div className="bg-dash-panel p-3.5 rounded-lg border border-dash-border">
                        <span className="text-[11px] text-dash-text-muted">Avg Traded Price (ATP)</span>
                        <p className="text-sm font-mono font-semibold text-dash-text mt-1">
                            ₹{formatINR(fundamentals.avgPrice)}
                        </p>
                    </div>

                    <div className="bg-dash-panel p-3.5 rounded-lg border border-dash-border">
                        <span className="text-[11px] text-dash-text-muted">Lower Circuit (-10%)</span>
                        <p className="text-sm font-mono font-semibold text-[#ef4444] mt-1">
                            ₹{formatINR(fundamentals.lowerCircuit)}
                        </p>
                    </div>

                    <div className="bg-dash-panel p-3.5 rounded-lg border border-dash-border">
                        <span className="text-[11px] text-dash-text-muted">Upper Circuit (+10%)</span>
                        <p className="text-sm font-mono font-semibold text-[#22c55e] mt-1">
                            ₹{formatINR(fundamentals.upperCircuit)}
                        </p>
                    </div>

                    <div className="bg-dash-panel p-3.5 rounded-lg border border-dash-border">
                        <span className="text-[11px] text-dash-text-muted">Sector / Segment</span>
                        <p className="text-sm font-semibold text-dash-text mt-1 truncate">
                            {stock.sector ?? "General Equities"}
                        </p>
                    </div>

                    <div className="bg-dash-panel p-3.5 rounded-lg border border-dash-border">
                        <span className="text-[11px] text-dash-text-muted">Trading Permission</span>
                        <p className="text-sm font-semibold text-primary-green mt-1">
                            {stock.isTradable ? "MIS & CNC Enabled" : "Index (Non-tradable)"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
