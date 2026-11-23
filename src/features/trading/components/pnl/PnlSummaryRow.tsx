import type { FC } from "react";
import type { PnlSummary } from "../../types";
import { formatCurrencyINR, formatZerodhaMetric } from "../../utils/pnlFormatters";

interface PnlSummaryRowProps {
    summary?: PnlSummary;
    isLoading?: boolean;
    onOpenChargesBreakdown: () => void;
}

export const PnlSummaryRow: FC<PnlSummaryRowProps> = ({
    summary,
    isLoading = false,
    onOpenChargesBreakdown,
}) => {
    if (isLoading) {
        return (
            <div className="p-5 bg-dash-panel border border-dash-border rounded-lg animate-pulse">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-3 bg-dash-panel-2 rounded w-20" />
                            <div className="h-8 bg-dash-panel-2 rounded w-28" />
                            <div className="h-2 bg-dash-panel-2 rounded w-16" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const grossRealized = summary?.realizedPnL ?? 0;
    const charges = summary?.charges ?? 0;
    const netRealized = summary?.netRealizedPnL ?? 0;
    const unrealized = summary?.unrealizedPnL ?? 0;
    const otherCredits = 0; // Standard for other DP/statutory adjustments

    const isGrossPositive = grossRealized >= 0;
    const isNetPositive = netRealized >= 0;
    const isUnrealizedPositive = unrealized >= 0;

    return (
        <div className="p-5 sm:p-6 bg-dash-panel border border-dash-border rounded-lg">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
                {/* 1. Realised P&L */}
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-dash-text-muted mb-1 select-none">
                        Realised P&L
                    </span>
                    <span
                        className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-sans transition-colors cursor-help ${
                            isGrossPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                        }`}
                        title={`Exact: ${formatCurrencyINR(grossRealized, true)}`}
                    >
                        {formatZerodhaMetric(grossRealized, true)}
                    </span>
                    <span className="text-[10px] text-dash-text-muted mt-1 font-mono">
                        {formatCurrencyINR(grossRealized, true)}
                    </span>
                </div>

                {/* 2. Charges & taxes */}
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-dash-text-muted mb-1 select-none">
                        Charges & taxes
                    </span>
                    <span
                        className="text-2xl sm:text-3xl font-bold tracking-tight text-dash-text font-sans cursor-help"
                        title={`Exact: ${formatCurrencyINR(charges, false)}`}
                    >
                        {formatZerodhaMetric(charges, false)}
                    </span>
                    <button
                        type="button"
                        onClick={onOpenChargesBreakdown}
                        className="text-left text-xs text-blue-500 hover:text-blue-400 font-medium hover:underline mt-1 cursor-pointer transition-colors"
                    >
                        View breakdown ⌵
                    </button>
                </div>

                {/* 3. Other credits & debits */}
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-dash-text-muted mb-1 select-none">
                        Other credits & debits
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold tracking-tight text-dash-text font-sans">
                        {otherCredits === 0 ? "0.00" : formatZerodhaMetric(otherCredits, true)}
                    </span>
                    <button
                        type="button"
                        onClick={onOpenChargesBreakdown}
                        className="text-left text-xs text-blue-500 hover:text-blue-400 font-medium hover:underline mt-1 cursor-pointer transition-colors"
                    >
                        View breakdown ⌵
                    </button>
                </div>

                {/* 4. Net realised P&L */}
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-dash-text-muted mb-1 select-none">
                        Net realised P&L
                    </span>
                    <span
                        className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-sans transition-colors cursor-help ${
                            isNetPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                        }`}
                        title={`Exact: ${formatCurrencyINR(netRealized, true)}`}
                    >
                        {formatZerodhaMetric(netRealized, true)}
                    </span>
                    <span className="text-[10px] text-dash-text-muted mt-1 font-mono">
                        {formatCurrencyINR(netRealized, true)}
                    </span>
                </div>

                {/* 5. Unrealised P&L */}
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-dash-text-muted mb-1 select-none">
                        Unrealised P&L
                    </span>
                    <span
                        className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-sans transition-colors cursor-help ${
                            isUnrealizedPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                        }`}
                        title={`Exact: ${formatCurrencyINR(unrealized, true)}`}
                    >
                        {formatZerodhaMetric(unrealized, true)}
                    </span>
                    <span className="text-[10px] text-dash-text-muted mt-1 font-mono">
                        {formatCurrencyINR(unrealized, true)}
                    </span>
                </div>
            </div>
        </div>
    );
};
