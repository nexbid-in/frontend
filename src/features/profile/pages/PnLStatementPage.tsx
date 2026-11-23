import { useState, useMemo, type FC } from "react";
import {
    usePnlStatementQuery,
    PnlHeatmap,
    PnlSummaryRow,
    PnlFilterBar,
    PnlSymbolTable,
    PnlChargesModal,
    PnlVerifiedModal,
    getIndianFinancialYearPresets,
    type PnlFilterState,
    type PnlChargesBreakdown,
} from "@/features/trading";
import { useAppSelector } from "@/store/hooks";

export const PnLStatementPage: FC = () => {
    const user = useAppSelector((state) => state.auth.user);
    const fullName = user
        ? `${user.firstName || ""}${user.lastName && user.lastName !== "undefined" ? ` ${user.lastName}` : ""}`.trim() || "Trader"
        : "Trader";

    const fyPresets = useMemo(() => getIndianFinancialYearPresets(), []);

    // 1. Form Filter State (controlled inputs)
    const [filterForm, setFilterForm] = useState<PnlFilterState>({
        segment: "ALL",
        pnlType: "COMBINED",
        symbol: "",
        fromDate: fyPresets.currentFy.from,
        toDate: fyPresets.currentFy.to,
        tag: "All Tags",
    });

    // 2. Active Applied Query State (triggered on Submit button click or Enter)
    const [appliedFilters, setAppliedFilters] = useState<PnlFilterState>({ ...filterForm });

    // 3. Modals State
    const [isChargesModalOpen, setIsChargesModalOpen] = useState(false);
    const [isVerifiedModalOpen, setIsVerifiedModalOpen] = useState(false);

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

    // Filter symbols by Tag if a specific tag is selected
    const visibleSymbols = useMemo(() => {
        const list = pnlData?.symbols ?? [];
        if (!appliedFilters.tag || appliedFilters.tag === "All Tags") {
            return list;
        }
        return list.filter((s) => s.tags?.includes(appliedFilters.tag));
    }, [pnlData?.symbols, appliedFilters.tag]);

    const handleFormSubmit = () => {
        setAppliedFilters({ ...filterForm });
    };

    const handleResetFilters = () => {
        const resetState: PnlFilterState = {
            segment: "ALL",
            pnlType: "COMBINED",
            symbol: "",
            fromDate: fyPresets.currentFy.from,
            toDate: fyPresets.currentFy.to,
            tag: "All Tags",
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
        <div className="flex flex-col flex-1 h-full space-y-5 animate-in fade-in duration-150 pb-8">
            {/* Header: Zerodha Console Style (📈 P&L on left, View Verified P&L on right) */}
            <div className="flex items-center justify-between pb-1 shrink-0">
                <div className="flex items-center gap-2.5">
                    <span className="text-dash-text">
                        <svg className="w-5 h-5 text-dash-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                        </svg>
                    </span>
                    <h1 className="text-xl md:text-2xl font-bold text-dash-text tracking-tight select-none">
                        P&L
                    </h1>
                </div>

                <button
                    type="button"
                    onClick={() => setIsVerifiedModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-400 hover:underline cursor-pointer transition-colors select-none"
                    title="View and share your authenticated trading performance"
                >
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                    <span>View Verified P&L</span>
                </button>
            </div>

            {/* Error Message if query fails */}
            {isError && (
                <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-between text-xs">
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
            <PnlFilterBar
                filters={filterForm}
                onChange={setFilterForm}
                onSubmit={handleFormSubmit}
                isLoading={isFetching}
            />

            {/* 2. Interactive Daily Heatmap Calendar */}
            <PnlHeatmap
                heatmap={pnlData?.heatmap}
                fromDate={appliedFilters.fromDate}
                toDate={appliedFilters.toDate}
                isLoading={isLoading}
            />

            {/* 3. Horizontal Summary Metrics Row (Zerodha 5 Columns) */}
            <PnlSummaryRow
                summary={pnlData?.summary}
                isLoading={isLoading}
                onOpenChargesBreakdown={() => setIsChargesModalOpen(true)}
            />

            {/* 4. Symbol Table with Search, Tag Filter, FIFO Expansion & Pagination */}
            <div className="flex-1">
                <PnlSymbolTable
                    symbols={visibleSymbols}
                    isLoading={isLoading}
                    onResetFilters={handleResetFilters}
                    onOpenManageTags={() => {}}
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

            {/* Verified P&L Modal */}
            <PnlVerifiedModal
                isOpen={isVerifiedModalOpen}
                onClose={() => setIsVerifiedModalOpen(false)}
                summary={pnlData?.summary}
                heatmap={pnlData?.heatmap}
                fromDate={appliedFilters.fromDate}
                toDate={appliedFilters.toDate}
                userName={fullName}
            />
        </div>
    );
};
