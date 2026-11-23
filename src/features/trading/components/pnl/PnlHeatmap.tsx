import { useState, useMemo, type FC } from "react";
import type { PnlHeatmapSummary } from "../../types";
import { formatCurrencyINR, formatTradeDateTime } from "../../utils/pnlFormatters";

interface PnlHeatmapProps {
    heatmap?: PnlHeatmapSummary;
    fromDate?: string;
    toDate?: string;
    isLoading?: boolean;
}

interface MonthBlock {
    name: string; // e.g. "Apr"
    year: number;
    monthIndex: number; // 0-11
    days: Array<{
        dateStr: string;
        dayNum: number;
        dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
        grossPnL: number;
        netPnL: number;
        tradesCount: number;
        hasTrades: boolean;
    }>;
}

export const PnlHeatmap: FC<PnlHeatmapProps> = ({
    heatmap,
    fromDate,
    toDate,
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

    // Construct monthly calendar blocks based on fromDate and toDate
    const monthBlocks = useMemo<MonthBlock[]>(() => {
        const start = fromDate ? new Date(fromDate) : new Date(new Date().getFullYear(), 3, 1);
        const end = toDate ? new Date(toDate) : new Date();

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
            return [];
        }

        const months: MonthBlock[] = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const cur = new Date(start.getFullYear(), start.getMonth(), 1);
        const last = new Date(end.getFullYear(), end.getMonth(), 1);

        while (cur <= last && months.length < 24) {
            const year = cur.getFullYear();
            const monthIndex = cur.getMonth();
            const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

            const daysList = [];
            for (let day = 1; day <= daysInMonth; day++) {
                const dateObj = new Date(year, monthIndex, day);
                const monthStr = (monthIndex + 1).toString().padStart(2, "0");
                const dayStr = day.toString().padStart(2, "0");
                const dateKey = `${year}-${monthStr}-${dayStr}`;

                const data = dayMap.get(dateKey);
                daysList.push({
                    dateStr: dateKey,
                    dayNum: day,
                    dayOfWeek: dateObj.getDay(),
                    grossPnL: data?.grossPnL ?? 0,
                    netPnL: data?.netPnL ?? 0,
                    tradesCount: data?.tradesCount ?? 0,
                    hasTrades: Boolean(data && data.tradesCount > 0),
                });
            }

            months.push({
                name: monthNames[monthIndex],
                year,
                monthIndex,
                days: daysList,
            });

            cur.setMonth(cur.getMonth() + 1);
        }

        return months;
    }, [fromDate, toDate, dayMap]);

    // Color intensity helper
    const getTileStyle = (netPnL: number, hasTrades: boolean) => {
        if (!hasTrades) {
            return "bg-dash-panel-2/60 border border-dash-border/30 hover:border-dash-border";
        }

        if (netPnL > 0) {
            const ratio = netPnL / maxProfit;
            if (ratio > 0.75) return "bg-[#00a35c] text-white border border-[#00873e]";
            if (ratio > 0.45) return "bg-[#22c55e] text-white border border-[#16a34a]";
            if (ratio > 0.20) return "bg-[#4ade80] text-black border border-[#22c55e]";
            return "bg-[#86efac]/80 text-black border border-[#4ade80]";
        }

        if (netPnL < 0) {
            const ratio = Math.abs(netPnL) / maxLoss;
            if (ratio > 0.75) return "bg-[#dc2626] text-white border border-[#b91c1c]";
            if (ratio > 0.45) return "bg-[#ef4444] text-white border border-[#dc2626]";
            if (ratio > 0.20) return "bg-[#f87171] text-white border border-[#ef4444]";
            return "bg-[#fca5a5]/80 text-black border border-[#f87171]";
        }

        // Neutral 0 P&L trade day
        return "bg-dash-panel-3 border border-dash-border";
    };

    if (isLoading) {
        return (
            <div className="p-4 bg-dash-panel border border-dash-border rounded-lg animate-pulse">
                <div className="h-4 bg-dash-panel-2 rounded w-48 mb-4" />
                <div className="h-28 bg-dash-panel-2 rounded w-full" />
            </div>
        );
    }

    const greenDays = heatmap?.greenDays ?? 0;
    const redDays = heatmap?.redDays ?? 0;

    return (
        <div className="p-4 sm:p-5 bg-dash-panel border border-dash-border rounded-lg flex flex-col relative overflow-hidden">
            {/* Heatmap Month Blocks */}
            <div className="overflow-x-auto pb-2 custom-scrollbar">
                <div className="inline-flex gap-4 sm:gap-6 min-w-full justify-between items-start">
                    {monthBlocks.map((block) => (
                        <div key={`${block.year}-${block.monthIndex}`} className="flex flex-col items-center shrink-0">
                            {/* Month Label */}
                            <span className="text-[11px] font-semibold text-dash-text-muted mb-2 select-none">
                                {block.name}
                            </span>

                            {/* 7-column Calendar Grid for the month */}
                            <div className="grid grid-cols-7 gap-1">
                                {/* Leading offset empty cells for first day of month */}
                                {Array.from({ length: block.days[0]?.dayOfWeek ?? 0 }).map((_, i) => (
                                    <div key={`offset-${i}`} className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-0 pointer-events-none" />
                                ))}

                                {block.days.map((day) => {
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
                                            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[2px] transition-transform duration-100 cursor-pointer hover:scale-125 hover:z-20 ${tileClass}`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Bar: Stats on left, Legend on right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-2 border-t border-dash-border/60 text-xs">
                {/* Left: Green days & Red days */}
                <div className="flex items-center gap-2 text-dash-text-muted font-medium text-[11px] sm:text-xs">
                    <span className="text-dash-text font-semibold">Gross realised P&L</span>
                    <span>|</span>
                    <span className="text-[#22c55e] font-semibold">{greenDays} green days</span>
                    <span>·</span>
                    <span className="text-[#ef4444] font-semibold">{redDays} red days</span>
                </div>

                {/* Right: Zerodha Less/More Legend */}
                <div className="flex items-center gap-1.5 text-[10px] text-dash-text-muted select-none">
                    <span>Less</span>
                    <div className="flex items-center gap-0.5">
                        <div className="w-2.5 h-2.5 rounded-[2px] bg-[#fca5a5]" title="Small Loss" />
                        <div className="w-2.5 h-2.5 rounded-[2px] bg-[#f87171]" title="Moderate Loss" />
                        <div className="w-2.5 h-2.5 rounded-[2px] bg-[#ef4444]" title="High Loss" />
                        <div className="w-2.5 h-2.5 rounded-[2px] bg-[#dc2626]" title="Max Loss" />
                    </div>
                    <div className="flex items-center gap-0.5 ml-1">
                        <div className="w-2.5 h-2.5 rounded-[2px] bg-[#86efac]" title="Small Profit" />
                        <div className="w-2.5 h-2.5 rounded-[2px] bg-[#4ade80]" title="Moderate Profit" />
                        <div className="w-2.5 h-2.5 rounded-[2px] bg-[#22c55e]" title="High Profit" />
                        <div className="w-2.5 h-2.5 rounded-[2px] bg-[#00a35c]" title="Max Profit" />
                    </div>
                    <span>More</span>
                </div>
            </div>

            {/* Floating Day Tooltip */}
            {hoveredDay && (
                <div
                    className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full mb-2 bg-dash-panel-3 border border-dash-border text-dash-text px-3 py-2 rounded-lg shadow-2xl text-[11px] font-sans"
                    style={{ left: `${hoveredDay.x}px`, top: `${hoveredDay.y - 8}px` }}
                >
                    <div className="font-semibold text-dash-text pb-1 border-b border-dash-border mb-1 flex items-center justify-between gap-4">
                        <span>{formatTradeDateTime(new Date(hoveredDay.dateStr))}</span>
                        <span className="text-[10px] font-mono text-dash-text-muted">
                            {hoveredDay.tradesCount} trade{hoveredDay.tradesCount !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div className="font-mono space-y-0.5 text-[10px]">
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
