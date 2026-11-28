/**
 * Utility functions for P&L formatting, currency display, and date presets.
 */

/**
 * Formats numbers into Zerodha-style abbreviated metrics:
 * e.g. +1.77L, 6.06k, +20.58k, -2.56k
 */
export function formatZerodhaMetric(
    val: number | null | undefined,
    showPlusSign: boolean = false
): string {
    if (val === null || val === undefined || isNaN(val)) {
        return "0.00";
    }

    const isNegative = val < 0;
    const absVal = Math.abs(val);

    let formatted: string;
    if (absVal >= 10000000) {
        // >= 1 Crore (Cr)
        formatted = `${(absVal / 10000000).toFixed(2)}Cr`;
    } else if (absVal >= 100000) {
        // >= 1 Lakh (L)
        formatted = `${(absVal / 100000).toFixed(2)}L`;
    } else if (absVal >= 1000) {
        // >= 1 Thousand (k)
        formatted = `${(absVal / 1000).toFixed(2)}k`;
    } else {
        formatted = absVal.toFixed(2);
    }

    if (isNegative) {
        return `-${formatted}`;
    }
    if (showPlusSign && val > 0) {
        return `+${formatted}`;
    }
    return formatted;
}

/**
 * Formats a numeric value into standard Indian Currency (INR).
 * Explicitly guards against double negative signs (e.g. never produces -₹-24.00).
 */
export function formatCurrencyINR(
    val: number | null | undefined,
    showPlusSign: boolean = false,
    includeRupeeSymbol: boolean = true
): string {
    if (val === null || val === undefined || isNaN(val)) {
        return includeRupeeSymbol ? "₹0.00" : "0.00";
    }

    const isNegative = val < 0;
    const absVal = Math.abs(val);

    const formatted = new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(absVal);

    const sym = includeRupeeSymbol ? "₹" : "";

    if (isNegative) {
        return `-${sym}${formatted}`;
    }
    if (showPlusSign && val > 0) {
        return `+${sym}${formatted}`;
    }
    return `${sym}${formatted}`;
}

/**
 * Formats a numeric value with an explicit +₹ / -₹ sign (e.g. "+₹1,250.00", "-₹420.50", "+₹0.00").
 */
export function formatSignedINR(val: number): string {
    const absFormatted = new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Math.abs(val));
    return val >= 0 ? `+₹${absFormatted}` : `-₹${absFormatted}`;
}

/**
 * Formats a percentage with an explicit +/- sign and 2 decimals (e.g. "+2.45%", "-1.20%").
 */
export function formatSignedPercent(pct: number): string {
    return pct >= 0 ? `+${pct.toFixed(2)}%` : `${pct.toFixed(2)}%`;
}

/**
 * Formats an ISO date/time string into: "DD MMM YYYY, HH:mm:ss"
 * e.g. "23 Nov 2026, 14:32:05"
 */
export function formatTradeDateTime(dateInput: string | Date, includeSeconds: boolean = true): string {
    try {
        const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
        if (isNaN(d.getTime())) return "—";

        const day = d.getDate().toString().padStart(2, "0");
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        const hours = d.getHours().toString().padStart(2, "0");
        const minutes = d.getMinutes().toString().padStart(2, "0");
        const seconds = d.getSeconds().toString().padStart(2, "0");

        return includeSeconds
            ? `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`
            : `${day} ${month} ${year}, ${hours}:${minutes}`;
    } catch {
        return "—";
    }
}

/**
 * Formats a calendar date string (YYYY-MM-DD) into: "DD MMM YYYY"
 * without arbitrary time offset artifacts. e.g. "23 Nov 2026"
 */
export function formatCalendarDate(dateStr: string): string {
    try {
        const parts = dateStr.split("-").map(Number);
        if (parts.length === 3 && !isNaN(parts[0])) {
            const year = parts[0];
            const monthIdx = parts[1] - 1;
            const day = parts[2];
            const months = [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];
            return `${day} ${months[monthIdx]} ${year}`;
        }
        return dateStr;
    } catch {
        return dateStr;
    }
}

/**
 * Formats a Date object to "YYYY-MM-DD" for HTML date inputs
 */
export function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export const MAX_DATE_RANGE_DAYS = 365;
export const MIN_SUPPORTED_DATE = "2010-01-01";

/**
 * Strictly parses a "YYYY-MM-DD" calendar string into a local Date at midnight,
 * returning null if malformed or rolled over (e.g. "2026-02-30").
 */
export function parseIsoCalendarDate(dateStr: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const parsed = new Date(year, month - 1, day);
    if (
        parsed.getFullYear() !== year ||
        parsed.getMonth() !== month - 1 ||
        parsed.getDate() !== day
    ) {
        return null;
    }
    return parsed;
}

