import React, { useState, useEffect, useRef, useMemo } from "react";
import { useInfiniteStockSearchQuery } from "../hooks/useWatchlist";
import type { StockItemDTO } from "../types";
import { formatStockDisplayName } from "../utils/stockPriceHelper";

interface StockSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    watchlistStockIds: Set<string>;
    watchlistCount: number;
    maxLimit?: number;
    onAddStock: (stockId: string) => Promise<void> | void;
    onRemoveStock?: (stockId: string) => Promise<void> | void;
    isAdding?: boolean;
    isRemoving?: boolean;
}

type InstrumentTab = "ALL" | "EQUITY" | "INDEX";

export const StockSearchModal: React.FC<StockSearchModalProps> = ({
    isOpen,
    onClose,
    watchlistStockIds,
    watchlistCount,
    maxLimit = 100,
    onAddStock,
    onRemoveStock,
    isAdding = false,
    isRemoving = false,
}) => {
    const [inputValue, setInputValue] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [activeTab, setActiveTab] = useState<InstrumentTab>("ALL");
    const [processingStockId, setProcessingStockId] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(inputValue);
        }, 200);

        return () => clearTimeout(timer);
    }, [inputValue]);

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

    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    const {
        data,
        isLoading,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteStockSearchQuery(debouncedQuery, activeTab, 20);

    const allStocks = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap((page) => page.stocks);
    }, [data?.pages]);

    useEffect(() => {
        const sentinelEl = sentinelRef.current;
        if (!sentinelEl) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            {
                root: scrollContainerRef.current,
                rootMargin: "120px",
                threshold: 0.05,
            }
        );

        observer.observe(sentinelEl);

        return () => {
            observer.disconnect();
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
        }
    }, [debouncedQuery, activeTab]);

    const handleClear = () => {
        setInputValue("");
        setDebouncedQuery("");
        inputRef.current?.focus();
    };

    const handleAdd = async (stock: StockItemDTO) => {
        if (watchlistStockIds.has(stock.id) || isAdding) return;
        setProcessingStockId(stock.id);
        try {
            await onAddStock(stock.id);
        } finally {
            setProcessingStockId(null);
        }
    };

    const handleRemove = async (stock: StockItemDTO) => {
        if (!watchlistStockIds.has(stock.id) || !onRemoveStock || isRemoving) return;
        setProcessingStockId(stock.id);
        try {
            await onRemoveStock(stock.id);
        } finally {
            setProcessingStockId(null);
        }
    };

    const renderHighlightedSymbol = (symbol: string, query: string) => {
        const cleanQuery = query.trim().toUpperCase();
        if (!cleanQuery) return <span>{symbol}</span>;

        const idx = symbol.toUpperCase().indexOf(cleanQuery);
        if (idx === -1) return <span>{symbol}</span>;

        return (
            <span>
                {symbol.slice(0, idx)}
                <span className="text-[#2962ff] dark:text-[#387aff] font-bold">
                    {symbol.slice(idx, idx + cleanQuery.length)}
                </span>
                {symbol.slice(idx + cleanQuery.length)}
            </span>
        );
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
                className="bg-dash-panel border border-dash-border rounded-2xl shadow-2xl w-full max-w-2xl h-[580px] max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="h-14 px-4 border-b border-dash-border bg-dash-panel-2/40 flex items-center gap-3 shrink-0">
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
                        placeholder="Search stock or index"
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

                <div className="h-11 px-4 border-b border-dash-border bg-dash-panel flex items-center justify-between gap-2 shrink-0 overflow-hidden select-none">
                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab("ALL")}
                            className={`h-7 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                                activeTab === "ALL"
                                    ? "bg-primary-green/10 text-primary-green border border-primary-green/25 font-semibold"
                                    : "text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 border border-transparent"
                            }`}
                        >
                            <span>All</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("EQUITY")}
                            className={`h-7 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                                activeTab === "EQUITY"
                                    ? "bg-primary-green/10 text-primary-green border border-primary-green/25 font-semibold"
                                    : "text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 border border-transparent"
                            }`}
                        >
                            <span>Stocks</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("INDEX")}
                            className={`h-7 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                                activeTab === "INDEX"
                                    ? "bg-primary-green/10 text-primary-green border border-primary-green/25 font-semibold"
                                    : "text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 border border-transparent"
                            }`}
                        >
                            <span>Indices</span>
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1"
                >
                    {isLoading || (isFetching && allStocks.length === 0) ? (
                        <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in duration-150">
                            <div className="w-7 h-7 rounded-full border-2 border-primary-green/20 border-t-primary-green animate-spin" />
                            <span className="text-xs text-dash-text-muted font-medium">Loading instruments...</span>
                        </div>
                    ) : allStocks.length === 0 ? (
                        <div className="h-full min-h-[340px] flex flex-col items-center justify-center py-12 text-center text-dash-text-muted space-y-2 animate-in fade-in duration-150">
                            <p className="text-sm font-medium text-dash-text">
                                {debouncedQuery.trim()
                                    ? `No instruments found matching "${debouncedQuery}"`
                                    : "No instruments found in this category"}
                            </p>
                            <p className="text-xs text-dash-text-muted max-w-xs mx-auto">
                                {debouncedQuery.trim()
                                    ? "Check the symbol spelling or try searching by company name."
                                    : "Try switching to another filter tab."}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-dash-border/40 animate-in fade-in duration-150">
                            {allStocks.map((stock) => {
                                const isAdded = watchlistStockIds.has(stock.id);
                                const isItemProcessing = processingStockId === stock.id;
                                const isIndex = stock.type === "INDEX";

                                return (
                                    <div
                                        key={stock.id}
                                        className="p-3 px-4 rounded-xl flex items-center justify-between hover:bg-dash-panel-2/60 transition-colors group"
                                    >
                                        <div className="min-w-0 pr-4">
                                            <div className="text-sm font-semibold tracking-tight text-dash-text">
                                                {renderHighlightedSymbol(stock.symbol, debouncedQuery)}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5 min-w-0">
                                                <span className="text-xs text-dash-text-muted truncate">
                                                    {formatStockDisplayName(stock.name, stock.symbol)}
                                                </span>
                                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-dash-panel-2 border border-dash-border text-dash-text-muted font-medium shrink-0">
                                                    {isIndex ? "INDEX" : "STOCK"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-xs font-mono font-medium text-dash-text-muted uppercase">
                                                {stock.exchange}
                                            </span>

                                            {isAdded ? (
                                                <button
                                                    type="button"
                                                    disabled={isItemProcessing}
                                                    onClick={() => handleRemove(stock)}
                                                    className="p-1 rounded-md text-dash-text hover:text-red-400 hover:bg-dash-panel-2 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-40"
                                                    title="In Watchlist (click to remove)"
                                                    aria-label={`Remove ${stock.symbol} from watchlist`}
                                                >
                                                    {isItemProcessing ? (
                                                        <svg className="w-4 h-4 animate-spin text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                        </svg>
                                                    ) : (
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth="2.2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <path d="m4.5 12.75 6 6 9-13.5" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={isItemProcessing || watchlistCount >= maxLimit}
                                                    onClick={() => handleAdd(stock)}
                                                    className="p-1 rounded-md text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-40"
                                                    title="Add to Watchlist"
                                                    aria-label={`Add ${stock.symbol} to watchlist`}
                                                >
                                                    {isItemProcessing ? (
                                                        <svg className="w-4 h-4 animate-spin text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                        </svg>
                                                    ) : (
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <line x1="12" y1="5" x2="12" y2="19" />
                                                            <line x1="5" y1="12" x2="19" y2="12" />
                                                        </svg>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {isFetchingNextPage && (
                                <div className="py-3 flex items-center justify-center gap-2 text-xs text-dash-text-muted select-none">
                                    <svg className="w-4 h-4 animate-spin text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    <span>Loading more instruments...</span>
                                </div>
                            )}

                            <div ref={sentinelRef} className="h-4 w-full pointer-events-none" />
                        </div>
                    )}
                </div>

                <div className="h-11 px-5 border-t border-dash-border bg-dash-panel-2/30 flex items-center justify-between text-xs text-dash-text-muted shrink-0 select-none">
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
