import { useState, useRef, useEffect, type FC } from "react";
import type { PnlSegment, PnlViewType } from "../../types";
import { getIndianFinancialYearPresets } from "../../utils/pnlFormatters";

export interface PnlFilterState {
    segment: PnlSegment;
    pnlType: PnlViewType;
    symbol: string;
    fromDate: string;
    toDate: string;
}

interface PnlFilterBarProps {
    filters: PnlFilterState;
    onChange: (filters: PnlFilterState) => void;
    onSubmit: () => void;
    isLoading?: boolean;
}

export const PnlFilterBar: FC<PnlFilterBarProps> = ({
    filters,
    onChange,
    onSubmit,
    isLoading = false,
}) => {
    const fyPresets = getIndianFinancialYearPresets();
    const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
    const dateMenuRef = useRef<HTMLDivElement>(null);

    // Close date picker menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dateMenuRef.current && !dateMenuRef.current.contains(e.target as Node)) {
                setIsDateMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleApplyPreset = (from: string, to: string) => {
        onChange({ ...filters, fromDate: from, toDate: to });
        setIsDateMenuOpen(false);
    };

    return (
        <div className="bg-dash-panel border border-dash-border rounded-lg p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-end gap-4 sm:gap-5 lg:gap-6">
                {/* 1. Segment */}
                <div className="lg:flex-1 min-w-0 flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-dash-text-muted select-none">
                        Segment
                    </label>
                    <select
                        value={
                            filters.segment === "ALL" || filters.segment === "COMBINED"
                                ? "COMBINED"
                                : filters.segment === "MIS" || filters.segment === "INTRADAY"
                                ? "INTRADAY"
                                : "DELIVERY"
                        }
                        onChange={(e) => onChange({ ...filters, segment: e.target.value as PnlSegment })}
                        className="w-full h-9 bg-dash-panel-2 border border-dash-border hover:border-dash-border-hover focus:border-blue-500 rounded px-3 py-2 text-xs text-dash-text focus:outline-none transition-colors cursor-pointer"
                    >
                        <option value="COMBINED">Combined</option>
                        <option value="INTRADAY">Intraday</option>
                        <option value="DELIVERY">Delivery</option>
                    </select>
                </div>

                {/* 2. P&L View */}
                <div className="lg:flex-1 min-w-0 flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-dash-text-muted select-none">
                        P&L
                    </label>
                    <select
                        value={filters.pnlType}
                        onChange={(e) => onChange({ ...filters, pnlType: e.target.value as PnlViewType })}
                        className="w-full h-9 bg-dash-panel-2 border border-dash-border hover:border-dash-border-hover focus:border-blue-500 rounded px-3 py-2 text-xs text-dash-text focus:outline-none transition-colors cursor-pointer"
                    >
                        <option value="COMBINED">Combined</option>
                        <option value="REALIZED">Realised</option>
                        <option value="UNREALIZED">Unrealised</option>
                    </select>
                </div>

                {/* 3. Symbol Search */}
                <div className="lg:flex-1 min-w-0 flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-dash-text-muted select-none">
                        Symbol
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="EG: INFY"
                            value={filters.symbol}
                            onChange={(e) => onChange({ ...filters, symbol: e.target.value.toUpperCase() })}
                            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                            className={`w-full h-9 bg-dash-panel-2 border border-dash-border hover:border-dash-border-hover focus:border-blue-500 rounded pl-3 ${
                                filters.symbol ? "pr-8" : "pr-3"
                            } py-2 text-xs text-dash-text placeholder-dash-text-muted/60 uppercase focus:outline-none transition-colors`}
                        />
                        {filters.symbol && (
                            <button
                                type="button"
                                onClick={() => onChange({ ...filters, symbol: "" })}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-dash-text-muted hover:text-dash-text rounded transition-colors cursor-pointer"
                                aria-label="Clear symbol"
                                title="Clear symbol"
                            >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* 4. Date Range Picker (Zerodha Console Style) */}
                <div className="lg:flex-1 min-w-0 flex flex-col gap-1.5 relative" ref={dateMenuRef}>
                    <label className="text-[11px] font-medium text-dash-text-muted select-none">
                        Date range
                    </label>
                    <button
                        type="button"
                        onClick={() => setIsDateMenuOpen((prev) => !prev)}
                        className="w-full h-9 bg-dash-panel-2 border border-dash-border hover:border-dash-border-hover focus:border-blue-500 rounded px-3 py-2 text-xs text-dash-text flex items-center justify-between focus:outline-none transition-colors cursor-pointer text-left"
                    >
                        <span>
                            {filters.fromDate} ~ {filters.toDate}
                        </span>
                        <svg className="w-3.5 h-3.5 text-dash-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>

                    {/* Popover Menu with Presets & Date Pickers */}
                    {isDateMenuOpen && (
                        <div className="absolute right-0 top-full mt-1.5 z-40 w-72 bg-dash-panel-3 border border-dash-border rounded-lg shadow-2xl p-3.5 text-xs animate-in fade-in zoom-in-95 duration-100">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted block mb-2">
                                Quick FY Presets
                            </span>
                            <div className="grid grid-cols-1 gap-1 mb-3">
                                <button
                                    type="button"
                                    onClick={() => handleApplyPreset(fyPresets.currentFy.from, fyPresets.currentFy.to)}
                                    className="text-left px-2.5 py-1.5 rounded hover:bg-dash-panel text-dash-text transition-colors flex justify-between"
                                >
                                    <span>{fyPresets.currentFy.label}</span>
                                    <span className="text-[10px] text-dash-text-muted font-mono">{fyPresets.currentFy.from} → Now</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleApplyPreset(fyPresets.previousFy.from, fyPresets.previousFy.to)}
                                    className="text-left px-2.5 py-1.5 rounded hover:bg-dash-panel text-dash-text transition-colors flex justify-between"
                                >
                                    <span>{fyPresets.previousFy.label}</span>
                                    <span className="text-[10px] text-dash-text-muted font-mono">Full FY</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleApplyPreset(fyPresets.last30Days.from, fyPresets.last30Days.to)}
                                    className="text-left px-2.5 py-1.5 rounded hover:bg-dash-panel text-dash-text transition-colors flex justify-between"
                                >
                                    <span>Last 30 Days</span>
                                    <span className="text-[10px] text-dash-text-muted font-mono">1 Month</span>
                                </button>
                            </div>

                            <div className="border-t border-dash-border pt-2.5 space-y-2">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted block">
                                    Custom Range
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-dash-text-muted w-8">From:</span>
                                    <input
                                        type="date"
                                        value={filters.fromDate}
                                        onChange={(e) => onChange({ ...filters, fromDate: e.target.value })}
                                        className="flex-1 bg-dash-panel border border-dash-border rounded px-2 py-1 text-xs text-dash-text focus:outline-none focus:border-blue-500 font-mono"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-dash-text-muted w-8">To:</span>
                                    <input
                                        type="date"
                                        value={filters.toDate}
                                        onChange={(e) => onChange({ ...filters, toDate: e.target.value })}
                                        className="flex-1 bg-dash-panel border border-dash-border rounded px-2 py-1 text-xs text-dash-text focus:outline-none focus:border-blue-500 font-mono"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsDateMenuOpen(false)}
                                className="w-full mt-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>

                {/* 5. Blue Arrow Submit Button (Zerodha signature button) */}
                <div className="sm:col-span-2 lg:col-span-auto shrink-0 flex items-end">
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={isLoading}
                        className="w-full sm:w-11 lg:w-11 h-9 rounded bg-[#387ed1] hover:bg-[#2b6cb8] active:bg-[#225796] text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                        title="Submit / Apply Filters"
                        aria-label="Submit filters"
                    >
                        {isLoading ? (
                            <svg className="w-4 h-4 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
