import { FormatDateType } from "klinecharts";

const MONTHS_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Indian Standard Time (IST) is UTC + 5 hours 30 minutes (+19,800,000 ms) with no Daylight Saving Time
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Production-grade TradingView & Fyers style date formatter for KLineCharts.
 * Dynamically adapts between Intraday hours (10:00, 11:30), Day numbers (14, 15, 30),
 * and Month names (Sep, Oct, Nov) based on zoom level and boundary tier promotions,
 * while maintaining high-precision timestamps for crosshair and cursor pills.
 */
export function tradingViewDateFormatter(
    dateTimeFormat: Intl.DateTimeFormat,
    timestamp: number,
    format: string,
    type: FormatDateType
): string {
    const ist = new Date(timestamp + IST_OFFSET_MS);

    const year = ist.getUTCFullYear();
    const monthIdx = ist.getUTCMonth();
    const monthName = MONTHS_SHORT[monthIdx];
    const day = ist.getUTCDate();
    const hours = String(ist.getUTCHours()).padStart(2, "0");
    const minutes = String(ist.getUTCMinutes()).padStart(2, "0");
    const shortYear = String(year).slice(-2);
    const dayPadded = String(day).padStart(2, "0");

    // 1. Crosshair Floating Cursor Badge (Type 1) & Tooltips (Type 0)
    // TradingView standard: "30 Oct '26  11:15" or "02 Nov '26  10:15"
    if (type === FormatDateType.Crosshair || type === FormatDateType.Tooltip) {
        if (format === "YYYY" || format === "YYYY-MM" || format === "YYYY-MM-DD" || format === "MM-DD") {
            return `${dayPadded} ${monthName} '${shortYear}`;
        }
        return `${dayPadded} ${monthName} '${shortYear}  ${hours}:${minutes}`;
    }

    // 2. Static X-Axis Bottom Bar (Type 2): Adaptive Contextual Level-of-Detail (LOD)
    if (type === FormatDateType.XAxis) {
        // Multi-Year Macro Zoom
        if (format === "YYYY") {
            return String(year);
        }

        // Multi-Month Macro Zoom: Show month names (Sep, Oct, Nov)
        if (format === "YYYY-MM") {
            // Promote January to Year string for temporal anchor
            if (monthIdx === 0) {
                return String(year);
            }
            return monthName;
        }

        // Day Scale & Boundary Promotions (e.g. 14, 15, 16, 28, 30)
        if (format === "MM-DD" || format === "YYYY-MM-DD") {
            // New Year transition
            if (day === 1 && monthIdx === 0) {
                return String(year);
            }
            // New Month transition: promote to Month Name (e.g. "Nov")
            if (day === 1) {
                return monthName;
            }
            // Standard day number as clean integer
            return String(day);
        }

        // First tick on edge when formatting range has both date and time
        if (format === "YYYY-MM-DD HH:mm" || format === "MM-DD HH:mm") {
            if (day === 1 && monthIdx === 0) return String(year);
            if (day === 1) return monthName;
            return `${day} ${monthName}`;
        }

        // Intraday Tier (1m, 5m, 15m, 1h)
        // If this tick represents the NSE opening bell (09:15 IST), promote to Day Number
        if (hours === "09" && minutes === "15") {
            if (day === 1 && monthIdx === 0) return String(year);
            if (day === 1) return monthName;
            return String(day);
        }

        // Standard intraday hour & minute mark (e.g. "10:00", "11:30", "14:00")
        return `${hours}:${minutes}`;
    }

    return dateTimeFormat.format(timestamp);
}
