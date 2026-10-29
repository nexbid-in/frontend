import { useState, useMemo, useCallback, useEffect } from "react";
import {
    useWatchlistQuery,
    useAddToWatchlistMutation,
    useRemoveFromWatchlistMutation,
} from "../hooks/useWatchlist";
import { WatchlistSidebar } from "../components/WatchlistSidebar";
import { StockChart } from "../components/StockChart";
import { StockOverviewPanel } from "../components/StockOverviewPanel";
import type { WatchlistItemDTO } from "../types";
import { getStockMarketQuote, formatINR } from "../utils/stockPriceHelper";
import { useAppSelector } from "@/store/hooks";

export function WatchlistPage() {
    const { data: watchlistItems = [], isLoading } = useWatchlistQuery();
    const addMutation = useAddToWatchlistMutation();
    const removeMutation = useRemoveFromWatchlistMutation();

    const userId = useAppSelector((state) => state.auth.user?.id);
    const lastStockStorageKey = userId ? `nexbid_last_stock_${userId}` : "nexbid_last_stock_guest";

    // Initialize from localStorage if available
    const [selectedStockId, setSelectedStockId] = useState<string | null>(() => {
        if (typeof window === "undefined") return null;
        try {
            return localStorage.getItem(lastStockStorageKey);
        } catch {
            return null;
        }
    });

    const [activeViewMode, setActiveViewMode] = useState<"chart" | "overview">("chart");

    // Real-time live tick stream state for active stock (keyed by stockId)
    const [liveTick, setLiveTick] = useState<{
        stockId: string;
        price: number;
        change: number;
        changePercent: number;
    } | null>(null);

    // Order Execution Modal placeholder state
    const [orderModal, setOrderModal] = useState<{
        isOpen: boolean;
        type: "BUY" | "SELL";
        item: WatchlistItemDTO | null;
    }>({
        isOpen: false,
        type: "BUY",
        item: null,
    });

    // Resolve active stock: prioritize saved/selected stock, fallback to first in list
    const activeItem = useMemo(() => {
        if (watchlistItems.length === 0) return null;
        const targetId = selectedStockId || (typeof window !== "undefined" ? localStorage.getItem(lastStockStorageKey) : null);
        if (!targetId) return watchlistItems[0];
        const found = watchlistItems.find((item) => item.stock.id === targetId || item.stock.symbol === targetId);
        return found ?? watchlistItems[0];
    }, [watchlistItems, selectedStockId, lastStockStorageKey]);

    // Keep localStorage in sync with activeItem so refreshes always reopen the exact visited stock
    useEffect(() => {
        if (activeItem && typeof window !== "undefined") {
            try {
                localStorage.setItem(lastStockStorageKey, activeItem.stock.id);
            } catch (err) {
                console.warn("Failed to persist active stock:", err);
            }
        }
    }, [activeItem, lastStockStorageKey]);

    const activeQuote = useMemo(() => {
        if (!activeItem) return null;
        return getStockMarketQuote(activeItem.stock.symbol);
    }, [activeItem]);

    const handlePriceTick = useCallback((price: number, change: number, changePercent: number, ticker?: string) => {
        if (!activeItem) return;
        // Ignore stale ticks from the previous stock if ticker is specified and doesn't match
        if (ticker && ticker !== activeItem.stock.symbol) return;
        setLiveTick({
            stockId: activeItem.stock.id,
            price,
            change,
            changePercent,
        });
    }, [activeItem]);

    const isCurrentTick = liveTick !== null && activeItem !== null && liveTick.stockId === activeItem.stock.id;
    const currentPrice = isCurrentTick ? liveTick.price : (activeQuote?.price ?? 0);
    const currentChange = isCurrentTick ? liveTick.change : (activeQuote?.change ?? 0);
    const currentChangePercent = isCurrentTick ? liveTick.changePercent : (activeQuote?.changePercent ?? 0);
    const isPositive = currentChange >= 0;

    const handleSelectStock = (item: WatchlistItemDTO) => {
        setLiveTick(null);
        setSelectedStockId(item.stock.id);
        try {
            localStorage.setItem(lastStockStorageKey, item.stock.id);
        } catch (err) {
            console.warn("Failed to save last visited stock:", err);
        }
    };

    const handleOpenChart = (item: WatchlistItemDTO) => {
        setLiveTick(null);
        setSelectedStockId(item.stock.id);
        setActiveViewMode("chart");
        requestAnimationFrame(() => {
            window.dispatchEvent(new Event("resize"));
        });
        try {
            localStorage.setItem(lastStockStorageKey, item.stock.id);
        } catch (err) {
            console.warn("Failed to save last visited stock:", err);
        }
    };

    const handleOpenOverview = (item: WatchlistItemDTO) => {
        setLiveTick(null);
        setSelectedStockId(item.stock.id);
        setActiveViewMode("overview");
        try {
            localStorage.setItem(lastStockStorageKey, item.stock.id);
        } catch (err) {
            console.warn("Failed to save last visited stock:", err);
        }
    };

    const handleViewModeChange = (mode: "chart" | "overview") => {
        setActiveViewMode(mode);
        if (mode === "chart") {
            requestAnimationFrame(() => {
                window.dispatchEvent(new Event("resize"));
            });
        }
    };

    const handleBuy = (item: WatchlistItemDTO) => {
        setOrderModal({
            isOpen: true,
            type: "BUY",
            item,
        });
    };

    const handleSell = (item: WatchlistItemDTO) => {
        setOrderModal({
            isOpen: true,
            type: "SELL",
            item,
        });
    };

    const handleAddStock = async (stockId: string) => {
        setLiveTick(null);
        const added = await addMutation.mutateAsync(stockId);
        setSelectedStockId(added.stockId);
        try {
            localStorage.setItem(lastStockStorageKey, added.stockId);
        } catch (err) {
            console.warn("Failed to save last visited stock:", err);
        }
    };

    const handleDeleteStock = (stockId: string) => {
        if (selectedStockId === stockId && typeof window !== "undefined") {
            try {
                localStorage.removeItem(lastStockStorageKey);
            } catch (err) {
                console.warn("Failed to clear deleted stock from storage:", err);
            }
        }
        removeMutation.mutate(stockId);
    };

    return (
        <div className="flex flex-col lg:flex-row h-full p-4 gap-4 overflow-hidden">
            {/* Left Column: Watchlist Sidebar (~380px fixed width on desktop) */}
            <WatchlistSidebar
                items={watchlistItems}
                isLoading={isLoading}
                selectedStockId={activeItem ? activeItem.stock.id : null}
                onSelectStock={handleSelectStock}
                onOpenChart={handleOpenChart}
                onOpenOverview={handleOpenOverview}
                onBuy={handleBuy}
                onSell={handleSell}
                onAddStock={handleAddStock}
                onDeleteStock={handleDeleteStock}
                isAdding={addMutation.isPending}
                isDeleting={removeMutation.isPending}
            />

            {/* Right Column: Dynamic Main View (Chart or Stock Overview) */}
            <main className="flex-1 bg-dash-panel border border-dash-border rounded-xl flex flex-col h-full overflow-hidden">
                {activeItem && activeQuote ? (
                    <>
                        {/* Top Stock Control Header */}
                        <div className="px-6 py-2 border-b border-dash-border bg-dash-panel-2/30 flex flex-wrap items-center justify-between gap-4 shrink-0">
                            {/* Stock Identity & Live Price */}
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-base font-bold text-dash-text tracking-tight">
                                        {activeItem.stock.symbol}
                                    </h1>
                                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-dash-border text-dash-text-muted bg-dash-card">
                                        {activeItem.stock.exchange}
                                    </span>
                                    {activeItem.stock.type === "INDEX" && (
                                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                                            Index
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-mono font-bold text-dash-text transition-colors">
                                        ₹{formatINR(currentPrice)}
                                    </span>
                                    <span
                                        className={`text-xs font-mono font-semibold transition-colors ${
                                            isPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                                        }`}
                                    >
                                        {isPositive
                                            ? `+${currentChange.toFixed(2)}`
                                            : currentChange.toFixed(2)}{" "}
                                        (
                                        {isPositive
                                            ? `+${currentChangePercent.toFixed(2)}%`
                                            : `${currentChangePercent.toFixed(2)}%`}
                                        )
                                    </span>
                                </div>
                            </div>

                            {/* View Switcher & Quick Order Buttons */}
                            <div className="flex items-center gap-3">
                                {/* View Mode Toggle Pills */}
                                <div className="flex items-center bg-dash-card p-0.5 rounded-lg border border-dash-border">
                                    <button
                                        type="button"
                                        onClick={() => handleViewModeChange("chart")}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-150 cursor-pointer ${
                                            activeViewMode === "chart"
                                                ? "bg-dash-panel text-primary-green shadow-xs border border-dash-border font-semibold"
                                                : "text-dash-text-muted hover:text-dash-text border border-transparent"
                                        }`}
                                    >
                                        Chart
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleViewModeChange("overview")}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-150 cursor-pointer ${
                                            activeViewMode === "overview"
                                                ? "bg-dash-panel text-primary-green shadow-xs border border-dash-border font-semibold"
                                                : "text-dash-text-muted hover:text-dash-text border border-transparent"
                                        }`}
                                    >
                                        Overview
                                    </button>
                                </div>

                                {/* Quick Buy/Sell Buttons (Like Zerodha / Kite Header) */}
                                {activeItem.stock.type !== "INDEX" && activeItem.stock.isTradable && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleBuy(activeItem)}
                                            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-md transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                                        >
                                            <span>BUY</span>
                                            <span className="font-mono text-[11px] opacity-90">
                                                @ {formatINR(currentPrice)}
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSell(activeItem)}
                                            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] rounded-md transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                                        >
                                            <span>SELL</span>
                                            <span className="font-mono text-[11px] opacity-90">
                                                @ {formatINR(currentPrice)}
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dynamic Main View Area */}
                        <div className="flex-1 overflow-hidden relative">
                            <div
                                className={`w-full h-full transition-opacity duration-150 ${
                                    activeViewMode === "chart"
                                        ? "opacity-100 z-10"
                                        : "opacity-0 z-0 pointer-events-none absolute inset-0"
                                }`}
                            >
                                <StockChart
                                    symbol={activeItem.stock.symbol}
                                    exchange={activeItem.stock.exchange}
                                    stockName={activeItem.stock.name}
                                    onPriceTick={handlePriceTick}
                                />
                            </div>

                            <div
                                className={`w-full h-full transition-opacity duration-150 ${
                                    activeViewMode === "overview"
                                        ? "opacity-100 z-10"
                                        : "opacity-0 z-0 pointer-events-none absolute inset-0"
                                }`}
                            >
                                <StockOverviewPanel
                                    item={activeItem}
                                    onOpenChart={handleOpenChart}
                                    onBuy={handleBuy}
                                    onSell={handleSell}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-dash-text-muted space-y-3">
                        <div className="w-14 h-14 rounded-full bg-dash-card flex items-center justify-center text-dash-text-muted border border-dash-border">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M8 12h8" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-dash-text">No Stock Selected</h3>
                            <p className="text-xs text-dash-text-muted mt-1 max-w-sm">
                                Search and add Indian stocks to your watchlist on the left to start viewing live charts and placing trades.
                            </p>
                        </div>
                    </div>
                )}
            </main>

            {/* Simple Order Modal Feedback Placeholder for Phase 5 */}
            {orderModal.isOpen && orderModal.item && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="w-full max-w-md bg-dash-panel border border-dash-border rounded-xl shadow-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-dash-border pb-3">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`px-2 py-0.5 text-xs font-bold text-white rounded ${
                                        orderModal.type === "BUY" ? "bg-[#2563eb]" : "bg-[#ea580c]"
                                    }`}
                                >
                                    {orderModal.type}
                                </span>
                                <span className="text-sm font-semibold text-dash-text">
                                    {orderModal.item.stock.symbol}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOrderModal({ isOpen: false, type: "BUY", item: null })}
                                className="text-dash-text-muted hover:text-dash-text transition-colors cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="text-xs text-dash-text-muted space-y-2">
                            <p>
                                <strong className="text-dash-text">{orderModal.item.stock.name}</strong> ({orderModal.item.stock.exchange})
                            </p>
                            <p>
                                Market Price: <span className="font-mono text-dash-text font-semibold">₹{formatINR(getStockMarketQuote(orderModal.item.stock.symbol).price)}</span>
                            </p>
                            <div className="p-3 bg-dash-panel-2 rounded-lg border border-dash-border text-xs text-dash-text-muted">
                                Full Order Execution Form (Intraday MIS / Longterm CNC, Quantity, Limit vs Market) will be connected here.
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setOrderModal({ isOpen: false, type: "BUY", item: null })}
                                className="px-4 py-1.5 text-xs rounded-md border border-dash-border text-dash-text hover:bg-dash-card transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => setOrderModal({ isOpen: false, type: "BUY", item: null })}
                                className={`px-4 py-1.5 text-xs font-semibold text-white rounded-md transition-colors cursor-pointer ${
                                    orderModal.type === "BUY" ? "bg-[#2563eb] hover:bg-[#1d4ed8]" : "bg-[#ea580c] hover:bg-[#c2410c]"
                                }`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
