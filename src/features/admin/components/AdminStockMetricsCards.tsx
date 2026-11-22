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
        totalSectors = 0,
    } = metrics || {};

    // Calculate split from available stocks in list or derived metrics
    const sampleEquities = stocks.filter((s) => s.type === "EQUITY").length;
    const sampleIndices = stocks.filter((s) => s.type === "INDEX").length;
    
    const activePercent = totalStocks > 0 ? Math.round((activeStocks / totalStocks) * 100) : 0;
    const tradablePercent = totalStocks > 0 ? Math.round((tradableStocks / totalStocks) * 100) : 0;

    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Total Instruments */}
            <article className="rounded-xl border border-border-muted bg-card p-4 hover:border-border-muted/80 transition-colors">
                <div className="flex items-center justify-between text-text-secondary">
                    <span className="text-xs font-medium">Total Instruments</span>
                    <div className="w-7 h-7 rounded-lg bg-panel-2 flex items-center justify-center text-text-primary">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="12" width="4" height="8" rx="1" strokeWidth="2" />
                            <rect x="10" y="8" width="4" height="12" rx="1" strokeWidth="2" />
                            <rect x="17" y="4" width="4" height="16" rx="1" strokeWidth="2" />
                        </svg>
                    </div>
                </div>
                <p className="text-xl font-bold text-text-primary mt-2">
                    {totalStocks.toLocaleString()}
                </p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                    Catalog across <span className="text-text-primary font-medium">{totalSectors}</span> {totalSectors === 1 ? "sector" : "sectors"}
                </p>
            </article>

            {/* Active Instruments */}
            <article className="rounded-xl border border-border-muted bg-card p-4 hover:border-border-muted/80 transition-colors">
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
            <article className="rounded-xl border border-border-muted bg-card p-4 hover:border-border-muted/80 transition-colors">
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
            <article className="rounded-xl border border-border-muted bg-card p-4 hover:border-border-muted/80 transition-colors">
                <div className="flex items-center justify-between text-text-secondary">
                    <span className="text-xs font-medium">Indices vs Equities</span>
                    <div className="w-7 h-7 rounded-lg bg-panel-2 flex items-center justify-center text-text-primary">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                        </svg>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        EQUITY {sampleEquities > 0 ? `(${sampleEquities})` : ""}
                    </span>
                    <span className="text-text-secondary text-xs">/</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        INDEX {sampleIndices > 0 ? `(${sampleIndices})` : ""}
                    </span>
                </div>
                <p className="text-[11px] text-text-secondary mt-1">
                    Indices are strictly view-only (non-tradable)
                </p>
            </article>
        </section>
    );
}
