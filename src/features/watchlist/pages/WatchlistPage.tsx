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
import { useAppSelector } from "@/store/hooks";
import { OrderPlacementModal } from "@/features/trading";

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

    const handleSelectStock = (item: WatchlistItemDTO) => {
        setSelectedStockId(item.stock.id);
        try {
            localStorage.setItem(lastStockStorageKey, item.stock.id);
        } catch (err) {
            console.warn("Failed to save last visited stock:", err);
        }
    };

    const handleOpenChart = (item: WatchlistItemDTO) => {
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

    const handleChartSymbolChange = useCallback(
        (newSymbol: string) => {
            const found = watchlistItems.find(
                (item) => item.stock.symbol.toUpperCase() === newSymbol.toUpperCase()
            );
            if (found) {
                setSelectedStockId(found.stock.id);
            }
        },
        [watchlistItems]
    );

    const handleOpenOverview = (item: WatchlistItemDTO) => {
        setSelectedStockId(item.stock.id);
        setActiveViewMode("overview");
        try {
            localStorage.setItem(lastStockStorageKey, item.stock.id);
        } catch (err) {
            console.warn("Failed to save last visited stock:", err);
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
        // Ensure the current active stock remains selected so adding a new stock does not switch the chart
        if (activeItem && !selectedStockId) {
            setSelectedStockId(activeItem.stock.id);
        }
        await addMutation.mutateAsync(stockId);
    };

    const handleDeleteStock = async (stockId: string) => {
        if (selectedStockId === stockId && typeof window !== "undefined") {
            try {
                localStorage.removeItem(lastStockStorageKey);
            } catch (err) {
                console.warn("Failed to clear deleted stock from storage:", err);
            }
        }
        try {
            await removeMutation.mutateAsync(stockId);
        } catch {
            // Error notification is dispatched within the mutation hook
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-full p-2 gap-2 overflow-hidden">
            {/* Left Column: Watchlist Sidebar (~320px fixed width on desktop) */}
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
            <main className="flex-1 bg-dash-panel border border-dash-border rounded-md flex flex-col h-full overflow-hidden">
                {activeItem ? (
                    <div className="w-full h-full overflow-hidden relative">
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
                                isTradable={activeItem.stock.isTradable}
                                stockType={activeItem.stock.type}
                                onSymbolChange={handleChartSymbolChange}
                                onBuy={() => handleBuy(activeItem)}
                                onSell={() => handleSell(activeItem)}
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

            {/* Production-grade Order Placement Modal */}
            {orderModal.isOpen && orderModal.item && (
                <OrderPlacementModal
                    isOpen={orderModal.isOpen}
                    onClose={() => setOrderModal({ isOpen: false, type: "BUY", item: null })}
                    initialSymbol={orderModal.item.stock.symbol}
                    initialSide={orderModal.type}
                    initialExchange={orderModal.item.stock.exchange}
                    stockName={orderModal.item.stock.name}
                />
            )}
        </div>
    );
}
