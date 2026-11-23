import { useState, useMemo, type FC } from "react";
import type { PnlHeatmapSummary } from "../../types";
import { formatCurrencyINR, formatCalendarDate } from "../../utils/pnlFormatters";

interface PnlHeatmapProps {
    heatmap?: PnlHeatmapSummary;
    fromDate?: string;
    toDate?: string;
    isLoading?: boolean;
}

interface DayCellData {
    dateStr: string;
    dayNum: number;
    dayOfWeek: number; // 1=Mon, ..., 5=Fri
    grossPnL: number;
    netPnL: number;
    tradesCount: number;
    hasTrades: boolean;
}

interface MonthBlock {
    name: string; // "Apr", "May", ...
    year: number;
    monthIndex: number;
    weeks: Array<Array<DayCellData | null>>; // 5 rows per week (Mon=0 .. Fri=4)
}

export const PnlHeatmap: FC<PnlHeatmapProps> = ({
    heatmap,
    fromDate,
    isLoading = false,
}) => {
    const [hoveredDay, setHoveredDay] = useState<{
        dateStr: string;
        grossPnL: number;
        netPnL: number;
        tradesCount: number;
        x: number;
        y: number;
    } | null>(null);

    // Build day lookup map from backend heatmap response
    const dayMap = useMemo(() => {
        const map = new Map<string, { grossPnL: number; netPnL: number; tradesCount: number }>();
        for (const d of heatmap?.days ?? []) {
            map.set(d.date, {
                grossPnL: d.grossPnL,
                netPnL: d.netPnL,
                tradesCount: d.tradesCount,
            });
        }
        return map;
    }, [heatmap?.days]);

    // Calculate max absolute values for color scaling
    const { maxProfit, maxLoss } = useMemo(() => {
        let maxP = 1;
        let maxL = 1;
        for (const d of heatmap?.days ?? []) {
            if (d.netPnL > maxP) maxP = d.netPnL;
            if (Math.abs(d.netPnL) > maxL && d.netPnL < 0) maxL = Math.abs(d.netPnL);
        }
        return { maxProfit: maxP, maxLoss: maxL };
    }, [heatmap?.days]);

    // Construct 12 Financial Year months with Mon-Fri week columns (Zerodha standard)
    const monthBlocks = useMemo<MonthBlock[]>(() => {
        let fyStartYear = new Date().getFullYear();
        if (fromDate) {
            const parts = fromDate.split("-").map(Number);
            if (parts.length >= 2 && !isNaN(parts[0])) {
                const year = parts[0];
                const month = parts[1]; // 1-12
                fyStartYear = month >= 4 ? year : year - 1;
            }
        }

        const monthNames = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
        const months: MonthBlock[] = [];

        for (let i = 0; i < 12; i++) {
            const monthIndex = (3 + i) % 12; // Apr=3 ... Dec=11, Jan=0 ... Mar=2
            const year = i < 9 ? fyStartYear : fyStartYear + 1;
            const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

            const weeks: Array<Array<DayCellData | null>> = [];
            let currentWeek: Array<DayCellData | null> = [null, null, null, null, null];
            let hasDaysInCurrentWeek = false;

            for (let day = 1; day <= daysInMonth; day++) {
                const dateObj = new Date(year, monthIndex, day);
                const dayOfWeek = dateObj.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

                // Only weekdays Mon (1) to Fri (5)
                if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                    const rowIndex = dayOfWeek - 1; // 0=Mon, 4=Fri
                    const monthStr = (monthIndex + 1).toString().padStart(2, "0");
                    const dayStr = day.toString().padStart(2, "0");
                    const dateKey = `${year}-${monthStr}-${dayStr}`;

                    const data = dayMap.get(dateKey);
                    currentWeek[rowIndex] = {
                        dateStr: dateKey,
                        dayNum: day,
                        dayOfWeek,
                        grossPnL: data?.grossPnL ?? 0,
                        netPnL: data?.netPnL ?? 0,
                        tradesCount: data?.tradesCount ?? 0,
                        hasTrades: Boolean(data && data.tradesCount > 0),
                    };
                    hasDaysInCurrentWeek = true;

                    if (dayOfWeek === 5 || day === daysInMonth) {
                        weeks.push([...currentWeek]);
                        currentWeek = [null, null, null, null, null];
                        hasDaysInCurrentWeek = false;
                    }
                } else if (day === daysInMonth && hasDaysInCurrentWeek) {
                    weeks.push([...currentWeek]);
                }
            }

            months.push({
                name: monthNames[i],
                year,
                monthIndex,
                weeks,
            });
        }

        return months;
    }, [fromDate, dayMap]);

    // Calculate Net Realised P&L Green & Red day counts (All hooks MUST be declared before any conditional return)
    const { greenDays, redDays } = useMemo(() => {
        if (!heatmap?.days || heatmap.days.length === 0) {
            return {
                greenDays: heatmap?.greenDays ?? 0,
                redDays: heatmap?.redDays ?? 0,
            };
        }
        let green = 0;
        let red = 0;
        for (const d of heatmap.days) {
            if (d.netPnL > 0) green++;
            else if (d.netPnL < 0) red++;
        }
        return { greenDays: green, redDays: red };
    }, [heatmap]);

    // Color intensity helper
    const getTileStyle = (netPnL: number, hasTrades: boolean) => {
        if (!hasTrades) {
            return "bg-white/[0.05] border border-white/[0.07] hover:border-white/20";
        }

        if (netPnL > 0) {
            const ratio = netPnL / maxProfit;
            if (ratio > 0.75) return "bg-[#00a35c] border border-[#00873e] shadow-sm";
            if (ratio > 0.45) return "bg-[#22c55e] border border-[#16a34a] shadow-sm";
            if (ratio > 0.20) return "bg-[#4ade80] border border-[#22c55e]";
            return "bg-[#86efac]/90 border border-[#4ade80]";
        }

        if (netPnL < 0) {
            const ratio = Math.abs(netPnL) / maxLoss;
            if (ratio > 0.75) return "bg-[#dc2626] border border-[#b91c1c] shadow-sm";
            if (ratio > 0.45) return "bg-[#ef4444] border border-[#dc2626] shadow-sm";
            if (ratio > 0.20) return "bg-[#f87171] border border-[#ef4444]";
            return "bg-[#fca5a5]/90 border border-[#f87171]";
        }

        // Neutral 0 P&L trade day
        return "bg-dash-panel-3 border border-dash-border";
    };

    if (isLoading) {
        return (
            <div className="p-4 sm:p-5 bg-dash-panel border border-dash-border rounded-lg animate-pulse shrink-0 min-h-[160px]">
                <div className="h-4 bg-dash-panel-2 rounded w-48 mb-4" />
                <div className="h-24 bg-dash-panel-2 rounded w-full" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-5 bg-dash-panel border border-dash-border rounded-lg flex flex-col shrink-0">
            {/* Heatmap Row: Mon/Wed/Fri Labels on left + 12 Months across (Zero Horizontal Scrolling) */}
            <div className="w-full">
                <div className="flex items-start justify-between w-full">
                    {/* Left Weekday Labels: M, W, F vertically aligned with Mon(0), Wed(2), Fri(4) */}
                    <div className="flex flex-col items-center pr-2 shrink-0">
                        {/* Empty height spacer to match the month label above tiles */}
                        <div className="h-4 mb-2" />
                        <div className="grid grid-rows-5 gap-1 text-[10px] text-dash-text-muted font-medium select-none">
                            <span className="w-3 h-2.5 sm:h-3 flex items-center justify-center">M</span>
                            <span className="w-3 h-2.5 sm:h-3 flex items-center justify-center opacity-0 pointer-events-none">T</span>
                            <span className="w-3 h-2.5 sm:h-3 flex items-center justify-center">W</span>
                            <span className="w-3 h-2.5 sm:h-3 flex items-center justify-center opacity-0 pointer-events-none">T</span>
                            <span className="w-3 h-2.5 sm:h-3 flex items-center justify-center">F</span>
                        </div>
                    </div>

                    {/* 12 Months: Evenly distributed with flex justify-between across the container */}
                    <div className="flex items-start justify-between flex-1 gap-1 sm:gap-2 lg:gap-3">
                        {monthBlocks.map((block) => (
                            <div key={`${block.year}-${block.monthIndex}`} className="flex flex-col items-center shrink-0">
                                {/* Month Label (Apr, May, Jun, ...) */}
                                <span className="text-[11px] font-semibold text-dash-text-muted mb-2 select-none">
                                    {block.name}
                                </span>

                                {/* Week columns for this month */}
                                <div className="flex gap-0.5 sm:gap-1">
                                    {block.weeks.map((week, wIdx) => (
                                        <div key={wIdx} className="grid grid-rows-5 gap-1">
                                            {week.map((day, rIdx) => {
                                                if (!day) {
                                                    return (
                                                        <div
                                                            key={`empty-${rIdx}`}
                                                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-0 pointer-events-none"
                                                        />
                                                    );
                                                }

                                                const tileClass = getTileStyle(day.netPnL, day.hasTrades);
                                                return (
                                                    <div
                                                        key={day.dateStr}
                                                        onMouseEnter={(e) => {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            setHoveredDay({
                                                                dateStr: day.dateStr,
                                                                grossPnL: day.grossPnL,
                                                                netPnL: day.netPnL,
                                                                tradesCount: day.tradesCount,
                                                                x: rect.left + rect.width / 2,
                                                                y: rect.top,
                                                            });
                                                        }}
                                                        onMouseLeave={() => setHoveredDay(null)}
                                                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[1.5px] transition-transform duration-100 cursor-pointer hover:scale-150 hover:z-20 ${tileClass}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Bar: Stats on left, Legend on right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-3 border-t border-dash-border/60 text-xs shrink-0">
                {/* Left: Green days & Red days based on Net Realised P&L */}
                <div className="flex items-center gap-2 text-dash-text-muted font-medium text-[11px] sm:text-xs select-none">
                    <span className="text-dash-text font-semibold">Net realised P&L</span>
                    <span>|</span>
                    <span className="text-[#22c55e] font-semibold">
                        {greenDays} green day{greenDays !== 1 ? "s" : ""}
                    </span>
                    <span>·</span>
                    <span className="text-[#ef4444] font-semibold">
                        {redDays} red day{redDays !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Right: Zerodha Less/More Legend */}
                <div className="flex items-center gap-1.5 text-[10px] text-dash-text-muted select-none">
                    <span>Less</span>
                    <div className="flex items-center gap-0.5">
                        <div className="w-2.5 h-2.5 rounded-[1.5px] bg-[#fca5a5]" title="Small Loss" />
                        <div className="w-2.5 h-2.5 rounded-[1.5px] bg-[#f87171]" title="Moderate Loss" />
                        <div className="w-2.5 h-2.5 rounded-[1.5px] bg-[#ef4444]" title="High Loss" />
                        <div className="w-2.5 h-2.5 rounded-[1.5px] bg-[#dc2626]" title="Max Loss" />
                    </div>
                    <div className="flex items-center gap-0.5 ml-1">
                        <div className="w-2.5 h-2.5 rounded-[1.5px] bg-[#86efac]" title="Small Profit" />
                        <div className="w-2.5 h-2.5 rounded-[1.5px] bg-[#4ade80]" title="Moderate Profit" />
                        <div className="w-2.5 h-2.5 rounded-[1.5px] bg-[#22c55e]" title="High Profit" />
                        <div className="w-2.5 h-2.5 rounded-[1.5px] bg-[#00a35c]" title="Max Profit" />
                    </div>
                    <span>More</span>
                </div>
            </div>

            {/* Floating Day Tooltip */}
            {hoveredDay && (
                <div
                    className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full mb-2 bg-dash-panel-3 border border-dash-border text-dash-text px-3.5 py-2.5 rounded-lg shadow-2xl text-[11px] font-sans min-w-[160px]"
                    style={{ left: `${hoveredDay.x}px`, top: `${hoveredDay.y - 8}px` }}
                >
                    <div className="font-semibold text-dash-text pb-1.5 border-b border-dash-border/80 mb-2 flex items-center justify-between gap-3">
                        <span className="font-medium text-dash-text">{formatCalendarDate(hoveredDay.dateStr)}</span>
                        <span className="text-[10px] font-mono text-dash-text-muted px-1.5 py-0.2 rounded bg-dash-panel-2 border border-dash-border/60">
                            {hoveredDay.tradesCount} trade{hoveredDay.tradesCount !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div className="font-mono space-y-1 text-[11px]">
                        <div className="flex justify-between gap-4">
                            <span className="text-dash-text-muted">Gross P&L:</span>
                            <span className={hoveredDay.grossPnL >= 0 ? "text-[#22c55e] font-semibold" : "text-[#ef4444] font-semibold"}>
                                {formatCurrencyINR(hoveredDay.grossPnL, true)}
                            </span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-dash-text-muted">Net P&L:</span>
                            <span className={hoveredDay.netPnL >= 0 ? "text-[#22c55e] font-bold" : "text-[#ef4444] font-bold"}>
                                {formatCurrencyINR(hoveredDay.netPnL, true)}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
