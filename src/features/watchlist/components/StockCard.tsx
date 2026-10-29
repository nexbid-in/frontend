import React from "react";
import type { WatchlistItemDTO } from "../types";
import { getStockMarketQuote, formatINR } from "../utils/stockPriceHelper";

interface StockCardProps {
    item: WatchlistItemDTO;
    isSelected: boolean;
    onSelect: (item: WatchlistItemDTO) => void;
    onOpenChart: (item: WatchlistItemDTO) => void;
    onOpenOverview: (item: WatchlistItemDTO) => void;
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
    onOpenOverview,
    onBuy,
    onSell,
    onDelete,
    isDeleting = false,
}) => {
    const stock = item.stock;
    const isIndex = stock.type === "INDEX";
    const quote = getStockMarketQuote(stock.symbol);

    return (
        <div
            onClick={() => onSelect(item)}
            className={`group relative px-4 py-3 border-b border-dash-border cursor-pointer transition-colors select-none ${
                isSelected
                    ? "bg-dash-panel-2 border-l-2 border-l-primary-green"
                    : "hover:bg-dash-panel-2/60 border-l-2 border-l-transparent"
            }`}
        >
            <div className="flex items-center justify-between">
                {/* Left Column: Name & Exchange Badge */}
                <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-dash-text tracking-tight truncate group-hover:text-primary-green transition-colors">
                            {stock.name}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono text-dash-text-muted">
                            {stock.symbol}
                        </span>
                        <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded border border-dash-border text-dash-text-muted bg-dash-card">
                            {stock.exchange}
                        </span>
                        {isIndex && (
                            <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                                Index
                            </span>
                        )}
                    </div>
                </div>

                {/* Right Column: Price & Change (Hidden on Hover when Action Bar shows) */}
                <div className="text-right shrink-0 transition-opacity duration-150 group-hover:opacity-0 md:group-hover:opacity-0">
                    <div className="text-xs font-mono font-semibold text-dash-text">
                        {formatINR(quote.price)}
                    </div>
                    <div
                        className={`text-[11px] font-mono font-medium mt-0.5 ${
                            quote.isPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                        }`}
                    >
                        {quote.isPositive ? `+${quote.change.toFixed(2)}` : quote.change.toFixed(2)} (
                        {quote.isPositive ? `+${quote.changePercent.toFixed(2)}%` : `${quote.changePercent.toFixed(2)}%`})
                    </div>
                </div>
            </div>

            {/* Zerodha Kite Style Floating Hover Action Toolbar */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-dash-panel/95 backdrop-blur-sm p-1 rounded-lg border border-dash-border shadow-lg z-10 animate-in fade-in zoom-in-95 duration-100"
            >
                {/* Buy Button (Hidden for non-tradable Indices) */}
                {!isIndex && stock.isTradable && (
                    <button
                        type="button"
                        onClick={() => onBuy(item)}
                        className="px-2 py-1 text-[11px] font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded transition-colors shadow-xs cursor-pointer flex items-center justify-center min-w-[24px]"
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
                        className="px-2 py-1 text-[11px] font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] rounded transition-colors shadow-xs cursor-pointer flex items-center justify-center min-w-[24px]"
                        title="Sell"
                    >
                        S
                    </button>
                )}

                {/* Chart Button */}
                <button
                    type="button"
                    onClick={() => onOpenChart(item)}
                    className="p-1 text-dash-text-muted hover:text-dash-text hover:bg-dash-card rounded transition-colors cursor-pointer"
                    title="Trading Chart"
                    aria-label="Open Chart"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                </button>

                {/* Overview / Market Depth Info Button */}
                <button
                    type="button"
                    onClick={() => onOpenOverview(item)}
                    className="p-1 text-dash-text-muted hover:text-dash-text hover:bg-dash-card rounded transition-colors cursor-pointer"
                    title="Stock Overview"
                    aria-label="Open Overview"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                </button>

                {/* Delete from Watchlist Button */}
                <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => onDelete(stock.id)}
                    className="p-1 text-dash-text-muted hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded transition-colors cursor-pointer disabled:opacity-50"
                    title="Remove from Watchlist"
                    aria-label="Remove stock"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
