import type { FC } from "react";
import { Link } from "react-router-dom";
import type { DashboardMargins } from "../types";
import { APP_ROUTES } from "@/constants/routes";
import { formatCurrencyINR, formatZerodhaMetric } from "@/features/trading";

interface MarginSummaryCardProps {
    margins?: DashboardMargins;
    isLoading?: boolean;
}

export const MarginSummaryCard: FC<MarginSummaryCardProps> = ({
    margins,
    isLoading = false,
}) => {
    if (isLoading && !margins) {
        return (
            <div className="bg-dash-panel border border-dash-border rounded-lg p-5 animate-pulse space-y-4">
                <div className="flex justify-between items-center">
                    <div className="h-4 bg-dash-panel-2 rounded w-32" />
                    <div className="h-8 bg-dash-panel-2 rounded w-24" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

    const availableMargin = margins?.availableMargin ?? 0;
    const usedMargin = margins?.usedMargin ?? 0;
    const availableCash = margins?.availableCash ?? 0;
    const openingBalance = margins?.openingBalance ?? 0;

    return (
        <div className="bg-dash-panel border border-dash-border rounded-lg p-5 flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-dash-border">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-dash-text tracking-tight uppercase">
                        Equity & Margin
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                        Active Account
                    </span>
                </div>

                <Link
                    to={APP_ROUTES.USER.FUNDS}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>Add Funds</span>
                </Link>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {/* 1. Available Margin */}
                <div className="flex flex-col">
                    <span className="text-xs text-dash-text-muted mb-1 select-none">
                        Available margin
                    </span>
                    <span
                        className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tracking-tight cursor-help"
                        title={`Exact: ${formatCurrencyINR(availableMargin, false, true)}`}
                    >
                        ₹{formatZerodhaMetric(availableMargin, false)}
                    </span>
                    <span className="text-[10px] text-dash-text-muted mt-0.5">
                        Total buying power
                    </span>
                </div>

                {/* 2. Used Margin */}
                <div className="flex flex-col">
                    <span className="text-xs text-dash-text-muted mb-1 select-none">
                        Used margin
                    </span>
                    <span
                        className="text-xl sm:text-2xl font-bold font-mono text-dash-text tracking-tight cursor-help"
                        title={`Exact: ${formatCurrencyINR(usedMargin, false, true)}`}
                    >
                        ₹{formatZerodhaMetric(usedMargin, false)}
                    </span>
                    <span className="text-[10px] text-dash-text-muted mt-0.5">
                        Committed in trades
                    </span>
                </div>

                {/* 3. Available Cash */}
                <div className="flex flex-col">
                    <span className="text-xs text-dash-text-muted mb-1 select-none">
                        Available cash
                    </span>
                    <span
                        className="text-xl sm:text-2xl font-bold font-mono text-dash-text tracking-tight cursor-help"
                        title={`Exact: ${formatCurrencyINR(availableCash, false, true)}`}
                    >
                        ₹{formatZerodhaMetric(availableCash, false)}
                    </span>
                    <span className="text-[10px] text-dash-text-muted mt-0.5">
                        Settled cash balance
                    </span>
                </div>

                {/* 4. Opening Balance */}
                <div className="flex flex-col">
                    <span className="text-xs text-dash-text-muted mb-1 select-none">
                        Opening balance
                    </span>
                    <span
                        className="text-xl sm:text-2xl font-bold font-mono text-dash-text tracking-tight cursor-help"
                        title={`Exact: ${formatCurrencyINR(openingBalance, false, true)}`}
                    >
                        ₹{formatZerodhaMetric(openingBalance, false)}
                    </span>
                    <span className="text-[10px] text-dash-text-muted mt-0.5">
                        Day open equity
                    </span>
                </div>
            </div>
        </div>
    );
};
