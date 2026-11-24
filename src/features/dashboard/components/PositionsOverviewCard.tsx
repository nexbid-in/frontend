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
                    {[1, 2, 3].map((i) => (
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
    const recent = positions?.recentPositions ?? [];

    const isRealizedPositive = realized >= 0;
    const isUnrealizedPositive = unrealized >= 0;

    return (
        <div className="flex flex-col space-y-3">
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
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

                <div className="flex flex-col">
                    <span className="text-xs text-dash-text-muted mb-1 select-none">
                        Session positions
                    </span>
                    <span className="text-xl sm:text-2xl font-bold font-mono text-dash-text tracking-tight">
                        {recent.length}
                    </span>
                </div>
            </div>
        </div>
    );
};
