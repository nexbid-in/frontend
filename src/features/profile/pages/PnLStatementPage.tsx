import { useState, useMemo, type FC } from "react";
import {
    usePnlStatementQuery,
    PnlHeatmap,
    PnlSummaryRow,
    PnlFilterBar,
    PnlSymbolTable,
    PnlChargesModal,
    getIndianFinancialYearPresets,
    type PnlFilterState,
    type PnlChargesBreakdown,
} from "@/features/trading";

export const PnLStatementPage: FC = () => {
    const fyPresets = useMemo(() => getIndianFinancialYearPresets(), []);

    // 1. Form Filter State (controlled inputs)
    const [filterForm, setFilterForm] = useState<PnlFilterState>({
        segment: "COMBINED",
        pnlType: "COMBINED",
        symbol: "",
        fromDate: fyPresets.currentFy.from,
        toDate: fyPresets.currentFy.to,
    });

    // 2. Active Applied Query State (triggered on Submit button click or Enter)
    const [appliedFilters, setAppliedFilters] = useState<PnlFilterState>({ ...filterForm });

    // 3. Modals State
    const [isChargesModalOpen, setIsChargesModalOpen] = useState(false);

    // 4. API Query Parameters Construction
    const queryParams = useMemo(() => {
        const fromIso = appliedFilters.fromDate
            ? new Date(`${appliedFilters.fromDate}T00:00:00.000Z`).toISOString()
            : undefined;
        const toIso = appliedFilters.toDate
            ? new Date(`${appliedFilters.toDate}T23:59:59.999Z`).toISOString()
            : undefined;

        return {
            from: fromIso,
            to: toIso,
            segment: appliedFilters.segment,
            pnlType: appliedFilters.pnlType,
            symbol: appliedFilters.symbol.trim() || undefined,
        };
    }, [appliedFilters]);

    const {
        data: pnlData,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = usePnlStatementQuery(queryParams);

    const handleFormSubmit = () => {
        setAppliedFilters({ ...filterForm });
    };

    const handleResetFilters = () => {
        const resetState: PnlFilterState = {
            segment: "COMBINED",
            pnlType: "COMBINED",
            symbol: "",
            fromDate: fyPresets.currentFy.from,
            toDate: fyPresets.currentFy.to,
        };
        setFilterForm(resetState);
        setAppliedFilters(resetState);
    };

    const chargesBreakdown: PnlChargesBreakdown = pnlData?.summary?.chargesBreakdown ?? {
        brokerage: 0,
        stt: 0,
        exchangeTurnoverCharges: 0,
        sebiCharges: 0,
        stampDuty: 0,
        gst: 0,
        totalCharges: 0,
    };

    return (
        <div className="flex flex-col space-y-5 animate-in fade-in duration-150 pb-10">
            {/* Header: Title matching sidebar "P&L Statement" */}
            <div className="flex items-center justify-between pb-1 shrink-0">
                <h1 className="text-xl md:text-2xl font-bold text-dash-text tracking-tight select-none">
                    P&L Statement
                </h1>
            </div>

            {/* Error Message if query fails */}
            {isError && (
                <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-between text-xs shrink-0">
                    <span>
                        {error instanceof Error ? error.message : "Failed to load P&L report."}
                    </span>
                    <button
                        type="button"
                        onClick={() => void refetch()}
                        className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 font-semibold cursor-pointer"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* 1. Filter Bar (Zerodha Console 5 inputs + Blue Arrow button) */}
            <div className="shrink-0">
                <PnlFilterBar
                    filters={filterForm}
                    onChange={setFilterForm}
                    onSubmit={handleFormSubmit}
                    isLoading={isFetching}
                />
            </div>

            {/* 2. Interactive Daily Heatmap Calendar */}
            <PnlHeatmap
                heatmap={pnlData?.heatmap}
                fromDate={appliedFilters.fromDate}
                toDate={appliedFilters.toDate}
                isLoading={isLoading}
            />

            {/* 3. Horizontal Summary Metrics Row */}
            <div className="shrink-0">
                <PnlSummaryRow
                    summary={pnlData?.summary}
                    isLoading={isLoading}
                    onOpenChargesBreakdown={() => setIsChargesModalOpen(true)}
                />
            </div>

            {/* 4. Symbol Table with Search, FIFO Expansion & Pagination */}
            <div className="shrink-0">
                <PnlSymbolTable
                    symbols={pnlData?.symbols ?? []}
                    isLoading={isLoading}
                    onResetFilters={handleResetFilters}
                />
            </div>

            {/* Charges Breakdown Transparency Modal */}
            <PnlChargesModal
                isOpen={isChargesModalOpen}
                onClose={() => setIsChargesModalOpen(false)}
                breakdown={chargesBreakdown}
                title="Charges & Taxes Breakdown"
                subtitle="Itemized statutory levies and platform fees deducted from your gross trading returns."
            />
        </div>
    );
};
