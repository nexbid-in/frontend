import React, { useEffect, useRef } from "react";
import type { TransactionRecord } from "../types";

interface StatementModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactions: TransactionRecord[];
    formatINR: (num: number) => string;
}

export const StatementModal: React.FC<StatementModalProps> = ({
    isOpen,
    onClose,
    transactions,
    formatINR,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const totalRealDeposited = transactions
        .filter((t) => t.status === "Completed")
        .reduce((sum, t) => sum + t.realAmount, 0);

    const totalVirtualReceived = transactions
        .filter((t) => t.status === "Completed")
        .reduce((sum, t) => sum + t.virtualAmount, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div
                ref={modalRef}
                className="relative w-full max-w-3xl max-h-[85vh] bg-dash-panel border border-dash-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-10"
                role="dialog"
                aria-modal="true"
                aria-labelledby="statement-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-dash-border shrink-0 bg-dash-panel-2/50">
                    <div>
                        <div className="flex items-center gap-2">
                            <svg
                                className="w-4 h-4 text-primary-green"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                                <path d="M14 8H8" />
                                <path d="M16 12H8" />
                                <path d="M13 16H8" />
                            </svg>
                            <h2 id="statement-title" className="text-base font-semibold text-dash-text tracking-tight">
                                Funds Statement & Ledger
                            </h2>
                        </div>
                        <p className="text-xs text-dash-text-muted mt-0.5">
                            Detailed transaction record of deposits and virtual margin allocations
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-dash-text-muted hover:text-dash-text p-1.5 rounded-md hover:bg-dash-panel-2 transition-colors cursor-pointer"
                        aria-label="Close statement modal"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Summary Metrics Banner */}
                <div className="grid grid-cols-2 gap-4 px-6 py-3 bg-dash-card border-b border-dash-border shrink-0">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-dash-text-muted">Total Real Deposited:</span>
                        <span className="font-mono font-semibold text-dash-text">{formatINR(totalRealDeposited)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-dash-text-muted">Total Virtual Margin Received:</span>
                        <span className="font-mono font-semibold text-primary-green">{formatINR(totalVirtualReceived)} V-INR</span>
                    </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <svg
                                className="w-12 h-12 text-dash-text-muted/40 mx-auto mb-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <p className="text-sm font-medium text-dash-text">No Transactions Found</p>
                            <p className="text-xs text-dash-text-muted mt-1">Your transaction history will appear here once you buy virtual funds.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-dash-border text-dash-text-muted uppercase text-[10px] tracking-wider">
                                        <th className="pb-2.5 font-medium">Date & Time</th>
                                        <th className="pb-2.5 font-medium">Txn Ref</th>
                                        <th className="pb-2.5 font-medium">Type</th>
                                        <th className="pb-2.5 font-medium">Method</th>
                                        <th className="pb-2.5 font-medium text-right">Real INR</th>
                                        <th className="pb-2.5 font-medium text-right">Virtual Credited</th>
                                        <th className="pb-2.5 font-medium text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dash-border">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-dash-panel-2/50 transition-colors">
                                            <td className="py-3 text-dash-text whitespace-nowrap">{tx.date}</td>
                                            <td className="py-3 font-mono text-[11px] text-dash-text-muted whitespace-nowrap">{tx.txnNumber}</td>
                                            <td className="py-3 text-dash-text font-medium whitespace-nowrap">{tx.type}</td>
                                            <td className="py-3 text-dash-text-muted whitespace-nowrap">{tx.paymentMethod}</td>
                                            <td className="py-3 font-mono text-right text-dash-text whitespace-nowrap">{formatINR(tx.realAmount)}</td>
                                            <td className="py-3 font-mono font-medium text-right text-primary-green whitespace-nowrap">
                                                +{formatINR(tx.virtualAmount)}
                                            </td>
                                            <td className="py-3 text-right whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-green bg-primary-green/10 px-2 py-0.5 rounded">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-green"></span>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-3.5 border-t border-dash-border bg-dash-panel-2/50 shrink-0">
                    <span className="text-xs text-dash-text-muted">Showing {transactions.length} record(s)</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-medium rounded-md border border-dash-border text-dash-text hover:bg-dash-card transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
