import React, { useMemo } from "react";
import type { WatchlistItemDTO } from "../types";
import { StockCard } from "./StockCard";
import { StockSearchDropdown } from "./StockSearchDropdown";

interface WatchlistSidebarProps {
    items: WatchlistItemDTO[];
    isLoading: boolean;
    selectedStockId: string | null;
    onSelectStock: (item: WatchlistItemDTO) => void;
    onOpenChart: (item: WatchlistItemDTO) => void;
    onOpenOverview: (item: WatchlistItemDTO) => void;
    onBuy: (item: WatchlistItemDTO) => void;
    onSell: (item: WatchlistItemDTO) => void;
    onAddStock: (stockId: string) => Promise<void> | void;
    onDeleteStock: (stockId: string) => void;
    isAdding?: boolean;
    isDeleting?: boolean;
}

export const WatchlistSidebar: React.FC<WatchlistSidebarProps> = ({
    items,
    isLoading,
    selectedStockId,
    onSelectStock,
    onOpenChart,
    onOpenOverview,
    onBuy,
    onSell,
    onAddStock,
    onDeleteStock,
    isAdding = false,
    isDeleting = false,
}) => {
    const watchlistStockIds = useMemo(() => {
        return new Set(items.map((item) => item.stock.id));
    }, [items]);

    return (
        <aside className="w-full lg:w-[380px] bg-dash-panel border border-dash-border rounded-xl flex flex-col h-full overflow-hidden shrink-0">
            {/* Header: Title and Counter */}
            <div className="p-4 border-b border-dash-border bg-dash-panel-2/40 space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-dash-text tracking-tight flex items-center gap-2">
                        <span>Watchlist 1</span>
                        <span className="text-[10px] font-mono text-dash-text-muted bg-dash-card px-1.5 py-0.5 rounded border border-dash-border">
                            {items.length} stocks
                        </span>
                    </h2>
                </div>

                {/* Stock Search Dropdown */}
                <StockSearchDropdown
                    watchlistStockIds={watchlistStockIds}
                    watchlistCount={items.length}
                    maxLimit={100}
                    onAddStock={onAddStock}
                    isAdding={isAdding}
                />
            </div>

            {/* Watchlist Stock Cards List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="divide-y divide-dash-border/60">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <div key={idx} className="p-4 flex items-center justify-between animate-pulse">
                                <div className="space-y-2">
                                    <div className="h-4 w-28 bg-dash-panel-2 rounded" />
                                    <div className="h-3 w-16 bg-dash-panel-2 rounded" />
                                </div>
                                <div className="space-y-2 text-right flex flex-col items-end">
                                    <div className="h-4 w-16 bg-dash-panel-2 rounded" />
                                    <div className="h-3 w-12 bg-dash-panel-2 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center h-full text-dash-text-muted space-y-3">
                        <div className="w-12 h-12 rounded-full bg-dash-panel-2 flex items-center justify-center text-dash-text-muted">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-dash-text">Your watchlist is empty</p>
                            <p className="text-[11px] text-dash-text-muted mt-1 max-w-[220px] mx-auto">
                                Search and add stocks above to monitor real-time prices and trade.
                            </p>
                        </div>
                    </div>
                ) : (
                    items.map((item) => (
                        <StockCard
                            key={item.id}
                            item={item}
                            isSelected={selectedStockId === item.stock.id}
                            onSelect={onSelectStock}
                            onOpenChart={onOpenChart}
                            onOpenOverview={onOpenOverview}
                            onBuy={onBuy}
                            onSell={onSell}
                            onDelete={onDeleteStock}
                            isDeleting={isDeleting}
                        />
                    ))
                )}
            </div>
        </aside>
    );
};
