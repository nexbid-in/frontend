import type { FC } from "react";
import { Link } from "react-router-dom";
import type { DashboardHoldingsOverview } from "../types";
import { APP_ROUTES } from "@/constants/routes";
import { formatCurrencyINR, formatZerodhaMetric } from "@/features/trading";

interface HoldingsOverviewCardProps {
    holdings?: DashboardHoldingsOverview;
    isLoading?: boolean;
}

export const HoldingsOverviewCard: FC<HoldingsOverviewCardProps> = ({
    holdings,
    isLoading = false,
}) => {
    if (isLoading && !holdings) {
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

    const count = holdings?.totalHoldingsCount ?? 0;
    const invested = holdings?.totalInvestmentValue ?? 0;
    const current = holdings?.totalCurrentValue ?? 0;
    const totalPnl = holdings?.totalPnl ?? 0;
    const totalPnlPct = holdings?.totalPnlPercentage ?? 0;
    const dayPnl = holdings?.dayPnl ?? 0;
    const dayPnlPct = holdings?.dayPnlPercentage ?? 0;

    const isTotalPositive = totalPnl >= 0;
    const isDayPositive = dayPnl >= 0;

    return (
        <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-dash-text tracking-tight">
                        Holdings
                    </span>
                    <span className="text-xs font-mono text-dash-text-muted">
                        ({count})
                    </span>
                </div>

                <Link
                    to={`${APP_ROUTES.USER.PORTFOLIO}?tab=holdings`}
                    className="text-xs text-blue-500 hover:text-blue-400 font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                    <span>View Holdings</span>
                    <span>↗</span>
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div className="flex flex-col">
                    <span className="text-xs text-dash-text-muted mb-1 select-none">
                        Current value
                    </span>
                    <span
                        className="text-xl sm:text-2xl font-bold font-mono text-dash-text tracking-tight cursor-help"
                        title={`Exact: ${formatCurrencyINR(current, false, true)}`}
                    >
                        ₹{formatZerodhaMetric(current, false)}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs text-dash-text-muted mb-1 select-none">
                        Total investment
                    </span>
                    <span
                        className="text-xl sm:text-2xl font-bold font-mono text-dash-text tracking-tight cursor-help"
                        title={`Exact: ${formatCurrencyINR(invested, false, true)}`}
                    >
                        ₹{formatZerodhaMetric(invested, false)}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs text-dash-text-muted mb-1 select-none">
                        Total P&L
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span
                            className={`text-xl sm:text-2xl font-bold font-mono tracking-tight cursor-help ${
                                isTotalPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                            }`}
                            title={`Exact: ${formatCurrencyINR(totalPnl, true, true)}`}
                        >
                            {formatCurrencyINR(totalPnl, true, true)}
                        </span>
                        <span
                            className={`text-xs font-mono font-medium ${
                                isTotalPositive ? "text-emerald-400" : "text-rose-400"
                            }`}
                        >
                            {isTotalPositive ? `+${totalPnlPct.toFixed(2)}%` : `${totalPnlPct.toFixed(2)}%`}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs text-dash-text-muted mb-1 select-none">
                        Today's P&L
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span
                            className={`text-xl sm:text-2xl font-bold font-mono tracking-tight cursor-help ${
                                isDayPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                            }`}
                            title={`Exact: ${formatCurrencyINR(dayPnl, true, true)}`}
                        >
                            {formatCurrencyINR(dayPnl, true, true)}
                        </span>
                        <span
                            className={`text-xs font-mono font-medium ${
                                isDayPositive ? "text-emerald-400" : "text-rose-400"
                            }`}
                        >
                            {isDayPositive ? `+${dayPnlPct.toFixed(2)}%` : `${dayPnlPct.toFixed(2)}%`}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
