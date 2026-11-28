import { useState, useMemo, useEffect } from "react";
import { marketWebSocketService } from "@/features/watchlist";
import { usePositionsQuery, useHoldingsQuery } from "./useTrading";

export interface PortfolioPositionsSummary {
    totalUnrealizedPnL: number;
    totalRealizedPnL: number;
    netPnL: number;
    sessionPositionsCount: number;
    positionsCount: {
        total: number;
        open: number;
        closed: number;
    };
}

export interface PortfolioHoldingsSummary {
    totalInvested: number;
    currentValue: number;
    totalPnL: number;
    totalPnLPercentage: number;
    todayPnL: number;
    todayPnLPercentage: number;
    holdingsCount: number;
    gainersCount: number;
    losersCount: number;
    exitedCount: number;
}

/**
 * Manages portfolio queries, live market WebSocket subscriptions for held/open instruments,
 * and memoized real-time P&L summaries for both Positions and Holdings tabs.
 */
export function usePortfolioLiveData() {
    const [livePrices, setLivePrices] = useState<Record<string, number>>({});

    const positionsQuery = usePositionsQuery("ALL");
    const holdingsQuery = useHoldingsQuery();

    useEffect(() => {
        const symbolsToSubscribe = new Set<string>();

        (positionsQuery.data?.positions ?? [])
            .filter((p) => p.quantity > 0)
            .forEach((p) => symbolsToSubscribe.add(p.symbol));

        (holdingsQuery.data?.holdings ?? []).forEach((h) => symbolsToSubscribe.add(h.symbol));
        (holdingsQuery.data?.exitedHoldings ?? []).forEach((h) => symbolsToSubscribe.add(h.symbol));

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

    const positionsSummary = useMemo<PortfolioPositionsSummary>(() => {
        const positions = positionsQuery.data?.positions ?? [];
        const openPositions = positions.filter((p) => p.quantity > 0);
        const totalRealizedPnL = positionsQuery.data?.summary?.totalRealizedPnL ?? 0;

        let totalUnrealizedPnL = 0;

        for (const pos of openPositions) {
            const cachedTick = marketWebSocketService.getLatestTick(pos.symbol);
            const currentLtp =
                livePrices[pos.symbol] ?? cachedTick?.ltp ?? pos.currentLtp ?? pos.averagePrice;
            const isLong = pos.side === "LONG" || (pos.side as string) === "BUY";

            const posUnrealized = isLong
                ? (currentLtp - pos.averagePrice) * pos.quantity
                : (pos.averagePrice - currentLtp) * pos.quantity;

            totalUnrealizedPnL += posUnrealized;
        }

        const roundedUnrealizedPnL = +totalUnrealizedPnL.toFixed(2);
        const netPnL = +(totalRealizedPnL + roundedUnrealizedPnL).toFixed(2);

        return {
            totalUnrealizedPnL: roundedUnrealizedPnL,
            totalRealizedPnL,
            netPnL,
            sessionPositionsCount: positions.length,
            positionsCount:
                positionsQuery.data?.summary?.positionsCount ?? { total: 0, open: 0, closed: 0 },
        };
    }, [positionsQuery.data?.positions, positionsQuery.data?.summary, livePrices]);

    const holdingsSummary = useMemo<PortfolioHoldingsSummary>(() => {
        const holdings = holdingsQuery.data?.holdings ?? [];
        const exitedCount =
            holdingsQuery.data?.exitedHoldings?.length ??
            holdingsQuery.data?.summary?.exitedCount ??
            0;

        if (holdings.length === 0) {
            return {
                totalInvested: 0,
                currentValue: 0,
                totalPnL: 0,
                totalPnLPercentage: 0,
                todayPnL: 0,
                todayPnLPercentage: 0,
                holdingsCount: 0,
                gainersCount: 0,
                losersCount: 0,
                exitedCount,
            };
        }

        let totalInvested = 0;
        let totalCurrentValue = 0;
        let totalTodayPnL = 0;
        let gainersCount = 0;
        let losersCount = 0;

        for (const item of holdings) {
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

            if (currVal >= item.investedAmount) {
                gainersCount++;
            } else {
                losersCount++;
            }
        }

        totalInvested = +totalInvested.toFixed(2);
        totalCurrentValue = +totalCurrentValue.toFixed(2);
        totalTodayPnL = +totalTodayPnL.toFixed(2);

        const totalPnL = +(totalCurrentValue - totalInvested).toFixed(2);
        const totalPnLPercentage =
            totalInvested > 0 ? +((totalPnL / totalInvested) * 100).toFixed(2) : 0;
        const todayPnLPercentage =
            totalInvested > 0 ? +((totalTodayPnL / totalInvested) * 100).toFixed(2) : 0;

        return {
            totalInvested,
            currentValue: totalCurrentValue,
            totalPnL,
            totalPnLPercentage,
            todayPnL: totalTodayPnL,
            todayPnLPercentage,
            holdingsCount: holdings.length,
            gainersCount,
            losersCount,
            exitedCount,
        };
    }, [
        holdingsQuery.data?.holdings,
        holdingsQuery.data?.exitedHoldings,
        holdingsQuery.data?.summary,
        livePrices,
    ]);

    return {
        livePrices,
        positionsQuery,
        holdingsQuery,
        positionsSummary,
        holdingsSummary,
    };
}
