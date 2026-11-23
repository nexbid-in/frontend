import type { FC } from "react";
import type { PnlSummary, PnlHeatmapSummary } from "../../types";
import { formatCurrencyINR } from "../../utils/pnlFormatters";

interface PnlVerifiedModalProps {
    isOpen: boolean;
    onClose: () => void;
    summary?: PnlSummary;
    heatmap?: PnlHeatmapSummary;
    fromDate?: string;
    toDate?: string;
    userName?: string;
}

export const PnlVerifiedModal: FC<PnlVerifiedModalProps> = ({
    isOpen,
    onClose,
    summary,
    heatmap,
    fromDate,
    toDate,
    userName = "Trader",
}) => {
    if (!isOpen) return null;

    const netRealized = summary?.netRealizedPnL ?? 0;
    const isPositive = netRealized >= 0;
    const greenDays = heatmap?.greenDays ?? 0;
    const redDays = heatmap?.redDays ?? 0;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="w-full max-w-md bg-dash-panel border border-dash-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-dash-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-blue-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                            </svg>
                        </span>
                        <h3 className="text-base font-bold text-dash-text">Verified P&L</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-dash-text-muted hover:text-dash-text p-1 rounded hover:bg-dash-panel-2 cursor-pointer transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Verified Card Preview */}
                <div className="p-6">
                    <div className="p-5 rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/5 via-dash-panel-2 to-dash-panel relative overflow-hidden shadow-inner">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <span className="text-[11px] font-mono text-dash-text-muted block">
                                    NEXBID VERIFIED P&L
                                </span>
                                <span className="text-base font-bold text-dash-text">
                                    {userName}
                                </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px] font-bold">
                                ✓ Authenticated
                            </span>
                        </div>

                        <div className="my-3">
                            <span className="text-[11px] text-dash-text-muted block mb-0.5">
                                Net Realised P&L ({fromDate ?? "FY"} ~ {toDate ?? "Now"})
                            </span>
                            <span className={`text-2xl font-black font-mono ${isPositive ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                                {formatCurrencyINR(netRealized, true)}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono text-dash-text-muted pt-3 border-t border-dash-border">
                            <div>
                                <span className="text-dash-text font-bold text-[#22c55e]">{greenDays}</span> Green Days
                            </div>
                            <div>
                                <span className="text-dash-text font-bold text-[#ef4444]">{redDays}</span> Red Days
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-dash-text-muted mt-4 text-center leading-relaxed">
                        Verified P&L allows you to share your trade performance transparently backed by tamper-proof exchange fill logs.
                    </p>
                </div>

                {/* Footer */}
                <div className="p-4 bg-dash-panel-2/50 border-t border-dash-border flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
