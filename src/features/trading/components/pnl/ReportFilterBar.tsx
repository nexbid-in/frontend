import { useState } from "react";
import { validateDateRange } from "../../utils/pnlFormatters";
import { DateRangePicker } from "./DateRangePicker";
import { FilterSelect, type FilterSelectOption } from "./FilterSelect";

type StandardSegment = "COMBINED" | "INTRADAY" | "DELIVERY";

const STANDARD_SEGMENT_OPTIONS: readonly FilterSelectOption<StandardSegment>[] = [
    { value: "COMBINED", label: "Combined" },
    { value: "INTRADAY", label: "Intraday" },
    { value: "DELIVERY", label: "Delivery" },
];

function normalizeSegment(segment: string): StandardSegment {
    if (segment === "ALL" || segment === "COMBINED") return "COMBINED";
    if (segment === "MIS" || segment === "INTRADAY") return "INTRADAY";
    return "DELIVERY";
}

interface ReportFilterBarProps<TSecondary extends string> {
    segment: string;
    onSegmentChange: (segment: StandardSegment) => void;
    secondaryLabel: string;
    secondaryValue: TSecondary;
    secondaryOptions: readonly FilterSelectOption<TSecondary>[];
    onSecondaryChange: (value: TSecondary) => void;
    symbol: string;
    onSymbolChange: (symbol: string) => void;
    fromDate: string;
    toDate: string;
    onDateRangeChange: (fromDate: string, toDate: string) => void;
    onSubmit: () => void;
    isLoading?: boolean;
    submitTitle?: string;
}

export function ReportFilterBar<TSecondary extends string>({
    segment,
    onSegmentChange,
    secondaryLabel,
    secondaryValue,
    secondaryOptions,
    onSecondaryChange,
    symbol,
    onSymbolChange,
    fromDate,
    toDate,
    onDateRangeChange,
    onSubmit,
    isLoading = false,
    submitTitle = "Submit / Apply Filters",
}: ReportFilterBarProps<TSecondary>) {
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleDateRangeChange = (nextFrom: string, nextTo: string) => {
        setSubmitError(null);
        onDateRangeChange(nextFrom, nextTo);
    };

    const handleValidatedSubmit = () => {
        const validation = validateDateRange(fromDate, toDate);
        if (!validation.isValid) {
            setSubmitError(validation.error);
            return;
        }
        setSubmitError(null);
        onSubmit();
    };

    return (
        <div className="bg-dash-panel border border-dash-border rounded-lg p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-end gap-4 sm:gap-5 lg:gap-6">
                <div className="lg:flex-1 min-w-0 flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-dash-text-muted select-none">
                        Segment
                    </label>
                    <FilterSelect<StandardSegment>
                        ariaLabel="Segment"
                        value={normalizeSegment(segment)}
                        options={STANDARD_SEGMENT_OPTIONS}
                        onChange={onSegmentChange}
                        disabled={isLoading}
                    />
                </div>

                <div className="lg:flex-1 min-w-0 flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-dash-text-muted select-none">
                        {secondaryLabel}
                    </label>
                    <FilterSelect<TSecondary>
                        ariaLabel={secondaryLabel}
                        value={secondaryValue}
                        options={secondaryOptions}
                        onChange={onSecondaryChange}
                        disabled={isLoading}
                    />
                </div>

                <div className="lg:flex-1 min-w-0 flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-dash-text-muted select-none">
                        Symbol
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="EG: INFY"
                            value={symbol}
                            onChange={(e) => onSymbolChange(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === "Enter" && handleValidatedSubmit()}
                            className={`w-full h-9 bg-dash-panel-2 border border-dash-border hover:border-dash-border-hover focus:border-primary-green rounded pl-3 ${
                                symbol ? "pr-8" : "pr-3"
                            } py-2 text-xs text-dash-text placeholder-dash-text-muted/60 uppercase focus:outline-none transition-colors`}
                        />
                        {symbol && (
                            <button
                                type="button"
                                onClick={() => onSymbolChange("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-dash-text-muted hover:text-dash-text rounded transition-colors cursor-pointer"
                                aria-label="Clear symbol"
                                title="Clear symbol"
                            >
                                <svg
                                    className="w-3.5 h-3.5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <DateRangePicker
                    fromDate={fromDate}
                    toDate={toDate}
                    onChange={handleDateRangeChange}
                    disabled={isLoading}
                />

                <div className="sm:col-span-2 lg:col-span-auto shrink-0 flex items-end">
                    <button
                        type="button"
                        onClick={handleValidatedSubmit}
                        disabled={isLoading}
                        className="w-full sm:w-11 lg:w-11 h-9 rounded bg-primary-green hover:bg-primary-green-hover active:bg-emerald-700 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 shadow-sm select-none"
                        title={submitTitle}
                        aria-label={submitTitle}
                    >
                        {isLoading ? (
                            <svg className="w-4 h-4 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {submitError && (
                <p className="mt-2.5 text-xs text-rose-400 font-medium">{submitError}</p>
            )}
        </div>
    );
}
