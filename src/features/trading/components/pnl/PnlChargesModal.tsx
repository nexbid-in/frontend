import type { FC } from "react";
import type { PnlChargesBreakdown } from "../../types";
import { formatCurrencyINR } from "../../utils/pnlFormatters";

interface PnlChargesModalProps {
    isOpen: boolean;
    onClose: () => void;
    breakdown?: PnlChargesBreakdown;
    title?: string;
    subtitle?: string;
}

export const PnlChargesModal: FC<PnlChargesModalProps> = ({
    isOpen,
    onClose,
    breakdown,
    title = "Charges & Taxes Transparency",
    subtitle = "Itemized breakdown of all statutory levies and platform fees deducted from your gross trading returns.",
}) => {
    if (!isOpen) return null;

    const charges = breakdown ?? {
        brokerage: 0,
        stt: 0,
        exchangeTurnoverCharges: 0,
        sebiCharges: 0,
        stampDuty: 0,
        gst: 0,
        totalCharges: 0,
    };

    const items = [
        {
            key: "brokerage",
            name: "Brokerage",
            description: "Platform transaction execution fee",
            amount: charges.brokerage,
            badge: "Platform Fee",
            badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
        },
        {
            key: "stt",
            name: "Securities Transaction Tax (STT)",
            description: "Direct tax levied by Central Government on traded securities",
            amount: charges.stt,
            badge: "Govt. Tax",
            badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        },
        {
            key: "exchangeTurnoverCharges",
            name: "Exchange Turnover Charges",
            description: "Transaction charges levied by NSE / BSE for infrastructure use",
            amount: charges.exchangeTurnoverCharges,
            badge: "Exchange Fee",
            badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
        },
        {
            key: "sebiCharges",
            name: "SEBI Turnover Charges",
            description: "Regulatory fee mandated by Securities & Exchange Board of India",
            amount: charges.sebiCharges,
            badge: "Regulatory",
            badgeColor: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
        },
        {
            key: "stampDuty",
            name: "Stamp Duty",
            description: "Indian Stamp Act duty levied by State Governments on buy transactions",
            amount: charges.stampDuty,
            badge: "State Levy",
            badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        },
        {
            key: "gst",
            name: "GST (18%)",
            description: "Goods & Services Tax applied to Brokerage + Exchange + SEBI fees",
            amount: charges.gst,
            badge: "Govt. Tax",
            badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/30",
        },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="w-full max-w-lg bg-dash-panel border border-dash-border rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-5 border-b border-dash-border shrink-0">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-dash-text">{title}</h2>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary-green/10 text-primary-green border border-primary-green/20">
                                100% Transparent
                            </span>
                        </div>
                        <p className="text-xs text-dash-text-muted mt-1 leading-relaxed">
                            {subtitle}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-dash-text-muted hover:text-dash-text p-1.5 rounded-lg hover:bg-dash-panel-2 transition-colors cursor-pointer"
                        aria-label="Close modal"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Items List */}
                <div className="p-5 overflow-y-auto custom-scrollbar space-y-2.5">
                    {items.map((item) => (
                        <div
                            key={item.key}
                            className="p-3 bg-dash-panel-2 border border-dash-border rounded-lg flex items-center justify-between gap-3 hover:border-dash-border-hover transition-colors"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-semibold text-dash-text">
                                        {item.name}
                                    </span>
                                    <span className={`text-[9px] font-medium px-1.5 py-0.2 rounded border ${item.badgeColor}`}>
                                        {item.badge}
                                    </span>
                                </div>
                                <p className="text-[11px] text-dash-text-muted truncate mt-0.5">
                                    {item.description}
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="font-mono text-sm font-bold text-dash-text">
                                    {formatCurrencyINR(item.amount, false)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Sum */}
                <div className="p-5 border-t border-dash-border bg-dash-panel-2/50 shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="text-xs font-bold text-dash-text uppercase tracking-wider block">
                                Total Trade Deductions
                            </span>
                            <span className="text-[10px] text-dash-text-muted">
                                Deducted automatically from trade gross returns
                            </span>
                        </div>
                        <span className="text-xl font-black font-mono text-dash-text">
                            {formatCurrencyINR(charges.totalCharges, false)}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2 px-4 rounded-lg bg-dash-panel-2 hover:bg-dash-panel-3 text-dash-text border border-dash-border text-xs font-semibold transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
