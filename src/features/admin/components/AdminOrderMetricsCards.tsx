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
            <article className="rounded-xl border border-border-muted bg-card p-4 hover:border-border-muted/80 transition-colors">
                <div className="flex items-center justify-between text-text-secondary">
                    <span className="text-xs font-medium">Today's Orders</span>
                    <div className="w-7 h-7 rounded-lg bg-panel-2 flex items-center justify-center text-text-primary">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                </div>
                <p className="text-xl font-bold text-text-primary mt-2">
                    {todayOrdersCount.toLocaleString()}
                </p>
                <p className="text-[11px] text-text-secondary mt-0.5">Total orders placed today</p>
            </article>

            {/* Today's Turnover */}
            <article className="rounded-xl border border-border-muted bg-card p-4 hover:border-border-muted/80 transition-colors">
                <div className="flex items-center justify-between text-text-secondary">
                    <span className="text-xs font-medium">Today's Turnover</span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <p className="text-xl font-bold text-text-primary mt-2">
                    ₹{formatINR(todayTurnover)}
                </p>
                <p className="text-[11px] text-text-secondary mt-0.5">Aggregate filled volume</p>
            </article>

            {/* Executed Orders */}
            <article className="rounded-xl border border-border-muted bg-card p-4 hover:border-border-border transition-colors">
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
            <article className="rounded-xl border border-border-muted bg-card p-4 hover:border-border-border transition-colors">
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
            <article className="rounded-xl border border-border-muted bg-card p-4 hover:border-border-border transition-colors">
                <div className="flex items-center justify-between text-text-secondary">
                    <span className="text-xs font-medium">Inactive / Failed</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red/10 text-red">
                        {todayCancelledCount + todayRejectedCount} Total
                    </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-xl font-bold text-text-primary">
                        {todayCancelledCount} <span className="text-xs font-normal text-text-secondary">canc.</span>
                    </span>
                    <span className="text-sm font-semibold text-red">
                        / {todayRejectedCount} <span className="text-xs font-normal text-text-secondary">rej.</span>
                    </span>
                </div>
                <p className="text-[11px] text-text-secondary mt-0.5">Cancelled or rejected</p>
            </article>
        </section>
    );
}
