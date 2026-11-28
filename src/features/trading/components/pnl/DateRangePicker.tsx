import { useState, useRef, useEffect, useMemo, type FC } from "react";
import {
    MAX_DATE_RANGE_DAYS,
    MIN_SUPPORTED_DATE,
    addCalendarDays,
    formatDateForInput,
    getCalendarDaysDifference,
    getIndianFinancialYearPresets,
    parseIsoCalendarDate,
    validateDateRange,
} from "../../utils/pnlFormatters";

interface DateRangePickerProps {
    fromDate: string;
    toDate: string;
    onChange: (fromDate: string, toDate: string) => void;
    disabled?: boolean;
}

interface YearMonth {
    year: number;
    month: number; // 0-indexed (0 = Jan, 11 = Dec)
}

interface CalendarCell {
    dateStr: string;
    day: number;
    isCurrentMonth: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const SHORT_MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

const MIN_YEAR_MONTH: YearMonth = { year: 2010, month: 0 };

function compareYearMonth(a: YearMonth, b: YearMonth): number {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
}

function clampYearMonth(target: YearMonth, min: YearMonth, max: YearMonth): YearMonth {
    if (compareYearMonth(target, min) < 0) return min;
    if (compareYearMonth(target, max) > 0) return max;
    return target;
}

function getYearMonthFromStr(dateStr: string, fallback: YearMonth): YearMonth {
    const parsed = parseIsoCalendarDate(dateStr);
    if (!parsed) return fallback;
    return { year: parsed.getFullYear(), month: parsed.getMonth() };
}

function buildCalendarGrid(year: number, month: number): CalendarCell[] {
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const startDate = new Date(year, month, 1 - firstDayOfWeek);
    const cells: CalendarCell[] = [];

    for (let i = 0; i < 42; i++) {
        const cellDate = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate() + i
        );
        cells.push({
            dateStr: formatDateForInput(cellDate),
            day: cellDate.getDate(),
            isCurrentMonth: cellDate.getMonth() === month && cellDate.getFullYear() === year,
        });
    }

    return cells;
}

interface CalendarMonthPanelProps {
    role: "from" | "to";
    title: "From" | "To";
    viewMonth: YearMonth;
    maxYearMonth: YearMonth;
    todayStr: string;
    draftFrom: string;
    draftTo: string;
    previewTo: string | null;
    maxAllowedToStr: string;
    onChangeViewMonth: (next: YearMonth) => void;
    onSelectDate: (dateStr: string) => void;
    onHoverDate: (dateStr: string | null) => void;
}

