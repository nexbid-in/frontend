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
    const [sectorFilter, setSectorFilter] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

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
        sector: sectorFilter.trim() || undefined,
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
        setSectorFilter("");
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
        tradableFilter !== "ALL" ||
        sectorFilter
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
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
            {/* Header & Primary Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
                        Instruments & Stock Directory
                    </h1>
                    <p className="text-xs sm:text-sm text-text-secondary mt-1">
                        Manage tradeable equities, indices, and market feed mappings
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-muted bg-panel hover:bg-panel-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
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

                    <button
                        type="button"
                        onClick={() => setModalState({ isOpen: true, mode: "create", stock: null })}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-green hover:bg-primary-green-hover text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-primary-green/10 cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Instrument</span>
                    </button>
                </div>
            </div>

            {/* Metrics Overview Cards */}
            <AdminStockMetricsCards metrics={metrics} stocks={stocks} isLoading={isLoading} />

            {/* Filter & Search Bar */}
            <section className="rounded-2xl border border-border-muted bg-panel p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Filter & Search Instruments
                    </span>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border-muted bg-panel-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Reset Filters</span>
                            </button>
                        )}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-panel-2 border border-border-muted text-xs text-text-secondary font-medium">
                            <strong className="font-semibold text-text-primary">{totalStocks}</strong> Instruments
                        </div>
                    </div>
                </div>

                {/* Filter Controls Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                    {/* Search Input */}
                    <div className="lg:col-span-4 relative">
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
                            className="w-full bg-panel-2 border border-border-muted rounded-xl pl-9 pr-8 py-2 text-xs text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-primary-green transition-colors"
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
                            className="w-full bg-panel-2 border border-border-muted rounded-xl px-3 py-2 text-xs text-text-secondary focus:outline-none focus:border-primary-green transition-colors cursor-pointer"
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
                            className="w-full bg-panel-2 border border-border-muted rounded-xl px-3 py-2 text-xs text-text-secondary focus:outline-none focus:border-primary-green transition-colors cursor-pointer"
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
                            className="w-full bg-panel-2 border border-border-muted rounded-xl px-3 py-2 text-xs text-text-secondary focus:outline-none focus:border-primary-green transition-colors cursor-pointer"
                        >
                            <option value="ALL">All Trading Modes</option>
                            <option value="TRADABLE">Tradable</option>
                            <option value="VIEW_ONLY">View-Only</option>
                        </select>
                    </div>

                    {/* Sector Filter Input */}
                    <div className="lg:col-span-2">
                        <input
                            type="text"
                            value={sectorFilter}
                            onChange={(e) => {
                                setSectorFilter(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Filter by Sector..."
                            className="w-full bg-panel-2 border border-border-muted rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-primary-green transition-colors"
                        />
                    </div>
                </div>
            </section>

            {/* Data Table Section */}
            <section className="rounded-2xl border border-border-muted bg-panel shadow-sm overflow-hidden flex flex-col">
                <div ref={tableContainerRef} className="overflow-x-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="p-12 flex flex-col items-center justify-center space-y-3">
                            <div className="w-8 h-8 rounded-full border-2 border-primary-green border-t-transparent animate-spin" />
                            <p className="text-xs text-text-secondary font-medium">Loading instrument master...</p>
                        </div>
                    ) : queryError ? (
                        <div className="p-12 text-center space-y-3">
                            <div className="w-10 h-10 rounded-full bg-red/10 text-red mx-auto flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-text-primary">Failed to load instruments</h3>
                            <p className="text-xs text-text-secondary max-w-sm mx-auto">
                                {queryError instanceof Error ? queryError.message : "Network error"}
                            </p>
                            <button
                                type="button"
                                onClick={() => refetch()}
                                className="px-3.5 py-1.5 rounded-lg bg-panel-2 border border-border-muted text-xs text-text-primary hover:bg-muted font-medium cursor-pointer"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : stocks.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-panel-2 border border-border-muted mx-auto flex items-center justify-center text-text-secondary">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <rect x="3" y="12" width="4" height="8" rx="1" strokeWidth="2" />
                                    <rect x="10" y="8" width="4" height="12" rx="1" strokeWidth="2" />
                                    <rect x="17" y="4" width="4" height="16" rx="1" strokeWidth="2" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-text-primary">No instruments found</h3>
                            <p className="text-xs text-text-secondary max-w-sm mx-auto">
                                {hasActiveFilters
                                    ? "No instruments matched your search or filter criteria. Try adjusting or clearing your filters."
                                    : "No instruments are registered in the master directory yet. Add your first instrument above."}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="px-3.5 py-1.5 rounded-lg bg-panel-2 border border-border-muted text-xs text-text-primary hover:bg-muted font-medium cursor-pointer"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border-muted/80 bg-panel-2/40 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                                    <th className="py-3 px-4">Symbol & Exchange</th>
                                    <th className="py-3 px-4">Instrument Name</th>
                                    <th className="py-3 px-4">Type</th>
                                    <th className="py-3 px-4">Sector</th>
                                    <th className="py-3 px-4">Feed Ticker</th>
                                    <th className="py-3 px-4 text-center">Active</th>
                                    <th className="py-3 px-4 text-center">Tradable</th>
                                    <th className="py-3 px-4 text-center">Orders</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-muted/40 text-xs">
                                {stocks.map((stock) => {
                                    const isEquity = stock.type === "EQUITY";
                                    const hasOrders = stock.orderCount > 0;

                                    return (
                                        <tr
                                            key={stock.id}
                                            className="hover:bg-panel-2/50 transition-colors group"
                                        >
                                            {/* Symbol & Exchange */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-text-primary font-mono tracking-tight text-sm">
                                                        {stock.symbol}
                                                    </span>
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-panel-2 border border-border-muted text-text-secondary uppercase">
                                                        {stock.exchange || "NSE"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Instrument Name */}
                                            <td className="py-3.5 px-4 font-medium text-text-primary max-w-xs truncate">
                                                {stock.name}
                                            </td>

                                            {/* Type Badge */}
                                            <td className="py-3.5 px-4">
                                                {isEquity ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                                        EQUITY
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                        INDEX
                                                    </span>
                                                )}
                                            </td>

                                            {/* Sector */}
                                            <td className="py-3.5 px-4 text-text-secondary text-xs">
                                                {stock.sector || <span className="text-text-secondary/40">-</span>}
                                            </td>

                                            {/* Feed Ticker */}
                                            <td className="py-3.5 px-4">
                                                {stock.feedSymbol ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-panel-2 border border-border-muted text-text-primary">
                                                        {stock.feedSymbol}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted/30 text-text-secondary/70">
                                                        Default
                                                    </span>
                                                )}
                                            </td>

                                            {/* Active Toggle Switch */}
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="inline-flex items-center justify-center">
                                                    <ToggleSwitch
                                                        checked={stock.isActive}
                                                        onChange={(next) => handleToggleActive(stock, next)}
                                                        size="sm"
                                                    />
                                                </div>
                                            </td>

                                            {/* Tradable Toggle Switch */}
                                            <td className="py-3.5 px-4 text-center">
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

                                            {/* Orders Count Badge */}
                                            <td className="py-3.5 px-4 text-center">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                        hasOrders
                                                            ? "bg-primary-green/10 text-primary-green border border-primary-green/20"
                                                            : "bg-panel-2 text-text-secondary/70 border border-border-muted/50"
                                                    }`}
                                                >
                                                    {stock.orderCount ?? 0}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
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

                                                    {/* Delete Button with Safety Guard */}
                                                    {hasOrders ? (
                                                        <div
                                                            className="inline-block"
                                                            title="Cannot delete instrument with order history. Deactivate it instead."
                                                        >
                                                            <button
                                                                type="button"
                                                                disabled
                                                                className="p-1.5 rounded-lg text-text-secondary/30 cursor-not-allowed"
                                                                aria-label="Delete disabled"
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
                                                        </div>
                                                    ) : (
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
                <div className="p-4 border-t border-border-muted flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary bg-panel">
                    <div className="flex items-center gap-3">
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

                        {/* Page Size Selector */}
                        <div className="flex items-center gap-1.5 pl-3 border-l border-border-muted">
                            <span className="text-[11px] text-text-secondary">Rows:</span>
                            <select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="bg-panel-2 border border-border-muted rounded-lg px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-primary-green cursor-pointer"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
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
