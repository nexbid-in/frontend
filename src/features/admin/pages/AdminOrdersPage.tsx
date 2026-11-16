import { useState, useEffect, useTransition } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Toast } from "@/components/ui/Toast";
import { formatINR } from "@/features/watchlist";
import {
    useAdminOrdersQuery,
    useAdminOrderMetricsQuery,
    useAdminCancelOrderMutation,
} from "../hooks/useAdminOrders";
import { AdminOrderMetricsCards } from "../components/AdminOrderMetricsCards";
import { AdminOrderDetailsDrawer } from "../components/AdminOrderDetailsDrawer";
import type {
    AdminOrderListItemDTO,
    AdminOrderFilterStatus,
    AdminOrderFilterSide,
    AdminOrderFilterProduct,
    AdminOrderFilterAmo,
    AdminOrdersQueryDTO,
} from "../types";

export function AdminOrdersPage() {
    const [, startTransition] = useTransition();

    // Filters state
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<AdminOrderFilterStatus>("ALL");
    const [sideFilter, setSideFilter] = useState<AdminOrderFilterSide>("ALL");
    const [productFilter, setProductFilter] = useState<AdminOrderFilterProduct>("ALL");
    const [amoFilter, setAmoFilter] = useState<AdminOrderFilterAmo>("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;

    // Modals / Drawers state
    const [inspectedOrder, setInspectedOrder] = useState<AdminOrderListItemDTO | null>(null);
    const [cancelModalOrder, setCancelModalOrder] = useState<AdminOrderListItemDTO | null>(null);
    const [toastMessage, setToastMessage] = useState<{ title: string; message: string; type: "success" | "error" } | null>(null);

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
    const queryParams: AdminOrdersQueryDTO = {
        page,
        limit,
        search: debouncedSearch || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        side: sideFilter !== "ALL" ? sideFilter : undefined,
        productType: productFilter !== "ALL" ? productFilter : undefined,
        isAmo: amoFilter === "AMO_ONLY" ? true : amoFilter === "REGULAR_ONLY" ? false : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
    };

    // React Queries
    const {
        data: ordersData,
        isLoading: isOrdersLoading,
        isFetching: isOrdersFetching,
        error: ordersError,
        refetch: refetchOrders,
    } = useAdminOrdersQuery(queryParams);

    const {
        data: metricsData,
        isLoading: isMetricsLoading,
        refetch: refetchMetrics,
    } = useAdminOrderMetricsQuery();

    const cancelMutation = useAdminCancelOrderMutation();

    const orders = ordersData?.orders ?? [];
    const pagination = ordersData?.pagination;
    const totalOrders = pagination?.totalOrders ?? 0;
    const totalPages = pagination?.totalPages ?? 1;

    // Reset all filters
    const handleResetFilters = () => {
        setSearchQuery("");
        setDebouncedSearch("");
        setStatusFilter("ALL");
        setSideFilter("ALL");
        setProductFilter("ALL");
        setAmoFilter("ALL");
        setStartDate("");
        setEndDate("");
        setPage(1);
    };

    const hasActiveFilters = Boolean(
        debouncedSearch ||
        statusFilter !== "ALL" ||
        sideFilter !== "ALL" ||
        productFilter !== "ALL" ||
        amoFilter !== "ALL" ||
        startDate ||
        endDate
    );

    // Handle cancel order confirmation
    const handleConfirmCancelOrder = async () => {
        if (!cancelModalOrder) return;
        const targetOrder = cancelModalOrder;
        setCancelModalOrder(null);

        try {
            await cancelMutation.mutateAsync(targetOrder.id);
            setToastMessage({
                title: "Order Cancelled",
                message: `Order #${targetOrder.id.slice(0, 8)} for ${targetOrder.symbol} has been safely cancelled and margin refunded.`,
                type: "success",
            });
            // Also update inspected order if it was open
            if (inspectedOrder?.id === targetOrder.id) {
                setInspectedOrder((prev) => (prev ? { ...prev, status: "CANCELLED" } : null));
            }
        } catch (err) {
            setToastMessage({
                title: "Failed to Cancel Order",
                message: err instanceof Error ? err.message : "An error occurred while cancelling the order.",
                type: "error",
            });
        }
    };

    // Formatters
    const formatOrderDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return {
                time: date.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                }),
                date: date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }),
            };
        } catch {
            return { time: "—", date: "—" };
        }
    };

    return (
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {/* KPI Metrics Cards */}
            <AdminOrderMetricsCards metrics={metricsData} isLoading={isMetricsLoading} />

            {/* Orders Management Section */}
            <section className="rounded-xl border border-border-muted bg-card overflow-hidden shadow-xs">
                {/* Header and Filter Toolbar */}
                <div className="p-5 border-b border-border-muted space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-semibold text-text-primary tracking-tight">
                                    Platform Order Book
                                </h2>
                                {isOrdersFetching && !isOrdersLoading && (
                                    <span className="w-2 h-2 rounded-full bg-primary-green animate-ping" />
                                )}
                            </div>
                            <p className="text-xs text-text-secondary mt-0.5">
                                Real-time monitoring and administrative oversight of all paper orders.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                            <button
                                type="button"
                                onClick={() => {
                                    refetchOrders();
                                    refetchMetrics();
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-muted bg-panel-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                                title="Refresh order feed"
                            >
                                <svg
                                    className={`w-3.5 h-3.5 ${isOrdersFetching ? "animate-spin text-primary-green" : ""}`}
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
                                <strong className="font-semibold text-text-primary">{totalOrders}</strong> Total Orders
                            </div>
                        </div>
                    </div>

                    {/* Filter Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 pt-1">
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
                                placeholder="Search order ID, symbol, user ID..."
                                className="w-full bg-panel-2 border border-border-muted rounded-lg pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-primary-green transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-0.5 cursor-pointer"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Status Filter */}
                        <div className="lg:col-span-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value as AdminOrderFilterStatus);
                                    setPage(1);
                                }}
                                className="w-full bg-panel-2 border border-border-muted rounded-lg px-2.5 py-2 text-xs text-text-secondary focus:outline-none focus:border-primary-green transition-colors cursor-pointer"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="PENDING">Pending Only</option>
                                <option value="EXECUTED">Executed Only</option>
                                <option value="CANCELLED">Cancelled</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>

                        {/* Side Filter */}
                        <div className="lg:col-span-2">
                            <select
                                value={sideFilter}
                                onChange={(e) => {
                                    setSideFilter(e.target.value as AdminOrderFilterSide);
                                    setPage(1);
                                }}
                                className="w-full bg-panel-2 border border-border-muted rounded-lg px-2.5 py-2 text-xs text-text-secondary focus:outline-none focus:border-primary-green transition-colors cursor-pointer"
                            >
                                <option value="ALL">All Sides</option>
                                <option value="BUY">Buy Orders</option>
                                <option value="SELL">Sell Orders</option>
                            </select>
                        </div>

                        {/* Product Filter */}
                        <div className="lg:col-span-2">
                            <select
                                value={productFilter}
                                onChange={(e) => {
                                    setProductFilter(e.target.value as AdminOrderFilterProduct);
                                    setPage(1);
                                }}
                                className="w-full bg-panel-2 border border-border-muted rounded-lg px-2.5 py-2 text-xs text-text-secondary focus:outline-none focus:border-primary-green transition-colors cursor-pointer"
                            >
                                <option value="ALL">All Products</option>
                                <option value="MIS">Intraday (MIS)</option>
                                <option value="CNC">Longterm (CNC)</option>
                            </select>
                        </div>

                        {/* AMO Filter */}
                        <div className="lg:col-span-2">
                            <select
                                value={amoFilter}
                                onChange={(e) => {
                                    setAmoFilter(e.target.value as AdminOrderFilterAmo);
                                    setPage(1);
                                }}
                                className="w-full bg-panel-2 border border-border-muted rounded-lg px-2.5 py-2 text-xs text-text-secondary focus:outline-none focus:border-primary-green transition-colors cursor-pointer"
                            >
                                <option value="ALL">All Sessions</option>
                                <option value="AMO_ONLY">AMO Only</option>
                                <option value="REGULAR_ONLY">Regular Market</option>
                            </select>
                        </div>
                    </div>

                    {/* Secondary Date Range & Reset Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-text-secondary text-[11px] font-medium">Date Range:</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setPage(1);
                                }}
                                className="bg-panel-2 border border-border-muted rounded-lg px-2 py-1 text-xs text-text-secondary focus:outline-none focus:border-primary-green transition-colors cursor-pointer"
                            />
                            <span className="text-text-secondary">to</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setPage(1);
                                }}
                                className="bg-panel-2 border border-border-muted rounded-lg px-2 py-1 text-xs text-text-secondary focus:outline-none focus:border-primary-green transition-colors cursor-pointer"
                            />
                        </div>

                        {hasActiveFilters && (
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
                        )}
                    </div>
                </div>

                {/* Table Viewport with vertical scroll for 5 visible rows */}
                <div className="overflow-x-auto overflow-y-auto max-h-[340px] relative">
                    {isOrdersLoading && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-card/60 backdrop-blur-xs transition-all duration-200">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-7 h-7 border-2 border-primary-green/20 border-t-primary-green rounded-full animate-spin" />
                                <span className="text-xs text-text-secondary font-medium">Loading orders...</span>
                            </div>
                        </div>
                    )}

                    {ordersError ? (
                        <div className="flex flex-col items-center justify-center h-56 text-red text-xs space-y-2">
                            <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="font-medium">
                                {ordersError instanceof Error ? ordersError.message : "Failed to load orders"}
                            </p>
                            <button
                                type="button"
                                onClick={() => refetchOrders()}
                                className="px-3 py-1 rounded bg-panel-2 border border-border-muted text-text-primary text-xs hover:border-primary-green transition-colors cursor-pointer"
                            >
                                Retry
                            </button>
                        </div>
                    ) : orders.length === 0 && !isOrdersLoading ? (
                        <div className="flex flex-col items-center justify-center h-56 text-text-secondary text-xs space-y-2">
                            <svg className="w-8 h-8 opacity-40 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="font-medium text-text-primary">No orders found</p>
                            <p className="text-[11px] text-text-secondary">Try adjusting your filters or date range.</p>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="px-3 py-1 mt-1 rounded bg-panel-2 border border-border-muted text-text-primary text-xs hover:border-primary-green transition-colors cursor-pointer"
                                >
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-10 bg-panel-2 border-b border-border-muted shadow-xs">
                                <tr className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                                    <th className="py-3 px-4 bg-panel-2">Order ID & Time</th>
                                    <th className="py-3 px-4 bg-panel-2">User ID</th>
                                    <th className="py-3 px-4 bg-panel-2">Instrument</th>
                                    <th className="py-3 px-4 bg-panel-2">Type / Side</th>
                                    <th className="py-3 px-4 bg-panel-2">Qty & Price</th>
                                    <th className="py-3 px-4 bg-panel-2">Margin</th>
                                    <th className="py-3 px-4 bg-panel-2">Status</th>
                                    <th className="py-3 px-4 bg-panel-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs divide-y divide-border-muted/60">
                                {orders.map((order) => {
                                    const timeInfo = formatOrderDate(order.createdAt);
                                    const isPending = order.status === "PENDING";
                                    const isExecuted = order.status === "EXECUTED";
                                    const isCancelled = order.status === "CANCELLED";
                                    const isRejected = order.status === "REJECTED";

                                    return (
                                        <tr
                                            key={order.id}
                                            onClick={() => setInspectedOrder(order)}
                                            className="hover:bg-panel-2/40 transition-colors cursor-pointer group"
                                        >
                                            {/* Order ID & Time */}
                                            <td className="py-3 px-4">
                                                <div className="font-mono text-xs font-semibold text-text-primary group-hover:text-primary-green transition-colors">
                                                    #{order.id.slice(0, 8)}
                                                </div>
                                                <div className="text-[11px] text-text-secondary mt-0.5">
                                                    <span>{timeInfo.time}</span> &bull; <span>{timeInfo.date}</span>
                                                </div>
                                            </td>

                                            {/* User ID */}
                                            <td className="py-3 px-4">
                                                <div className="font-mono text-xs font-semibold text-text-primary">
                                                    {order.user.id}
                                                </div>
                                            </td>

                                            {/* Instrument */}
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-text-primary tracking-tight">
                                                        {order.symbol}
                                                    </span>
                                                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-panel-2 border border-border-muted text-text-secondary">
                                                        {order.stock.exchange || "NSE"}
                                                    </span>
                                                    {order.isAmo && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-400 border border-purple-500/20">
                                                            AMO
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-text-secondary truncate max-w-[140px] mt-0.5">
                                                    {order.stock.name || order.symbol}
                                                </p>
                                            </td>

                                            {/* Type / Side */}
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className={`px-1.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                                                            order.side === "BUY"
                                                                ? "bg-green/10 text-green"
                                                                : "bg-red/10 text-red"
                                                        }`}
                                                    >
                                                        {order.side}
                                                    </span>
                                                    <span className="text-[11px] font-medium text-text-secondary">
                                                        {order.orderType}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-text-secondary block mt-0.5 font-medium">
                                                    {order.productType === "MIS" ? "Intraday (MIS)" : "Longterm (CNC)"}
                                                </span>
                                            </td>

                                            {/* Qty & Price */}
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-text-primary">
                                                    <span>{order.filledQuantity}</span>
                                                    <span className="text-text-secondary"> / {order.quantity} Qty</span>
                                                </div>
                                                <div className="text-[11px] text-text-secondary mt-0.5">
                                                    {order.price ? `₹${formatINR(order.price)}` : "Market"}
                                                    {order.averagePrice ? ` (avg ₹${formatINR(order.averagePrice)})` : ""}
                                                </div>
                                            </td>

                                            {/* Blocked Margin */}
                                            <td className="py-3 px-4">
                                                <span className="font-semibold text-text-primary">
                                                    ₹{formatINR(order.blockedMargin)}
                                                </span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                                        isExecuted
                                                            ? "bg-green/10 text-green"
                                                            : isPending
                                                            ? "bg-amber-500/10 text-amber-400"
                                                            : isCancelled
                                                            ? "bg-muted text-text-secondary"
                                                            : "bg-red/10 text-red"
                                                    }`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${
                                                            isExecuted
                                                                ? "bg-green"
                                                                : isPending
                                                                ? "bg-amber-400 animate-pulse"
                                                                : isCancelled
                                                                ? "bg-text-secondary"
                                                                : "bg-red"
                                                        }`}
                                                    />
                                                    {order.status}
                                                </span>
                                                {isRejected && order.rejectionReason && (
                                                    <p className="text-[10px] text-red/80 truncate max-w-[120px] mt-0.5" title={order.rejectionReason}>
                                                        {order.rejectionReason}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setInspectedOrder(order)}
                                                        className="px-2.5 py-1 rounded-lg border border-border-muted bg-panel-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-primary-green transition-colors cursor-pointer"
                                                        title="Inspect full diagnostics"
                                                    >
                                                        Details
                                                    </button>

                                                    {isPending && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setCancelModalOrder(order)}
                                                            className="px-2.5 py-1 rounded-lg border border-red/30 bg-red/10 text-xs font-semibold text-red hover:bg-red/20 transition-colors cursor-pointer"
                                                            title="Administrative Cancel"
                                                        >
                                                            Cancel
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
                <div className="p-4 border-t border-border-muted flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
                    <div>
                        Showing <span className="font-semibold text-text-primary">{(page - 1) * limit + (orders.length > 0 ? 1 : 0)}</span> to{" "}
                        <span className="font-semibold text-text-primary">{Math.min(page * limit, totalOrders)}</span> of{" "}
                        <span className="font-semibold text-text-primary">{totalOrders}</span> orders
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-1.5 rounded-lg border border-border-muted bg-panel-2 text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            aria-label="Previous page"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <span className="px-2 font-medium">Page {page} of {totalPages || 1}</span>

                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

            {/* Diagnostics Inspection Slide-over Drawer */}
            <AdminOrderDetailsDrawer
                orderItem={inspectedOrder}
                onClose={() => setInspectedOrder(null)}
                onRequestCancel={(order) => {
                    setCancelModalOrder(order);
                }}
            />

            {/* Cancel Confirmation Modal */}
            <ConfirmModal
                isOpen={Boolean(cancelModalOrder)}
                title="Cancel Order (Admin Override)"
                message={
                    cancelModalOrder ? (
                        <div className="space-y-2 text-xs">
                            <p>
                                Are you sure you want to administratively cancel Order{" "}
                                <strong className="font-mono text-text-primary">
                                    #{cancelModalOrder.id.slice(0, 8)}
                                </strong>{" "}
                                for{" "}
                                <strong className="text-text-primary">{cancelModalOrder.symbol}</strong>?
                            </p>
                            <p className="text-text-secondary">
                                This will remove the order from the matching engine order book and release{" "}
                                <strong className="text-primary-green">
                                    ₹{formatINR(cancelModalOrder.blockedMargin)}
                                </strong>{" "}
                                blocked margin back to user{" "}
                                <strong className="text-text-primary">
                                    {cancelModalOrder.user.firstName} {cancelModalOrder.user.lastName} ({cancelModalOrder.user.id})
                                </strong>.
                            </p>
                        </div>
                    ) : null
                }
                confirmText={cancelMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
                confirmButtonVariant="danger"
                onConfirm={handleConfirmCancelOrder}
                onCancel={() => setCancelModalOrder(null)}
            />

            {/* Toast Notification */}
            {toastMessage && (
                <Toast
                    title={toastMessage.title}
                    message={toastMessage.message}
                    type={toastMessage.type}
                    duration={6000}
                    onClose={() => setToastMessage(null)}
                />
            )}
        </main>
    );
}
