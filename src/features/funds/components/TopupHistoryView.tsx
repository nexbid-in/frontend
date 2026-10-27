import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fundsService } from "../services/fundsService";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type { PaymentOrderStatus } from "../types";

interface TopupHistoryViewProps {
    formatINR: (num: number) => string;
    onClose?: () => void;
}

const STATUS_FILTERS: { label: string; value: PaymentOrderStatus | "ALL" }[] = [
    { label: "All Orders", value: "ALL" },
    { label: "Success", value: "SUCCESS" },
    { label: "Failed", value: "FAILED" },
    { label: "Pending", value: "PENDING" },
];

const formatDate = (dateString: string) => {
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return (
            d.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }) +
            ", " +
            d.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            })
        );
    } catch {
        return dateString;
    }
};

export const TopupHistoryView: React.FC<TopupHistoryViewProps> = ({ formatINR, onClose }) => {
    // Filter & Query States
    const [selectedStatus, setSelectedStatus] = useState<PaymentOrderStatus | "ALL">("ALL");
    const [searchInput, setSearchInput] = useState<string>("");
    const [activeSearch, setActiveSearch] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);

    // Clipboard copy feedback
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // TanStack Query: Top-up Orders History Query with auto-caching
    const {
        data: historyData,
        isLoading,
        isFetching,
        error: queryError,
        refetch,
    } = useQuery({
        queryKey: QUERY_KEYS.wallet.topupHistory({
            page: currentPage,
            limit: 10,
            status: selectedStatus,
            search: activeSearch,
        }),
        queryFn: () =>
            fundsService.getTopupHistory({
                page: currentPage,
                limit: 10,
                status: selectedStatus,
                search: activeSearch.trim() || undefined,
            }),
    });

    const orders = historyData?.orders ?? [];
    const pagination = historyData?.pagination ?? {
        page: 1,
        limit: 10,
        totalOrders: 0,
        totalPages: 1,
    };
    const error = queryError instanceof Error ? queryError.message : null;

    const handleStatusChange = (status: PaymentOrderStatus | "ALL") => {
        setSelectedStatus(status);
        setCurrentPage(1);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setActiveSearch(searchInput);
        setCurrentPage(1);
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setActiveSearch("");
        setCurrentPage(1);
    };

    const handleRefresh = () => {
        refetch();
    };

    const handleCopy = (text: string, id: string) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    const renderStatusBadge = (status: PaymentOrderStatus) => {
        switch (status) {
            case "SUCCESS":
                return (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary-green bg-primary-green/10 px-2 py-0.5 rounded border border-primary-green/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-green"></span>
                        Success
                    </span>
                );
            case "FAILED":
                return (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        Failed
                    </span>
                );
            case "PENDING":
                return (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        Pending
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-dash-text-muted bg-dash-card px-2 py-0.5 rounded border border-dash-border">
                        {status}
                    </span>
                );
        }
    };

    const startRecord = pagination.totalOrders === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
    const endRecord = Math.min(pagination.page * pagination.limit, pagination.totalOrders);

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            {/* Controls Bar: Status Filter Pills, Search, & Refresh */}
            <div className="px-6 py-3 border-b border-dash-border bg-dash-panel-2/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {STATUS_FILTERS.map((filter) => {
                        const isSelected = selectedStatus === filter.value;
                        return (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() => handleStatusChange(filter.value)}
                                className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                                    isSelected
                                        ? "bg-primary-green border border-primary-green text-white font-medium shadow-xs"
                                        : "bg-dash-card border border-dash-border text-dash-text-muted hover:text-dash-text hover:border-dash-text-muted"
                                }`}
                            >
                                {filter.label}
                            </button>
                        );
                    })}
                </div>

                {/* Search Form & Refresh */}
                <div className="flex items-center gap-2">
                    <form onSubmit={handleSearchSubmit} className="relative flex items-center min-w-[280px] sm:w-80">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by Order ID or Payment ID..."
                            className="w-full bg-dash-card border border-dash-border rounded-md pl-8 pr-8 py-1.5 text-xs text-dash-text focus:outline-none focus:border-primary-green transition-colors font-sans"
                        />
                        <svg
                            className="w-3.5 h-3.5 text-dash-text-muted absolute left-2.5 pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3" />
                        </svg>
                        {searchInput && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-2 text-dash-text-muted hover:text-dash-text cursor-pointer outline-none focus:outline-none"
                                aria-label="Clear search"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                    </form>

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={isFetching}
                        className="p-1.5 rounded-md text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 transition-colors cursor-pointer disabled:opacity-50 border border-dash-border bg-dash-card outline-none focus:outline-none"
                        title="Refresh Top-up Orders"
                    >
                        <svg
                            className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-primary-green" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {isLoading ? (
                    /* Loading Skeleton */
                    <div className="space-y-3 py-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="h-12 rounded bg-dash-panel-2/60 border border-dash-border/40 animate-pulse flex items-center px-4 justify-between"
                            >
                                <div className="h-3 w-28 bg-dash-border/60 rounded"></div>
                                <div className="h-3 w-36 bg-dash-border/60 rounded"></div>
                                <div className="h-3 w-20 bg-dash-border/60 rounded"></div>
                                <div className="h-3 w-24 bg-dash-border/60 rounded"></div>
                                <div className="h-3 w-16 bg-dash-border/60 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    /* Error State */
                    <div className="text-center py-12">
                        <svg
                            className="w-10 h-10 text-rose-400 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 7.5h.01"
                            />
                        </svg>
                        <p className="text-sm font-medium text-dash-text">{error}</p>
                        <button
                            type="button"
                            onClick={handleRefresh}
                            className="mt-3 px-3 py-1.5 text-xs font-medium rounded border border-dash-border text-dash-text hover:bg-dash-card transition-colors cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-12">
                        <svg
                            className="w-12 h-12 text-dash-text-muted/40 mx-auto mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-6.75 4.5h16.5a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5H3.75A2.25 2.25 0 0 0 1.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z"
                            />
                        </svg>
                        <p className="text-sm font-medium text-dash-text">No Top-up Orders Found</p>
                        <p className="text-xs text-dash-text-muted mt-1 max-w-sm mx-auto">
                            {activeSearch || selectedStatus !== "ALL"
                                ? "No orders match your filter criteria. Try resetting status or clearing search."
                                : "You haven't initiated any virtual margin top-ups yet. Deposit funds to start trading."}
                        </p>
                        {(activeSearch || selectedStatus !== "ALL") && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedStatus("ALL");
                                    handleClearSearch();
                                }}
                                className="mt-3 text-xs text-primary-green hover:underline cursor-pointer"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    /* Orders Table */
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-dash-border text-dash-text-muted uppercase text-[10px] tracking-wider bg-dash-panel-2/30">
                                    <th className="px-5 py-3 font-semibold">Date & Time</th>
                                    <th className="px-5 py-3 font-semibold">Gateway References</th>
                                    <th className="px-5 py-3 font-semibold text-right">Real Amount</th>
                                    <th className="px-5 py-3 font-semibold text-right">Virtual Credits</th>
                                    <th className="px-5 py-3 font-semibold text-center">Status</th>
                                    <th className="px-5 py-3 font-semibold">Audit Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dash-border">
                                {orders.map((order) => {
                                    const isSuccess = order.status === "SUCCESS";
                                    const isFailed = order.status === "FAILED";

                                    return (
                                        <tr key={order.id} className="hover:bg-dash-panel-2/50 transition-colors">
                                            {/* Date & Time */}
                                            <td className="px-5 py-3.5 text-dash-text whitespace-nowrap">
                                                {formatDate(order.createdAt)}
                                            </td>

                                            {/* Gateway References: Order ID & Payment ID */}
                                            <td className="px-5 py-3.5 whitespace-nowrap min-w-[240px]">
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono text-[11px] text-dash-text font-medium">
                                                            {order.orderId}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopy(order.orderId, `${order.id}-order`)}
                                                            className="text-dash-text-muted hover:text-dash-text transition-colors p-0.5 rounded cursor-pointer"
                                                            title="Copy Order ID"
                                                        >
                                                            {copiedId === `${order.id}-order` ? (
                                                                <svg className="w-3 h-3 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                                                    <polyline points="20 6 9 17 4 12" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                                                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </div>

                                                    {order.paymentId ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-mono text-[10px] text-dash-text-muted">
                                                                Pay ID: {order.paymentId}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopy(order.paymentId!, `${order.id}-pay`)}
                                                                className="text-dash-text-muted hover:text-dash-text transition-colors p-0.5 rounded cursor-pointer"
                                                                title="Copy Payment ID"
                                                            >
                                                                {copiedId === `${order.id}-pay` ? (
                                                                    <svg className="w-2.5 h-2.5 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                                                        <polyline points="20 6 9 17 4 12" />
                                                                    </svg>
                                                                ) : (
                                                                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                                                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="font-mono text-[10px] text-dash-text-muted/60">
                                                            Pay ID: None (Aborted before gateway attempt)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Real INR */}
                                            <td className="px-5 py-3.5 font-mono font-medium text-right text-dash-text whitespace-nowrap">
                                                {formatINR(order.realAmount)}
                                            </td>

                                            {/* Virtual Credits */}
                                            <td className="px-5 py-3.5 font-mono font-semibold text-right whitespace-nowrap">
                                                <span className={isSuccess ? "text-primary-green" : "text-dash-text-muted"}>
                                                    +{formatINR(order.virtualAmount)} V-INR
                                                </span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                                {renderStatusBadge(order.status)}
                                            </td>

                                            {/* Audit Remarks */}
                                            <td className="px-5 py-3.5 text-dash-text-muted whitespace-nowrap text-[11px]">
                                                {isSuccess ? (
                                                    <span className="text-primary-green/90 font-medium flex items-center gap-1">
                                                        <svg className="w-3 h-3 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                        </svg>
                                                        Credited to Margin
                                                    </span>
                                                ) : isFailed ? (
                                                    <span className="text-rose-400/90 font-medium flex items-center gap-1">
                                                        <svg className="w-3 h-3 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10" />
                                                            <line x1="15" y1="9" x2="9" y2="15" />
                                                            <line x1="9" y1="9" x2="15" y2="15" />
                                                        </svg>
                                                        Bank declined / cancelled
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-400/90 font-medium flex items-center gap-1">
                                                        <svg className="w-3 h-3 text-amber-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5" />
                                                        </svg>
                                                        Awaiting verification
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer with Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3.5 border-t border-dash-border bg-dash-panel-2/50 gap-3 shrink-0">
                <span className="text-xs text-dash-text-muted">
                    {pagination.totalOrders > 0
                        ? `Showing ${startRecord}-${endRecord} of ${pagination.totalOrders} order(s)`
                        : "0 top-up orders"}
                </span>

                <div className="flex items-center gap-2">
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center gap-1.5 mr-2">
                            <button
                                type="button"
                                disabled={currentPage <= 1 || isLoading}
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                className="px-2.5 py-1 text-xs rounded border border-dash-border text-dash-text hover:bg-dash-card transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                aria-label="Previous page"
                            >
                                Previous
                            </button>
                            <span className="text-xs text-dash-text-muted px-2">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={currentPage >= pagination.totalPages || isLoading}
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, pagination.totalPages))}
                                className="px-2.5 py-1 text-xs rounded border border-dash-border text-dash-text hover:bg-dash-card transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                aria-label="Next page"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-1.5 text-xs font-medium rounded-md border border-dash-border text-dash-text hover:bg-dash-card transition-colors cursor-pointer"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