/**
 * Returns the exact whole-day UTC difference between two "YYYY-MM-DD" strings (to - from).
 */
export function getCalendarDaysDifference(fromStr: string, toStr: string): number | null {
    const from = parseIsoCalendarDate(fromStr);
    const to = parseIsoCalendarDate(toStr);
    if (!from || !to) return null;

    const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
    const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
    return Math.round((toUtc - fromUtc) / 86_400_000);
}

/**
 * Adds a signed number of calendar days to a "YYYY-MM-DD" date string.
 */
export function addCalendarDays(dateStr: string, days: number): string {
    const base = parseIsoCalendarDate(dateStr);
    if (!base) return dateStr;
    const shifted = new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
    return formatDateForInput(shifted);
}

export interface DateRangeValidationResult {
    isValid: boolean;
    error: string | null;
}

/**
 * Validates a report date range:
 * 1. Both From and To must be valid YYYY-MM-DD calendar dates
 * 2. Neither date may be earlier than MIN_SUPPORTED_DATE (2010-01-01)
 * 3. Neither date may be in the future (> today)
 * 4. From date cannot be later than To date
 * 5. Range span cannot exceed MAX_DATE_RANGE_DAYS (365 days)
 */
export function validateDateRange(
    fromDate: string,
    toDate: string,
    now: Date = new Date()
): DateRangeValidationResult {
    if (!fromDate || !toDate) {
        return { isValid: false, error: "Please select both From and To dates." };
    }

    const fromParsed = parseIsoCalendarDate(fromDate);
    const toParsed = parseIsoCalendarDate(toDate);
    if (!fromParsed || !toParsed) {
        return { isValid: false, error: "Please enter valid dates in YYYY-MM-DD format." };
    }

    const todayStr = formatDateForInput(now);

    if (fromDate < MIN_SUPPORTED_DATE || toDate < MIN_SUPPORTED_DATE) {
        return {
            isValid: false,
            error: `Dates earlier than ${MIN_SUPPORTED_DATE} are not supported.`,
        };
    }

    if (fromDate > todayStr || toDate > todayStr) {
        return { isValid: false, error: "Future dates cannot be selected." };
    }

    if (fromDate > toDate) {
        return { isValid: false, error: "From date cannot be later than To date." };
    }

    const diffDays = getCalendarDaysDifference(fromDate, toDate);
    if (diffDays === null || diffDays > MAX_DATE_RANGE_DAYS) {
        return {
            isValid: false,
            error: `Date range cannot exceed ${MAX_DATE_RANGE_DAYS} days.`,
        };
    }

    return { isValid: true, error: null };
}

/**
 * Computes Indian Financial Year (FY) Date ranges.
 * Indian Financial Year runs from April 1 to March 31.
 */
export interface FyPresetRange {
    from: string; // YYYY-MM-DD
    to: string;   // YYYY-MM-DD
    label: string;
}

export function getIndianFinancialYearPresets(now: Date = new Date()): {
    currentFy: FyPresetRange;
    previousFy: FyPresetRange;
    last30Days: FyPresetRange;
    last7Days: FyPresetRange;
} {
    const year = now.getFullYear();
    const month = now.getMonth(); // 0 = Jan, 3 = Apr, 11 = Dec

    // In India:
    // If month >= 3 (April or later), Current FY started April 1 of this year
    // If month < 3 (Jan - Mar), Current FY started April 1 of previous year
    const currentFyStartYear = month >= 3 ? year : year - 1;
    const currentFyEndYear = currentFyStartYear + 1;

    const currentFyStart = new Date(currentFyStartYear, 3, 1); // 1st April
    const currentFyEnd = now; // up to today

    const prevFyStart = new Date(currentFyStartYear - 1, 3, 1); // 1st April of prev FY
    const prevFyEnd = new Date(currentFyStartYear, 2, 31); // 31st March of prev FY

    const last30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    const last7 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    const currentFyLabel = `FY ${currentFyStartYear.toString().slice(-2)}-${currentFyEndYear.toString().slice(-2)}`;
    const prevFyLabel = `FY ${(currentFyStartYear - 1).toString().slice(-2)}-${currentFyStartYear.toString().slice(-2)}`;

    return {
        currentFy: {
            from: formatDateForInput(currentFyStart),
            to: formatDateForInput(currentFyEnd),
            label: `Current FY (${currentFyLabel})`,
        },
        previousFy: {
            from: formatDateForInput(prevFyStart),
            to: formatDateForInput(prevFyEnd),
            label: `Previous FY (${prevFyLabel})`,
        },
        last30Days: {
            from: formatDateForInput(last30),
            to: formatDateForInput(now),
            label: "Last 30 days",
        },
        last7Days: {
            from: formatDateForInput(last7),
            to: formatDateForInput(now),
            label: "Last 7 days",
        },
    };
}
