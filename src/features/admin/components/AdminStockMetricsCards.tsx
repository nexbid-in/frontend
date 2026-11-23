import type { AdminStockMetrics, AdminStockItem } from "@/types/adminStock";

interface AdminStockMetricsCardsProps {
    metrics?: AdminStockMetrics;
    stocks?: AdminStockItem[];
    isLoading?: boolean;
}

export function AdminStockMetricsCards({
    metrics,
    stocks = [],
    isLoading = false,
}: AdminStockMetricsCardsProps) {
    if (isLoading && !metrics) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {[1, 2, 3, 4].map((idx) => (
                    <div
                        key={idx}
                        className="rounded-xl border border-border-muted bg-card p-4 animate-pulse h-24 flex flex-col justify-between"
                    >
                        <div className="h-3 w-24 bg-panel-2 rounded" />
                        <div className="h-6 w-16 bg-panel-2 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    const {
        totalStocks = 0,
        activeStocks = 0,
        tradableStocks = 0,
    } = metrics || {};

    // Calculate split from available stocks in list or derived metrics
    const sampleEquities = stocks.filter((s) => s.type === "EQUITY").length;
    const sampleIndices = stocks.filter((s) => s.type === "INDEX").length;
    
    const activePercent = totalStocks > 0 ? Math.round((activeStocks / totalStocks) * 100) : 0;
    const tradablePercent = totalStocks > 0 ? Math.round((tradableStocks / totalStocks) * 100) : 0;

    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Total Instruments */}
            <article className="rounded-xl border border-border-muted bg-card p-4 hover:border-border-muted/80 transition-colors flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-secondary">
                    <span className="text-xs font-medium">Total Instruments</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-panel-2 text-text-secondary border border-border-muted">
                        Directory
                    </span>
                </div>
                <p className="text-xl font-bold text-text-primary mt-2">
                    {totalStocks.toLocaleString()}
                </p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                    Total instruments registered in directory
                </p>
            </article>

            {/* Active Instruments */}
            <article className="rounded-xl border border-border-muted bg-card p-4 hover:border-border-muted/80 transition-colors flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-secondary">
                    <span className="text-xs font-medium">Active Instruments</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green/10 text-green">
                        {activePercent}% live
                    </span>
                </div>
                <p className="text-xl font-bold text-green mt-2">
                    {activeStocks.toLocaleString()}
                </p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                    Visible to traders in search & watchlists
                </p>
            </article>

            {/* Tradable Instruments */}
            <article className="rounded-xl border border-border-muted bg-card p-4 hover:border-border-muted/80 transition-colors flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-secondary">
                    <span className="text-xs font-medium">Tradable Instruments</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400">
                        {tradablePercent}% eligible
                    </span>
                </div>
                <p className="text-xl font-bold text-blue-400 mt-2">
                    {tradableStocks.toLocaleString()}
                </p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                    Eligible for order placement & execution
                </p>
            </article>

            {/* Indices vs Equities Split */}
            <article className="rounded-xl border border-border-muted bg-card p-4 hover:border-border-muted/80 transition-colors flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-secondary">
                    <span className="text-xs font-medium">Indices vs Equities</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/15 text-purple-400">
                        Breakdown
                    </span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-xl font-bold text-cyan-400">{sampleEquities}</span>
                    <span className="text-xs font-medium text-text-secondary">Equity</span>
                    <span className="text-text-secondary/40 text-xs">/</span>
                    <span className="text-xl font-bold text-purple-400">{sampleIndices}</span>
                    <span className="text-xs font-medium text-text-secondary">Index</span>
                </div>
                <p className="text-[11px] text-text-secondary mt-0.5">
                    Indices are strictly view-only (non-tradable)
                </p>
            </article>
        </section>
    );
}
