import type { FC } from "react";
import type { DashboardBenchmarkIndex } from "../types";
import { formatCurrencyINR } from "@/features/trading";

interface BenchmarkIndicesPanelProps {
    indices?: DashboardBenchmarkIndex[];
    isLoading?: boolean;
}

export const BenchmarkIndicesPanel: FC<BenchmarkIndicesPanelProps> = ({
    indices = [],
    isLoading = false,
}) => {
    if (isLoading && indices.length === 0) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-dash-panel border border-dash-border rounded-lg p-3.5 animate-pulse space-y-2">
                        <div className="h-3 bg-dash-panel-2 rounded w-20" />
                        <div className="h-6 bg-dash-panel-2 rounded w-28" />
                        <div className="h-3 bg-dash-panel-2 rounded w-24" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {indices.map((idx) => {
                const isPositive = idx.change >= 0;
                const formattedChange = isPositive ? `+${idx.change.toFixed(2)}` : idx.change.toFixed(2);
                const formattedPercent = isPositive ? `+${idx.changePercent.toFixed(2)}%` : `${idx.changePercent.toFixed(2)}%`;

                return (
                    <div
                        key={idx.symbol}
                        className="bg-dash-panel border border-dash-border hover:border-dash-border-hover rounded-lg p-3.5 transition-colors"
                    >
                        <div className="flex items-center justify-between text-xs text-dash-text-muted mb-1">
                            <span className="font-semibold text-dash-text">{idx.name}</span>
                            <span className="text-[10px] font-mono uppercase bg-dash-panel-2 px-1.5 py-0.5 rounded border border-dash-border/60">
                                {idx.symbol}
                            </span>
                        </div>

                        <div className="flex items-baseline justify-between gap-2 mt-1">
                            <span className="text-xl font-bold font-mono text-dash-text tracking-tight">
                                {formatCurrencyINR(idx.ltp, false, false)}
                            </span>

                            <div className="flex items-center gap-1 font-mono text-xs">
                                <span className={`font-medium ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                                    {formattedChange}
                                </span>
                                <span
                                    className={`px-1.5 py-0.2 rounded text-[11px] font-semibold ${
                                        isPositive
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : "bg-rose-500/10 text-rose-400"
                                    }`}
                                >
                                    {formattedPercent}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
