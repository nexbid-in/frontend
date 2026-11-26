import { useState, useMemo, type FC } from "react";
import {
    useTradebookQuery,
    TradebookFilterBar,
    TradebookSummaryRow,
    TradebookTable,
    PnlChargesModal,
    getIndianFinancialYearPresets,
    type TradebookFilterState,
    type TradeChargesItem,
    type PnlChargesBreakdown,
} from "@/features/trading";

export const TradeBookPage: FC = () => {
    const fyPresets = useMemo(() => getIndianFinancialYearPresets(), []);

    const [filterForm, setFilterForm] = useState<TradebookFilterState>({
        segment: "COMBINED",
        side: "ALL",
        symbol: "",
        fromDate: fyPresets.currentFy.from,
        toDate: fyPresets.currentFy.to,
    });

    const [appliedFilters, setAppliedFilters] = useState<TradebookFilterState>({ ...filterForm });
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageLimit, setPageLimit] = useState<number>(20);

    const [isChargesModalOpen, setIsChargesModalOpen] = useState(false);
    const [modalChargesData, setModalChargesData] = useState<{
        breakdown: PnlChargesBreakdown;
        title: string;
        subtitle: string;
    }>({
        breakdown: {
            brokerage: 0,
            stt: 0,
            exchangeTurnoverCharges: 0,
            sebiCharges: 0,
            stampDuty: 0,
            gst: 0,
            totalCharges: 0,
        },
        title: "Trade Charges Breakdown",
        subtitle: "Itemized statutory levies and platform fees deducted for this trade execution.",
    });

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
            side: appliedFilters.side,
            symbol: appliedFilters.symbol.trim() || undefined,
            page: currentPage,
            limit: pageLimit,
        };
    }, [appliedFilters, currentPage, pageLimit]);

    const {
        data: tradebookData,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useTradebookQuery(queryParams);

    const handleFormSubmit = () => {
        setCurrentPage(1);
        setAppliedFilters({ ...filterForm });
    };

    const handleResetFilters = () => {
        const resetState: TradebookFilterState = {
            segment: "COMBINED",
            side: "ALL",
            symbol: "",
            fromDate: fyPresets.currentFy.from,
            toDate: fyPresets.currentFy.to,
        };
        setFilterForm(resetState);
        setAppliedFilters(resetState);
        setCurrentPage(1);
    };

    // Aggregate charges breakdown across all executions directly from backend summary (independent of pagination)
    const totalChargesBreakdown: PnlChargesBreakdown = useMemo(() => {
        return (
            tradebookData?.summary?.chargesBreakdown ?? {
                brokerage: 0,
                stt: 0,
                exchangeTurnoverCharges: 0,
                sebiCharges: 0,
                stampDuty: 0,
                gst: 0,
                totalCharges: tradebookData?.summary?.totalCharges ?? 0,
            }
        );
    }, [tradebookData]);

    const handleOpenTotalCharges = () => {
        setModalChargesData({
            breakdown: totalChargesBreakdown,
            title: "Total Charges & Taxes Breakdown",
            subtitle: "Itemized statutory levies and platform fees deducted across your executions.",
        });
        setIsChargesModalOpen(true);
    };

    const handleOpenIndividualTradeCharges = (charges: TradeChargesItem, tradeTitle: string) => {
        setModalChargesData({
            breakdown: {
                brokerage: charges.brokerage,
                stt: charges.stt,
                exchangeTurnoverCharges: charges.exchangeTurnoverCharges,
                sebiCharges: charges.sebiCharges,
                stampDuty: charges.stampDuty,
                gst: charges.gst,
                totalCharges: charges.total,
            },
            title: tradeTitle,
            subtitle: "Itemized statutory levies and platform fees applied to this execution.",
        });
        setIsChargesModalOpen(true);
    };

    const paginationData = tradebookData?.pagination ?? {
        page: currentPage,
        limit: pageLimit,
        totalCount: 0,
        totalPages: 1,
    };

    return (
        <div className="flex flex-col space-y-5 animate-in fade-in duration-150 pb-10">
            {/* Header: Matches Sidebar "Trade Book" */}
            <div className="flex items-center justify-between pb-1 shrink-0">
                <h1 className="text-xl md:text-2xl font-bold text-dash-text tracking-tight select-none">
                    Trade Book
                </h1>
            </div>

            {/* Error Message if query fails */}
            {isError && (
                <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-between text-xs shrink-0">
                    <span>
                        {error instanceof Error ? error.message : "Failed to load tradebook executions."}
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

            <div className="shrink-0">
                <TradebookFilterBar
                    filters={filterForm}
                    onChange={setFilterForm}
                    onSubmit={handleFormSubmit}
                    onReset={handleResetFilters}
                    isLoading={isFetching}
                />
            </div>

            <div className="shrink-0">
                <TradebookSummaryRow
                    summary={tradebookData?.summary}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    onOpenChargesBreakdown={handleOpenTotalCharges}
                />
            </div>

            <div className="shrink-0">
                <TradebookTable
                    trades={tradebookData?.trades ?? []}
                    pagination={paginationData}
                    onPageChange={(newPage) => setCurrentPage(newPage)}
                    onLimitChange={(newLimit) => {
                        setPageLimit(newLimit);
                        setCurrentPage(1);
                    }}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    onSelectTradeCharges={handleOpenIndividualTradeCharges}
                    onResetFilters={handleResetFilters}
                />
            </div>

            <PnlChargesModal
                isOpen={isChargesModalOpen}
                onClose={() => setIsChargesModalOpen(false)}
                breakdown={modalChargesData.breakdown}
                title={modalChargesData.title}
                subtitle={modalChargesData.subtitle}
            />
        </div>
    );
};
