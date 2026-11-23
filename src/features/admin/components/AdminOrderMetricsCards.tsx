import { formatINR } from "@/features/watchlist";
import type { AdminOrderMetricsDTO } from "../types";

interface AdminOrderMetricsCardsProps {
    metrics?: AdminOrderMetricsDTO;
    isLoading?: boolean;
}

export function AdminOrderMetricsCards({ metrics, isLoading }: AdminOrderMetricsCardsProps) {
    if (isLoading && !metrics) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {[1, 2, 3, 4, 5].map((idx) => (
                    <div
                        key={idx}
                        className="rounded-xl border border-border-muted bg-card p-4 animate-pulse h-24 flex flex-col justify-between"
                    >
                        <div className="h-3 w-20 bg-panel-2 rounded" />
                        <div className="h-6 w-28 bg-panel-2 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    const {
        todayOrdersCount = 0,
        todayTurnover = 0,
        pendingAmoCount = 0,
        todayExecutedCount = 0,
        todayRejectedCount = 0,
        todayCancelledCount = 0,
    } = metrics || {};

    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Today's Orders */}
            <article className="rounded-xl border border-border-muted bg-card p-4 hover:border-border-muted/80 transition-colors flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-secondary">
                    <span className="text-xs font-medium">Today's Orders</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-panel-2 text-text-secondary border border-border-muted">
                        Today
                    </span>
                </div>
                <p className="text-xl font-bold text-text-primary mt-2">
                    {todayOrdersCount.toLocaleString()}
                </p>
                <p className="text-[11px] text-text-secondary mt-0.5">Total orders placed today</p>
            </article>

            {/* Today's Turnover */}
            <article className="rounded-xl border border-border-muted bg-card p-4 hover:border-border-muted/80 transition-colors flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-secondary">
                    <span className="text-xs font-medium">Today's Turnover</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
                        Volume
                    </span>
                </div>
                <p className="text-xl font-bold text-text-primary mt-2">
                    ₹{formatINR(todayTurnover)}
                </p>
                <p className="text-[11px] text-text-secondary mt-0.5">Aggregate filled volume</p>
            </article>

            {/* Executed Orders */}
            <article className="rounded-xl border border-border-muted bg-card p-4 hover:border-border-muted/80 transition-colors flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-secondary">
                    <span className="text-xs font-medium">Executed</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green/10 text-green">
                        Filled
                    </span>
                </div>
                <p className="text-xl font-bold text-green mt-2">
                    {todayExecutedCount.toLocaleString()}
                </p>
                <p className="text-[11px] text-text-secondary mt-0.5">Successful executions</p>
            </article>

            {/* Pending AMO */}
            <article className="rounded-xl border border-border-muted bg-card p-4 hover:border-border-muted/80 transition-colors flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-secondary">
                    <span className="text-xs font-medium">Pending AMO</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/15 text-purple-400">
                        Queued
                    </span>
                </div>
                <p className="text-xl font-bold text-purple-400 mt-2">
                    {pendingAmoCount.toLocaleString()}
                </p>
                <p className="text-[11px] text-text-secondary mt-0.5">Orders for next session</p>
            </article>

            {/* Cancelled & Rejected */}
            <article className="rounded-xl border border-border-muted bg-card p-4 hover:border-border-muted/80 transition-colors flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-secondary">
                    <span className="text-xs font-medium">Inactive / Failed</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red/10 text-red">
                        {todayCancelledCount + todayRejectedCount} Total
                    </span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-xl font-bold text-text-primary">{todayCancelledCount}</span>
                    <span className="text-xs font-medium text-text-secondary">Canc</span>
                    <span className="text-text-secondary/40 text-xs">/</span>
                    <span className="text-xl font-bold text-red">{todayRejectedCount}</span>
                    <span className="text-xs font-medium text-text-secondary">Rej</span>
                </div>
                <p className="text-[11px] text-text-secondary mt-0.5">Cancelled or rejected orders</p>
            </article>
        </section>
    );
}
