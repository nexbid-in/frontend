import { useState, useEffect, useTransition, useRef } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Toast } from "@/components/ui/Toast";
import {
    useAdminStocksQuery,
    useCreateStockMutation,
    useUpdateStockMutation,
    useUpdateStockStatusMutation,
    useDeleteStockMutation,
} from "../hooks/useAdminStocks";
import { AdminStockMetricsCards } from "../components/AdminStockMetricsCards";
import { AdminStockModal } from "../components/AdminStockModal";
import { ToggleSwitch } from "../components/ToggleSwitch";
import type {
    AdminStockItem,
    AdminStocksQuery,
    CreateStockInput,
    UpdateStockInput,
} from "@/types/adminStock";

export function AdminStocksPage() {
    const [, startTransition] = useTransition();

    // Filters state
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<"ALL" | "EQUITY" | "INDEX">("ALL");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
    const [tradableFilter, setTradableFilter] = useState<"ALL" | "TRADABLE" | "VIEW_ONLY">("ALL");
    const [page, setPage] = useState(1);
    const limit = 20;

    // Modals state
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        mode: "create" | "edit";
        stock?: AdminStockItem | null;
    }>({
        isOpen: false,
        mode: "create",
        stock: null,
    });
    const [deleteModalStock, setDeleteModalStock] = useState<AdminStockItem | null>(null);
    const [toastMessage, setToastMessage] = useState<{
        title: string;
        message: string;
        type: "success" | "error" | "info";
    } | null>(null);

    // Scroll to top on page change
    useEffect(() => {
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollTop = 0;
        }
    }, [page]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            startTransition(() => {
                setDebouncedSearch(searchQuery);
                setPage(1);
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Query parameters
    const queryParams: AdminStocksQuery = {
        page,
        limit,
        query: debouncedSearch || undefined,
        type: typeFilter !== "ALL" ? typeFilter : undefined,
        isActive:
            statusFilter === "ACTIVE"
                ? true
                : statusFilter === "INACTIVE"
                ? false
                : undefined,
        isTradable:
            tradableFilter === "TRADABLE"
                ? true
                : tradableFilter === "VIEW_ONLY"
                ? false
                : undefined,
    };

    // React Query data fetching
    const {
        data: stocksData,
        isLoading,
        isFetching,
        error: queryError,
        refetch,
    } = useAdminStocksQuery(queryParams);

    const stocks = stocksData?.stocks ?? [];
    const pagination = stocksData?.pagination;
    const metrics = stocksData?.metrics;
    const totalStocks = pagination?.totalStocks ?? 0;
    const totalPages = pagination?.totalPages ?? 1;

    // Mutations
    const createMutation = useCreateStockMutation({
        onSuccess: (newStock) => {
            setModalState({ isOpen: false, mode: "create", stock: null });
            setToastMessage({
                title: "Instrument Registered",
                message: `Successfully created ${newStock.symbol} (${newStock.name}) in the instrument master.`,
                type: "success",
            });
        },
        onError: (err) => {
            setToastMessage({
                title: "Failed to Register Instrument",
                message: err.message || "An unexpected error occurred while creating instrument.",
                type: "error",
            });
        },
    });

    const updateMetadataMutation = useUpdateStockMutation();
    const updateStatusMutation = useUpdateStockStatusMutation();

    const deleteMutation = useDeleteStockMutation({
        onSuccess: () => {
            const deletedSymbol = deleteModalStock?.symbol ?? "Instrument";
            setDeleteModalStock(null);
            setToastMessage({
                title: "Instrument Deleted",
                message: `${deletedSymbol} has been removed from the instrument master.`,
                type: "success",
            });
        },
        onError: (err) => {
            setDeleteModalStock(null);
            setToastMessage({
                title: "Cannot Delete Instrument",
                message:
                    err.message ||
                    "Cannot delete instrument with associated orders or trades. Deactivate it instead.",
                type: "error",
            });
        },
    });

    // Reset filters
    const handleResetFilters = () => {
        setSearchQuery("");
        setDebouncedSearch("");
        setTypeFilter("ALL");
        setStatusFilter("ALL");
        setTradableFilter("ALL");
        setPage(1);
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollTop = 0;
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages || newPage === page) return;
        setPage(newPage);
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollTop = 0;
        }
    };

    const hasActiveFilters = Boolean(
        debouncedSearch ||
        typeFilter !== "ALL" ||
        statusFilter !== "ALL" ||
        tradableFilter !== "ALL"
    );

    // Quick toggle active status
    const handleToggleActive = async (stock: AdminStockItem, nextActive: boolean) => {
        try {
            await updateStatusMutation.mutateAsync({
                stockId: stock.id,
                payload: {
                    isActive: nextActive,
                    isTradable: stock.type === "INDEX" ? false : stock.isTradable,
                },
            });
            setToastMessage({
                title: "Status Updated",
                message: `${stock.symbol} is now ${nextActive ? "Active" : "Inactive"}.`,
                type: "success",
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to toggle active status";
            setToastMessage({
                title: "Status Update Failed",
                message,
                type: "error",
            });
        }
    };

    // Quick toggle tradable status
    const handleToggleTradable = async (stock: AdminStockItem, nextTradable: boolean) => {
        if (stock.type === "INDEX") return;
        try {
            await updateStatusMutation.mutateAsync({
                stockId: stock.id,
                payload: {
                    isActive: stock.isActive,
                    isTradable: nextTradable,
                },
            });
            setToastMessage({
                title: "Trading Status Updated",
                message: `${stock.symbol} is now ${nextTradable ? "Tradable" : "View-Only"}.`,
                type: "success",
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to toggle trading status";
            setToastMessage({
                title: "Trading Status Update Failed",
                message,
                type: "error",
            });
        }
    };

    // Handle Create in Modal
    const handleCreateInstrument = async (payload: CreateStockInput) => {
        await createMutation.mutateAsync(payload);
    };

    // Handle Edit in Modal (Metadata + Status sync)
    const handleUpdateInstrument = async (
        stockId: string,
        metadataPayload: UpdateStockInput,
        statusPayload: { isActive: boolean; isTradable: boolean }
    ) => {
        try {
            // Update metadata
            await updateMetadataMutation.mutateAsync({
                stockId,
                payload: metadataPayload,
            });

            // Update status if changed
            const existing = modalState.stock;
            if (
                existing &&
                (existing.isActive !== statusPayload.isActive ||
                    existing.isTradable !== statusPayload.isTradable)
            ) {
                await updateStatusMutation.mutateAsync({
                    stockId,
                    payload: statusPayload,
                });
            }

            setModalState({ isOpen: false, mode: "edit", stock: null });
            setToastMessage({
                title: "Instrument Updated",
                message: `Successfully updated metadata for ${existing?.symbol || "instrument"}.`,
                type: "success",
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to update instrument";
            setToastMessage({
                title: "Update Failed",
                message,
                type: "error",
            });
        }
    };

    // Handle Delete Confirm
    const handleConfirmDelete = async () => {
        if (!deleteModalStock) return;
        await deleteMutation.mutateAsync(deleteModalStock.id);
    };

    return (
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {/* Metrics Overview Cards */}
            <AdminStockMetricsCards metrics={metrics} stocks={stocks} isLoading={isLoading} />

            {/* Instruments Management Section (Unified Filter Toolbar + Table) */}
            <section className="rounded-xl border border-border-muted bg-card overflow-hidden shadow-xs">
                {/* Header and Filter Toolbar */}
                <div className="p-5 border-b border-border-muted space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-semibold text-text-primary tracking-tight">
                                    Platform Instrument Directory
                                </h2>
                                {isFetching && !isLoading && (
                                    <span className="w-2 h-2 rounded-full bg-primary-green animate-ping" />
                                )}
                            </div>
                            <p className="text-xs text-text-secondary mt-0.5">
                                Real-time catalog and administrative oversight of all tradeable instruments.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                            <button
                                type="button"
                                onClick={() => refetch()}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-muted bg-panel-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                                title="Refresh instrument directory"
                            >
                                <svg
                                    className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-primary-green" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                <span>Refresh</span>
                            </button>

                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-panel-2 border border-border-muted text-xs text-text-secondary font-medium">
                                <strong className="font-semibold text-text-primary">{totalStocks}</strong> Total Instruments
                            </div>

                            <button
                                type="button"
                                onClick={() => setModalState({ isOpen: true, mode: "create", stock: null })}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-green hover:bg-primary-green-hover text-white text-xs font-semibold transition-all shadow-sm shadow-primary-green/10 cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Add Instrument</span>
                            </button>
                        </div>
                    </div>

                    {/* Filter Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 pt-1">
                        {/* Search Input */}
                        <div className="lg:col-span-6 relative">
                            <svg
                                className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search symbol, company name, or feed ticker..."
                                className="w-full bg-panel-2 border border-border-muted rounded-lg pl-9 pr-8 py-2 text-xs text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-primary-green transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-0.5 cursor-pointer"
                                    aria-label="Clear search"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Type Filter */}
                        <div className="lg:col-span-2">
                            <select
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value as "ALL" | "EQUITY" | "INDEX");
                                    setPage(1);
                                }}
                                className="w-full bg-panel-2 border border-border-muted rounded-lg px-2.5 py-2 text-xs text-text-secondary focus:outline-none focus:border-primary-green transition-colors cursor-pointer"
                            >
                                <option value="ALL">All Types</option>
                                <option value="EQUITY">Equities Only</option>
                                <option value="INDEX">Indices Only</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="lg:col-span-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE");
                                    setPage(1);
                                }}
                                className="w-full bg-panel-2 border border-border-muted rounded-lg px-2.5 py-2 text-xs text-text-secondary focus:outline-none focus:border-primary-green transition-colors cursor-pointer"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="ACTIVE">Active Only</option>
                                <option value="INACTIVE">Inactive Only</option>
                            </select>
                        </div>

                        {/* Tradable Filter */}
                        <div className="lg:col-span-2">
                            <select
                                value={tradableFilter}
                                onChange={(e) => {
                                    setTradableFilter(e.target.value as "ALL" | "TRADABLE" | "VIEW_ONLY");
                                    setPage(1);
                                }}
                                className="w-full bg-panel-2 border border-border-muted rounded-lg px-2.5 py-2 text-xs text-text-secondary focus:outline-none focus:border-primary-green transition-colors cursor-pointer"
                            >
                                <option value="ALL">All Trading Modes</option>
                                <option value="TRADABLE">Tradable</option>
                                <option value="VIEW_ONLY">View-Only</option>
                            </select>
                        </div>
                    </div>

                    {/* Clear Filters Row */}
                    {hasActiveFilters && (
                        <div className="flex items-center justify-end pt-1">
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="text-xs text-text-secondary hover:text-primary-green transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Clear Filters</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Table Viewport with vertical scroll for visible rows */}
                <div
                    ref={tableContainerRef}
                    className="overflow-x-auto overflow-y-auto h-[340px] custom-scrollbar relative"
                >
                    {isLoading && !stocksData && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-card/60 backdrop-blur-xs transition-all duration-200">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-7 h-7 border-2 border-primary-green/20 border-t-primary-green rounded-full animate-spin" />
                                <span className="text-xs text-text-secondary font-medium">Loading instruments...</span>
                            </div>
                        </div>
                    )}

                    {queryError ? (
                        <div className="flex flex-col items-center justify-center h-full text-red text-xs space-y-2 p-8">
                            <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="font-medium">
                                {queryError instanceof Error ? queryError.message : "Failed to load instruments"}
                            </p>
                            <button
                                type="button"
                                onClick={() => refetch()}
                                className="px-3 py-1 rounded bg-panel-2 border border-border-muted text-text-primary text-xs hover:border-primary-green transition-colors cursor-pointer"
                            >
                                Retry
                            </button>
                        </div>
                    ) : stocks.length === 0 && !isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-text-secondary text-xs space-y-2 p-8">
                            <svg className="w-8 h-8 opacity-40 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="12" width="4" height="8" rx="1" strokeWidth="1.5" />
                                <rect x="10" y="8" width="4" height="12" rx="1" strokeWidth="1.5" />
                                <rect x="17" y="4" width="4" height="16" rx="1" strokeWidth="1.5" />
                            </svg>
                            <p className="font-medium text-text-primary">No instruments found</p>
                            <p className="text-[11px] text-text-secondary">Try adjusting your search or filters.</p>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="px-3 py-1 mt-1 rounded bg-panel-2 border border-border-muted text-text-primary text-xs hover:border-primary-green transition-colors cursor-pointer"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-10 bg-panel-2 border-b border-border-muted shadow-xs">
                                <tr className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                                    <th className="py-3 px-4 bg-panel-2">Symbol & Exchange</th>
                                    <th className="py-3 px-4 bg-panel-2">Instrument Name</th>
                                    <th className="py-3 px-4 bg-panel-2">Type</th>
                                    <th className="py-3 px-4 bg-panel-2">Sector</th>
                                    <th className="py-3 px-4 bg-panel-2">Feed Ticker</th>
                                    <th className="py-3 px-4 bg-panel-2 text-center">Active</th>
                                    <th className="py-3 px-4 bg-panel-2 text-center">Tradable</th>
                                    <th className="py-3 px-4 bg-panel-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs divide-y divide-border-muted/60">
                                {stocks.map((stock) => {
                                    const isEquity = stock.type === "EQUITY";

                                    return (
                                        <tr
                                            key={stock.id}
                                            className="hover:bg-panel-2/40 transition-colors group"
                                        >
                                            {/* Symbol & Exchange */}
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono font-bold text-text-primary tracking-tight">
                                                        {stock.symbol}
                                                    </span>
                                                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-panel-2 border border-border-muted text-text-secondary uppercase">
                                                        {stock.exchange || "NSE"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Instrument Name */}
                                            <td className="py-3 px-4 font-medium text-text-primary max-w-[220px] truncate">
                                                {stock.name}
                                            </td>

                                            {/* Type Badge */}
                                            <td className="py-3 px-4">
                                                {isEquity ? (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                                        EQUITY
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                        INDEX
                                                    </span>
                                                )}
                                            </td>

                                            {/* Sector */}
                                            <td className="py-3 px-4 text-text-secondary text-xs max-w-[160px] truncate">
                                                {stock.sector || <span className="text-text-secondary/40">—</span>}
                                            </td>

                                            {/* Feed Ticker */}
                                            <td className="py-3 px-4">
                                                {stock.feedSymbol ? (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-panel-2 border border-border-muted text-text-primary">
                                                        {stock.feedSymbol}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted/30 text-text-secondary/70">
                                                        Default
                                                    </span>
                                                )}
                                            </td>

                                            {/* Active Toggle Switch */}
                                            <td className="py-3 px-4 text-center">
                                                <div className="inline-flex items-center justify-center">
                                                    <ToggleSwitch
                                                        checked={stock.isActive}
                                                        onChange={(next) => handleToggleActive(stock, next)}
                                                        size="sm"
                                                    />
                                                </div>
                                            </td>

                                            {/* Tradable Toggle Switch */}
                                            <td className="py-3 px-4 text-center">
                                                <div className="inline-flex items-center justify-center">
                                                    <ToggleSwitch
                                                        checked={stock.type === "INDEX" ? false : stock.isTradable}
                                                        onChange={(next) => handleToggleTradable(stock, next)}
                                                        disabled={stock.type === "INDEX"}
                                                        disabledTooltip="Indices are view-only and cannot be traded"
                                                        size="sm"
                                                    />
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {/* Edit Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setModalState({
                                                                isOpen: true,
                                                                mode: "edit",
                                                                stock,
                                                            })
                                                        }
                                                        className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-panel-2 transition-colors cursor-pointer"
                                                        title="Edit instrument metadata"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                    </button>

                                                    {/* Delete Button (Rendered ONLY IF stock.canDelete === true) */}
                                                    {stock.canDelete && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteModalStock(stock)}
                                                            className="p-1.5 rounded-lg text-text-secondary hover:text-red hover:bg-red/10 transition-colors cursor-pointer"
                                                            title="Delete instrument"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Controls */}
                <div className="p-4 border-t border-border-muted flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary bg-card">
                    <div>
                        Showing{" "}
                        <span className="font-semibold text-text-primary">
                            {(page - 1) * limit + (stocks.length > 0 ? 1 : 0)}
                        </span>{" "}
                        to{" "}
                        <span className="font-semibold text-text-primary">
                            {Math.min(page * limit, totalStocks)}
                        </span>{" "}
                        of <span className="font-semibold text-text-primary">{totalStocks}</span> instruments
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="p-1.5 rounded-lg border border-border-muted bg-panel-2 text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            aria-label="Previous page"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <span className="px-2 font-medium">
                            Page {page} of {totalPages || 1}
                        </span>

                        <button
                            type="button"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages || totalPages === 0}
                            className="p-1.5 rounded-lg border border-border-muted bg-panel-2 text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            aria-label="Next page"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </section>

            {/* Add / Edit Instrument Modal */}
            <AdminStockModal
                isOpen={modalState.isOpen}
                mode={modalState.mode}
                stock={modalState.stock}
                isSubmitting={createMutation.isPending || updateMetadataMutation.isPending || updateStatusMutation.isPending}
                onClose={() => setModalState({ isOpen: false, mode: "create", stock: null })}
                onSubmitCreate={handleCreateInstrument}
                onSubmitUpdate={handleUpdateInstrument}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={Boolean(deleteModalStock)}
                title="Delete Instrument"
                message={
                    deleteModalStock ? (
                        <div className="space-y-2 text-xs">
                            <p>
                                Are you sure you want to permanently delete instrument{" "}
                                <strong className="font-mono text-text-primary">
                                    {deleteModalStock.symbol}
                                </strong>{" "}
                                ({deleteModalStock.name})?
                            </p>
                            <p className="text-text-secondary">
                                This will remove the instrument from the catalog. Instruments with existing orders cannot be deleted and must be deactivated instead.
                            </p>
                        </div>
                    ) : null
                }
                confirmText={deleteMutation.isPending ? "Deleting..." : "Delete Instrument"}
                confirmButtonVariant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteModalStock(null)}
            />

            {/* Toast Notifications */}
            {toastMessage && (
                <Toast
                    title={toastMessage.title}
                    message={toastMessage.message}
                    type={toastMessage.type}
                    duration={5000}
                    onClose={() => setToastMessage(null)}
                />
            )}
        </main>
    );
}
