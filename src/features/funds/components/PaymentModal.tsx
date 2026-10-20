import React, { useState, useEffect, useRef } from "react";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    realAmount: number;
    virtualAmount: number;
    onPaymentSuccess: (method: string) => void;
    formatINR: (num: number) => string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    realAmount,
    virtualAmount,
    onPaymentSuccess,
    formatINR,
}) => {
    const [selectedMethod, setSelectedMethod] = useState<"upi" | "netbanking" | "card">("upi");
    const [isProcessing, setIsProcessing] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isProcessing) onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, isProcessing, onClose]);

    if (!isOpen) return null;

    const handleConfirmPayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            const methodLabel =
                selectedMethod === "upi"
                    ? "UPI (Instant)"
                    : selectedMethod === "netbanking"
                    ? "Net Banking"
                    : "Debit Card";
            onPaymentSuccess(methodLabel);
        }, 900);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => !isProcessing && onClose()}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div
                ref={modalRef}
                className="relative w-full max-w-md bg-dash-panel border border-dash-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-10"
                role="dialog"
                aria-modal="true"
                aria-labelledby="payment-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-dash-border shrink-0 bg-dash-panel-2/50">
                    <div>
                        <h2 id="payment-title" className="text-base font-semibold text-dash-text tracking-tight">
                            Complete Deposit
                        </h2>
                        <p className="text-xs text-dash-text-muted mt-0.5">
                            Simulated test payment gateway
                        </p>
                    </div>

                    {!isProcessing && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-dash-text-muted hover:text-dash-text p-1.5 rounded-md hover:bg-dash-panel-2 transition-colors cursor-pointer"
                            aria-label="Close payment modal"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Amount Summary Card */}
                <div className="p-5 space-y-4">
                    <div className="rounded-lg border border-dash-border bg-dash-card p-4 space-y-2.5">
                        <div className="flex justify-between items-center text-xs text-dash-text-muted">
                            <span>Amount to Pay (Real INR):</span>
                            <span className="font-mono text-sm font-semibold text-dash-text">{formatINR(realAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-dash-text-muted">
                            <span>Virtual Credits (1:10):</span>
                            <span className="font-mono text-sm font-semibold text-primary-green">+{formatINR(virtualAmount)} V-INR</span>
                        </div>
                        <div className="pt-2 border-t border-dash-border flex justify-between items-center text-[11px] text-dash-text-muted">
                            <span>Settlement:</span>
                            <span className="text-dash-text font-medium">Instant Margin Addition</span>
                        </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-dash-text-muted">Choose Payment Method</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => setSelectedMethod("upi")}
                                className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                                    selectedMethod === "upi"
                                        ? "border-primary-green bg-primary-green/10 text-primary-green font-medium ring-1 ring-primary-green"
                                        : "border-dash-border bg-dash-card text-dash-text-muted hover:text-dash-text hover:border-dash-text-muted"
                                }`}
                            >
                                <svg className="w-5 h-5 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                                </svg>
                                <span className="text-xs block">UPI</span>
                            </button>

                            <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => setSelectedMethod("netbanking")}
                                className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                                    selectedMethod === "netbanking"
                                        ? "border-primary-green bg-primary-green/10 text-primary-green font-medium ring-1 ring-primary-green"
                                        : "border-dash-border bg-dash-card text-dash-text-muted hover:text-dash-text hover:border-dash-text-muted"
                                }`}
                            >
                                <svg className="w-5 h-5 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5m-15 10.5V10.5M3 21h18M4.5 10.5h15" />
                                </svg>
                                <span className="text-xs block">Net Banking</span>
                            </button>

                            <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => setSelectedMethod("card")}
                                className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                                    selectedMethod === "card"
                                        ? "border-primary-green bg-primary-green/10 text-primary-green font-medium ring-1 ring-primary-green"
                                        : "border-dash-border bg-dash-card text-dash-text-muted hover:text-dash-text hover:border-dash-text-muted"
                                }`}
                            >
                                <svg className="w-5 h-5 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-6.75 4.5h16.5a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5H3.75A2.25 2.25 0 0 0 1.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z" />
                                </svg>
                                <span className="text-xs block">Card</span>
                            </button>
                        </div>
                    </div>

                    {/* Method details simulation */}
                    <div className="p-3 rounded-md bg-dash-panel-2 border border-dash-border text-xs text-dash-text-muted">
                        {selectedMethod === "upi" && (
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary-green"></span>
                                <span>Instant UPI verification enabled. Simulated auto-approval.</span>
                            </div>
                        )}
                        {selectedMethod === "netbanking" && (
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary-green"></span>
                                <span>HDFC / SBI / ICICI direct simulation channel.</span>
                            </div>
                        )}
                        {selectedMethod === "card" && (
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary-green"></span>
                                <span>Visa / Mastercard test environment active.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer action */}
                <div className="p-5 pt-0">
                    <button
                        type="button"
                        disabled={isProcessing}
                        onClick={handleConfirmPayment}
                        className="w-full py-2.5 bg-primary-green text-white text-xs font-semibold rounded hover:bg-primary-green-hover transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Processing Payment...</span>
                            </>
                        ) : (
                            <span>Confirm & Pay {formatINR(realAmount)}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
