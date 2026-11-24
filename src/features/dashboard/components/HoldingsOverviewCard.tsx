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
    const allocation = holdings?.allocation ?? [];

    const isTotalPositive = totalPnl >= 0;
    const isDayPositive = dayPnl >= 0;

    return (
        <div className="flex flex-col space-y-3">
            {/* Header */}
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

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {/* 1. Current Value */}
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

                {/* 2. Total Investment */}
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

                {/* 3. Total P&L */}
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

                {/* 4. Today's P&L */}
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

            {/* Weightage Allocation Strip (if holdings exist) */}
            {allocation.length > 0 && (
                <div className="pt-2">
                    <div className="flex items-center justify-between text-xs text-dash-text-muted mb-2">
                        <span className="font-semibold text-dash-text">Portfolio Weightage</span>
                        <span className="text-[11px]">Top holdings by value</span>
                    </div>

                    {/* Proportional Segment Bar */}
                    <div className="w-full h-2 rounded-full overflow-hidden bg-dash-panel-2 flex mb-3">
                        {allocation.slice(0, 5).map((item, idx) => {
                            const colors = [
                                "bg-blue-500",
                                "bg-emerald-500",
                                "bg-purple-500",
                                "bg-amber-500",
                                "bg-cyan-500",
                            ];
                            return (
                                <div
                                    key={item.symbol}
                                    style={{ width: `${Math.max(4, item.weightagePercentage)}%` }}
                                    className={`${colors[idx % colors.length]} h-full transition-all`}
                                    title={`${item.symbol}: ${item.weightagePercentage}%`}
                                />
                            );
                        })}
                    </div>

                    {/* Allocation Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {allocation.slice(0, 4).map((item) => {
                            const isPos = item.totalPnl >= 0;
                            return (
                                <div
                                    key={item.symbol}
                                    className="bg-dash-panel-2 border border-dash-border/70 rounded-md p-2 flex flex-col text-xs"
                                >
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="font-bold text-dash-text">{item.symbol}</span>
                                        <span className="text-[10px] text-dash-text-muted font-mono">
                                            {item.weightagePercentage}%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-mono">
                                        <span className="text-dash-text">
                                            {formatCurrencyINR(item.currentValue, false, true)}
                                        </span>
                                        <span className={isPos ? "text-emerald-400" : "text-rose-400"}>
                                            {isPos ? `+${item.totalPnlPercentage}%` : `${item.totalPnlPercentage}%`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
