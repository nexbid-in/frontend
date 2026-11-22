import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    usePositionsQuery,
    useHoldingsQuery,
    useSquareOffPositionMutation,
} from "../hooks/useTrading";
import { OrderPlacementModal } from "../components/OrderPlacementModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { marketWebSocketService, useLiveStockQuote, formatINR } from "@/features/watchlist";
import { APP_ROUTES } from "@/constants/routes";
import type {
    PositionResponseDTO,
    PositionsFilter,
    HoldingItem,
    PortfolioMainTab,
    HoldingsFilter,
    OrderSide,
} from "../types";

// ============================================================================
// POSITIONS TABLE ROW (Intraday MIS)
// ============================================================================
interface PositionRowProps {
    position: PositionResponseDTO;
    onSquareOff: (position: PositionResponseDTO) => void;
    isSquaringOff: boolean;
}

const PositionTableRow: React.FC<PositionRowProps> = ({
    position,
    onSquareOff,
    isSquaringOff,
}) => {
    const quote = useLiveStockQuote(position.symbol);

    const liveLtp = quote.price > 0 ? quote.price : position.currentLtp;
    const isLong = position.side === "LONG";
    const isOpen = position.quantity > 0;

    const liveUnrealizedPnL = isOpen
        ? isLong
            ? (liveLtp - position.averagePrice) * position.quantity
            : (position.averagePrice - liveLtp) * position.quantity
        : 0;

    const liveTotalPnL = position.realizedPnL + liveUnrealizedPnL;

    const liveReturnPercent =
        position.averagePrice > 0 && isOpen
            ? ((liveLtp - position.averagePrice) / position.averagePrice) * 100 * (isLong ? 1 : -1)
            : position.pnlPercentage;

    const isPnLPositive = liveTotalPnL >= 0;
    const pnlTextColor = isPnLPositive ? "text-[#22c55e]" : "text-[#ef4444]";

    return (
        <tr
            className={`border-b border-dash-border transition-[background-color,opacity] duration-150 group ${
                isOpen
                    ? "hover:bg-dash-panel-2/60"
                    : "hover:bg-dash-panel-2/30 opacity-60 hover:opacity-85"
            }`}
        >
            <td className="py-3 px-3 font-medium whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-dash-text">
                        {position.symbol}
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-dash-panel-2 text-dash-text-muted border border-dash-border">
                        NSE
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-dash-panel-2 text-dash-text border border-dash-border font-semibold">
                        {position.productType}
                    </span>
                </div>
            </td>

            <td className="py-3 px-3 whitespace-nowrap">
                {isOpen ? (
                    <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider inline-block ${
                            isLong
                                ? "bg-[#00873e]/15 text-[#00873e] border border-[#00873e]/30"
                                : "bg-[#c83200]/15 text-[#c83200] border border-[#c83200]/30"
                        }`}
                    >
                        {position.side}
                    </span>
                ) : (
                    <span className="text-dash-text-muted font-mono pl-2 select-none">—</span>
                )}
            </td>

            <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                <span className="font-semibold text-dash-text">
                    {position.quantity}
                </span>
            </td>

            <td className="py-3 px-3 text-right font-mono text-dash-text whitespace-nowrap">
                ₹{formatINR(position.averagePrice)}
            </td>

            <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                <span
                    className={`font-semibold transition-colors duration-200 ${
                        isOpen
                            ? quote.flashDirection === "up"
                                ? "text-[#22c55e]"
                                : quote.flashDirection === "down"
                                ? "text-[#ef4444]"
                                : "text-dash-text"
                            : "text-dash-text"
                    }`}
                >
                    ₹{formatINR(liveLtp)}
                </span>
            </td>

            <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                <span className={`font-semibold ${pnlTextColor}`}>
                    {liveTotalPnL >= 0
                        ? `+₹${formatINR(liveTotalPnL)}`
                        : `-₹${formatINR(Math.abs(liveTotalPnL))}`}
                </span>
                <span className={`text-[10px] block ${pnlTextColor}`}>
                    {liveReturnPercent >= 0
                        ? `(+${liveReturnPercent.toFixed(2)}%)`
                        : `(${liveReturnPercent.toFixed(2)}%)`}
                </span>
            </td>

            <td className="py-3 px-3 text-right whitespace-nowrap">
                {isOpen ? (
                    <button
                        type="button"
                        disabled={isSquaringOff}
                        onClick={() => onSquareOff(position)}
                        className="px-2.5 py-1 text-[11px] font-medium text-red hover:text-white hover:bg-red rounded border border-red/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                        Exit
                    </button>
                ) : (
                    <span className="text-dash-text-muted font-mono pr-2 select-none">—</span>
                )}
            </td>
        </tr>
    );
};

// ============================================================================
// HOLDINGS TABLE ROW (Long-term Delivery CNC)
// ============================================================================
interface HoldingRowProps {
    item: HoldingItem;
    onBuy: (item: HoldingItem) => void;
    onSell: (item: HoldingItem) => void;
}

const HoldingTableRow: React.FC<HoldingRowProps> = ({ item, onBuy, onSell }) => {
    const quote = useLiveStockQuote(item.symbol);

    const liveLtp = quote.price > 0 ? quote.price : item.currentLtp;
    const liveCurrentValue = item.isExited ? item.currentValue : +(liveLtp * item.quantity).toFixed(2);
    const liveTotalPnL = item.isExited ? item.totalPnL : +((liveLtp - item.buyAvgPrice) * item.quantity).toFixed(2);
    const liveTotalPnLPercentage = item.isExited
        ? item.totalPnLPercentage
        : item.investedAmount > 0
        ? +((liveTotalPnL / item.investedAmount) * 100).toFixed(2)
        : 0;

    const liveDayPnL = item.isExited
        ? item.dayPnL
        : item.isBoughtToday
        ? liveTotalPnL
        : quote.hasLiveTick
        ? +((quote.change ?? 0) * item.quantity).toFixed(2)
        : item.dayPnL;

    const dayChange = quote.hasLiveTick
        ? quote.change ?? 0
        : item.isBoughtToday
        ? +(liveLtp - item.buyAvgPrice).toFixed(2)
        : item.dayChange;

    const dayChangePercentage = quote.hasLiveTick
        ? quote.changePercent ?? 0
        : item.isBoughtToday
        ? liveTotalPnLPercentage
        : item.dayChangePercentage;

    const isTotalPnLPositive = liveTotalPnL >= 0;
    const isDayPnLPositive = liveDayPnL >= 0;
    const isDayChangePositive = dayChange >= 0;

    return (
        <tr className="border-b border-dash-border hover:bg-dash-panel-2/60 transition-[background-color] duration-150 group">
            <td className="py-3 px-3 font-medium whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                    <span className="text-dash-text font-semibold">{item.symbol}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-dash-panel-2 text-dash-text-muted border border-dash-border">
                        NSE
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                        CNC
                    </span>
                </div>
            </td>

            <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                <span className="font-semibold text-dash-text">{item.quantity}</span>
            </td>

            <td className="py-3 px-3 text-right font-mono text-dash-text whitespace-nowrap">
                ₹{formatINR(item.buyAvgPrice)}
            </td>

            <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                <span
                    className={`font-semibold transition-colors duration-200 ${
                        quote.flashDirection === "up"
                            ? "text-[#22c55e]"
                            : quote.flashDirection === "down"
                            ? "text-[#ef4444]"
                            : "text-dash-text"
                    }`}
                >
                    ₹{formatINR(liveLtp)}
                </span>
                <span
                    className={`text-[10px] block font-mono ${
                        isDayChangePositive ? "text-[#22c55e]" : "text-[#ef4444]"
                    }`}
                >
                    {isDayChangePositive ? `+${dayChange.toFixed(2)}` : dayChange.toFixed(2)} (
                    {isDayChangePositive
                        ? `+${dayChangePercentage.toFixed(2)}%`
                        : `${dayChangePercentage.toFixed(2)}%`}
                    )
                </span>
            </td>

            <td className="py-3 px-3 text-right font-mono text-dash-text whitespace-nowrap">
                ₹{formatINR(item.investedAmount)}
            </td>

            <td className="py-3 px-3 text-right font-mono text-dash-text whitespace-nowrap">
                ₹{formatINR(liveCurrentValue)}
            </td>

            {item.isExited ? (
                <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                    <span
                        className={`font-semibold ${
                            isTotalPnLPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                        }`}
                    >
                        {liveTotalPnL >= 0
                            ? `+₹${formatINR(liveTotalPnL)}`
                            : `-₹${formatINR(Math.abs(liveTotalPnL))}`}
                    </span>
                    <span
                        className={`text-[10px] block ${
                            isTotalPnLPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                        }`}
                    >
                        {liveTotalPnLPercentage >= 0
                            ? `(+${liveTotalPnLPercentage.toFixed(2)}%)`
                            : `(${liveTotalPnLPercentage.toFixed(2)}%)`}
                    </span>
                </td>
            ) : (
                <>
                    <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                        <span
                            className={`font-semibold ${
                                isTotalPnLPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                            }`}
                        >
                            {liveTotalPnL >= 0
                                ? `+₹${formatINR(liveTotalPnL)}`
                                : `-₹${formatINR(Math.abs(liveTotalPnL))}`}
                        </span>
                        <span
                            className={`text-[10px] block ${
                                isTotalPnLPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                            }`}
                        >
                            {liveTotalPnLPercentage >= 0
                                ? `(+${liveTotalPnLPercentage.toFixed(2)}%)`
                                : `(${liveTotalPnLPercentage.toFixed(2)}%)`}
                        </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                        <span
                            className={`font-semibold ${
                                isDayPnLPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                            }`}
                        >
                            {liveDayPnL >= 0
                                ? `+₹${formatINR(liveDayPnL)}`
                                : `-₹${formatINR(Math.abs(liveDayPnL))}`}
                        </span>
                        <span
                            className={`text-[10px] block ${
                                isDayChangePositive ? "text-[#22c55e]" : "text-[#ef4444]"
                            }`}
                        >
                            {dayChangePercentage >= 0
                                ? `(+${dayChangePercentage.toFixed(2)}%)`
                                : `(${dayChangePercentage.toFixed(2)}%)`}
                        </span>
                    </td>
                </>
            )}

            <td className="py-3 px-3 text-right whitespace-nowrap">
                <div className="inline-flex items-center gap-1.5 justify-end">
                    <button
                        type="button"
                        onClick={() => onBuy(item)}
                        className="w-6 h-6 rounded bg-[#00873e]/15 text-[#00873e] hover:bg-[#00873e] hover:text-white border border-[#00873e]/30 font-bold text-[11px] flex items-center justify-center transition-all cursor-pointer"
                        title={item.isExited ? `Buy ${item.symbol} again (CNC)` : `Buy more ${item.symbol} (CNC)`}
                    >
                        B
                    </button>
                    {!item.isExited && (
                        <button
                            type="button"
                            onClick={() => onSell(item)}
                            className="w-6 h-6 rounded bg-[#c83200]/15 text-[#c83200] hover:bg-[#c83200] hover:text-white border border-[#c83200]/30 font-bold text-[11px] flex items-center justify-center transition-all cursor-pointer"
                            title={`Sell ${item.quantity} qty of ${item.symbol} (CNC)`}
                        >
                            S
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};

// ============================================================================
// MAIN PORTFOLIO PAGE
// ============================================================================
export const PortfolioPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get("tab")?.toUpperCase();
    const mainTab: PortfolioMainTab = tabParam === "HOLDINGS" ? "HOLDINGS" : "POSITIONS";

    const setMainTab = (tab: PortfolioMainTab) => {
        if (tab === "HOLDINGS") {
            setSearchParams({ tab: "holdings" });
        } else {
            setSearchParams({});
        }
    };

    // Global Search & Live Prices
    const [searchQuery, setSearchQuery] = useState("");
    const [livePrices, setLivePrices] = useState<Record<string, number>>({});

    // Positions State
    const [selectedPositionsFilter, setSelectedPositionsFilter] =
        useState<PositionsFilter>("ALL");
    const [squaringOffPosition, setSquaringOffPosition] =
        useState<PositionResponseDTO | null>(null);

    // Holdings State
    const [holdingsFilter, setHoldingsFilter] = useState<HoldingsFilter>("ALL");

    // Order Placement Modal State for Holdings [B] & [S]
    const [orderModal, setOrderModal] = useState<{
        isOpen: boolean;
        symbol: string;
        side: OrderSide;
        quantity: number;
    }>({
        isOpen: false,
        symbol: "",
        side: "BUY",
        quantity: 1,
    });

    // Queries & Mutations
    const positionsQuery = usePositionsQuery("ALL");
    const holdingsQuery = useHoldingsQuery();
    const squareOffMutation = useSquareOffPositionMutation();

    // WebSocket Price Subscriptions
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
    }, [positionsQuery.data?.positions, holdingsQuery.data?.holdings, holdingsQuery.data?.exitedHoldings]);

    // Positions Real-Time Live Summary
    const positionsSummary = useMemo(() => {
        const positions = positionsQuery.data?.positions ?? [];
        const openPositions = positions.filter((p) => p.quantity > 0);
        const totalRealizedPnL = positionsQuery.data?.summary?.totalRealizedPnL ?? 0;

        let totalInvestment = 0;
        let currentPortfolioValue = 0;
        let totalUnrealizedPnL = 0;

        for (const pos of openPositions) {
            const cost = pos.averagePrice * pos.quantity;
            totalInvestment += cost;

            const cachedTick = marketWebSocketService.getLatestTick(pos.symbol);
            const currentLtp =
                livePrices[pos.symbol] ?? cachedTick?.ltp ?? pos.currentLtp ?? pos.averagePrice;
            const isLong = pos.side === "LONG";

            const posUnrealized = isLong
                ? (currentLtp - pos.averagePrice) * pos.quantity
                : (pos.averagePrice - currentLtp) * pos.quantity;

            totalUnrealizedPnL += posUnrealized;

            if (isLong) {
                currentPortfolioValue += currentLtp * pos.quantity;
            } else {
                currentPortfolioValue += cost + posUnrealized;
            }
        }

        const netPnL = totalRealizedPnL + totalUnrealizedPnL;
        const overallReturnPercentage =
            totalInvestment > 0 ? (totalUnrealizedPnL / totalInvestment) * 100 : 0;

        return {
            totalInvestment:
                totalInvestment > 0
                    ? totalInvestment
                    : (positionsQuery.data?.summary?.totalInvestment ?? 0),
            currentPortfolioValue:
                totalInvestment > 0
                    ? currentPortfolioValue
                    : (positionsQuery.data?.summary?.currentPortfolioValue ?? 0),
            totalUnrealizedPnL,
            totalRealizedPnL,
            netPnL,
            overallReturnPercentage,
            positionsCount:
                positionsQuery.data?.summary?.positionsCount ?? { total: 0, open: 0, closed: 0 },
        };
    }, [positionsQuery.data?.positions, positionsQuery.data?.summary, livePrices]);

    const holdingsSummary = useMemo(() => {
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
    }, [holdingsQuery.data?.holdings, holdingsQuery.data?.exitedHoldings, holdingsQuery.data?.summary, livePrices]);

    // Filtered Positions
    const filteredPositions = useMemo(() => {
        const list = positionsQuery.data?.positions ?? [];
        return list
            .filter((p) => {
                if (selectedPositionsFilter === "OPEN" && p.quantity <= 0) {
                    return false;
                }
                if (selectedPositionsFilter === "CLOSED" && p.quantity > 0) {
                    return false;
                }
                if (
                    searchQuery.trim() !== "" &&
                    !p.symbol.toLowerCase().includes(searchQuery.toLowerCase().trim())
                ) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => {
                const aOpen = a.quantity > 0 ? 1 : 0;
                const bOpen = b.quantity > 0 ? 1 : 0;
                if (aOpen !== bOpen) {
                    return bOpen - aOpen;
                }
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            });
    }, [positionsQuery.data?.positions, selectedPositionsFilter, searchQuery]);

    const filteredHoldings = useMemo(() => {
        if (holdingsFilter === "EXITED") {
            const list = holdingsQuery.data?.exitedHoldings ?? [];
            return list.filter((item) => {
                if (
                    searchQuery.trim() !== "" &&
                    !item.symbol.toLowerCase().includes(searchQuery.toLowerCase().trim())
                ) {
                    return false;
                }
                return true;
            });
        }

        const list = holdingsQuery.data?.holdings ?? [];
        return list.filter((item) => {
            if (
                searchQuery.trim() !== "" &&
                !item.symbol.toLowerCase().includes(searchQuery.toLowerCase().trim())
            ) {
                return false;
            }

            const cachedTick = marketWebSocketService.getLatestTick(item.symbol);
            const ltp =
                livePrices[item.symbol] ?? cachedTick?.ltp ?? item.currentLtp ?? item.buyAvgPrice;
            const currVal = ltp * item.quantity;
            const isGainer = currVal >= item.investedAmount;

            if (holdingsFilter === "GAINERS") return isGainer;
            if (holdingsFilter === "LOSERS") return !isGainer;
            return true;
        });
    }, [holdingsQuery.data?.holdings, holdingsQuery.data?.exitedHoldings, searchQuery, holdingsFilter, livePrices]);

    const handleConfirmSquareOff = async () => {
        if (!squaringOffPosition) return;
        try {
            await squareOffMutation.mutateAsync(squaringOffPosition.id);
            setSquaringOffPosition(null);
        } catch {
            /* Handled in mutation hook */
        }
    };

    const handleRefresh = () => {
        if (mainTab === "POSITIONS") {
            void positionsQuery.refetch();
        } else {
            void holdingsQuery.refetch();
        }
    };

    const isFetching =
        mainTab === "POSITIONS" ? positionsQuery.isFetching : holdingsQuery.isFetching;

    return (
        <div className="h-full p-2 overflow-hidden">
            <section className="h-full bg-dash-panel border border-dash-border rounded-md p-5 flex flex-col overflow-hidden">
                {/* Header & Main Tab Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-dash-border shrink-0">
                    {/* Top Sub-Tab Navigation [ Positions ] | [ Holdings ] */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setMainTab("POSITIONS")}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors duration-150 cursor-pointer select-none focus:outline-none ${
                                mainTab === "POSITIONS"
                                    ? "bg-primary-green/15 text-primary-green border-primary-green/30"
                                    : "border-transparent text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2"
                            }`}
                        >
                            <span>Positions</span>
                            <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full transition-colors duration-150 ${
                                    mainTab === "POSITIONS"
                                        ? "bg-primary-green/20 text-primary-green"
                                        : "bg-dash-panel-2 text-dash-text-muted"
                                }`}
                            >
                                {positionsSummary.positionsCount.open}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setMainTab("HOLDINGS")}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors duration-150 cursor-pointer select-none focus:outline-none ${
                                mainTab === "HOLDINGS"
                                    ? "bg-primary-green/15 text-primary-green border-primary-green/30"
                                    : "border-transparent text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2"
                            }`}
                        >
                            <span>Holdings</span>
                            <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full transition-colors duration-150 ${
                                    mainTab === "HOLDINGS"
                                        ? "bg-primary-green/20 text-primary-green"
                                        : "bg-dash-panel-2 text-dash-text-muted"
                                }`}
                            >
                                {holdingsSummary.holdingsCount}
                            </span>
                        </button>
                    </div>

                    {/* Search & Refresh */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={
                                    mainTab === "POSITIONS"
                                        ? "Search position..."
                                        : "Search holdings..."
                                }
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-48 sm:w-60 bg-dash-panel-2 border border-dash-border rounded-md pl-8 pr-3 py-1.5 text-xs text-dash-text placeholder-dash-text-muted focus:outline-none focus:border-primary-green transition-colors"
                            />
                            <svg
                                className="w-3.5 h-3.5 text-dash-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                            </svg>
                        </div>

                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={isFetching}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-dash-border text-xs text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 transition-colors cursor-pointer disabled:opacity-50"
                            title="Refresh portfolio"
                        >
                            <svg
                                className={`w-3.5 h-3.5 ${
                                    isFetching ? "animate-spin text-primary-green" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                                />
                            </svg>
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* POSITIONS TAB VIEW                                        */}
                {/* ========================================================= */}
                {mainTab === "POSITIONS" && (
                    <>
                        {/* Positions Summary Cards: Realized, Unrealized, Total P&L */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 border-b border-dash-border shrink-0">
                            <div className="p-3 bg-dash-panel-2 border border-dash-border rounded-lg">
                                <span className="text-[11px] text-dash-text-muted block">
                                    Today's Realized P&L
                                </span>
                                <span
                                    className={`text-sm md:text-base font-bold font-mono mt-1 block ${
                                        positionsSummary.totalRealizedPnL >= 0
                                            ? "text-[#22c55e]"
                                            : "text-[#ef4444]"
                                    }`}
                                >
                                    {positionsSummary.totalRealizedPnL >= 0
                                        ? `+₹${formatINR(positionsSummary.totalRealizedPnL)}`
                                        : `-₹${formatINR(Math.abs(positionsSummary.totalRealizedPnL))}`}
                                </span>
                            </div>

                            <div className="p-3 bg-dash-panel-2 border border-dash-border rounded-lg">
                                <span className="text-[11px] text-dash-text-muted block">
                                    Unrealized P&L
                                </span>
                                <span
                                    className={`text-sm md:text-base font-bold font-mono mt-1 block ${
                                        positionsSummary.totalUnrealizedPnL >= 0
                                            ? "text-[#22c55e]"
                                            : "text-[#ef4444]"
                                    }`}
                                >
                                    {positionsSummary.totalUnrealizedPnL >= 0
                                        ? `+₹${formatINR(positionsSummary.totalUnrealizedPnL)}`
                                        : `-₹${formatINR(Math.abs(positionsSummary.totalUnrealizedPnL))}`}
                                </span>
                            </div>

                            <div className="p-3 bg-dash-panel-2 border border-dash-border rounded-lg">
                                <span className="text-[11px] text-dash-text-muted block">
                                    Total P&L
                                </span>
                                <span
                                    className={`text-sm md:text-base font-bold font-mono mt-1 block ${
                                        positionsSummary.netPnL >= 0
                                            ? "text-[#22c55e]"
                                            : "text-[#ef4444]"
                                    }`}
                                >
                                    {positionsSummary.netPnL >= 0
                                        ? `+₹${formatINR(positionsSummary.netPnL)}`
                                        : `-₹${formatINR(Math.abs(positionsSummary.netPnL))}`}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 py-3 border-b border-dash-border shrink-0">
                            <button
                                type="button"
                                onClick={() => setSelectedPositionsFilter("ALL")}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer select-none ${
                                    selectedPositionsFilter === "ALL"
                                        ? "bg-primary-green/15 text-primary-green border border-primary-green/30"
                                        : "text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 border border-transparent"
                                }`}
                            >
                                <span>All</span>
                                <span
                                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                        selectedPositionsFilter === "ALL"
                                            ? "bg-primary-green/20 text-primary-green"
                                            : "bg-dash-panel-2 text-dash-text-muted"
                                    }`}
                                >
                                    {positionsSummary.positionsCount.total}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedPositionsFilter("OPEN")}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer select-none ${
                                    selectedPositionsFilter === "OPEN"
                                        ? "bg-primary-green/15 text-primary-green border border-primary-green/30"
                                        : "text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 border border-transparent"
                                }`}
                            >
                                <span>Open</span>
                                <span
                                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                        selectedPositionsFilter === "OPEN"
                                            ? "bg-primary-green/20 text-primary-green"
                                            : "bg-dash-panel-2 text-dash-text-muted"
                                    }`}
                                >
                                    {positionsSummary.positionsCount.open}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedPositionsFilter("CLOSED")}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer select-none ${
                                    selectedPositionsFilter === "CLOSED"
                                        ? "bg-primary-green/15 text-primary-green border border-primary-green/30"
                                        : "text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 border border-transparent"
                                }`}
                            >
                                <span>Closed</span>
                                <span
                                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                        selectedPositionsFilter === "CLOSED"
                                            ? "bg-primary-green/20 text-primary-green"
                                            : "bg-dash-panel-2 text-dash-text-muted"
                                    }`}
                                >
                                    {positionsSummary.positionsCount.closed}
                                </span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar mt-3">
                            {positionsQuery.isLoading ? (
                                <div className="h-full flex flex-col items-center justify-center text-dash-text-muted gap-2">
                                    <div className="w-6 h-6 border-2 border-primary-green/20 border-t-primary-green rounded-full animate-spin" />
                                    <span className="text-xs">Loading positions...</span>
                                </div>
                            ) : filteredPositions.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-dash-text-muted">
                                    <div className="w-12 h-12 rounded-full bg-dash-panel-2 border border-dash-border flex items-center justify-center mb-3 text-dash-text-muted">
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-sm font-semibold text-dash-text mb-1">
                                        No {selectedPositionsFilter === "OPEN" ? "open" : selectedPositionsFilter === "CLOSED" ? "closed" : ""} positions found
                                    </h3>
                                    <p className="text-xs text-dash-text-muted max-w-sm mb-4">
                                        {searchQuery
                                            ? `No positions matching "${searchQuery}".`
                                            : "You don't have any active intraday positions yet! Select instruments from your watchlist to open an MIS position."}
                                    </p>
                                    <Link
                                        to={APP_ROUTES.USER.WATCHLIST}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary-green text-black font-semibold text-xs hover:brightness-110 transition-all cursor-pointer"
                                    >
                                        <span>Go to Watchlist</span>
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                            />
                                        </svg>
                                    </Link>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead className="sticky top-0 bg-dash-panel z-10 border-b border-dash-border">
                                        <tr className="text-dash-text-muted font-medium select-none">
                                            <th className="py-2.5 px-3">Instrument</th>
                                            <th className="py-2.5 px-3">Side</th>
                                            <th className="py-2.5 px-3 text-right">Net Qty</th>
                                            <th className="py-2.5 px-3 text-right">Avg Price</th>
                                            <th className="py-2.5 px-3 text-right">LTP</th>
                                            <th className="py-2.5 px-3 text-right">Total P&L</th>
                                            <th className="py-2.5 px-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPositions.map((pos) => (
                                            <PositionTableRow
                                                key={pos.id}
                                                position={pos}
                                                onSquareOff={(p) => setSquaringOffPosition(p)}
                                                isSquaringOff={squareOffMutation.isPending}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}

                {/* ========================================================= */}
                {/* HOLDINGS TAB VIEW (Matching Fyers Brokerage)               */}
                {/* ========================================================= */}
                {mainTab === "HOLDINGS" && (
                    <>
                        {/* Summary Metric Cards: Invested, Current Value, Today's P&L, Total P&L */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4 border-b border-dash-border shrink-0">
                            <div className="p-3 bg-dash-panel-2 border border-dash-border rounded-lg">
                                <span className="text-[11px] text-dash-text-muted block">
                                    Invested
                                </span>
                                <span className="text-sm md:text-base font-bold font-mono text-dash-text mt-1 block">
                                    ₹{formatINR(holdingsSummary.totalInvested)}
                                </span>
                            </div>

                            <div className="p-3 bg-dash-panel-2 border border-dash-border rounded-lg">
                                <span className="text-[11px] text-dash-text-muted block">
                                    Current Value
                                </span>
                                <span className="text-sm md:text-base font-bold font-mono text-dash-text mt-1 block">
                                    ₹{formatINR(holdingsSummary.currentValue)}
                                </span>
                            </div>

                            <div className="p-3 bg-dash-panel-2 border border-dash-border rounded-lg">
                                <span className="text-[11px] text-dash-text-muted block">
                                    Today's P&L
                                </span>
                                <span
                                    className={`text-sm md:text-base font-bold font-mono mt-1 block ${
                                        holdingsSummary.todayPnL >= 0
                                            ? "text-[#22c55e]"
                                            : "text-[#ef4444]"
                                    }`}
                                >
                                    {holdingsSummary.todayPnL >= 0
                                        ? `+₹${formatINR(holdingsSummary.todayPnL)}`
                                        : `-₹${formatINR(Math.abs(holdingsSummary.todayPnL))}`}{" "}
                                    <span className="text-xs font-normal">
                                        (
                                        {holdingsSummary.todayPnLPercentage >= 0
                                            ? `+${holdingsSummary.todayPnLPercentage.toFixed(2)}%`
                                            : `${holdingsSummary.todayPnLPercentage.toFixed(2)}%`}
                                        )
                                    </span>
                                </span>
                            </div>

                            <div className="p-3 bg-dash-panel-2 border border-dash-border rounded-lg">
                                <span className="text-[11px] text-dash-text-muted block">
                                    Total P&L
                                </span>
                                <span
                                    className={`text-sm md:text-base font-bold font-mono mt-1 block ${
                                        holdingsSummary.totalPnL >= 0
                                            ? "text-[#22c55e]"
                                            : "text-[#ef4444]"
                                    }`}
                                >
                                    {holdingsSummary.totalPnL >= 0
                                        ? `+₹${formatINR(holdingsSummary.totalPnL)}`
                                        : `-₹${formatINR(Math.abs(holdingsSummary.totalPnL))}`}{" "}
                                    <span className="text-xs font-normal">
                                        (
                                        {holdingsSummary.totalPnLPercentage >= 0
                                            ? `+${holdingsSummary.totalPnLPercentage.toFixed(2)}%`
                                            : `${holdingsSummary.totalPnLPercentage.toFixed(2)}%`}
                                        )
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Quick Filters: All | Gainers | Losers */}
                        <div className="flex items-center gap-2 py-3 border-b border-dash-border shrink-0">
                            <button
                                type="button"
                                onClick={() => setHoldingsFilter("ALL")}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer select-none ${
                                    holdingsFilter === "ALL"
                                        ? "bg-primary-green/15 text-primary-green border border-primary-green/30"
                                        : "text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 border border-transparent"
                                }`}
                            >
                                <span>All</span>
                                <span
                                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                        holdingsFilter === "ALL"
                                            ? "bg-primary-green/20 text-primary-green"
                                            : "bg-dash-panel-2 text-dash-text-muted"
                                    }`}
                                >
                                    {holdingsSummary.holdingsCount}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setHoldingsFilter("GAINERS")}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer select-none ${
                                    holdingsFilter === "GAINERS"
                                        ? "bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30"
                                        : "text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 border border-transparent"
                                }`}
                            >
                                <span>Gainers</span>
                                <span
                                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                        holdingsFilter === "GAINERS"
                                            ? "bg-[#22c55e]/20 text-[#22c55e]"
                                            : "bg-dash-panel-2 text-dash-text-muted"
                                    }`}
                                >
                                    {holdingsSummary.gainersCount}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setHoldingsFilter("LOSERS")}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer select-none ${
                                    holdingsFilter === "LOSERS"
                                        ? "bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30"
                                        : "text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 border border-transparent"
                                }`}
                            >
                                <span>Losers</span>
                                <span
                                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                        holdingsFilter === "LOSERS"
                                            ? "bg-[#ef4444]/20 text-[#ef4444]"
                                            : "bg-dash-panel-2 text-dash-text-muted"
                                    }`}
                                >
                                    {holdingsSummary.losersCount}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setHoldingsFilter("EXITED")}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer select-none ${
                                    holdingsFilter === "EXITED"
                                        ? "bg-primary-green/15 text-primary-green border border-primary-green/30"
                                        : "text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 border border-transparent"
                                }`}
                            >
                                <span>Exited</span>
                                <span
                                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                        holdingsFilter === "EXITED"
                                            ? "bg-primary-green/20 text-primary-green"
                                            : "bg-dash-panel-2 text-dash-text-muted"
                                    }`}
                                >
                                    {holdingsSummary.exitedCount}
                                </span>
                            </button>
                        </div>

                        {/* Holdings Table */}
                        <div className="flex-1 overflow-auto custom-scrollbar mt-3">
                            {holdingsQuery.isLoading ? (
                                <div className="h-full flex flex-col items-center justify-center text-dash-text-muted gap-2">
                                    <div className="w-6 h-6 border-2 border-primary-green/20 border-t-primary-green rounded-full animate-spin" />
                                    <span className="text-xs">Loading holdings...</span>
                                </div>
                            ) : filteredHoldings.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-dash-text-muted">
                                    <div className="w-12 h-12 rounded-full bg-dash-panel-2 border border-dash-border flex items-center justify-center mb-3 text-dash-text-muted">
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-sm font-semibold text-dash-text mb-1">
                                        {holdingsFilter === "EXITED"
                                            ? "No exited holdings found"
                                            : "No delivery holdings found"}
                                    </h3>
                                    <p className="text-xs text-dash-text-muted max-w-sm mb-4">
                                        {searchQuery
                                            ? `No holdings matching "${searchQuery}".`
                                            : holdingsFilter === "EXITED"
                                            ? "You haven't exited any CNC delivery holdings yet."
                                            : "You don't have any CNC delivery stocks in your portfolio yet. Buy stocks using CNC product type to build your long-term portfolio."}
                                    </p>
                                    <Link
                                        to={APP_ROUTES.USER.WATCHLIST}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary-green text-black font-semibold text-xs hover:brightness-110 transition-all cursor-pointer"
                                    >
                                        <span>Explore Watchlist</span>
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                            />
                                        </svg>
                                    </Link>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead className="sticky top-0 bg-dash-panel z-10 border-b border-dash-border">
                                        <tr className="text-dash-text-muted font-medium select-none">
                                            <th className="py-2.5 px-3">Instrument</th>
                                            <th className="py-2.5 px-3 text-right">Qty</th>
                                            <th className="py-2.5 px-3 text-right">Buy Avg (₹)</th>
                                            <th className="py-2.5 px-3 text-right">LTP</th>
                                            <th className="py-2.5 px-3 text-right">Invested</th>
                                            <th className="py-2.5 px-3 text-right">Current</th>
                                            {holdingsFilter === "EXITED" ? (
                                                <th className="py-2.5 px-3 text-right">Realized P&L</th>
                                            ) : (
                                                <>
                                                    <th className="py-2.5 px-3 text-right">Total P&L</th>
                                                    <th className="py-2.5 px-3 text-right">Day's P&L</th>
                                                </>
                                            )}
                                            <th className="py-2.5 px-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="">
                                        {filteredHoldings.map((item) => (
                                            <HoldingTableRow
                                                key={item.id}
                                                item={item}
                                                onBuy={(h) =>
                                                    setOrderModal({
                                                        isOpen: true,
                                                        symbol: h.symbol,
                                                        side: "BUY",
                                                        quantity: 1,
                                                    })
                                                }
                                                onSell={(h) =>
                                                    setOrderModal({
                                                        isOpen: true,
                                                        symbol: h.symbol,
                                                        side: "SELL",
                                                        quantity: h.quantity,
                                                    })
                                                }
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}
            </section>

            {/* Confirm Square-Off Modal */}
            <ConfirmModal
                isOpen={squaringOffPosition !== null}
                title="Square Off Position"
                message={
                    squaringOffPosition ? (
                        <div className="space-y-2">
                            <p>
                                Are you sure you want to exit your{" "}
                                <strong className="text-dash-text">
                                    {squaringOffPosition.side}
                                </strong>{" "}
                                position for{" "}
                                <strong className="text-dash-text">
                                    {squaringOffPosition.quantity}
                                </strong>{" "}
                                qty of{" "}
                                <strong className="text-dash-text">
                                    {squaringOffPosition.symbol}
                                </strong>{" "}
                                at market price?
                            </p>
                            <p className="text-xs text-dash-text-muted">
                                An opposing market order will be submitted immediately to close this
                                position and release margin.
                            </p>
                        </div>
                    ) : null
                }
                confirmText={squareOffMutation.isPending ? "Exiting..." : "Yes, Exit Position"}
                cancelText="Keep Open"
                confirmButtonVariant="danger"
                onConfirm={handleConfirmSquareOff}
                onCancel={() => setSquaringOffPosition(null)}
            />

            {/* Order Placement Modal (Triggered by [B] or [S] in Holdings) */}
            {orderModal.isOpen && (
                <OrderPlacementModal
                    isOpen={orderModal.isOpen}
                    onClose={() =>
                        setOrderModal({ isOpen: false, symbol: "", side: "BUY", quantity: 1 })
                    }
                    initialSymbol={orderModal.symbol}
                    initialSide={orderModal.side}
                    initialProductType="CNC"
                    initialQuantity={orderModal.quantity}
                />
            )}
        </div>
    );
};
