import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "@/constants/routes";
import { useAppSelector } from "@/store/hooks";
import {
    useWatchlistQuery,
    useAddToWatchlistMutation,
    useRemoveFromWatchlistMutation,
    WatchlistSidebar,
    type WatchlistItemDTO,
} from "@/features/watchlist";
import { OrderPlacementModal } from "@/features/trading";
import { useDashboardOverviewQuery } from "../hooks/useDashboardOverview";
import {
    MarketStatusHeader,
    MarginSummaryCard,
    HoldingsOverviewCard,
    PositionsOverviewCard,
    DashboardQuickLinks,
} from "../components";

export const DashboardPage: FC = () => {
    const navigate = useNavigate();

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useDashboardOverviewQuery();

    const [isManualRefreshing, setIsManualRefreshing] = useState(false);

    const handleManualRefresh = async () => {
        try {
            setIsManualRefreshing(true);
            await refetch();
        } finally {
            setIsManualRefreshing(false);
        }
    };

    const { data: watchlistItems = [], isLoading: isWatchlistLoading } = useWatchlistQuery();
    const addMutation = useAddToWatchlistMutation();
    const removeMutation = useRemoveFromWatchlistMutation();

    const userId = useAppSelector((state) => state.auth.user?.id);
    const lastStockStorageKey = userId ? `nexbid_last_stock_${userId}` : "nexbid_last_stock_guest";

    const [selectedStockId, setSelectedStockId] = useState<string | null>(() => {
        if (typeof window === "undefined") return null;
        try {
            return localStorage.getItem(lastStockStorageKey);
        } catch {
            return null;
        }
    });

    const [orderModal, setOrderModal] = useState<{
        isOpen: boolean;
        type: "BUY" | "SELL";
        item: WatchlistItemDTO | null;
    }>({
        isOpen: false,
        type: "BUY",
        item: null,
    });

    const handleSelectStock = (item: WatchlistItemDTO) => {
        setSelectedStockId(item.stock.id);
        try {
            localStorage.setItem(lastStockStorageKey, item.stock.id);
        } catch (err) {
            console.warn("Failed to persist selected stock:", err);
        }
        navigate(APP_ROUTES.USER.WATCHLIST);
    };

    const handleOpenChart = (item: WatchlistItemDTO) => {
        handleSelectStock(item);
    };

    const handleOpenOverview = (item: WatchlistItemDTO) => {
        handleSelectStock(item);
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
            // Handled within mutation toast
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-full p-2 gap-2 overflow-hidden bg-dash-bg">
            <WatchlistSidebar
                items={watchlistItems}
                isLoading={isWatchlistLoading}
                selectedStockId={selectedStockId}
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

            <main className="flex-1 min-w-0 bg-dash-panel border border-dash-border rounded-md flex flex-col h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-4 sm:p-5 lg:p-6">
                <div className="flex-1 flex flex-col justify-between min-h-full gap-3 sm:gap-4">
                    <MarketStatusHeader
                        user={data?.user}
                        marketStatus={data?.marketStatus}
                        isFetching={isManualRefreshing}
                        onRefresh={() => void handleManualRefresh()}
                    />

                    {isError && (
                        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-between text-xs">
                            <span>
                                {error instanceof Error ? error.message : "Failed to load dashboard overview."}
                            </span>
                            <button
                                type="button"
                                onClick={() => void handleManualRefresh()}
                                className="px-3 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 font-semibold cursor-pointer"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    <MarginSummaryCard
                        margins={data?.margins}
                        isLoading={isLoading}
                    />

                    <div className="pt-2 sm:pt-3 border-t border-dash-border/60">
                        <HoldingsOverviewCard
                            holdings={data?.holdings}
                            isLoading={isLoading}
                        />
                    </div>

                    <div className="pt-2 sm:pt-3 border-t border-dash-border/60">
                        <PositionsOverviewCard
                            positions={data?.positions}
                            isLoading={isLoading}
                        />
                    </div>

                    <div className="pt-2 sm:pt-3 border-t border-dash-border/60">
                        <DashboardQuickLinks />
                    </div>
                </div>
            </main>

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
};
