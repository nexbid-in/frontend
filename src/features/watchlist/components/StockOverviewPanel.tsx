import React, { useMemo } from "react";
import type { PerformanceReturnKey, WatchlistItemDTO } from "../types";
import {
    getStockFundamentals,
    formatINR,
    formatVolume,
} from "../utils/stockPriceHelper";
import { useLiveStockQuote } from "../hooks/useLiveStockQuote";
import { useStockOverviewQuery } from "../hooks/useStockOverview";

const PERFORMANCE_INTERVALS: ReadonlyArray<{ key: PerformanceReturnKey; label: string }> = [
    { key: "oneDay", label: "1 Day" },
    { key: "oneWeek", label: "1 Week" },
    { key: "oneMonth", label: "1 Month" },
    { key: "threeMonths", label: "3 Months" },
    { key: "sixMonths", label: "6 Months" },
    { key: "ytd", label: "YTD" },
    { key: "oneYear", label: "1 Year" },
];

function computeLiveReturn(
    liveLtp: number,
    anchor: number | null | undefined,
    fallbackReturn: number | null | undefined
): number | null {
    if (liveLtp > 0 && typeof anchor === "number" && Number.isFinite(anchor) && anchor > 0) {
        const pct = Math.round(((liveLtp - anchor) / anchor) * 10000) / 100;
        return Object.is(pct, -0) ? 0 : pct;
    }
    return fallbackReturn ?? null;
}

function pickBoundary(
    mode: "min" | "max",
    fallbackValue: number,
    ...values: Array<number | undefined | null>
): number {
    const valid = values.filter(
        (v): v is number => typeof v === "number" && Number.isFinite(v) && v > 0
    );
    if (valid.length === 0) return fallbackValue;
    return mode === "min" ? Math.min(...valid) : Math.max(...valid);
}

