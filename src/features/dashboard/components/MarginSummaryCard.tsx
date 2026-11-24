import type { FC } from "react";
import type { DashboardMargins } from "../types";
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
            <div className="flex flex-col space-y-3 animate-pulse">
                <div className="h-4 bg-dash-panel-2 rounded w-16" />
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

    const availableMargin = margins?.availableMargin ?? 0;
    const usedMargin = margins?.usedMargin ?? 0;
    const availableCash = margins?.availableCash ?? 0;
    const openingBalance = margins?.openingBalance ?? 0;

    return (
        <div className="flex flex-col space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-dash-text tracking-tight">
                    Equity
                </span>
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
                </div>
            </div>
        </div>
    );
};
