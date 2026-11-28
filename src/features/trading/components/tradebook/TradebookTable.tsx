import { useState, type FC } from "react";
import type { TradebookItem, TradebookPagination, TradeChargesItem } from "../../types";
import { formatCurrencyINR, formatTradeDateTime } from "../../utils/pnlFormatters";

interface TradebookTableProps {
    trades: TradebookItem[];
    pagination: TradebookPagination;
    onPageChange: (newPage: number) => void;
    onLimitChange?: (newLimit: number) => void;
    isLoading?: boolean;
    isFetching?: boolean;
    onSelectTradeCharges?: (charges: TradeChargesItem, tradeTitle: string) => void;
    onResetFilters: () => void;
}

export const TradebookTable: FC<TradebookTableProps> = ({
    trades,
    pagination,
    onPageChange,
    onLimitChange,
    isLoading = false,
    isFetching = false,
    onSelectTradeCharges,
    onResetFilters,
}) => {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (isLoading && trades.length === 0) {
        return (
            <div className="bg-dash-panel border border-dash-border rounded-lg p-5 animate-pulse space-y-4">
                <div className="h-9 bg-dash-panel-2 rounded w-60" />
                <div className="h-10 bg-dash-panel-2 rounded w-full" />
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-12 bg-dash-panel-2 rounded w-full" />
                    ))}
                </div>
            </div>
        );
    }

    const { page, limit, totalCount, totalPages } = pagination;
    const startRow = totalCount === 0 ? 0 : (page - 1) * limit + 1;
    const endRow = Math.min(totalCount, page * limit);

    return (
        <div className={`bg-dash-panel border border-dash-border rounded-lg flex flex-col transition-opacity duration-300 ${
            isFetching ? "opacity-75" : "opacity-100"
        }`}>
            {/* Top Toolbar */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dash-border">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-dash-text uppercase tracking-wider">
                        Execution Ledger
                    </span>
                    <span className="text-[11px] font-mono text-dash-text-muted bg-dash-panel-2 px-2 py-0.5 rounded">
                        {totalCount} {totalCount === 1 ? "trade" : "trades"}
                    </span>
                </div>

                {onLimitChange && (
                    <div className="flex items-center gap-2 text-xs text-dash-text-muted">
                        <span>Show</span>
                        <select
                            value={limit}
                            onChange={(e) => onLimitChange(Number(e.target.value))}
                            className="bg-dash-panel-2 border border-dash-border hover:border-dash-border-hover focus:border-primary-green rounded px-2 py-1 text-xs text-dash-text focus:outline-none transition-colors cursor-pointer"
                        >
                            <option value={10}>10 / page</option>
                            <option value={20}>20 / page</option>
                            <option value={50}>50 / page</option>
                            <option value={100}>100 / page</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Zero State */}
            {totalCount === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-dash-panel-2 flex items-center justify-center text-dash-text-muted mb-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-dash-text mb-1">
                        No trade executions found for this filter.
                    </p>
                    <p className="text-xs text-dash-text-muted mb-4 max-w-sm">
                        Try clearing search terms or selecting another date range or segment.
                    </p>
                    <button
                        type="button"
                        onClick={onResetFilters}
                        className="px-3.5 py-1.5 rounded bg-primary-green hover:bg-primary-green-hover text-white font-medium text-xs transition-colors cursor-pointer"
                    >
                        Reset filters
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-dash-border text-dash-text-muted select-none text-[11px] font-medium uppercase tracking-wider">
                                <th className="py-3 px-4">Time</th>
                                <th className="py-3 px-4">Symbol</th>
                                <th className="py-3 px-4">Type</th>
                                <th className="py-3 px-4">Segment</th>
                                <th className="py-3 px-4 text-right">Qty.</th>
                                <th className="py-3 px-4 text-right">Price</th>
                                <th className="py-3 px-4 text-right">Trade value</th>
                                <th className="py-3 px-4 text-right">Charges</th>
                                <th className="py-3 px-4 text-right">Order ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dash-border/60">
                            {trades.map((item) => {
                                const isBuy = item.side === "BUY";
                                const isDelivery = item.productType === "CNC";

                                return (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-dash-panel-2/50 transition-colors"
                                    >
                                        {/* Execution Time */}
                                        <td className="py-3.5 px-4 font-mono text-dash-text-muted whitespace-nowrap text-[11px]">
                                            {formatTradeDateTime(item.executedAt, true)}
                                        </td>

                                        {/* Symbol & Exchange */}
                                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-dash-text">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-semibold text-xs tracking-tight">
                                                    {item.symbol}
                                                </span>
                                                <span className="text-[10px] text-dash-text-muted font-normal uppercase bg-dash-panel-2 px-1.5 py-0.5 rounded border border-dash-border/60">
                                                    {item.exchange}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Type (BUY / SELL) */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border ${
                                                    isBuy
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                }`}
                                            >
                                                {item.side}
                                            </span>
                                        </td>

                                        {/* Segment (CNC / MIS) */}
                                        <td className="py-3.5 px-4 whitespace-nowrap text-[11px] font-mono text-dash-text-muted">
                                            <span
                                                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                                    isDelivery
                                                        ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                                                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                }`}
                                            >
                                                {item.productType}
                                            </span>
                                        </td>

                                        {/* Qty */}
                                        <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap text-dash-text font-medium">
                                            {item.quantity.toLocaleString()}
                                        </td>

                                        {/* Price */}
                                        <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap text-dash-text">
                                            {formatCurrencyINR(item.price, false, true)}
                                        </td>

                                        {/* Trade Value */}
                                        <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap text-dash-text font-medium">
                                            {formatCurrencyINR(item.tradeValue, false, true)}
                                        </td>

                                        {/* Charges with Breakdown Action */}
                                        <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap text-dash-text">
                                            <div className="inline-flex items-center justify-end gap-1.5">
                                                <span>
                                                    {formatCurrencyINR(item.charges?.total ?? 0, false, true)}
                                                </span>
                                                {onSelectTradeCharges && item.charges && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onSelectTradeCharges(
                                                                item.charges,
                                                                `${item.symbol} ${item.side} Trade Charges`
                                                            )
                                                        }
                                                        className="text-primary-green hover:text-emerald-400 p-0.5 rounded hover:bg-primary-green/10 transition-colors cursor-pointer"
                                                        title="View itemized trade charges"
                                                        aria-label="View trade charges breakdown"
                                                    >
                                                        <svg className="w-3.5 h-3.5 text-primary-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                                            <path d="M2 17l10 5 10-5" />
                                                            <path d="M2 12l10 5 10-5" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>

                                        {/* Order ID */}
                                        <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(item.orderId)}
                                                className="inline-flex items-center gap-1 text-[11px] text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                                                title={`Click to copy Order ID: ${item.orderId}`}
                                            >
                                                <span>#{item.orderId.slice(-6)}</span>
                                                {copiedId === item.orderId ? (
                                                    <span className="text-[10px] text-emerald-400 font-sans">Copied!</span>
                                                ) : (
                                                    <svg className="w-3 h-3 text-dash-text-muted/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                                    </svg>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Table Footer: Rows Counter on left, Pagination on right (matching P&L Statement) */}
            {totalCount > 0 && (
                <div className="p-4 sm:p-5 border-t border-dash-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-dash-text-muted select-none">
                    <span>
                        Showing page {page} (rows {startRow} - {endRow} out of {totalCount})
                    </span>

                    {/* Pagination Buttons */}
                    <div className="flex items-center gap-1 self-center sm:self-auto">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => onPageChange(page - 1)}
                            className="w-8 h-8 rounded border border-dash-border flex items-center justify-center hover:bg-dash-panel-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors text-dash-text"
                            aria-label="Previous page"
                        >
                            ‹
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                            let pageNum = idx + 1;
                            if (totalPages > 5 && page > 3) {
                                pageNum = page - 3 + idx;
                                if (pageNum > totalPages) pageNum = totalPages - 4 + idx;
                            }

                            const isActive = pageNum === page;
                            return (
                                <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => onPageChange(pageNum)}
                                    className={`w-8 h-8 rounded border text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                                        isActive
                                            ? "border-primary-green text-primary-green bg-primary-green/10"
                                            : "border-dash-border text-dash-text hover:bg-dash-panel-2"
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => onPageChange(page + 1)}
                            className="w-8 h-8 rounded border border-dash-border flex items-center justify-center hover:bg-dash-panel-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors text-dash-text"
                            aria-label="Next page"
                        >
                            ›
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
