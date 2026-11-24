import type { FC } from "react";
import { Link } from "react-router-dom";
import type { DashboardPositionsOverview } from "../types";
import { APP_ROUTES } from "@/constants/routes";
import { formatCurrencyINR } from "@/features/trading";

interface PositionsOverviewCardProps {
    positions?: DashboardPositionsOverview;
    isLoading?: boolean;
}

export const PositionsOverviewCard: FC<PositionsOverviewCardProps> = ({
    positions,
    isLoading = false,
}) => {
    if (isLoading && !positions) {
        return (
            <div className="flex flex-col space-y-3 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="h-4 bg-dash-panel-2 rounded w-20" />
                    <div className="h-4 bg-dash-panel-2 rounded w-20" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-3 bg-dash-panel-2 rounded w-20" />
                            <div className="h-7 bg-dash-panel-2 rounded w-28" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const openCount = positions?.openPositionsCount ?? 0;
    const realized = positions?.dayRealizedPnL ?? 0;
    const unrealized = positions?.dayUnrealizedPnL ?? 0;
    const netPnL = positions?.dayNetPnL ?? 0;
    const recent = positions?.recentPositions ?? [];

    const isNetPositive = netPnL >= 0;
    const isRealizedPositive = realized >= 0;
    const isUnrealizedPositive = unrealized >= 0;

    return (
        <div className="flex flex-col space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-dash-text tracking-tight">
                        Positions
                    </span>
                    <span className="text-xs font-mono text-dash-text-muted">
                        ({openCount})
                    </span>
                </div>

                <Link
                    to={APP_ROUTES.USER.PORTFOLIO}
                    className="text-xs text-blue-500 hover:text-blue-400 font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                    <span>View Positions</span>
                    <span>↗</span>
                </Link>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {/* 1. Day Net P&L */}
                <div className="flex flex-col">
                    <span className="text-xs text-dash-text-muted mb-1 select-none">
                        Day net P&L
                    </span>
                    <span
                        className={`text-xl sm:text-2xl font-bold font-mono tracking-tight cursor-help ${
                            isNetPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                        }`}
                        title={`Exact: ${formatCurrencyINR(netPnL, true, true)}`}
                    >
                        {formatCurrencyINR(netPnL, true, true)}
                    </span>
                </div>

                {/* 2. Realized P&L */}
                <div className="flex flex-col">
                    <span className="text-xs text-dash-text-muted mb-1 select-none">
                        Realized P&L
                    </span>
                    <span
                        className={`text-xl sm:text-2xl font-bold font-mono tracking-tight cursor-help ${
                            isRealizedPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                        }`}
                        title={`Exact: ${formatCurrencyINR(realized, true, true)}`}
                    >
                        {formatCurrencyINR(realized, true, true)}
                    </span>
                </div>

                {/* 3. Unrealized P&L */}
                <div className="flex flex-col">
                    <span className="text-xs text-dash-text-muted mb-1 select-none">
                        Unrealized P&L
                    </span>
                    <span
                        className={`text-xl sm:text-2xl font-bold font-mono tracking-tight cursor-help ${
                            isUnrealizedPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                        }`}
                        title={`Exact: ${formatCurrencyINR(unrealized, true, true)}`}
                    >
                        {formatCurrencyINR(unrealized, true, true)}
                    </span>
                </div>

                {/* 4. Session Positions */}
                <div className="flex flex-col">
                    <span className="text-xs text-dash-text-muted mb-1 select-none">
                        Session positions
                    </span>
                    <span className="text-xl sm:text-2xl font-bold font-mono text-dash-text tracking-tight">
                        {recent.length}
                    </span>
                </div>
            </div>

            {/* Recent Positions Table */}
            {recent.length > 0 && (
                <div className="pt-2 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-dash-border text-dash-text-muted select-none text-[10px] font-medium uppercase tracking-wider">
                                <th className="pb-2">Instrument</th>
                                <th className="pb-2">Product</th>
                                <th className="pb-2 text-right">Qty</th>
                                <th className="pb-2 text-right">Avg Price</th>
                                <th className="pb-2 text-right">LTP</th>
                                <th className="pb-2 text-right">Unrealized P&L</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dash-border/60">
                            {recent.map((pos) => {
                                const isPos = pos.unrealizedPnL >= 0;
                                const isBuy = pos.side === "BUY";
                                const isOpen = pos.quantity > 0;

                                return (
                                    <tr key={pos.id} className="hover:bg-dash-panel-2/40 transition-colors">
                                        <td className="py-2.5 font-medium text-dash-text">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-semibold">{pos.symbol}</span>
                                                <span
                                                    className={`px-1 py-0.2 rounded text-[9px] font-bold uppercase ${
                                                        isBuy
                                                            ? "bg-emerald-500/10 text-emerald-400"
                                                            : "bg-rose-500/10 text-rose-400"
                                                    }`}
                                                >
                                                    {pos.side}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-2.5 text-[10px] font-mono text-dash-text-muted">
                                            {pos.productType}
                                        </td>
                                        <td className="py-2.5 text-right font-mono font-medium">
                                            {isOpen ? (
                                                <span className="text-dash-text">{pos.quantity}</span>
                                            ) : (
                                                <span className="text-dash-text-muted">Closed</span>
                                            )}
                                        </td>
                                        <td className="py-2.5 text-right font-mono text-dash-text">
                                            {formatCurrencyINR(pos.averagePrice, false, true)}
                                        </td>
                                        <td className="py-2.5 text-right font-mono text-dash-text font-medium">
                                            {formatCurrencyINR(pos.ltp, false, true)}
                                        </td>
                                        <td className="py-2.5 text-right font-mono font-semibold whitespace-nowrap">
                                            <span className={isPos ? "text-[#22c55e]" : "text-[#ef4444]"}>
                                                {formatCurrencyINR(pos.unrealizedPnL, true, true)}
                                            </span>
                                            <span className="text-[10px] font-normal text-dash-text-muted ml-1">
                                                ({isPos ? `+${pos.pnlPercentage}%` : `${pos.pnlPercentage}%`})
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
