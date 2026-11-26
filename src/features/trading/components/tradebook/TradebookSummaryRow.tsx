import type { FC } from "react";
import type { TradebookSummary } from "../../types";
import { formatCurrencyINR, formatZerodhaMetric } from "../../utils/pnlFormatters";

interface TradebookSummaryRowProps {
    summary?: TradebookSummary;
    isLoading?: boolean;
    isFetching?: boolean;
    onOpenChargesBreakdown: () => void;
}

export const TradebookSummaryRow: FC<TradebookSummaryRowProps> = ({
    summary,
    isLoading = false,
    isFetching = false,
    onOpenChargesBreakdown,
}) => {
    if (isLoading && !summary) {
        return (
            <div className="p-5 sm:py-6 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 bg-dash-panel border border-dash-border rounded-lg animate-pulse">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-start justify-between">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-col space-y-2">
                            <div className="h-3 bg-dash-panel-2 rounded w-20" />
                            <div className="h-7 bg-dash-panel-2 rounded w-28" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const totalTrades = summary?.totalTrades ?? 0;
    const buyTurnover = summary?.totalBuyTurnover ?? 0;
    const sellTurnover = summary?.totalSellTurnover ?? 0;
    const totalCharges = summary?.totalCharges ?? 0;

    return (
        <div className={`p-5 sm:py-6 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 bg-dash-panel border border-dash-border rounded-lg transition-opacity duration-300 ${
            isFetching ? "opacity-75" : "opacity-100"
        }`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-start justify-between">
                <div className="flex flex-col">
                    <span className="text-xs sm:text-[13px] font-normal text-dash-text-muted mb-1 select-none">
                        Total executions
                    </span>
                    <span className="text-2xl sm:text-[28px] font-medium tracking-normal text-dash-text font-sans">
                        {totalTrades}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs sm:text-[13px] font-normal text-dash-text-muted mb-1 select-none">
                        Buy turnover
                    </span>
                    <span
                        className="text-2xl sm:text-[28px] font-medium tracking-normal text-dash-text font-sans cursor-help"
                        title={`Exact: ${formatCurrencyINR(buyTurnover, false, true)}`}
                    >
                        {formatZerodhaMetric(buyTurnover, false)}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs sm:text-[13px] font-normal text-dash-text-muted mb-1 select-none">
                        Sell turnover
                    </span>
                    <span
                        className="text-2xl sm:text-[28px] font-medium tracking-normal text-dash-text font-sans cursor-help"
                        title={`Exact: ${formatCurrencyINR(sellTurnover, false, true)}`}
                    >
                        {formatZerodhaMetric(sellTurnover, false)}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs sm:text-[13px] font-normal text-dash-text-muted mb-1 select-none">
                        Charges & taxes
                    </span>
                    <div className="flex items-center gap-2">
                        <span
                            className="text-2xl sm:text-[28px] font-medium tracking-normal text-dash-text font-sans cursor-help"
                            title={`Exact: ${formatCurrencyINR(totalCharges, false, true)}`}
                        >
                            {formatZerodhaMetric(totalCharges, false)}
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
            </div>
        </div>
    );
};
