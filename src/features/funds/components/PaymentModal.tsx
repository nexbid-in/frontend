import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { showToast } from "@/store/uiSlice";
import { fundsService } from "../services/fundsService";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import type { RazorpayOptions, RazorpayFailureResponse } from "@/types/razorpay";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    realAmount: number;
    virtualAmount: number;
    conversionRate?: number;
    onPaymentSuccess: (virtualAmountAdded: number, newBalance: number) => void;
    formatINR: (num: number) => string;
}

type PaymentStep = "idle" | "creating_order" | "awaiting_payment" | "verifying" | "success" | "error";

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    realAmount,
    virtualAmount,
    conversionRate = 10,
    onPaymentSuccess,
    formatINR,
}) => {
    const dispatch = useAppDispatch();
    const authUser = useAppSelector((state) => state.auth.user);
    const [step, setStep] = useState<PaymentStep>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Track active order and outcome to manage modal dismissals & failure transitions
    const currentOrderIdRef = useRef<string | null>(null);
    const hasFailedRef = useRef<boolean>(false);
    const hasSucceededRef = useRef<boolean>(false);
    const latestFailureAttemptRef = useRef<{ paymentId?: string | null; reason: string } | null>(null);

    // Reset state when modal is opened or closed
    useEffect(() => {
        if (isOpen) {
            setStep("idle");
            setErrorMessage(null);
            currentOrderIdRef.current = null;
            hasFailedRef.current = false;
            hasSucceededRef.current = false;
            latestFailureAttemptRef.current = null;
        }
    }, [isOpen]);

    // Handle ESC key (disabled when actively processing/verifying)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && step !== "verifying" && step !== "creating_order") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, step, onClose]);

    if (!isOpen) return null;

    const handleInitiatePayment = async () => {
        try {
            setStep("creating_order");
            setErrorMessage(null);
            hasFailedRef.current = false;
            hasSucceededRef.current = false;
            latestFailureAttemptRef.current = null;

            // 1. Ensure Razorpay SDK script is loaded
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded || !window.Razorpay) {
                throw new Error("Unable to load Razorpay payment gateway. Please check your internet connection.");
            }

            // 2. Call backend to create Razorpay Order & internal PaymentOrder
            const order = await fundsService.createTopupOrder(Math.round(realAmount));
            currentOrderIdRef.current = order.orderId;

            // 3. Prepare Razorpay Checkout Options
            const options: RazorpayOptions = {
                key: order.keyId,
                amount: order.amount, // amount in paise
                currency: order.currency || "INR",
                name: "NexBid",
                description: `Virtual Margin Top-up (+${order.virtualAmount.toLocaleString("en-IN")} V-INR)`,
                order_id: order.orderId,
                prefill: {
                    name: authUser ? `${authUser.firstName} ${authUser.lastName}`.trim() : undefined,
                    email: authUser?.email,
                },
                theme: {
                    color: "#10b981", // primary green
                    backdrop_color: "rgba(0, 0, 0, 0.75)",
                },
                modal: {
                    ondismiss: async () => {
                        // If already succeeded or verifying, ignore modal dismissal
                        if (hasSucceededRef.current || step === "verifying" || step === "success") {
                            return;
                        }

                        const activeOrderId = currentOrderIdRef.current;
                        const failedAttempt = latestFailureAttemptRef.current;

                        // 1. Notify backend so the PENDING order is transitioned to FAILED in DB
                        if (activeOrderId) {
                            const reason = failedAttempt?.reason || "Payment window closed by user";
                            const paymentId = failedAttempt?.paymentId || null;

                            try {
                                await fundsService.failTopupPayment({
                                    orderId: activeOrderId,
                                    paymentId,
                                    reason,
                                });
                            } catch (e) {
                                console.error("Failed to notify server of payment cancellation:", e);
                            }
                        }

                        // 2. Transition frontend UI
                        if (failedAttempt) {
                            // User experienced a bank/card decline in the gateway and closed the modal
                            hasFailedRef.current = true;
                            setErrorMessage(failedAttempt.reason);
                            setStep("error");
                            dispatch(
                                showToast({
                                    type: "error",
                                    title: "Payment Incomplete",
                                    message: failedAttempt.reason,
                                    duration: 5000,
                                })
                            );
                        } else {
                            // User closed the gateway before attempting payment
                            dispatch(
                                showToast({
                                    type: "info",
                                    title: "Payment Cancelled",
                                    message: "Top-up was cancelled before completing payment.",
                                    duration: 4000,
                                })
                            );
                            setStep("idle");
                        }
                    },
                },
                handler: async (response) => {
                    try {
                        hasSucceededRef.current = true;
                        setStep("verifying");

                        // 4. Verify payment signature with backend
                        const verification = await fundsService.verifyTopupPayment({
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                        });

                        if (verification.success) {
                            setStep("success");
                            setTimeout(() => {
                                onPaymentSuccess(verification.virtualAmountAdded, verification.balance);
                            }, 700);
                        } else {
                            throw new Error("Payment verification failed on server");
                        }
                    } catch (err: unknown) {
                        hasSucceededRef.current = false;
                        hasFailedRef.current = true;
                        const message = err instanceof Error ? err.message : "Payment verification failed";
                        setErrorMessage(message);
                        setStep("error");
                        dispatch(
                            showToast({
                                type: "error",
                                title: "Payment Verification Failed",
                                message,
                                duration: 6000,
                            })
                        );
                    }
                },
            };

            // 4. Instantiate and launch Razorpay Checkout modal
            const rzp = new window.Razorpay(options);

            // Handle individual payment attempt decline/failure inside Razorpay.
            // In industry-standard gateways, an attempt failure does NOT terminate the Order.
            // Razorpay keeps the modal open to let the user retry with another method.
            // We record the latest failure details and only finalize the failure if the user exits (ondismiss).
            rzp.on("payment.failed", (failure: RazorpayFailureResponse) => {
                console.warn("Razorpay payment attempt declined/failed (retry available in modal):", failure);

                const desc =
                    failure?.error?.description ||
                    failure?.error?.reason ||
                    "Payment was declined by bank or cancelled.";
                const failedPaymentId = failure?.error?.metadata?.payment_id || null;

                latestFailureAttemptRef.current = {
                    paymentId: failedPaymentId,
                    reason: desc,
                };
            });

            setStep("awaiting_payment");
            rzp.open();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to initiate payment";
            setErrorMessage(message);
            setStep("error");
        }
    };

    const isBusy = step === "creating_order" || step === "verifying";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
                onClick={() => !isBusy && onClose()}
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
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-green/10 border border-primary-green/20 flex items-center justify-center text-primary-green">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h2 id="payment-title" className="text-sm font-semibold text-dash-text tracking-tight">
                                Complete Deposit
                            </h2>
                            <p className="text-xs text-dash-text-muted">
                                Secured by Razorpay Payment Gateway
                            </p>
                        </div>
                    </div>

                    {!isBusy && (
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

                {/* Body Content */}
                <div className="p-5 space-y-4">
                    {/* Error State Banner */}
                    {step === "error" && errorMessage && (
                        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in duration-200">
                            <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-rose-200">Payment Unsuccessful</p>
                                <p className="text-[11px] text-rose-300/90 mt-0.5 leading-relaxed">{errorMessage}</p>
                                <p className="text-[10px] text-dash-text-muted mt-1.5">
                                    Track this attempt, Order ID, and status anytime in <strong className="text-dash-text">Top-up History</strong>.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Verifying / Success State Banner */}
                    {step === "verifying" && (
                        <div className="p-4 rounded-lg bg-primary-green/10 border border-primary-green/20 text-center space-y-2">
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-green/20 text-primary-green animate-spin mx-auto">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            </div>
                            <p className="text-xs font-semibold text-primary-green">Verifying Payment With Server...</p>
                            <p className="text-[11px] text-dash-text-muted">Please do not close or refresh this window.</p>
                        </div>
                    )}

                    {step === "success" && (
                        <div className="p-4 rounded-lg bg-primary-green/10 border border-primary-green/20 text-center space-y-1.5">
                            <div className="w-8 h-8 rounded-full bg-primary-green/20 text-primary-green inline-flex items-center justify-center mx-auto">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <p className="text-xs font-semibold text-primary-green">Payment Verified!</p>
                            <p className="text-[11px] text-dash-text-muted">Crediting your virtual trading margin...</p>
                        </div>
                    )}

                    {/* Amount Summary Breakdown Card */}
                    <div className="rounded-lg border border-dash-border bg-dash-card p-4 space-y-3">
                        <div className="flex justify-between items-center text-xs text-dash-text-muted">
                            <span>Amount to Pay (Real INR):</span>
                            <span className="font-mono text-sm font-semibold text-dash-text">{formatINR(realAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-dash-text-muted">
                            <span>Virtual Credits (1:{conversionRate}):</span>
                            <span className="font-mono text-sm font-semibold text-primary-green">+{formatINR(virtualAmount)} V-INR</span>
                        </div>
                        <div className="pt-2.5 border-t border-dash-border space-y-1.5 text-[11px] text-dash-text-muted">
                            <div className="flex justify-between items-center">
                                <span>Conversion Rate:</span>
                                <span className="font-mono text-dash-text">₹1.00 Real = ₹{conversionRate}.00 Virtual</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Settlement:</span>
                                <span className="text-dash-text font-medium">Instant Margin Addition (T+0)</span>
                            </div>
                        </div>
                    </div>

                    {/* Supported Methods Showcase */}
                    <div className="rounded-lg border border-dash-border bg-dash-panel-2 p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-dash-text">Supported Payment Modes</span>
                            <span className="text-[10px] font-medium text-primary-green bg-primary-green/10 px-2 py-0.5 rounded">
                                Instant Approval
                            </span>
                        </div>
                        <p className="text-[11px] text-dash-text-muted leading-relaxed">
                            Pay seamlessly using <strong className="text-dash-text">UPI</strong> (Google Pay, PhonePe, Paytm, BHIM), <strong className="text-dash-text">Net Banking</strong> (all major Indian banks), or <strong className="text-dash-text">Debit/Credit Cards</strong>.
                        </p>
                    </div>

                    {/* Trust and Security Badge */}
                    <div className="flex items-center justify-center gap-2 text-[11px] text-dash-text-muted pt-1">
                        <svg className="w-3.5 h-3.5 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span>256-Bit Encrypted & RBI Compliant Gateway</span>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                    {step === "error" ? (
                        <div className="flex gap-2.5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 border border-dash-border text-dash-text text-xs font-semibold rounded hover:bg-dash-card transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={handleInitiatePayment}
                                className="flex-1 py-2.5 bg-primary-green text-white text-xs font-semibold rounded hover:bg-primary-green-hover transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                                <span>Retry Payment</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            disabled={isBusy || step === "success"}
                            onClick={handleInitiatePayment}
                            className="w-full py-2.5 bg-primary-green text-white text-xs font-semibold rounded hover:bg-primary-green-hover transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow"
                        >
                            {step === "creating_order" ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Opening Razorpay Checkout...</span>
                                </>
                            ) : step === "verifying" ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Verifying Payment...</span>
                                </>
                            ) : step === "success" ? (
                                <span>Success!</span>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-6.75 4.5h16.5a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5H3.75A2.25 2.25 0 0 0 1.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z" />
                                    </svg>
                                    <span>Pay {formatINR(realAmount)} via Razorpay</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
