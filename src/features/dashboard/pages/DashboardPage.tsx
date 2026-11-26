import { useState, useEffect, useMemo, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "@/constants/routes";
import { useAppSelector } from "@/store/hooks";
import {
    useWatchlistQuery,
    useAddToWatchlistMutation,
    useRemoveFromWatchlistMutation,
    WatchlistSidebar,
    marketWebSocketService,
    type WatchlistItemDTO,
} from "@/features/watchlist";
import {
    OrderPlacementModal,
    usePositionsQuery,
    useHoldingsQuery,
} from "@/features/trading";
import { useWalletOverview } from "@/features/funds";
import { useDashboardOverviewQuery } from "../hooks/useDashboardOverview";
import {
    MarketStatusHeader,
    MarginSummaryCard,
    HoldingsOverviewCard,
    PositionsOverviewCard,
    DashboardQuickLinks,
} from "../components";
import type {
    DashboardMargins,
    DashboardHoldingsOverview,
    DashboardPositionsOverview,
} from "../types";

export const DashboardPage: FC = () => {
    const navigate = useNavigate();
    const userId = useAppSelector((state) => state.auth.user?.id);

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useDashboardOverviewQuery();

    const { data: walletOverview, refetch: refetchWallet } = useWalletOverview({ enabled: !!userId });
    const positionsQuery = usePositionsQuery("ALL");
    const holdingsQuery = useHoldingsQuery();
    const [livePrices, setLivePrices] = useState<Record<string, number>>({});

    const [isManualRefreshing, setIsManualRefreshing] = useState(false);

    const handleManualRefresh = async () => {
        try {
            setIsManualRefreshing(true);
            await Promise.all([
                refetch(),
                positionsQuery.refetch(),
                holdingsQuery.refetch(),
                refetchWallet(),
            ]);
        } finally {
            setIsManualRefreshing(false);
        }
    };

    const liveMargins = useMemo<DashboardMargins | undefined>(() => {
        if (walletOverview) {
            return {
                availableMargin:
                    walletOverview.availableMargin ??
                    (walletOverview.balance - (walletOverview.usedMargin ?? 0)),
                usedMargin: walletOverview.usedMargin ?? 0,
                availableCash: walletOverview.balance ?? 0,
                openingBalance: data?.margins?.openingBalance ?? walletOverview.balance ?? 0,
                tradingStatus:
                    walletOverview.tradingStatus ?? data?.margins?.tradingStatus ?? "ACTIVE",
            };
        }
        return data?.margins;
    }, [walletOverview, data?.margins]);

    useEffect(() => {
        const symbolsToSubscribe = new Set<string>();

        (positionsQuery.data?.positions ?? [])
            .filter((p) => p.quantity > 0)
            .forEach((p) => symbolsToSubscribe.add(p.symbol));

        (holdingsQuery.data?.holdings ?? [])
            .forEach((h) => symbolsToSubscribe.add(h.symbol));

        (holdingsQuery.data?.exitedHoldings ?? [])
            .forEach((h) => symbolsToSubscribe.add(h.symbol));

        if (symbolsToSubscribe.size === 0) return;

        const unsubs = Array.from(symbolsToSubscribe).map((symbol) =>
            marketWebSocketService.subscribe(symbol, (tick) => {
                setLivePrices((prev) => {
                    if (prev[symbol] === tick.ltp) return prev;
                    return { ...prev, [symbol]: tick.ltp };
                });
            })
        );

        return () => {
            unsubs.forEach((unsub) => unsub());
        };
    }, [
        positionsQuery.data?.positions,
        holdingsQuery.data?.holdings,
        holdingsQuery.data?.exitedHoldings,
    ]);

    const liveHoldings = useMemo<DashboardHoldingsOverview | undefined>(() => {
        const holdingsList = holdingsQuery.data?.holdings;

        if (!holdingsList && data?.holdings) {
            return data.holdings;
        }

        if (!holdingsList) return data?.holdings;

        if (holdingsList.length === 0) {
            return {
                totalHoldingsCount: 0,
                totalInvestmentValue: 0,
                totalCurrentValue: 0,
                totalPnl: 0,
                totalPnlPercentage: 0,
                dayPnl: 0,
                dayPnlPercentage: 0,
                allocation: [],
            };
        }

        let totalInvested = 0;
        let totalCurrentValue = 0;
        let totalTodayPnL = 0;

        for (const item of holdingsList) {
            totalInvested += item.investedAmount;
            const cachedTick = marketWebSocketService.getLatestTick(item.symbol);
            const ltp =
                livePrices[item.symbol] ?? cachedTick?.ltp ?? item.currentLtp ?? item.buyAvgPrice;

            const currVal = +(ltp * item.quantity).toFixed(2);
            totalCurrentValue += currVal;

            const itemTotalPnL = +((ltp - item.buyAvgPrice) * item.quantity).toFixed(2);
            const itemDayPnL = item.isBoughtToday
                ? itemTotalPnL
                : +((cachedTick?.change ?? item.dayChange) * item.quantity).toFixed(2);

            totalTodayPnL += itemDayPnL;
        }

        totalInvested = +totalInvested.toFixed(2);
        totalCurrentValue = +totalCurrentValue.toFixed(2);
        totalTodayPnL = +totalTodayPnL.toFixed(2);

        const totalPnl = +(totalCurrentValue - totalInvested).toFixed(2);
        const totalPnlPercentage =
            totalInvested > 0 ? +((totalPnl / totalInvested) * 100).toFixed(2) : 0;
        const todayPnLPercentage =
            totalInvested > 0 ? +((totalTodayPnL / totalInvested) * 100).toFixed(2) : 0;

        return {
            totalHoldingsCount: holdingsList.length,
            totalInvestmentValue: totalInvested,
            totalCurrentValue,
            totalPnl,
            totalPnlPercentage,
            dayPnl: totalTodayPnL,
            dayPnlPercentage: todayPnLPercentage,
        };
    }, [holdingsQuery.data?.holdings, data?.holdings, livePrices]);

    const livePositions = useMemo<DashboardPositionsOverview | undefined>(() => {
        if (!positionsQuery.data && data?.positions) {
            return data.positions;
        }

        if (!positionsQuery.data) return data?.positions;

        const positions = positionsQuery.data.positions ?? [];
        const openPositions = positions.filter((p) => p.quantity > 0);
        const totalRealizedPnL = positionsQuery.data.summary?.totalRealizedPnL ?? 0;

        let totalUnrealizedPnL = 0;
        for (const pos of openPositions) {
            const cachedTick = marketWebSocketService.getLatestTick(pos.symbol);
            const ltp = livePrices[pos.symbol] ?? cachedTick?.ltp ?? pos.currentLtp ?? pos.averagePrice;
            const isLong = pos.side === "LONG" || (pos.side as string) === "BUY";
            const posUnrealized = isLong
                ? (ltp - pos.averagePrice) * pos.quantity
                : (pos.averagePrice - ltp) * pos.quantity;
            totalUnrealizedPnL += posUnrealized;
        }

        totalUnrealizedPnL = +totalUnrealizedPnL.toFixed(2);
        const dayNetPnL = +(totalRealizedPnL + totalUnrealizedPnL).toFixed(2);

        return {
            openPositionsCount: openPositions.length,
            dayRealizedPnL: totalRealizedPnL,
            dayUnrealizedPnL: totalUnrealizedPnL,
            dayNetPnL,
            sessionPositionsCount: positions.length,
        };
    }, [positionsQuery.data, data?.positions, livePrices]);

    const { data: watchlistItems = [], isLoading: isWatchlistLoading } = useWatchlistQuery();
    const addMutation = useAddToWatchlistMutation();
    const removeMutation = useRemoveFromWatchlistMutation();

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
                        margins={liveMargins}
                        isLoading={isLoading && !walletOverview}
                    />

                    <div className="pt-2 sm:pt-3 border-t border-dash-border/60">
                        <HoldingsOverviewCard
                            holdings={liveHoldings}
                            isLoading={isLoading && holdingsQuery.isLoading}
                        />
                    </div>

                    <div className="pt-2 sm:pt-3 border-t border-dash-border/60">
                        <PositionsOverviewCard
                            positions={livePositions}
                            isLoading={isLoading && positionsQuery.isLoading}
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
