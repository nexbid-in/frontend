import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePositionsQuery, useSquareOffPositionMutation } from "../hooks/useTrading";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { marketWebSocketService, useLiveStockQuote, formatINR } from "@/features/watchlist";
import { APP_ROUTES } from "@/constants/routes";
import type { PositionResponseDTO, PositionsFilter } from "../types";

/**
 * Individual live-updating position table row.
 * Scopes WebSocket tick re-renders strictly to this row.
 */
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

    // Compute live metrics with real-time WebSocket ticks
    const liveLtp = quote.price > 0 ? quote.price : position.currentLtp;
    const isLong = position.side === "LONG";
    const isOpen = position.quantity > 0;

    // Real-time floating unrealized P&L
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
        <tr className="hover:bg-dash-panel-2/60 transition-colors group">
            {/* Product Badge */}
            <td className="py-3 px-3 whitespace-nowrap">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-dash-panel-2 border border-dash-border text-dash-text">
                    {position.productType}
                </span>
            </td>

            {/* Instrument & Exchange */}
            <td className="py-3 px-3 font-medium whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                    <span className="text-dash-text font-semibold">{position.symbol}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-dash-panel-2 text-dash-text-muted border border-dash-border">
                        NSE
                    </span>
                </div>
            </td>

            {/* Side Badge */}
            <td className="py-3 px-3 whitespace-nowrap">
                <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider inline-block ${
                        isLong
                            ? "bg-[#00873e]/15 text-[#00873e] border border-[#00873e]/30"
                            : "bg-[#c83200]/15 text-[#c83200] border border-[#c83200]/30"
                    }`}
                >
                    {position.side}
                </span>
            </td>

            {/* Net Quantity */}
            <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                <span className={`font-semibold ${isOpen ? "text-dash-text" : "text-dash-text-muted"}`}>
                    {position.quantity}
                </span>
            </td>

            {/* Average Buy/Sell Price */}
            <td className="py-3 px-3 text-right font-mono text-dash-text whitespace-nowrap">
                ₹{formatINR(position.averagePrice)}
            </td>

            {/* Live LTP with directional flash */}
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
            </td>

            {/* Unrealized Floating P&L */}
            <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                <span className={`font-semibold ${pnlTextColor}`}>
                    {liveUnrealizedPnL >= 0 ? `+₹${formatINR(liveUnrealizedPnL)}` : `-₹${formatINR(Math.abs(liveUnrealizedPnL))}`}
                </span>
                <span className={`text-[10px] block ${pnlTextColor}`}>
                    {liveReturnPercent >= 0 ? `(+${liveReturnPercent.toFixed(2)}%)` : `(${liveReturnPercent.toFixed(2)}%)`}
                </span>
            </td>

            {/* Realized P&L */}
            <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                <span
                    className={`font-medium ${
                        position.realizedPnL > 0
                            ? "text-[#22c55e]"
                            : position.realizedPnL < 0
                            ? "text-[#ef4444]"
                            : "text-dash-text-muted"
                    }`}
                >
                    {position.realizedPnL > 0
                        ? `+₹${formatINR(position.realizedPnL)}`
                        : position.realizedPnL < 0
                        ? `-₹${formatINR(Math.abs(position.realizedPnL))}`
                        : "₹0.00"}
                </span>
            </td>

            {/* Blocked Margin */}
            <td className="py-3 px-3 text-right font-mono text-dash-text-muted whitespace-nowrap">
                {isOpen ? `₹${formatINR(position.blockedMargin)}` : "—"}
            </td>

            {/* Action: Exit / Square Off */}
            <td className="py-3 px-3 text-right whitespace-nowrap">
                {isOpen ? (
                    <button
                        type="button"
                        disabled={isSquaringOff}
                        onClick={() => onSquareOff(position)}
                        className="px-2.5 py-1 text-[11px] font-medium text-amber-500 hover:text-white hover:bg-amber-500 rounded border border-amber-500/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                        Exit
                    </button>
                ) : (
                    <span className="text-[10px] text-dash-text-muted px-2 py-0.5 rounded bg-dash-panel-2 border border-dash-border">
                        Closed
                    </span>
                )}
            </td>
        </tr>
    );
};

export const PortfolioPage: React.FC = () => {
    const [selectedFilter, setSelectedFilter] = useState<PositionsFilter>("OPEN");
    const [searchQuery, setSearchQuery] = useState("");
    const [squaringOffPosition, setSquaringOffPosition] = useState<PositionResponseDTO | null>(null);

    const { data, isLoading, isFetching, refetch } = usePositionsQuery(selectedFilter);
    const squareOffMutation = useSquareOffPositionMutation();

    // Map of live ticks: { [symbol]: liveLtp }
    const [livePrices, setLivePrices] = useState<Record<string, number>>({});

    // Subscribe to live WebSocket feeds for all active open positions
    useEffect(() => {
        const openPositions = (data?.positions ?? []).filter((p) => p.quantity > 0);
        if (openPositions.length === 0) return;

        // Subscribe to live WebSocket feeds for each open symbol
        const unsubs = openPositions.map((pos) =>
            marketWebSocketService.subscribe(pos.symbol, (tick) => {
                setLivePrices((prev) => {
                    if (prev[pos.symbol] === tick.ltp) return prev;
                    return { ...prev, [pos.symbol]: tick.ltp };
                });
            })
        );

        // Cleanup unsubscriptions on unmount or position change
        return () => {
            unsubs.forEach((unsub) => unsub());
        };
    }, [data?.positions]);

    // Dynamically calculate live portfolio summary on every price tick
    const summary = useMemo(() => {
        const positions = data?.positions ?? [];
        const openPositions = positions.filter((p) => p.quantity > 0);
        const totalRealizedPnL = data?.summary?.totalRealizedPnL ?? 0;

        let totalInvestment = 0;
        let currentPortfolioValue = 0;
        let totalUnrealizedPnL = 0;

        for (const pos of openPositions) {
            const cost = pos.averagePrice * pos.quantity;
            totalInvestment += cost;

            // Use live WebSocket tick if available, or in-memory singleton cache, fallback to snapshot
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
            totalInvestment: totalInvestment > 0 ? totalInvestment : (data?.summary?.totalInvestment ?? 0),
            currentPortfolioValue: totalInvestment > 0 ? currentPortfolioValue : (data?.summary?.currentPortfolioValue ?? 0),
            totalUnrealizedPnL,
            totalRealizedPnL,
            netPnL,
            overallReturnPercentage,
            positionsCount: data?.summary?.positionsCount ?? { total: 0, open: 0, closed: 0 },
        };
    }, [data?.positions, data?.summary, livePrices]);

    // Filter positions by user search query
    const filteredPositions = useMemo(() => {
        const list = data?.positions ?? [];
        return list.filter((p) => {
            const matchesQuery =
                searchQuery.trim() === "" ||
                p.symbol.toLowerCase().includes(searchQuery.toLowerCase().trim());
            return matchesQuery;
        });
    }, [data?.positions, searchQuery]);

    const handleConfirmSquareOff = async () => {
        if (!squaringOffPosition) return;
        try {
            await squareOffMutation.mutateAsync(squaringOffPosition.id);
            setSquaringOffPosition(null);
        } catch {
            // Toast notification is handled in mutation hook
        }
    };

    const isNetPositive = summary.netPnL >= 0;

    return (
        <div className="h-full p-2 overflow-hidden">
            <section className="h-full bg-dash-panel border border-dash-border rounded-md p-5 flex flex-col overflow-hidden">
                {/* 1. Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-dash-border shrink-0">
                    <div>
                        <h1 className="text-base font-semibold text-dash-text tracking-tight">Portfolio Positions</h1>
                        <p className="text-xs text-dash-text-muted mt-0.5">
                            Real-time open intraday trades, delivery positions, and P&L breakdown
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search Input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search position..."
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

                        {/* Refresh Button */}
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            disabled={isFetching}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-dash-border text-xs text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 transition-colors cursor-pointer disabled:opacity-50"
                            title="Refresh portfolio"
                        >
                            <svg
                                className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-primary-green" : ""}`}
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

                {/* 2. Top Summary KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 py-4 border-b border-dash-border shrink-0">
                    {/* Total Investment */}
                    <div className="p-3 bg-dash-panel-2 border border-dash-border rounded-lg">
                        <span className="text-[11px] text-dash-text-muted block">Total Invested</span>
                        <span className="text-sm md:text-base font-bold font-mono text-dash-text mt-1 block">
                            ₹{formatINR(summary.totalInvestment)}
                        </span>
                    </div>

                    {/* Current Value */}
                    <div className="p-3 bg-dash-panel-2 border border-dash-border rounded-lg">
                        <span className="text-[11px] text-dash-text-muted block">Current Value</span>
                        <span className="text-sm md:text-base font-bold font-mono text-dash-text mt-1 block">
                            ₹{formatINR(summary.currentPortfolioValue)}
                        </span>
                    </div>

                    {/* Unrealized P&L */}
                    <div className="p-3 bg-dash-panel-2 border border-dash-border rounded-lg">
                        <span className="text-[11px] text-dash-text-muted block">Unrealized P&L</span>
                        <span
                            className={`text-sm md:text-base font-bold font-mono mt-1 block ${
                                summary.totalUnrealizedPnL >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"
                            }`}
                        >
                            {summary.totalUnrealizedPnL >= 0
                                ? `+₹${formatINR(summary.totalUnrealizedPnL)}`
                                : `-₹${formatINR(Math.abs(summary.totalUnrealizedPnL))}`}
                        </span>
                    </div>

                    {/* Realized P&L */}
                    <div className="p-3 bg-dash-panel-2 border border-dash-border rounded-lg">
                        <span className="text-[11px] text-dash-text-muted block">Realized P&L</span>
                        <span
                            className={`text-sm md:text-base font-bold font-mono mt-1 block ${
                                summary.totalRealizedPnL >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"
                            }`}
                        >
                            {summary.totalRealizedPnL >= 0
                                ? `+₹${formatINR(summary.totalRealizedPnL)}`
                                : `-₹${formatINR(Math.abs(summary.totalRealizedPnL))}`}
                        </span>
                    </div>

                    {/* Net Total P&L */}
                    <div className="p-3 bg-dash-panel-2 border border-dash-border rounded-lg col-span-2 md:col-span-1">
                        <span className="text-[11px] text-dash-text-muted block">Total P&L</span>
                        <span
                            className={`text-sm md:text-base font-bold font-mono mt-1 block ${
                                isNetPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                            }`}
                        >
                            {isNetPositive
                                ? `+₹${formatINR(summary.netPnL)}`
                                : `-₹${formatINR(Math.abs(summary.netPnL))}`}
                        </span>
                    </div>
                </div>

                {/* 3. Filter Navigation (Open vs All) */}
                <div className="flex items-center gap-2 py-3 border-b border-dash-border shrink-0">
                    <button
                        type="button"
                        onClick={() => setSelectedFilter("OPEN")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer select-none ${
                            selectedFilter === "OPEN"
                                ? "bg-primary-green/15 text-primary-green border border-primary-green/30"
                                : "text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 border border-transparent"
                        }`}
                    >
                        <span>Open Positions</span>
                        <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                selectedFilter === "OPEN"
                                    ? "bg-primary-green/20 text-primary-green"
                                    : "bg-dash-panel-2 text-dash-text-muted"
                            }`}
                        >
                            {summary.positionsCount.open}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedFilter("ALL")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer select-none ${
                            selectedFilter === "ALL"
                                ? "bg-primary-green/15 text-primary-green border border-primary-green/30"
                                : "text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 border border-transparent"
                        }`}
                    >
                        <span>All Positions</span>
                        <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                selectedFilter === "ALL"
                                    ? "bg-primary-green/20 text-primary-green"
                                    : "bg-dash-panel-2 text-dash-text-muted"
                            }`}
                        >
                            {summary.positionsCount.total}
                        </span>
                    </button>
                </div>

                {/* 4. Positions Table */}
                <div className="flex-1 overflow-auto custom-scrollbar mt-3">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center text-dash-text-muted gap-2">
                            <div className="w-6 h-6 border-2 border-primary-green/20 border-t-primary-green rounded-full animate-spin" />
                            <span className="text-xs">Loading positions...</span>
                        </div>
                    ) : filteredPositions.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-dash-text-muted">
                            <div className="w-12 h-12 rounded-full bg-dash-panel-2 border border-dash-border flex items-center justify-center mb-3 text-dash-text-muted">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-dash-text mb-1">
                                No {selectedFilter === "OPEN" ? "open" : ""} positions found
                            </h3>
                            <p className="text-xs text-dash-text-muted max-w-sm mb-4">
                                {searchQuery
                                    ? `No positions matching "${searchQuery}".`
                                    : "You don't have any active positions yet! Select instruments from your watchlist to open a position."}
                            </p>
                            <Link
                                to={APP_ROUTES.USER.WATCHLIST}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary-green text-black font-semibold text-xs hover:brightness-110 transition-all cursor-pointer"
                            >
                                <span>Go to Watchlist</span>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="sticky top-0 bg-dash-panel z-10 border-b border-dash-border">
                                <tr className="text-dash-text-muted font-medium select-none">
                                    <th className="py-2.5 px-3">Product</th>
                                    <th className="py-2.5 px-3">Instrument</th>
                                    <th className="py-2.5 px-3">Side</th>
                                    <th className="py-2.5 px-3 text-right">Net Qty</th>
                                    <th className="py-2.5 px-3 text-right">Avg. Price</th>
                                    <th className="py-2.5 px-3 text-right">LTP</th>
                                    <th className="py-2.5 px-3 text-right">P&L (Unrealized)</th>
                                    <th className="py-2.5 px-3 text-right">Realized P&L</th>
                                    <th className="py-2.5 px-3 text-right">Blocked Margin</th>
                                    <th className="py-2.5 px-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dash-border">
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
            </section>

            {/* Square-off confirmation modal */}
            <ConfirmModal
                isOpen={squaringOffPosition !== null}
                title="Square Off Position"
                message={
                    squaringOffPosition ? (
                        <div className="space-y-2">
                            <p>
                                Are you sure you want to exit your{" "}
                                <strong className="text-dash-text">{squaringOffPosition.side}</strong> position for{" "}
                                <strong className="text-dash-text">{squaringOffPosition.quantity}</strong> qty of{" "}
                                <strong className="text-dash-text">{squaringOffPosition.symbol}</strong> at market price?
                            </p>
                            <p className="text-xs text-dash-text-muted">
                                An opposing market order will be submitted immediately to close this position and release margin.
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
        </div>
    );
};

