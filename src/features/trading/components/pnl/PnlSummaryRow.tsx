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
            <div className="p-5 sm:py-6 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 bg-dash-panel border border-dash-border rounded-lg animate-pulse">
                <div className="flex items-center justify-between w-full">
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

    const grossRealized = summary?.realizedPnL ?? 0;
    const charges = summary?.charges ?? 0;
    const netRealized = summary?.netRealizedPnL ?? 0;
    const unrealized = summary?.unrealizedPnL ?? 0;

    const isGrossPositive = grossRealized >= 0;
    const isNetPositive = netRealized >= 0;
    const isUnrealizedPositive = unrealized >= 0;

    return (
        <div className="p-5 sm:py-6 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 bg-dash-panel border border-dash-border rounded-lg">
            <div className="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-row lg:items-center lg:justify-between w-full gap-6 sm:gap-8 lg:gap-0">
                <div className="flex flex-col">
                    <span className="text-xs sm:text-[13px] font-normal text-dash-text-muted mb-1 select-none">
                        Realised P&L
                    </span>
                    <span
                        className={`text-2xl sm:text-[28px] font-medium tracking-normal font-sans transition-colors cursor-help ${
                            isGrossPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                        }`}
                        title={`Exact: ${formatCurrencyINR(grossRealized, true)}`}
                    >
                        {formatZerodhaMetric(grossRealized, true)}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs sm:text-[13px] font-normal text-dash-text-muted mb-1 select-none">
                        Charges & taxes
                    </span>
                    <div className="flex items-center gap-2">
                        <span
                            className="text-2xl sm:text-[28px] font-medium tracking-normal text-dash-text font-sans cursor-help"
                            title={`Exact: ${formatCurrencyINR(charges, false)}`}
                        >
                            {formatZerodhaMetric(charges, false)}
                        </span>
                        <button
                            type="button"
                            onClick={onOpenChargesBreakdown}
                            className="text-blue-500 hover:text-blue-400 p-0.5 rounded hover:bg-blue-500/10 transition-colors cursor-pointer inline-flex items-center justify-center"
                            title="View charges breakdown"
                            aria-label="View charges breakdown"
                        >
                            <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs sm:text-[13px] font-normal text-dash-text-muted mb-1 select-none">
                        Net realised P&L
                    </span>
                    <span
                        className={`text-2xl sm:text-[28px] font-medium tracking-normal font-sans transition-colors cursor-help ${
                            isNetPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                        }`}
                        title={`Exact: ${formatCurrencyINR(netRealized, true)}`}
                    >
                        {formatZerodhaMetric(netRealized, true)}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs sm:text-[13px] font-normal text-dash-text-muted mb-1 select-none">
                        Unrealised P&L
                    </span>
                    <span
                        className={`text-2xl sm:text-[28px] font-medium tracking-normal font-sans transition-colors cursor-help ${
                            isUnrealizedPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                        }`}
                        title={`Exact: ${formatCurrencyINR(unrealized, true)}`}
                    >
                        {formatZerodhaMetric(unrealized, true)}
                    </span>
                </div>
            </div>
        </div>
    );
};
