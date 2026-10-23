import React, { useEffect, useRef, useState, useCallback } from "react";
import { fundsService } from "../services/fundsService";
import type {
    WalletOverviewDTO,
    WalletStatementItemDTO,
    WalletStatementPagination,
    WalletTransactionType,
} from "../types";

interface StatementModalProps {
    isOpen: boolean;
    onClose: () => void;
    overview?: WalletOverviewDTO | null;
    formatINR: (num: number) => string;
}

const FILTER_TYPES: { label: string; value: WalletTransactionType | "ALL" }[] = [
    { label: "All", value: "ALL" },
    { label: "Deposits", value: "TOPUP" },
    { label: "Buy Orders", value: "BUY" },
    { label: "Sell Orders", value: "SELL" },
    { label: "Bonus", value: "BONUS" },
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

export const StatementModal: React.FC<StatementModalProps> = ({
    isOpen,
    onClose,
    overview,
    formatINR,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Filter & Query States
    const [selectedType, setSelectedType] = useState<WalletTransactionType | "ALL">("ALL");
    const [searchInput, setSearchInput] = useState<string>("");
    const [activeSearch, setActiveSearch] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);

    // Data States
    const [transactions, setTransactions] = useState<WalletStatementItemDTO[]>([]);
    const [pagination, setPagination] = useState<WalletStatementPagination>({
        page: 1,
        limit: 10,
        totalTransactions: 0,
        totalPages: 1,
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch transactions from backend API
    const fetchStatement = useCallback(async (page: number, type: WalletTransactionType | "ALL", search: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fundsService.getStatement({
                page,
                limit: 10,
                type,
                search: search.trim() || undefined,
            });
            setTransactions(response.transactions || []);
            setPagination(response.pagination);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to load statement records";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load data when modal opens or query params change
    useEffect(() => {
        if (isOpen) {
            fetchStatement(currentPage, selectedType, activeSearch);
        }
    }, [isOpen, currentPage, selectedType, activeSearch, fetchStatement]);

    // Reset pagination when filter or search changes
    const handleTypeChange = (type: WalletTransactionType | "ALL") => {
        setSelectedType(type);
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
        fetchStatement(currentPage, selectedType, activeSearch);
    };

    // Close on Escape & prevent body scroll
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const renderTypeBadge = (type: WalletTransactionType) => {
        switch (type) {
            case "TOPUP":
                return (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-green bg-primary-green/10 px-2 py-0.5 rounded border border-primary-green/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-green"></span>
                        Deposit
                    </span>
                );
            case "BUY":
                return (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        Buy Order
                    </span>
                );
            case "SELL":
                return (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                        Sell Order
                    </span>
                );
            case "BONUS":
                return (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        Bonus
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-dash-text-muted bg-dash-card px-2 py-0.5 rounded border border-dash-border">
                        {type}
                    </span>
                );
        }
    };

    const isCredit = (type: WalletTransactionType) => {
        return type === "TOPUP" || type === "SELL" || type === "BONUS";
    };

    const startRecord = pagination.totalTransactions === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
    const endRecord = Math.min(pagination.page * pagination.limit, pagination.totalTransactions);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div
                ref={modalRef}
                className="relative w-full max-w-4xl max-h-[90vh] bg-dash-panel border border-dash-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-10"
                role="dialog"
                aria-modal="true"
                aria-labelledby="statement-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-dash-border shrink-0 bg-dash-panel-2/50">
                    <div>
                        <div className="flex items-center gap-2">
                            <svg
                                className="w-4 h-4 text-primary-green"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                                <path d="M14 8H8" />
                                <path d="M16 12H8" />
                                <path d="M13 16H8" />
                            </svg>
                            <h2 id="statement-title" className="text-base font-semibold text-dash-text tracking-tight">
                                Funds Statement & Ledger
                            </h2>
                        </div>
                        <p className="text-xs text-dash-text-muted mt-0.5">
                            Real-time transaction statement with running margin balance audit trail
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Refresh Button */}
                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="p-1.5 rounded-md text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 transition-colors cursor-pointer disabled:opacity-50"
                            title="Refresh Statement"
                            aria-label="Refresh statement"
                        >
                            <svg
                                className={`w-4 h-4 ${isLoading ? "animate-spin text-primary-green" : ""}`}
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

                        {/* Close Button */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-dash-text-muted hover:text-dash-text p-1.5 rounded-md hover:bg-dash-panel-2 transition-colors cursor-pointer"
                            aria-label="Close statement modal"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Summary Metrics Banner */}
                {overview && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-6 py-3 bg-dash-card border-b border-dash-border shrink-0">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-dash-text-muted">Total Real Deposited:</span>
                            <span className="font-mono font-semibold text-dash-text">
                                {formatINR(overview.totalRealMoneyUsed)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-dash-text-muted">Total Virtual Bought:</span>
                            <span className="font-mono font-semibold text-primary-green">
                                {formatINR(overview.totalVirtualMoneyBought)} V-INR
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-dash-text-muted">Available Margin:</span>
                            <span className="font-mono font-semibold text-dash-text">
                                {formatINR(overview.balance)} V-INR
                            </span>
                        </div>
                    </div>
                )}

                {/* Controls Bar: Type Filters & Search */}
                <div className="px-6 py-3 border-b border-dash-border bg-dash-panel-2/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        {FILTER_TYPES.map((filter) => {
                            const isSelected = selectedType === filter.value;
                            return (
                                <button
                                    key={filter.value}
                                    type="button"
                                    onClick={() => handleTypeChange(filter.value)}
                                    className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                                        isSelected
                                            ? "bg-primary-green text-white font-medium shadow-xs"
                                            : "bg-dash-card border border-dash-border text-dash-text-muted hover:text-dash-text hover:border-dash-text-muted"
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearchSubmit} className="relative flex items-center min-w-[220px]">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by ref or description..."
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
                                className="absolute right-2 text-dash-text-muted hover:text-dash-text cursor-pointer"
                                aria-label="Clear search"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                    </form>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {isLoading ? (
                        /* Loading Skeleton */
                        <div className="space-y-3 py-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="h-11 rounded bg-dash-panel-2/60 border border-dash-border/40 animate-pulse flex items-center px-4 justify-between"
                                >
                                    <div className="h-3 w-28 bg-dash-border/60 rounded"></div>
                                    <div className="h-3 w-20 bg-dash-border/60 rounded"></div>
                                    <div className="h-3 w-16 bg-dash-border/60 rounded"></div>
                                    <div className="h-3 w-24 bg-dash-border/60 rounded"></div>
                                    <div className="h-3 w-20 bg-dash-border/60 rounded"></div>
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
                    ) : transactions.length === 0 ? (
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
                                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                />
                            </svg>
                            <p className="text-sm font-medium text-dash-text">No Transactions Found</p>
                            <p className="text-xs text-dash-text-muted mt-1">
                                {activeSearch || selectedType !== "ALL"
                                    ? "No transactions match your current filters. Try resetting search or type."
                                    : "Your transaction statement will appear here once you deposit funds or make trades."}
                            </p>
                            {(activeSearch || selectedType !== "ALL") && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedType("ALL");
                                        handleClearSearch();
                                    }}
                                    className="mt-3 text-xs text-primary-green hover:underline cursor-pointer"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    ) : (
                        /* Transactions Table */
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-dash-border text-dash-text-muted uppercase text-[10px] tracking-wider">
                                        <th className="pb-2.5 font-medium">Date & Time</th>
                                        <th className="pb-2.5 font-medium">Reference ID</th>
                                        <th className="pb-2.5 font-medium">Type</th>
                                        <th className="pb-2.5 font-medium">Description</th>
                                        <th className="pb-2.5 font-medium text-right">Amount (V-INR)</th>
                                        <th className="pb-2.5 font-medium text-right">Balance After</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dash-border">
                                    {transactions.map((tx) => {
                                        const credit = isCredit(tx.type);
                                        return (
                                            <tr key={tx.id} className="hover:bg-dash-panel-2/50 transition-colors">
                                                <td className="py-3 text-dash-text whitespace-nowrap">
                                                    {formatDate(tx.createdAt)}
                                                </td>
                                                <td className="py-3 font-mono text-[11px] text-dash-text-muted whitespace-nowrap">
                                                    {tx.referenceId}
                                                </td>
                                                <td className="py-3 whitespace-nowrap">{renderTypeBadge(tx.type)}</td>
                                                <td className="py-3 text-dash-text-muted whitespace-nowrap max-w-[240px] truncate" title={tx.description}>
                                                    {tx.description || "-"}
                                                </td>
                                                <td
                                                    className={`py-3 font-mono font-medium text-right whitespace-nowrap ${
                                                        credit ? "text-primary-green" : "text-rose-400"
                                                    }`}
                                                >
                                                    {credit ? "+" : "-"}
                                                    {formatINR(Math.abs(tx.amount))}
                                                </td>
                                                <td className="py-3 font-mono font-semibold text-right text-dash-text whitespace-nowrap">
                                                    {formatINR(tx.balanceAfter)}
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
                        {pagination.totalTransactions > 0
                            ? `Showing ${startRecord}-${endRecord} of ${pagination.totalTransactions} transaction(s)`
                            : "0 transactions"}
                    </span>

                    <div className="flex items-center gap-2">
                        {/* Pagination Controls */}
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

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-1.5 text-xs font-medium rounded-md border border-dash-border text-dash-text hover:bg-dash-card transition-colors cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
