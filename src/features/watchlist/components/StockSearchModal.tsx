import React, { useState, useEffect, useRef, useMemo } from "react";
import { useStockSearchQuery } from "../hooks/useWatchlist";
import type { StockItemDTO } from "../types";
import { formatStockDisplayName } from "../utils/stockPriceHelper";

interface StockSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    watchlistStockIds: Set<string>;
    watchlistCount: number;
    maxLimit?: number;
    onAddStock: (stockId: string) => Promise<void> | void;
    isAdding?: boolean;
}

type InstrumentTab = "ALL" | "EQUITY" | "INDEX";

const POPULAR_SUGGESTIONS = [
    "NIFTY 50",
    "BSE SENSEX",
    "RELIANCE",
    "TCS",
    "INFY",
    "HDFCBANK",
    "TATAMOTORS",
    "SBIN",
    "ICICIBANK",
];

export const StockSearchModal: React.FC<StockSearchModalProps> = ({
    isOpen,
    onClose,
    watchlistStockIds,
    watchlistCount,
    maxLimit = 100,
    onAddStock,
    isAdding = false,
}) => {
    const [inputValue, setInputValue] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [activeTab, setActiveTab] = useState<InstrumentTab>("ALL");
    const [addingStockId, setAddingStockId] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input when modal opens and reset state
    useEffect(() => {
        if (isOpen) {
            setInputValue("");
            setDebouncedQuery("");
            setActiveTab("ALL");
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 60);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Debounce search input by 200ms
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(inputValue);
        }, 200);

        return () => clearTimeout(timer);
    }, [inputValue]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Prevent body scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    const { data: searchResults = [], isLoading, isFetching } = useStockSearchQuery(debouncedQuery);

    const filteredResults = useMemo(() => {
        if (activeTab === "ALL") return searchResults;
        return searchResults.filter((s) => s.type === activeTab);
    }, [searchResults, activeTab]);

    const counts = useMemo(() => {
        let equities = 0;
        let indices = 0;
        for (const item of searchResults) {
            if (item.type === "INDEX") indices++;
            else equities++;
        }
        return { all: searchResults.length, equities, indices };
    }, [searchResults]);

    const handleClear = () => {
        setInputValue("");
        setDebouncedQuery("");
        inputRef.current?.focus();
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

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="bg-dash-panel border border-dash-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header: Search Input Bar (TradingView style) */}
                <div className="p-4 border-b border-dash-border bg-dash-panel-2/40 flex items-center gap-3">
                    <svg
                        className="w-5 h-5 text-dash-text-muted shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3" />
                    </svg>

                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Search symbol, company or index (e.g. INFY, NIFTY, TATAMOTORS)..."
                        className="w-full bg-transparent text-sm md:text-base text-dash-text placeholder:text-dash-text-muted/60 focus:outline-none font-medium"
                    />

                    {inputValue.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 rounded-md text-dash-text-muted hover:text-dash-text hover:bg-dash-card transition-colors cursor-pointer shrink-0"
                            title="Clear search"
                            aria-label="Clear search"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-dash-text-muted hover:text-dash-text hover:bg-dash-card border border-transparent hover:border-dash-border transition-colors cursor-pointer shrink-0"
                        title="Close modal (Esc)"
                        aria-label="Close modal"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Instrument Category Filter Tabs */}
                <div className="px-4 py-2 border-b border-dash-border bg-dash-panel flex items-center justify-between gap-2 overflow-x-auto">
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setActiveTab("ALL")}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                                activeTab === "ALL"
                                    ? "bg-primary-green/10 text-primary-green border border-primary-green/25 font-semibold"
                                    : "text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 border border-transparent"
                            }`}
                        >
                            <span>All</span>
                            {searchResults.length > 0 && (
                                <span className="text-[10px] opacity-75 font-mono">({counts.all})</span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("EQUITY")}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                                activeTab === "EQUITY"
                                    ? "bg-primary-green/10 text-primary-green border border-primary-green/25 font-semibold"
                                    : "text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 border border-transparent"
                            }`}
                        >
                            <span>Stocks</span>
                            {searchResults.length > 0 && (
                                <span className="text-[10px] opacity-75 font-mono">({counts.equities})</span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("INDEX")}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                                activeTab === "INDEX"
                                    ? "bg-primary-green/10 text-primary-green border border-primary-green/25 font-semibold"
                                    : "text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 border border-transparent"
                            }`}
                        >
                            <span>Indices</span>
                            {searchResults.length > 0 && (
                                <span className="text-[10px] opacity-75 font-mono">({counts.indices})</span>
                            )}
                        </button>
                    </div>

                    {(isLoading || isFetching) && (
                        <div className="flex items-center gap-1.5 text-xs text-primary-green shrink-0">
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <span>Searching...</span>
                        </div>
                    )}
                </div>

                {/* Modal Results Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1 min-h-[300px]">
                    {debouncedQuery.trim().length === 0 ? (
                        /* Empty Search State with Popular Symbol Suggestions */
                        <div className="py-8 px-4 text-center space-y-6">
                            <div className="w-12 h-12 rounded-full bg-dash-panel-2 border border-dash-border mx-auto flex items-center justify-center text-dash-text-muted">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                    <circle cx="11" cy="11" r="8" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3" />
                                </svg>
                            </div>
                            <div className="max-w-sm mx-auto space-y-1">
                                <h3 className="text-sm font-semibold text-dash-text">Search Indian Markets</h3>
                                <p className="text-xs text-dash-text-muted">
                                    Find stocks and indices across NSE &amp; BSE to track live prices and charts in your watchlist.
                                </p>
                            </div>

                            {/* Quick Popular Tags */}
                            <div className="space-y-2 pt-2">
                                <span className="text-[11px] font-medium text-dash-text-muted uppercase tracking-wider block">
                                    Popular Searches
                                </span>
                                <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                                    {POPULAR_SUGGESTIONS.map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => {
                                                setInputValue(tag);
                                                inputRef.current?.focus();
                                            }}
                                            className="px-2.5 py-1 text-xs rounded-lg bg-dash-panel-2 hover:bg-dash-card border border-dash-border text-dash-text hover:text-primary-green transition-colors cursor-pointer"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : isLoading ? (
                        /* Skeleton Loading Rows */
                        <div className="divide-y divide-dash-border/40">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="p-3.5 flex items-center justify-between animate-pulse">
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-dash-panel-2 rounded" />
                                        <div className="h-3 w-48 bg-dash-panel-2 rounded" />
                                    </div>
                                    <div className="h-7 w-20 bg-dash-panel-2 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    ) : filteredResults.length === 0 ? (
                        /* No Results Found */
                        <div className="py-12 text-center text-dash-text-muted space-y-2">
                            <p className="text-sm font-medium text-dash-text">
                                No instruments found matching &ldquo;{debouncedQuery}&rdquo;
                            </p>
                            <p className="text-xs text-dash-text-muted max-w-xs mx-auto">
                                Check the symbol name spelling or try searching by company name.
                            </p>
                        </div>
                    ) : (
                        /* TradingView Style Instrument Rows */
                        <div className="divide-y divide-dash-border/40">
                            {filteredResults.map((stock) => {
                                const isAdded = watchlistStockIds.has(stock.id);
                                const isItemAdding = addingStockId === stock.id;
                                const isIndex = stock.type === "INDEX";

                                return (
                                    <div
                                        key={stock.id}
                                        className="p-3.5 rounded-xl flex items-center justify-between hover:bg-dash-panel-2/60 transition-colors group"
                                    >
                                        <div className="min-w-0 pr-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-dash-text group-hover:text-primary-green transition-colors">
                                                    {stock.symbol}
                                                </span>
                                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-dash-border text-dash-text-muted bg-dash-card">
                                                    {stock.exchange}
                                                </span>
                                                {isIndex && (
                                                    <span className="text-[10px] uppercase font-medium px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                        Index
                                                    </span>
                                                )}
                                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-dash-panel-2 text-dash-text-muted border border-dash-border">
                                                    {stock.isTradable ? "Tradable" : "Read-only"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-dash-text-muted truncate mt-1">
                                                {formatStockDisplayName(stock.name, stock.symbol)}
                                                {stock.sector ? ` • ${stock.sector}` : ""}
                                            </p>
                                        </div>

                                        <div className="shrink-0">
                                            {isAdded ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs text-primary-green font-medium px-3 py-1.5 rounded-lg bg-primary-green/10 border border-primary-green/20">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                    </svg>
                                                    Added
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={isItemAdding || watchlistCount >= maxLimit}
                                                    onClick={() => handleAdd(stock)}
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-primary-green hover:bg-primary-green-hover px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                                                >
                                                    {isItemAdding ? (
                                                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                                                            <line x1="12" y1="5" x2="12" y2="19" />
                                                            <line x1="5" y1="12" x2="19" y2="12" />
                                                        </svg>
                                                    )}
                                                    <span>Add</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Modal Footer: Watchlist Status & Keyboard Hints */}
                <div className="p-3 px-5 border-t border-dash-border bg-dash-panel-2/30 flex items-center justify-between text-xs text-dash-text-muted">
                    <div className="flex items-center gap-2">
                        <span>Watchlist Capacity:</span>
                        <span className="font-mono text-dash-text font-semibold">
                            {watchlistCount} / {maxLimit}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[11px]">
                            Press <kbd className="px-1.5 py-0.5 rounded bg-dash-card border border-dash-border font-mono text-[10px]">ESC</kbd> to close
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

