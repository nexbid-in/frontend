import React, { useMemo, useState, useEffect } from "react";
import type { WatchlistItemDTO } from "../types";
import { StockCard } from "./StockCard";
import { StockSearchModal } from "./StockSearchModal";

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
    onDeleteStock: (stockId: string) => Promise<void> | void;
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
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    const watchlistStockIds = useMemo(() => {
        return new Set(items.map((item) => item.stock.id));
    }, [items]);

    // Keyboard shortcut '/' to quickly open the Symbol Search modal (like TradingView)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === "/" &&
                !isSearchModalOpen &&
                !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
            ) {
                e.preventDefault();
                setIsSearchModalOpen(true);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isSearchModalOpen]);

    return (
        <aside className="w-full lg:w-[380px] bg-dash-panel border border-dash-border rounded-md flex flex-col h-full overflow-hidden shrink-0">
            {/* Header: Title, Counter & Search Modal Trigger */}
            <div className="p-3.5 px-4 border-b border-dash-border bg-dash-panel-2/40 flex items-center justify-between shrink-0">
                <h2 className="text-sm font-semibold text-dash-text tracking-tight">
                    Watchlist
                </h2>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsSearchModalOpen(true)}
                        className="text-dash-text-muted hover:text-dash-text transition-colors cursor-pointer flex items-center justify-center"
                        title="Search and add instruments (/)"
                        aria-label="Search and add instruments"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <line x1="11" y1="8" x2="11" y2="14" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                    </button>

                    <span className="text-sm font-mono text-dash-text-muted">
                        {items.length}/100
                    </span>
                </div>
            </div>

            {/* TradingView-style Symbol Search Modal */}
            <StockSearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                watchlistStockIds={watchlistStockIds}
                watchlistCount={items.length}
                maxLimit={100}
                onAddStock={onAddStock}
                onRemoveStock={onDeleteStock}
                isAdding={isAdding}
                isRemoving={isDeleting}
            />

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
                                Search and add stocks to monitor real-time prices and trade.
                            </p>
                            <button
                                type="button"
                                onClick={() => setIsSearchModalOpen(true)}
                                className="mt-3 px-3 py-1.5 text-xs font-medium text-primary-green hover:bg-primary-green/10 border border-primary-green/20 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                            >
                                <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    <line x1="11" y1="8" x2="11" y2="14" />
                                    <line x1="8" y1="11" x2="14" y2="11" />
                                </svg>
                                Search Instruments
                            </button>
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
