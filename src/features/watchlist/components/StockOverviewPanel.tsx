import React, { useMemo } from "react";
import type { WatchlistItemDTO } from "../types";
import {
    getStockFundamentals,
    formatINR,
    formatVolume,
} from "../utils/stockPriceHelper";
import { useLiveStockQuote } from "../hooks/useLiveStockQuote";
import { useStockOverviewQuery } from "../hooks/useStockOverview";

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

    // 1. Live WebSocket quote streaming (continuous LTP & tick flash)
    const quote = useLiveStockQuote(stock.symbol);

    // 2. Fetch rich market overview & performance returns from backend API
    const { data: overview, isLoading } = useStockOverviewQuery(stock.symbol);

    // 3. Fallback baseline if API is still loading or offline
    const fallback = useMemo(() => getStockFundamentals(stock.symbol), [stock.symbol]);

    const vitals = overview?.vitals;
    const openPrice = vitals?.open ?? fallback.open;
    const prevClosePrice = vitals?.close ?? fallback.prevClose;
    const volume = vitals?.volume ?? fallback.volume;
    const atpPrice = quote.atp ?? vitals?.atp ?? fallback.avgPrice;
    const lowerCircuit = vitals ? vitals.lowerCircuit : fallback.lowerCircuit;
    const upperCircuit = vitals ? vitals.upperCircuit : fallback.upperCircuit;

    const dayLow = vitals ? Math.min(vitals.low, quote.price) : fallback.dayLow;
    const dayHigh = vitals ? Math.max(vitals.high, quote.price) : fallback.dayHigh;

    const week52Low = overview ? Math.min(overview.range52W.low, quote.price) : fallback.week52Low;
    const week52High = overview ? Math.max(overview.range52W.high, quote.price) : fallback.week52High;

    const performance = overview?.performance;
    // Live WebSocket order book streaming with REST snapshot fallback
    const buyQty = typeof quote.totalBuyQty === "number" ? quote.totalBuyQty : vitals?.totalBuyQty;
    const sellQty = typeof quote.totalSellQty === "number" ? quote.totalSellQty : vitals?.totalSellQty;
    const bidPrice = typeof quote.bidPrice === "number" ? quote.bidPrice : vitals?.bidPrice;
    const askPrice = typeof quote.askPrice === "number" ? quote.askPrice : vitals?.askPrice;

    // Calculate percentage positions for range slider markers
    const dayRangePercent = useMemo(() => {
        const span = dayHigh - dayLow;
        if (span <= 0) return 50;
        const pct = ((quote.price - dayLow) / span) * 100;
        return Math.min(100, Math.max(0, Math.round(pct)));
    }, [quote.price, dayLow, dayHigh]);

    const week52RangePercent = useMemo(() => {
        const span = week52High - week52Low;
        if (span <= 0) return 50;
        const pct = ((quote.price - week52Low) / span) * 100;
        return Math.min(100, Math.max(0, Math.round(pct)));
    }, [quote.price, week52Low, week52High]);

    // Market Depth calculations
    const depthTotal = (buyQty ?? 0) + (sellQty ?? 0);
    const buyPercent = depthTotal > 0 ? Math.round(((buyQty ?? 0) / depthTotal) * 100) : 50;
    const sellPercent = 100 - buyPercent;

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

                    {/* Live LTP & Day Change */}
                    <div className="flex items-baseline gap-2 mt-2">
                        <span
                            className={`text-2xl font-bold font-mono transition-colors duration-200 ${
                                quote.flashDirection === "up"
                                    ? "text-[#22c55e]"
                                    : quote.flashDirection === "down"
                                    ? "text-[#ef4444]"
                                    : "text-dash-text"
                            }`}
                        >
                            ₹{formatINR(quote.price)}
                        </span>
                        <span
                            className={`text-sm font-mono font-medium ${
                                quote.isPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                            }`}
                        >
                            {quote.isPositive ? `+${quote.change.toFixed(2)}` : quote.change.toFixed(2)}{" "}
                            ({quote.isPositive ? `+${quote.changePercent.toFixed(2)}%` : `${quote.changePercent.toFixed(2)}%`})
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => onOpenChart(item)}
                        className="px-3.5 py-2 text-xs font-medium text-dash-text bg-dash-panel hover:bg-dash-panel-2 border border-dash-border rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
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
                                className="px-5 py-2 text-xs font-semibold text-white bg-[#00873e] hover:bg-[#009c48] rounded-lg transition-colors shadow-xs cursor-pointer"
                            >
                                BUY
                            </button>
                            <button
                                type="button"
                                onClick={() => onSell(item)}
                                className="px-5 py-2 text-xs font-semibold text-white bg-[#c83200] hover:bg-[#df3d17] rounded-lg transition-colors shadow-xs cursor-pointer"
                            >
                                SELL
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Performance Sliders: Day High/Low & 52-Week High/Low (Zerodha Kite Style) */}
            <div className="bg-dash-card border border-dash-border rounded-xl p-5 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-dash-text-muted">
                        Price Performance & Ranges
                    </h3>
                    {isLoading && (
                        <span className="text-[11px] text-dash-text-muted animate-pulse">Syncing vitals...</span>
                    )}
                </div>

                {/* Day Range Slider */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <div className="text-left">
                            <span className="text-dash-text-muted">Today&apos;s Low</span>
                            <p className="font-mono font-semibold text-dash-text mt-0.5">
                                ₹{formatINR(dayLow)}
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
                                ₹{formatINR(dayHigh)}
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
                                ₹{formatINR(week52Low)}
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
                                ₹{formatINR(week52High)}
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

            {/* Historical Performance Returns (1W, 1M, 1Y) */}
            {performance && (
                <div className="bg-dash-card border border-dash-border rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-dash-text-muted">
                            Historical Returns
                        </h3>
                        <span className="text-[11px] text-dash-text-muted">Trailing Performance</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-dash-panel p-3.5 rounded-lg border border-dash-border flex flex-col justify-between">
                            <span className="text-[11px] text-dash-text-muted">1 Week</span>
                            <p className={`text-base font-mono font-bold mt-1 ${
                                performance.oneWeek === null
                                    ? "text-dash-text-muted"
                                    : performance.oneWeek >= 0
                                    ? "text-[#22c55e]"
                                    : "text-[#ef4444]"
                            }`}>
                                {performance.oneWeek !== null
                                    ? `${performance.oneWeek >= 0 ? "+" : ""}${performance.oneWeek.toFixed(2)}%`
                                    : "N/A"}
                            </p>
                        </div>

                        <div className="bg-dash-panel p-3.5 rounded-lg border border-dash-border flex flex-col justify-between">
                            <span className="text-[11px] text-dash-text-muted">1 Month</span>
                            <p className={`text-base font-mono font-bold mt-1 ${
                                performance.oneMonth === null
                                    ? "text-dash-text-muted"
                                    : performance.oneMonth >= 0
                                    ? "text-[#22c55e]"
                                    : "text-[#ef4444]"
                            }`}>
                                {performance.oneMonth !== null
                                    ? `${performance.oneMonth >= 0 ? "+" : ""}${performance.oneMonth.toFixed(2)}%`
                                    : "N/A"}
                            </p>
                        </div>

                        <div className="bg-dash-panel p-3.5 rounded-lg border border-dash-border flex flex-col justify-between">
                            <span className="text-[11px] text-dash-text-muted">1 Year</span>
                            <p className={`text-base font-mono font-bold mt-1 ${
                                performance.oneYear === null
                                    ? "text-dash-text-muted"
                                    : performance.oneYear >= 0
                                    ? "text-[#22c55e]"
                                    : "text-[#ef4444]"
                            }`}>
                                {performance.oneYear !== null
                                    ? `${performance.oneYear >= 0 ? "+" : ""}${performance.oneYear.toFixed(2)}%`
                                    : "N/A"}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Book / Market Depth Snapshot */}
            {!isIndex && (typeof buyQty === "number" || typeof bidPrice === "number" || typeof askPrice === "number") && (
                <div className="bg-dash-card border border-dash-border rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-dash-text-muted">
                            Order Book Depth
                        </h3>
                        {typeof bidPrice === "number" && typeof askPrice === "number" && (
                            <div className="text-xs font-mono">
                                <span className="text-dash-text-muted">Spread: </span>
                                <span className="text-dash-text font-medium">₹{(Math.max(0, askPrice - bidPrice)).toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {/* Buy vs Sell Volume Ratio Bar */}
                    {depthTotal > 0 && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-mono">
                                <span className="text-[#22c55e] font-medium">
                                    Total Buy {formatVolume(buyQty ?? 0)} ({buyPercent}%)
                                </span>
                                <span className="text-[#ef4444] font-medium">
                                    Total Sell {formatVolume(sellQty ?? 0)} ({sellPercent}%)
                                </span>
                            </div>
                            <div className="w-full h-2 rounded-full flex overflow-hidden bg-dash-panel-2">
                                <div className="bg-[#22c55e] transition-all duration-300" style={{ width: `${buyPercent}%` }} />
                                <div className="bg-[#ef4444] transition-all duration-300" style={{ width: `${sellPercent}%` }} />
                            </div>
                        </div>
                    )}

                    {/* Best Bid and Ask Prices */}
                    {(typeof bidPrice === "number" || typeof askPrice === "number") && (
                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <div className="bg-dash-panel p-3 rounded-lg border border-dash-border">
                                <span className="text-[11px] text-dash-text-muted">Best Bid (Buyer Price)</span>
                                <p className="text-sm font-mono font-semibold text-[#22c55e] mt-1">
                                    {typeof bidPrice === "number" ? `₹${formatINR(bidPrice)}` : "—"}
                                </p>
                            </div>
                            <div className="bg-dash-panel p-3 rounded-lg border border-dash-border">
                                <span className="text-[11px] text-dash-text-muted">Best Ask (Seller Price)</span>
                                <p className="text-sm font-mono font-semibold text-[#ef4444] mt-1">
                                    {typeof askPrice === "number" ? `₹${formatINR(askPrice)}` : "—"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Key Market Fundamentals Grid */}
            <div className="bg-dash-card border border-dash-border rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-dash-text-muted">
                        Key Market Statistics
                    </h3>
                    {overview?.lastUpdated && (
                        <span className="text-[10px] font-mono text-dash-text-muted">
                            Updated {new Date(overview.lastUpdated).toLocaleTimeString()}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="bg-dash-panel p-3.5 rounded-lg border border-dash-border">
                        <span className="text-[11px] text-dash-text-muted">Open Price</span>
                        <p className="text-sm font-mono font-semibold text-dash-text mt-1">
                            ₹{formatINR(openPrice)}
                        </p>
                    </div>

                    <div className="bg-dash-panel p-3.5 rounded-lg border border-dash-border">
                        <span className="text-[11px] text-dash-text-muted">Previous Close</span>
                        <p className="text-sm font-mono font-semibold text-dash-text mt-1">
                            ₹{formatINR(prevClosePrice)}
                        </p>
                    </div>

                    <div className="bg-dash-panel p-3.5 rounded-lg border border-dash-border">
                        <span className="text-[11px] text-dash-text-muted">Traded Volume</span>
                        <p className="text-sm font-mono font-semibold text-dash-text mt-1">
                            {formatVolume(volume)} shares
                        </p>
                    </div>

                    <div className="bg-dash-panel p-3.5 rounded-lg border border-dash-border">
                        <span className="text-[11px] text-dash-text-muted">Avg Price (ATP / VWAP)</span>
                        <p className="text-sm font-mono font-semibold text-dash-text mt-1">
                            ₹{formatINR(atpPrice)}
                        </p>
                    </div>

                    <div className="bg-dash-panel p-3.5 rounded-lg border border-dash-border">
                        <span className="text-[11px] text-dash-text-muted">Lower Circuit</span>
                        <p className="text-sm font-mono font-semibold text-[#ef4444] mt-1">
                            {lowerCircuit !== null ? `₹${formatINR(lowerCircuit)}` : "No Limit"}
                        </p>
                    </div>

                    <div className="bg-dash-panel p-3.5 rounded-lg border border-dash-border">
                        <span className="text-[11px] text-dash-text-muted">Upper Circuit</span>
                        <p className="text-sm font-mono font-semibold text-[#22c55e] mt-1">
                            {upperCircuit !== null ? `₹${formatINR(upperCircuit)}` : "No Limit"}
                        </p>
                    </div>

                    <div className="bg-dash-panel p-3.5 rounded-lg border border-dash-border">
                        <span className="text-[11px] text-dash-text-muted">Sector / Segment</span>
                        <p className="text-sm font-semibold text-dash-text mt-1 truncate" title={stock.sector ?? "General Equities"}>
                            {stock.sector ?? "General Equities"}
                        </p>
                    </div>

                    <div className="bg-dash-panel p-3.5 rounded-lg border border-dash-border">
                        <span className="text-[11px] text-dash-text-muted">Trading Permission</span>
                        <p className="text-sm font-semibold text-primary-green mt-1">
                            {stock.isTradable ? "MIS & CNC Enabled" : "Read-only"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
