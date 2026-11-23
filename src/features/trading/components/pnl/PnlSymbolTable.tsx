import { useState, useMemo, Fragment, type FC } from "react";
import type { PnlSymbolSummary } from "../../types";
import { PnlTradeLotsRow } from "./PnlTradeLotsRow";
import { formatCurrencyINR } from "../../utils/pnlFormatters";

interface PnlSymbolTableProps {
    symbols: PnlSymbolSummary[];
    isLoading?: boolean;
    onResetFilters?: () => void;
}

export const PnlSymbolTable: FC<PnlSymbolTableProps> = ({
    symbols,
    isLoading = false,
    onResetFilters,
}) => {
    // 1. Search & Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    // 2. Row Expansion State
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

    // 3. Pagination State (10 items per page as in Zerodha Screenshot 3)
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;

    const toggleRow = (key: string) => {
        setExpandedKeys((prev) => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    // Filter by search query
    const filteredList = useMemo(() => {
        let list = symbols;
        if (searchQuery.trim()) {
            const term = searchQuery.trim().toLowerCase();
            list = list.filter((s) => s.symbol.toLowerCase().includes(term));
        }

        // Sort by Net Realised P&L
        return [...list].sort((a, b) => {
            const diff = a.netRealizedPnL - b.netRealizedPnL;
            return sortDirection === "desc" ? -diff : diff;
        });
    }, [symbols, searchQuery, sortDirection]);

    // Pagination calculations
    const totalCount = filteredList.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const paginatedSymbols = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredList.slice(start, start + PAGE_SIZE);
    }, [filteredList, currentPage]);

    // CSV Download
    const handleDownloadCSV = () => {
        if (!symbols || symbols.length === 0) return;

        const headers = ["Symbol", "Exchange", "Product", "Qty", "Buy Avg", "Buy Value", "Sell Avg", "Sell Value", "Net Realised P&L", "Unrealised P&L", "Open Qty"];
        const rows = symbols.map((s) => [
            s.symbol,
            s.exchange,
            s.productType,
            s.quantity,
            s.buyAvg.toFixed(2),
            s.buyValue.toFixed(2),
            s.sellAvg.toFixed(2),
            s.sellValue.toFixed(2),
            s.netRealizedPnL.toFixed(2),
            s.unrealizedPnL.toFixed(2),
            s.openQuantity,
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Nexbid_PnL_Statement_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return (
            <div className="bg-dash-panel border border-dash-border rounded-lg p-5 animate-pulse space-y-4">
                <div className="h-9 bg-dash-panel-2 rounded w-60" />
                <div className="h-10 bg-dash-panel-2 rounded w-full" />
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 bg-dash-panel-2 rounded w-full" />
                    ))}
                </div>
            </div>
        );
    }

    const startRow = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const endRow = Math.min(totalCount, currentPage * PAGE_SIZE);

    return (
        <div className="bg-dash-panel border border-dash-border rounded-lg flex flex-col">
            {/* Top Toolbar: Search on left, Manage Tags & Download on right */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dash-border">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full bg-dash-panel-2 border border-dash-border hover:border-dash-border-hover focus:border-blue-500 rounded px-3 pl-8 py-2 text-xs text-dash-text placeholder-dash-text-muted focus:outline-none transition-colors"
                    />
                    <svg
                        className="w-3.5 h-3.5 text-dash-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <circle cx="11" cy="11" r="8" strokeWidth="2" />
                        <path d="m21 21-4.3-4.3" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4 text-xs font-medium text-dash-text">
                    <button
                        type="button"
                        onClick={handleDownloadCSV}
                        className="inline-flex items-center gap-1.5 text-blue-500 hover:text-blue-400 hover:underline cursor-pointer transition-colors"
                        title="Export statement as CSV"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        <span>Download</span>
                    </button>
                </div>
            </div>

            {/* Zero State */}
            {totalCount === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                    <p className="text-sm font-medium text-dash-text mb-1">
                        No trade positions found for this query.
                    </p>
                    <p className="text-xs text-dash-text-muted mb-4">
                        Try clearing search terms or selecting another date range or segment.
                    </p>
                    {onResetFilters && (
                        <button
                            type="button"
                            onClick={onResetFilters}
                            className="px-3.5 py-1.5 rounded bg-dash-panel-2 border border-dash-border hover:bg-dash-panel-3 text-xs font-semibold text-dash-text cursor-pointer transition-colors"
                        >
                            Reset filters
                        </button>
                    )}
                </div>
            ) : (
                /* Main Table */
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-dash-border text-[11px] font-medium text-dash-text-muted bg-dash-panel select-none">
                                <th className="py-3 px-4 font-normal">Symbol</th>
                                <th className="py-3 px-4 text-right font-normal">Qty.</th>
                                <th className="py-3 px-4 text-right font-normal">Buy avg.</th>
                                <th className="py-3 px-4 text-right font-normal">Buy value</th>
                                <th className="py-3 px-4 text-right font-normal">Sell avg.</th>
                                <th className="py-3 px-4 text-right font-normal">Sell value</th>
                                <th
                                    className="py-3 px-4 text-right font-normal cursor-pointer hover:text-dash-text"
                                    onClick={() => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}
                                    title="Click to sort by Net Realised P&L"
                                >
                                    <span>Net realised P&L</span>
                                    <span className="ml-1">{sortDirection === "desc" ? "▾" : "▴"}</span>
                                </th>
                                <th className="py-3 px-4 text-right font-normal">Unrealised P&L</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dash-border/60">
                            {paginatedSymbols.map((item) => {
                                const rowKey = `${item.symbol}:${item.productType}`;
                                const isExpanded = expandedKeys.has(rowKey);
                                const isNetProfit = item.netRealizedPnL >= 0;
                                const isUnrealizedProfit = item.unrealizedPnL >= 0;

                                return (
                                    <Fragment key={rowKey}>
                                        <tr
                                            onClick={() => toggleRow(rowKey)}
                                            className={`transition-colors duration-100 cursor-pointer group ${
                                                isExpanded ? "bg-dash-panel-2/50" : "hover:bg-dash-panel-2/30"
                                            }`}
                                        >
                                            {/* Symbol column with Caret + Ticker + NSE */}
                                            <td className="py-3.5 px-4 font-medium whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`text-dash-text-muted inline-block text-[11px] transition-transform duration-150 ${
                                                            isExpanded ? "rotate-90 text-blue-500" : ""
                                                        }`}
                                                    >
                                                        ›
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-dash-text">
                                                            {item.symbol}
                                                        </span>
                                                        <span className="text-[10px] text-dash-text-muted font-normal">
                                                            {item.exchange || "NSE"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Qty. */}
                                            <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap text-dash-text">
                                                {item.quantity}
                                            </td>

                                            {/* Buy avg. */}
                                            <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap text-dash-text">
                                                {formatCurrencyINR(item.buyAvg, false, false)}
                                            </td>

                                            {/* Buy value */}
                                            <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap text-dash-text">
                                                {formatCurrencyINR(item.buyValue, false, false)}
                                            </td>

                                            {/* Sell avg. */}
                                            <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap text-dash-text">
                                                {formatCurrencyINR(item.sellAvg, false, false)}
                                            </td>

                                            {/* Sell value */}
                                            <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap text-dash-text">
                                                {formatCurrencyINR(item.sellValue, false, false)}
                                            </td>

                                            {/* Net realised P&L ▾ */}
                                            <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                                                <span className={`font-semibold ${isNetProfit ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                                                    {formatCurrencyINR(item.netRealizedPnL, true, true)}
                                                </span>
                                            </td>

                                            {/* Unrealised P&L */}
                                            <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                                                {item.openQuantity > 0 ? (
                                                    <div>
                                                        <span className={`font-semibold ${isUnrealizedProfit ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                                                            {formatCurrencyINR(item.unrealizedPnL, true, true)}
                                                        </span>
                                                        <span className="text-[10px] block text-dash-text-muted font-sans mt-0.5">
                                                            Open: {item.openQuantity}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-dash-text-muted font-mono">0.00</span>
                                                )}
                                            </td>
                                        </tr>

                                        {/* Expanded FIFO Trade Breakdown */}
                                        {isExpanded && (
                                            <PnlTradeLotsRow symbol={item.symbol} legs={item.legs} colSpan={8} />
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Table Footer: Rows Counter on left, Pagination on right (Screenshot 3) */}
            {totalCount > 0 && (
                <div className="p-4 sm:p-5 border-t border-dash-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-dash-text-muted select-none">
                    <span>
                        Showing page {currentPage} (rows {startRow} - {endRow} out of {totalCount})
                    </span>

                    {/* Pagination Buttons */}
                    <div className="flex items-center gap-1 self-center sm:self-auto">
                        <button
                            type="button"
                            disabled={currentPage <= 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className="w-8 h-8 rounded border border-dash-border flex items-center justify-center hover:bg-dash-panel-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors text-dash-text"
                            aria-label="Previous page"
                        >
                            ‹
                        </button>

                        {Array.from({ length: totalPages }).map((_, i) => {
                            const pageNum = i + 1;
                            const isActive = pageNum === currentPage;
                            return (
                                <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 rounded border text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                                        isActive
                                            ? "border-blue-500 text-blue-500 bg-blue-500/10"
                                            : "border-dash-border text-dash-text hover:bg-dash-panel-2"
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
