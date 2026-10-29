import React from "react";
import type { WatchlistItemDTO } from "../types";
import { getStockMarketQuote, formatINR, formatStockDisplayName } from "../utils/stockPriceHelper";

interface StockCardProps {
    item: WatchlistItemDTO;
    isSelected: boolean;
    onSelect: (item: WatchlistItemDTO) => void;
    onOpenChart: (item: WatchlistItemDTO) => void;
    onOpenOverview?: (item: WatchlistItemDTO) => void;
    onBuy: (item: WatchlistItemDTO) => void;
    onSell: (item: WatchlistItemDTO) => void;
    onDelete: (stockId: string) => void;
    isDeleting?: boolean;
}

export const StockCard: React.FC<StockCardProps> = ({
    item,
    isSelected,
    onSelect,
    onOpenChart,
    onBuy,
    onSell,
    onDelete,
    isDeleting = false,
}) => {
    const stock = item.stock;
    const isIndex = stock.type === "INDEX";
    const quote = getStockMarketQuote(stock.symbol);
    const displayName = formatStockDisplayName(stock.name, stock.symbol);

    return (
        <div
            onClick={() => onSelect(item)}
            className={`group relative px-4 py-2.5 border-b border-dash-border cursor-pointer transition-colors select-none ${
                isSelected
                    ? "bg-dash-panel-2 border-l-4 border-l-primary-green"
                    : "hover:bg-dash-panel-2/60 border-l-4 border-l-transparent"
            }`}
        >
            <div className="flex items-center justify-between">
                {/* Left Column: Clean Brand Name & Exchange Badge */}
                <div className="min-w-0 pr-2">
                    <span className="text-sm font-medium text-dash-text tracking-tight truncate block group-hover:text-primary-green transition-colors">
                        {displayName}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-dash-border text-dash-text-muted bg-dash-card/70 inline-flex items-center gap-1">
                            <span>{stock.exchange}</span>
                            <svg className="w-2.5 h-2.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </span>
                        {isIndex && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                                Index
                            </span>
                        )}
                    </div>
                </div>

                {/* Right Column: Price & Change (Hidden on Hover when Action Bar shows) */}
                <div className="text-right shrink-0 transition-opacity duration-150 group-hover:opacity-0 md:group-hover:opacity-0">
                    <div className="text-sm font-mono font-medium text-dash-text">
                        {formatINR(quote.price)}
                    </div>
                    <div
                        className={`text-xs font-mono font-medium mt-0.5 ${
                            quote.isPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                        }`}
                    >
                        {quote.isPositive ? `+${quote.change.toFixed(2)}` : quote.change.toFixed(2)}{" "}
                        (
                        {quote.isPositive ? `+${quote.changePercent.toFixed(2)}%` : `${quote.changePercent.toFixed(2)}%`}
                        )
                    </div>
                </div>
            </div>

            {/* Zerodha Kite Style Floating Hover Action Toolbar */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 bg-[#181a1f] p-1 rounded border border-dash-border shadow-lg z-10 animate-in fade-in zoom-in-95 duration-100"
            >
                {/* Buy Button (Hidden for non-tradable Indices) */}
                {!isIndex && stock.isTradable && (
                    <button
                        type="button"
                        onClick={() => onBuy(item)}
                        className="w-7 h-7 text-xs font-bold text-white bg-[#00873e] hover:bg-[#009c48] rounded-[3px] transition-colors cursor-pointer flex items-center justify-center shadow-xs"
                        title="Buy"
                    >
                        B
                    </button>
                )}

                {/* Sell Button (Hidden for non-tradable Indices) */}
                {!isIndex && stock.isTradable && (
                    <button
                        type="button"
                        onClick={() => onSell(item)}
                        className="w-7 h-7 text-xs font-bold text-white bg-[#c83200] hover:bg-[#df3d17] rounded-[3px] transition-colors cursor-pointer flex items-center justify-center shadow-xs"
                        title="Sell"
                    >
                        S
                    </button>
                )}

                {/* Chart Button (Candlestick Bars Icon) */}
                <button
                    type="button"
                    onClick={() => onOpenChart(item)}
                    className="w-7 h-7 rounded-[3px] border border-white/20 hover:border-white/40 bg-[#1e2024] hover:bg-[#282c34] text-white transition-colors cursor-pointer flex items-center justify-center"
                    title="Trading Chart"
                    aria-label="Open Chart"
                >
                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <line x1="5" y1="9" x2="5" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <rect x="3.5" y="11" width="3" height="6" rx="0.5" fill="currentColor" />
                        <line x1="12" y1="4" x2="12" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <rect x="10.5" y="7" width="3" height="8" rx="0.5" fill="currentColor" />
                        <line x1="19" y1="6" x2="19" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <rect x="17.5" y="9" width="3" height="8" rx="0.5" fill="currentColor" />
                    </svg>
                </button>

                {/* Delete from Watchlist Button */}
                <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => onDelete(stock.id)}
                    className="w-7 h-7 rounded-[3px] border border-white/20 hover:border-red-500/50 hover:text-red-400 bg-[#1e2024] hover:bg-[#282c34] text-white transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
                    title="Remove from Watchlist"
                    aria-label="Remove stock"
                >
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4h6" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
                        <line x1="10" y1="11" x2="10" y2="17" strokeLinecap="round" />
                        <line x1="14" y1="11" x2="14" y2="17" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