const CalendarMonthPanel: FC<CalendarMonthPanelProps> = ({
    role,
    title,
    viewMonth,
    maxYearMonth,
    todayStr,
    draftFrom,
    draftTo,
    previewTo,
    maxAllowedToStr,
    onChangeViewMonth,
    onSelectDate,
    onHoverDate,
}) => {
    const [showMonthGrid, setShowMonthGrid] = useState(false);

    const cells = useMemo(
        () => buildCalendarGrid(viewMonth.year, viewMonth.month),
        [viewMonth.year, viewMonth.month]
    );

    const effectiveEnd = previewTo && previewTo >= draftFrom ? previewTo : draftTo;

    const isPrevYearDisabled = viewMonth.year <= MIN_YEAR_MONTH.year;
    const isPrevMonthDisabled = compareYearMonth(viewMonth, MIN_YEAR_MONTH) <= 0;
    const isNextMonthDisabled = compareYearMonth(viewMonth, maxYearMonth) >= 0;
    const isNextYearDisabled = viewMonth.year >= maxYearMonth.year;

    const shiftMonth = (delta: number) => {
        const next = new Date(viewMonth.year, viewMonth.month + delta, 1);
        onChangeViewMonth(
            clampYearMonth(
                { year: next.getFullYear(), month: next.getMonth() },
                MIN_YEAR_MONTH,
                maxYearMonth
            )
        );
    };

    const getCellDisabledReason = (dateStr: string): string | null => {
        if (dateStr < MIN_SUPPORTED_DATE) {
            return `Dates earlier than ${MIN_SUPPORTED_DATE} are unavailable`;
        }
        if (dateStr > todayStr) {
            return "Future dates cannot be selected";
        }
        if (role === "to") {
            if (draftFrom && dateStr < draftFrom) {
                return "To date cannot be earlier than From date";
            }
            if (draftFrom && dateStr > maxAllowedToStr) {
                return `Date range cannot exceed ${MAX_DATE_RANGE_DAYS} days`;
            }
        }
        return null;
    };

    return (
        <div className="flex flex-col w-full min-w-[244px]">
            <div className="bg-emerald-600 text-white text-xs font-semibold text-center py-1.5 rounded mb-2 select-none shadow-xs">
                {title}
            </div>

            <div className="flex items-center justify-between px-1 py-1 mb-1">
                <div className="flex items-center gap-0.5">
                    <button
                        type="button"
                        disabled={isPrevYearDisabled}
                        onClick={() => shiftMonth(-12)}
                        aria-label={`${title} previous year`}
                        title="Previous year"
                        className="w-6 h-6 flex items-center justify-center rounded text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors text-xs"
                    >
                        «
                    </button>
                    <button
                        type="button"
                        disabled={isPrevMonthDisabled}
                        onClick={() => shiftMonth(-1)}
                        aria-label={`${title} previous month`}
                        title="Previous month"
                        className="w-6 h-6 flex items-center justify-center rounded text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors text-xs"
                    >
                        ‹
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => setShowMonthGrid((prev) => !prev)}
                    title="Select month"
                    className="px-2 py-0.5 rounded text-xs font-semibold text-dash-text hover:bg-dash-panel-2 transition-colors cursor-pointer select-none"
                >
                    {SHORT_MONTHS[viewMonth.month]} {viewMonth.year}
                </button>

                <div className="flex items-center gap-0.5">
                    <button
                        type="button"
                        disabled={isNextMonthDisabled}
                        onClick={() => shiftMonth(1)}
                        aria-label={`${title} next month`}
                        title="Next month"
                        className="w-6 h-6 flex items-center justify-center rounded text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors text-xs"
                    >
                        ›
                    </button>
                    <button
                        type="button"
                        disabled={isNextYearDisabled}
                        onClick={() => shiftMonth(12)}
                        aria-label={`${title} next year`}
                        title="Next year"
                        className="w-6 h-6 flex items-center justify-center rounded text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors text-xs"
                    >
                        »
                    </button>
                </div>
            </div>

            {showMonthGrid ? (
                <div className="grid grid-cols-3 gap-1.5 py-2 px-1">
                    {SHORT_MONTHS.map((label, idx) => {
                        const candidate: YearMonth = { year: viewMonth.year, month: idx };
                        const isOutOfBounds =
                            compareYearMonth(candidate, MIN_YEAR_MONTH) < 0 ||
                            compareYearMonth(candidate, maxYearMonth) > 0;
                        const isActiveMonth = viewMonth.month === idx;

                        return (
                            <button
                                key={label}
                                type="button"
                                disabled={isOutOfBounds}
                                onClick={() => {
                                    onChangeViewMonth(candidate);
                                    setShowMonthGrid(false);
                                }}
                                className={`py-2 rounded text-xs font-medium transition-colors ${
                                    isOutOfBounds
                                        ? "text-dash-text-muted/35 cursor-not-allowed"
                                        : isActiveMonth
                                        ? "bg-emerald-600 text-white font-semibold cursor-pointer"
                                        : "text-dash-text hover:bg-dash-panel-2 cursor-pointer"
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-7 mb-1">
                        {WEEKDAYS.map((dayName) => (
                            <span
                                key={dayName}
                                className="text-[11px] font-medium text-dash-text-muted text-center py-1 select-none"
                            >
                                {dayName}
                            </span>
                        ))}
                    </div>

                    <div
                        className="grid grid-cols-7 gap-y-0.5"
                        onMouseLeave={() => onHoverDate(null)}
                    >
                        {cells.map((cell) => {
                            const disabledReason = getCellDisabledReason(cell.dateStr);
                            const isDisabled = disabledReason !== null;
                            const isFuture = cell.dateStr > todayStr;

                            const isStart = cell.dateStr === draftFrom;
                            const isEnd = cell.dateStr === effectiveEnd;
                            const isEndpoint = isStart || isEnd;

                            const isInRange =
                                !isDisabled &&
                                Boolean(draftFrom) &&
                                Boolean(effectiveEnd) &&
                                cell.dateStr > draftFrom &&
                                cell.dateStr < effectiveEnd;

                            const isToday = cell.dateStr === todayStr;

                            let cellClass =
                                "h-8 w-full flex items-center justify-center text-xs tabular-nums transition-colors select-none ";

                            if (isDisabled) {
                                // Subtle rose background marks unavailable future or out-of-range dates
                                cellClass += isFuture || role === "to"
                                    ? "bg-rose-500/8 text-dash-text-muted/35 cursor-not-allowed "
                                    : "text-dash-text-muted/35 cursor-not-allowed ";
                            } else if (isEndpoint) {
                                cellClass +=
                                    "bg-emerald-600 text-white font-semibold rounded cursor-pointer shadow-xs ";
                            } else if (isInRange) {
                                cellClass += cell.isCurrentMonth
                                    ? "bg-primary-green/18 text-dash-text hover:bg-primary-green/30 cursor-pointer "
                                    : "bg-primary-green/12 text-dash-text-muted/80 hover:bg-primary-green/25 cursor-pointer ";
                            } else if (!cell.isCurrentMonth) {
                                cellClass +=
                                    "text-dash-text-muted/45 hover:bg-dash-panel-2 hover:text-dash-text rounded cursor-pointer ";
                            } else {
                                cellClass +=
                                    "text-dash-text hover:bg-dash-panel-2 rounded cursor-pointer ";
                            }

                            if (isToday && !isEndpoint && !isDisabled) {
                                cellClass += "ring-1 ring-inset ring-primary-green/60 font-semibold ";
                            }

                            return (
                                <button
                                    key={cell.dateStr}
                                    type="button"
                                    disabled={isDisabled}
                                    title={disabledReason ?? cell.dateStr}
                                    onClick={() => onSelectDate(cell.dateStr)}
                                    onMouseEnter={() => {
                                        if (!isDisabled && role === "to") {
                                            onHoverDate(cell.dateStr);
                                        }
                                    }}
                                    className={cellClass}
                                >
                                    {cell.day}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export const DateRangePicker: FC<DateRangePickerProps> = ({
    fromDate,
    toDate,
    onChange,
    disabled = false,
}) => {
    const todayStr = formatDateForInput(new Date());
    const maxYearMonth = useMemo(
        () => getYearMonthFromStr(todayStr, { year: new Date().getFullYear(), month: new Date().getMonth() }),
        [todayStr]
    );
    const presets = useMemo(() => getIndianFinancialYearPresets(), []);

    const [isOpen, setIsOpen] = useState(false);
    const [draftFrom, setDraftFrom] = useState(fromDate);
    const [draftTo, setDraftTo] = useState(toDate);
    const [hoveredTo, setHoveredTo] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const [leftViewMonth, setLeftViewMonth] = useState<YearMonth>(() =>
        clampYearMonth(getYearMonthFromStr(fromDate, maxYearMonth), MIN_YEAR_MONTH, maxYearMonth)
    );
    const [rightViewMonth, setRightViewMonth] = useState<YearMonth>(() =>
        clampYearMonth(getYearMonthFromStr(toDate, maxYearMonth), MIN_YEAR_MONTH, maxYearMonth)
    );

    const containerRef = useRef<HTMLDivElement>(null);

    const closeAndDiscardInvalidDraft = () => {
        setIsOpen(false);
        setHoveredTo(null);
        setValidationError(null);
        setDraftFrom(fromDate);
        setDraftTo(toDate);
    };

    const handleToggleOpen = () => {
        if (disabled) return;
        if (isOpen) {
            closeAndDiscardInvalidDraft();
            return;
        }
        setDraftFrom(fromDate);
        setDraftTo(toDate);
        setHoveredTo(null);
        setValidationError(null);
        setLeftViewMonth(
            clampYearMonth(getYearMonthFromStr(fromDate, maxYearMonth), MIN_YEAR_MONTH, maxYearMonth)
        );
        setRightViewMonth(
            clampYearMonth(getYearMonthFromStr(toDate, maxYearMonth), MIN_YEAR_MONTH, maxYearMonth)
        );
        setIsOpen(true);
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideMouseDown = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setHoveredTo(null);
                setValidationError(null);
                setDraftFrom(fromDate);
                setDraftTo(toDate);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                setHoveredTo(null);
                setValidationError(null);
                setDraftFrom(fromDate);
                setDraftTo(toDate);
            }
        };

        document.addEventListener("mousedown", handleOutsideMouseDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleOutsideMouseDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, fromDate, toDate]);

    const maxAllowedToStr = useMemo(() => {
        if (!draftFrom || !parseIsoCalendarDate(draftFrom)) return todayStr;
        const oneYearAhead = addCalendarDays(draftFrom, MAX_DATE_RANGE_DAYS);
        return oneYearAhead < todayStr ? oneYearAhead : todayStr;
    }, [draftFrom, todayStr]);

    const handleSelectFrom = (selectedFrom: string) => {
        const nextTo = selectedFrom > draftTo ? selectedFrom : draftTo;
        setDraftFrom(selectedFrom);
        setDraftTo(nextTo);

        const validation = validateDateRange(selectedFrom, nextTo);
        if (validation.isValid) {
            setValidationError(null);
            onChange(selectedFrom, nextTo);
            if (nextTo !== draftTo) {
                setRightViewMonth(
                    clampYearMonth(getYearMonthFromStr(nextTo, maxYearMonth), MIN_YEAR_MONTH, maxYearMonth)
                );
            }
        } else {
            // Keep popover open and show guidance so user can adjust the To date within 365 days
            setValidationError(
                `Date range cannot exceed ${MAX_DATE_RANGE_DAYS} days. Select a To date within ${MAX_DATE_RANGE_DAYS} days of ${selectedFrom}.`
            );
            const suggestedEndMonth = getYearMonthFromStr(
                addCalendarDays(selectedFrom, 30) < todayStr
                    ? addCalendarDays(selectedFrom, 30)
                    : selectedFrom,
                maxYearMonth
            );
            setRightViewMonth(clampYearMonth(suggestedEndMonth, MIN_YEAR_MONTH, maxYearMonth));
        }
    };

    const handleSelectTo = (selectedTo: string) => {
        const validation = validateDateRange(draftFrom, selectedTo);
        if (!validation.isValid) {
            setValidationError(validation.error);
            return;
        }

        setDraftTo(selectedTo);
        setValidationError(null);
        setHoveredTo(null);
        onChange(draftFrom, selectedTo);
        setIsOpen(false);
    };

    const handleApplyPreset = (presetFrom: string, presetTo: string) => {
        const validation = validateDateRange(presetFrom, presetTo);
        if (!validation.isValid) {
            setValidationError(validation.error);
            return;
        }

        setDraftFrom(presetFrom);
        setDraftTo(presetTo);
        setValidationError(null);
        setHoveredTo(null);
        onChange(presetFrom, presetTo);
        setIsOpen(false);
    };

    const activePresetKey = useMemo(() => {
        const currentFrom = isOpen ? draftFrom : fromDate;
        const currentTo = isOpen ? draftTo : toDate;
        if (currentFrom === presets.last7Days.from && currentTo === presets.last7Days.to) {
            return "last7";
        }
        if (currentFrom === presets.last30Days.from && currentTo === presets.last30Days.to) {
            return "last30";
        }
        if (currentFrom === presets.previousFy.from && currentTo === presets.previousFy.to) {
            return "prevFy";
        }
        if (currentFrom === presets.currentFy.from && currentTo === presets.currentFy.to) {
            return "currentFy";
        }
        return null;
    }, [isOpen, draftFrom, draftTo, fromDate, toDate, presets]);

    const displayedFrom = isOpen ? draftFrom : fromDate;
    const displayedTo = isOpen ? draftTo : toDate;
    const spanDays = getCalendarDaysDifference(displayedFrom, displayedTo);

    const shortcutItems = [
        { key: "last7", label: "Last 7 days", range: presets.last7Days },
        { key: "last30", label: "Last 30 days", range: presets.last30Days },
        { key: "prevFy", label: "Prev. FY", range: presets.previousFy },
        { key: "currentFy", label: "Current FY", range: presets.currentFy },
    ] as const;

    return (
        <div className="lg:flex-1 min-w-0 flex flex-col gap-1.5 relative" ref={containerRef}>
            <label className="text-[11px] font-medium text-dash-text-muted select-none">
                Date range
            </label>

            <button
                type="button"
                disabled={disabled}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                onClick={handleToggleOpen}
                className={`w-full h-9 bg-dash-panel-2 border rounded px-3 py-2 text-xs text-dash-text flex items-center justify-between gap-2 focus:outline-none transition-colors cursor-pointer text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                    isOpen
                        ? "border-primary-green ring-1 ring-primary-green/30"
                        : "border-dash-border hover:border-dash-border-hover focus:border-primary-green"
                }`}
            >
                <span className="font-mono tabular-nums truncate">
                    {displayedFrom} ~ {displayedTo}
                </span>
                <svg
                    className="w-3.5 h-3.5 text-dash-text-muted shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            </button>

            {isOpen && (
                <div
                    role="dialog"
                    aria-label="Select date range"
                    className="absolute right-0 top-full mt-1.5 z-50 w-[min(92vw,548px)] bg-dash-panel border border-dash-border rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                >
                    {/* Shortcut Presets Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-dash-border bg-dash-panel-2/60">
                        <div className="flex flex-wrap items-center text-xs">
                            {shortcutItems.map((item, idx) => {
                                const isActive = activePresetKey === item.key;
                                return (
                                    <div key={item.key} className="flex items-center">
                                        {idx > 0 && (
                                            <span className="mx-2.5 h-3.5 w-px bg-dash-border select-none" />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleApplyPreset(item.range.from, item.range.to)
                                            }
                                            className={`transition-colors cursor-pointer whitespace-nowrap ${
                                                isActive
                                                    ? "text-primary-green font-semibold"
                                                    : "text-dash-text-muted hover:text-dash-text font-medium"
                                            }`}
                                        >
                                            {item.label}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {spanDays !== null && spanDays >= 0 && spanDays <= MAX_DATE_RANGE_DAYS && (
                            <span className="text-[11px] font-mono text-dash-text-muted select-none">
                                {spanDays + 1} {spanDays === 0 ? "day" : "days"}
                            </span>
                        )}
                    </div>

                    {/* Dual Calendar Body */}
                    <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <CalendarMonthPanel
                            role="from"
                            title="From"
                            viewMonth={leftViewMonth}
                            maxYearMonth={maxYearMonth}
                            todayStr={todayStr}
                            draftFrom={draftFrom}
                            draftTo={draftTo}
                            previewTo={hoveredTo}
                            maxAllowedToStr={maxAllowedToStr}
                            onChangeViewMonth={setLeftViewMonth}
                            onSelectDate={handleSelectFrom}
                            onHoverDate={setHoveredTo}
                        />

                        <CalendarMonthPanel
                            role="to"
                            title="To"
                            viewMonth={rightViewMonth}
                            maxYearMonth={maxYearMonth}
                            todayStr={todayStr}
                            draftFrom={draftFrom}
                            draftTo={draftTo}
                            previewTo={hoveredTo}
                            maxAllowedToStr={maxAllowedToStr}
                            onChangeViewMonth={setRightViewMonth}
                            onSelectDate={handleSelectTo}
                            onHoverDate={setHoveredTo}
                        />
                    </div>

                    {/* Validation Message Footer */}
                    {validationError && (
                        <div className="px-4 py-2 border-t border-rose-500/20 bg-rose-500/10 text-rose-400 text-[11px] font-medium flex items-center gap-2">
                            <svg
                                className="w-3.5 h-3.5 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                />
                            </svg>
                            <span>{validationError}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
