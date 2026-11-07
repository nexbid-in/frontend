import React, { useState, useEffect, useRef } from "react";
import { useStockSearchQuery } from "../hooks/useWatchlist";
import type { StockItemDTO } from "../types";
import { formatStockDisplayName } from "../utils/stockPriceHelper";

interface StockSearchDropdownProps {
    watchlistStockIds: Set<string>;
    watchlistCount: number;
    maxLimit?: number;
    onAddStock: (stockId: string) => Promise<void> | void;
    isAdding?: boolean;
}

export const StockSearchDropdown: React.FC<StockSearchDropdownProps> = ({
    watchlistStockIds,
    watchlistCount,
    maxLimit = 100,
    onAddStock,
    isAdding = false,
}) => {
    const [inputValue, setInputValue] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [addingStockId, setAddingStockId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounce search input by 250ms
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(inputValue);
            if (inputValue.trim().length > 0) {
                setIsOpen(true);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [inputValue]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                event.target instanceof Node &&
                !containerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const { data: searchResults = [], isLoading, isFetching } = useStockSearchQuery(debouncedQuery);

    const handleClear = () => {
        setInputValue("");
        setDebouncedQuery("");
        setIsOpen(false);
    };

    const handleAdd = async (stock: StockItemDTO) => {
        if (watchlistStockIds.has(stock.id) || isAdding) return;
        setAddingStockId(stock.id);
        try {
            await onAddStock(stock.id);
        } finally {
            setAddingStockId(null);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Search Input Bar */}
            <div className="relative flex items-center">
                <svg
                    className="w-4 h-4 text-dash-text-muted absolute left-3 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                >
                    <circle cx="11" cy="11" r="8" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3" />
                </svg>

                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => {
                        if (debouncedQuery.trim().length > 0) {
                            setIsOpen(true);
                        }
                    }}
                    placeholder="Search and add stocks"
                    className="w-full bg-dash-card border border-dash-border rounded-lg pl-9 pr-20 py-2 text-xs text-dash-text placeholder:text-dash-text-muted/70 focus:outline-none focus:border-primary-green transition-colors"
                />

                {/* Right controls: Counter and Clear button */}
                <div className="absolute right-2.5 flex items-center gap-2">
                    {inputValue.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-dash-text-muted hover:text-dash-text transition-colors p-0.5 cursor-pointer"
                            aria-label="Clear search"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                    <span className="text-[11px] font-mono text-dash-text-muted bg-dash-panel px-1.5 py-0.5 rounded border border-dash-border">
                        {watchlistCount}/{maxLimit}
                    </span>
                </div>
            </div>

            {/* Floating Dropdown Results */}
            {isOpen && debouncedQuery.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-dash-panel border border-dash-border rounded-xl shadow-2xl z-50 overflow-hidden max-h-80 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-dash-border bg-dash-panel-2/50 flex items-center justify-between text-[11px] text-dash-text-muted">
                        <span>Matching Instruments ({searchResults.length})</span>
                        {(isLoading || isFetching) && (
                            <span className="flex items-center gap-1.5 text-primary-green">
                                <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Searching...
                            </span>
                        )}
                    </div>

                    <div className="overflow-y-auto custom-scrollbar divide-y divide-dash-border/50">
                        {searchResults.length === 0 && !isLoading ? (
                            <div className="p-6 text-center text-xs text-dash-text-muted">
                                No stocks found matching &ldquo;<span className="text-dash-text">{debouncedQuery}</span>&rdquo;
                            </div>
                        ) : (
                            searchResults.map((stock) => {
                                const isAdded = watchlistStockIds.has(stock.id);
                                const isItemAdding = addingStockId === stock.id;

                                return (
                                    <div
                                        key={stock.id}
                                        className="p-3 flex items-center justify-between hover:bg-dash-panel-2 transition-colors group"
                                    >
                                        <div className="min-w-0 pr-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-dash-text group-hover:text-primary-green transition-colors">
                                                    {stock.symbol}
                                                </span>
                                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded border border-dash-border text-dash-text-muted bg-dash-card">
                                                    {stock.exchange}
                                                </span>
                                                {stock.type === "INDEX" && (
                                                    <span className="text-[10px] uppercase font-medium px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                        Index
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-dash-text-muted truncate mt-0.5">
                                                {formatStockDisplayName(stock.name, stock.symbol)}
                                                {stock.sector ? ` • ${stock.sector}` : ""}
                                            </p>
                                        </div>

                                        <div className="shrink-0">
                                            {isAdded ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] text-primary-green font-medium px-2 py-1 rounded bg-primary-green/10 border border-primary-green/20">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                    </svg>
                                                    Added
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={isItemAdding}
                                                    onClick={() => handleAdd(stock)}
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-white bg-primary-green hover:bg-primary-green-hover px-2.5 py-1 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                                                >
                                                    {isItemAdding ? (
                                                        <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                            <line x1="12" y1="5" x2="12" y2="19" />
                                                            <line x1="5" y1="12" x2="19" y2="12" />
                                                        </svg>
                                                    )}
                                                    Add
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
