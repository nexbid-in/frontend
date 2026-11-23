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

    const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

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
            label: "Last 30 Days",
        },
    };
}