function computeRangePercent(ltp: number, low: number, high: number): number {
    const span = high - low;
    if (span <= 0) return 50;
    const pct = ((ltp - low) / span) * 100;
    return Math.min(100, Math.max(0, Math.round(pct)));
}

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

    const quote = useLiveStockQuote(stock.symbol);

    const { data: overview, isLoading } = useStockOverviewQuery(stock.symbol);

    const fallback = useMemo(() => getStockFundamentals(stock.symbol), [stock.symbol]);

    const vitals = overview?.vitals;
    const liveLtp = quote.hasLiveTick
        ? quote.price
        : vitals?.ltp && vitals.ltp > 0
        ? vitals.ltp
        : 0;
    const displayLtp = liveLtp > 0 ? liveLtp : quote.price;
    const displayChange = !quote.hasLiveTick && vitals && vitals.ltp > 0 ? vitals.change : quote.change;
    const displayChangePercent =
        !quote.hasLiveTick && vitals && vitals.ltp > 0 ? vitals.changePercent : quote.changePercent;
    const displayIsPositive = displayChange >= 0;

    const openPrice = (quote.open && quote.open > 0 ? quote.open : vitals?.open) ?? fallback.open;
    const prevClosePrice =
        (quote.prevClose && quote.prevClose > 0 ? quote.prevClose : vitals?.close) ?? fallback.prevClose;
    const volume = quote.volume ?? vitals?.volume ?? fallback.volume;
    const atpPrice = quote.atp ?? vitals?.atp ?? fallback.avgPrice;
    const lowerCircuit = vitals ? vitals.lowerCircuit : fallback.lowerCircuit;
    const upperCircuit = vitals ? vitals.upperCircuit : fallback.upperCircuit;

    const livePriceForRange = quote.hasLiveTick ? quote.price : undefined;
    const dayLow = pickBoundary("min", fallback.dayLow, vitals?.low, quote.low, livePriceForRange);
    const dayHigh = pickBoundary("max", fallback.dayHigh, vitals?.high, quote.high, livePriceForRange);

    const week52Low = pickBoundary(
        "min",
        fallback.week52Low,
        overview?.range52W.low,
        quote.low,
        quote.hasLiveTick ? quote.price : vitals?.ltp
    );
    const week52High = pickBoundary(
        "max",
        fallback.week52High,
        overview?.range52W.high,
        quote.high,
        quote.hasLiveTick ? quote.price : vitals?.ltp
    );

    const performance = overview?.performance;
    const performanceReturns = useMemo(() => {
        if (!performance) return null;
        const anchors = performance.anchors;

        return PERFORMANCE_INTERVALS.reduce(
            (acc, { key }) => {
                const baseAnchor = anchors?.[key];
                const effectiveAnchor =
                    key === "oneDay"
                        ? baseAnchor && baseAnchor > 0
                            ? baseAnchor
                            : quote.prevClose
                        : baseAnchor;

                acc[key] = computeLiveReturn(liveLtp, effectiveAnchor, performance[key]);
                return acc;
            },
            {} as Record<PerformanceReturnKey, number | null>
        );
    }, [performance, liveLtp, quote.prevClose]);

    const buyQty = typeof quote.totalBuyQty === "number" ? quote.totalBuyQty : vitals?.totalBuyQty;
    const sellQty = typeof quote.totalSellQty === "number" ? quote.totalSellQty : vitals?.totalSellQty;
    const bidPrice = typeof quote.bidPrice === "number" ? quote.bidPrice : vitals?.bidPrice;
    const askPrice = typeof quote.askPrice === "number" ? quote.askPrice : vitals?.askPrice;

    const dayRangePercent = useMemo(
        () => computeRangePercent(displayLtp, dayLow, dayHigh),
        [displayLtp, dayLow, dayHigh]
    );

    const week52RangePercent = useMemo(
        () => computeRangePercent(displayLtp, week52Low, week52High),
        [displayLtp, week52Low, week52High]
    );

    const depthTotal = (buyQty ?? 0) + (sellQty ?? 0);
    const buyPercent = depthTotal > 0 ? Math.round(((buyQty ?? 0) / depthTotal) * 100) : 50;
    const sellPercent = 100 - buyPercent;

    return (
        <div className="w-full h-full overflow-y-auto custom-scrollbar p-6 space-y-6">
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
                            ₹{formatINR(displayLtp)}
                        </span>
                        <span
                            className={`text-sm font-mono font-medium tabular-nums ${
                                displayIsPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                            }`}
                        >
                            {displayIsPositive ? `+${displayChange.toFixed(2)}` : displayChange.toFixed(2)}{" "}
                            ({displayIsPositive ? `+${displayChangePercent.toFixed(2)}%` : `${displayChangePercent.toFixed(2)}%`})
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

            <div className="bg-dash-card border border-dash-border rounded-xl p-5 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-dash-text-muted">
                        Price Performance & Ranges
                    </h3>
                    {isLoading && (
                        <span className="text-[11px] text-dash-text-muted animate-pulse">Syncing vitals...</span>
                    )}
                </div>

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
                            <p className="font-mono font-bold text-dash-text tabular-nums mt-0.5">
                                ₹{formatINR(displayLtp)}
                            </p>
                        </div>

                        <div className="text-right">
                            <span className="text-dash-text-muted">Today&apos;s High</span>
                            <p className="font-mono font-semibold text-dash-text mt-0.5">
                                ₹{formatINR(dayHigh)}
                            </p>
                        </div>
                    </div>

                    <div className="relative w-full h-2 bg-dash-panel-2 rounded-full overflow-visible">
                        <div
                            className="h-full rounded-full bg-linear-to-r from-[#ef4444] via-amber-400 to-[#22c55e]"
                            style={{ width: "100%" }}
                        />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-primary-green rounded-full shadow-md -ml-1.5 transition-all duration-300"
                            style={{ left: `${dayRangePercent}%` }}
                            title={`Current: ₹${formatINR(displayLtp)} (${dayRangePercent}%)`}
                        />
                    </div>
                </div>

                <div className="border-t border-dash-border/60" />

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

                    <div className="relative w-full h-2 bg-dash-panel-2 rounded-full overflow-visible">
                        <div
                            className="h-full rounded-full bg-linear-to-r from-dash-panel-2 via-primary-green/60 to-primary-green"
                            style={{ width: "100%" }}
                        />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-primary-green rounded-full shadow-md -ml-1.5 transition-all duration-300"
                            style={{ left: `${week52RangePercent}%` }}
                            title={`Current: ₹${formatINR(displayLtp)} (${week52RangePercent}%)`}
                        />
                    </div>
                </div>
            </div>

            {performance && performanceReturns && (
                <div className="bg-dash-card border border-dash-border rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-dash-text-muted">
                            Historical Returns
                        </h3>
                        <span className="text-[11px] text-dash-text-muted">Trailing Performance</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                        {PERFORMANCE_INTERVALS.map(({ key, label }) => {
                            const val = performanceReturns[key];
                            const colorClass =
                                val === null
                                    ? "text-dash-text-muted"
                                    : val >= 0
                                    ? "text-[#22c55e]"
                                    : "text-[#ef4444]";
                            const formatted =
                                val === null
                                    ? "—"
                                    : `${val > 0 ? "+" : ""}${val.toFixed(2)}%`;

                            return (
                                <div
                                    key={key}
                                    className="bg-dash-panel border border-dash-border rounded-lg px-3 py-3 flex flex-col items-center justify-center text-center gap-1.5"
                                >
                                    <span className="text-xs font-semibold text-dash-text/80 whitespace-nowrap">
                                        {label}
                                    </span>
                                    <span className={`text-sm font-mono font-bold tabular-nums ${colorClass}`}>
                                        {formatted}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

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
