import React, { useState, useEffect, useCallback } from "react";
import { useAppDispatch } from "@/store/hooks";
import { showToast } from "@/store/uiSlice";
import { fundsService } from "../services/fundsService";
import type { WalletOverviewDTO } from "../types";
import { StatementModal } from "../components/StatementModal";
import { PaymentModal } from "../components/PaymentModal";

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

// Standard Indian Currency Number Formatter
const formatINR = (number: number) => {
    return (
        "₹ " +
        number.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    );
};

export const FundsPage: React.FC = () => {
    const dispatch = useAppDispatch();

    // Backend Wallet Overview State
    const [overview, setOverview] = useState<WalletOverviewDTO | null>(null);
    const [isLoadingOverview, setIsLoadingOverview] = useState<boolean>(true);
    const [overviewError, setOverviewError] = useState<string | null>(null);

    // Deposit Input State
    const [depositAmount, setDepositAmount] = useState<string>("1000");
    const [activePreset, setActivePreset] = useState<number | null>(1000);

    // Modals
    const [isStatementOpen, setIsStatementOpen] = useState<boolean>(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);

    // Fetch Wallet Overview from API
    const fetchOverview = useCallback(async () => {
        try {
            setIsLoadingOverview(true);
            setOverviewError(null);
            const data = await fundsService.getOverview();
            setOverview(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to load wallet overview";
            setOverviewError(message);
            dispatch(
                showToast({
                    type: "error",
                    title: "Funds Error",
                    message,
                })
            );
        } finally {
            setIsLoadingOverview(false);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchOverview();
    }, [fetchOverview]);

    // Live Calculations
    const conversionRate = overview?.exchangeRate?.ratio ?? 10;
    const availableBalance = overview?.balance ?? 0;
    const numericReal = parseFloat(depositAmount) || 0;
    const virtualReceived = numericReal > 0 ? numericReal * conversionRate : 0;
    const projectedBalance = availableBalance + virtualReceived;

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setDepositAmount(val);

        const parsed = parseFloat(val);
        if (PRESET_AMOUNTS.includes(parsed)) {
            setActivePreset(parsed);
        } else {
            setActivePreset(null);
        }
    };

    const handleSelectPreset = (amount: number) => {
        setDepositAmount(amount.toString());
        setActivePreset(amount);
    };

    const handleOpenPayment = () => {
        if (numericReal <= 0) {
            dispatch(
                showToast({
                    type: "error",
                    title: "Invalid Amount",
                    message: "Please enter a valid deposit amount greater than ₹0.",
                })
            );
            return;
        }
        setIsPaymentOpen(true);
    };

    const handlePaymentSuccess = (paymentMethod: string) => {
        // Optimistically update local view while refreshing from API
        const newVirtualCredit = numericReal * conversionRate;
        if (overview) {
            setOverview({
                ...overview,
                balance: overview.balance + newVirtualCredit,
                totalVirtualMoneyBought: overview.totalVirtualMoneyBought + newVirtualCredit,
                totalRealMoneyUsed: overview.totalRealMoneyUsed + numericReal,
            });
        }

        setIsPaymentOpen(false);

        dispatch(
            showToast({
                type: "success",
                title: "Margin Credited Successfully",
                message: `${formatINR(newVirtualCredit)} V-INR has been added via ${paymentMethod}.`,
                duration: 5000,
            })
        );

        // Re-fetch overview from backend
        fetchOverview();
    };

    const renderTradingStatus = (status: string | undefined) => {
        const normalized = (status || "ACTIVE").toUpperCase();
        if (normalized === "ACTIVE") {
            return (
                <span className="text-primary-green font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-green animate-pulse"></span>
                    Active
                </span>
            );
        }
        if (normalized === "FROZEN") {
            return (
                <span className="text-amber-400 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Frozen
                </span>
            );
        }
        return (
            <span className="text-rose-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                Suspended
            </span>
        );
    };

    return (
        <div className="h-full p-4 overflow-hidden">
            <section className="h-full bg-dash-panel border border-dash-border rounded-lg p-5 flex flex-col overflow-hidden">
                {/* Section Header */}
                <div className="flex items-center justify-between pb-4 border-b border-dash-border shrink-0">
                    <div>
                        <h1 className="text-base font-semibold text-dash-text tracking-tight">Funds Management</h1>
                        <p className="text-xs text-dash-text-muted mt-0.5">
                            Manage virtual trading margin and view transaction history
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Refresh Button */}
                        <button
                            type="button"
                            onClick={fetchOverview}
                            disabled={isLoadingOverview}
                            className="inline-flex items-center gap-1.5 text-xs text-dash-text-muted hover:text-dash-text transition-colors cursor-pointer disabled:opacity-50"
                            title="Refresh overview"
                        >
                            <svg
                                className={`w-3.5 h-3.5 ${isLoadingOverview ? "animate-spin text-primary-green" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                                />
                            </svg>
                            <span className="hidden sm:inline">Refresh</span>
                        </button>

                        {/* View Statement Button */}
                        <button
                            type="button"
                            id="openStatementBtn"
                            onClick={() => setIsStatementOpen(true)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-green hover:text-primary-green-hover transition-colors cursor-pointer"
                        >
                            <svg
                                className="w-3.5 h-3.5"
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
                            <span>View Statement</span>
                        </button>
                    </div>
                </div>

                {/* Optional Error Alert Banner */}
                {overviewError && (
                    <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between shrink-0">
                        <span>Failed to sync wallet data: {overviewError}</span>
                        <button
                            type="button"
                            onClick={fetchOverview}
                            className="text-xs font-medium underline text-rose-300 hover:text-rose-200 cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Main Body: Two Columns */}
                <div className="flex-1 pt-4 grid grid-cols-1 lg:grid-cols-2 gap-5 overflow-hidden">
                    {/* LEFT SIDE: Available Virtual Balance (Top) and Capital & Margin Details (Bottom) */}
                    <div className="flex flex-col gap-4 h-full overflow-hidden">
                        {/* 1. Available Virtual Balance Card */}
                        <div className="rounded-lg border border-dash-border bg-dash-panel-2 p-5 shrink-0">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-dash-text-muted uppercase tracking-wider">
                                    Available Virtual Balance
                                </span>
                                <span className="text-[11px] font-medium text-primary-green bg-primary-green/10 px-2 py-0.5 rounded">
                                    Active Margin
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2 mt-2">
                                {isLoadingOverview && !overview ? (
                                    <div className="h-9 w-48 bg-dash-border/60 rounded animate-pulse my-0.5"></div>
                                ) : (
                                    <p
                                        id="availableVirtualDisplay"
                                        className="text-3xl font-semibold text-dash-text font-mono tracking-tight"
                                    >
                                        {formatINR(availableBalance)}
                                    </p>
                                )}
                                <span className="text-xs text-dash-text-muted font-medium">V-INR</span>
                            </div>
                            <p className="text-xs text-dash-text-muted mt-1">
                                Usable trading balance available for executing market orders and open positions.
                            </p>
                        </div>

                        {/* 2. Capital & Margin Details Card */}
                        <div className="rounded-lg border border-dash-border bg-dash-panel-2 p-5 flex-1 flex flex-col justify-between overflow-hidden">
                            <div>
                                <h2 className="text-sm font-semibold text-dash-text border-b border-dash-border pb-3">
                                    Capital & Margin Details
                                </h2>

                                <div className="space-y-3.5 text-xs pt-3.5">
                                    <div className="flex justify-between items-center text-dash-text-muted">
                                        <span>Available Margin</span>
                                        {isLoadingOverview && !overview ? (
                                            <div className="h-4 w-24 bg-dash-border/60 rounded animate-pulse"></div>
                                        ) : (
                                            <span className="font-mono font-medium text-dash-text">
                                                {formatINR(availableBalance)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center text-dash-text-muted">
                                        <span>Used Margin (Open Positions)</span>
                                        {isLoadingOverview && !overview ? (
                                            <div className="h-4 w-20 bg-dash-border/60 rounded animate-pulse"></div>
                                        ) : (
                                            <span className="font-mono font-medium text-dash-text">
                                                {formatINR(overview?.usedMargin ?? 0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="pt-3 border-t border-dash-border flex justify-between items-center text-dash-text-muted">
                                        <span className="font-medium text-dash-text">Total Virtual Money Bought</span>
                                        {isLoadingOverview && !overview ? (
                                            <div className="h-4 w-28 bg-dash-border/60 rounded animate-pulse"></div>
                                        ) : (
                                            <span
                                                id="totalVirtualDisplay"
                                                className="font-mono font-semibold text-dash-text"
                                            >
                                                {formatINR(overview?.totalVirtualMoneyBought ?? 0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center text-dash-text-muted">
                                        <span className="font-medium text-dash-text">Total Real Money Used</span>
                                        {isLoadingOverview && !overview ? (
                                            <div className="h-4 w-24 bg-dash-border/60 rounded animate-pulse"></div>
                                        ) : (
                                            <span id="totalRealDisplay" className="font-mono font-semibold text-dash-text">
                                                {formatINR(overview?.totalRealMoneyUsed ?? 0)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Account & Settlement Status */}
                            <div className="pt-3 border-t border-dash-border space-y-2.5 text-xs text-dash-text-muted">
                                <div className="flex items-center justify-between">
                                    <span>Trading Status</span>
                                    {renderTradingStatus(overview?.tradingStatus)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Settlement Cycle</span>
                                    <span className="text-dash-text font-mono text-[11px]">Instant (T+0)</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Virtual Currency</span>
                                    <span className="text-dash-text font-mono text-[11px]">V-INR</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Buy Virtual Money */}
                    <div className="rounded-lg border border-dash-border bg-dash-panel-2 p-5 h-full flex flex-col justify-between overflow-hidden">
                        <div className="space-y-4">
                            <div className="border-b border-dash-border pb-3">
                                <h2 className="text-sm font-semibold text-dash-text">Buy Virtual Money</h2>
                                <p className="text-xs text-dash-text-muted mt-0.5">
                                    Enter the real amount in INR. Virtual credits will be added to your available margin automatically at a 1:{conversionRate} ratio.
                                </p>
                            </div>

                            {/* Real Money Input & Quick Presets */}
                            <div className="space-y-2.5">
                                <label
                                    htmlFor="realAmountInput"
                                    className="block text-xs font-medium text-dash-text-muted"
                                >
                                    Deposit Amount (Real INR)
                                </label>

                                <div className="relative flex items-center">
                                    <span className="absolute left-3.5 text-sm font-medium text-dash-text-muted select-none">
                                        ₹
                                    </span>
                                    <input
                                        type="number"
                                        id="realAmountInput"
                                        value={depositAmount}
                                        onChange={handleAmountChange}
                                        min="100"
                                        step="100"
                                        placeholder="Enter amount"
                                        className="w-full bg-dash-card border border-dash-border rounded-md pl-8 pr-16 py-2.5 text-sm font-medium text-dash-text focus:outline-none focus:border-primary-green transition-colors font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <span className="absolute right-3.5 text-xs font-medium text-dash-text-muted">
                                        INR
                                    </span>
                                </div>

                                {/* Preset Amount Buttons */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {PRESET_AMOUNTS.map((amt) => {
                                        const isSelected = activePreset === amt;
                                        return (
                                            <button
                                                key={amt}
                                                type="button"
                                                onClick={() => handleSelectPreset(amt)}
                                                className={`preset-btn px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer ${
                                                    isSelected
                                                        ? "border-primary-green bg-dash-card text-primary-green font-medium"
                                                        : "border-dash-border bg-dash-card text-dash-text-muted hover:text-dash-text hover:border-dash-text-muted"
                                                }`}
                                            >
                                                ₹{amt.toLocaleString("en-IN")}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Automatic Live Calculation Ledger Table */}
                            <div className="rounded-md border border-dash-border bg-dash-card p-4 space-y-3">
                                <div className="flex justify-between items-center text-xs text-dash-text-muted">
                                    <span>Exchange Rate:</span>
                                    <span className="font-mono text-dash-text">
                                        ₹{overview?.exchangeRate?.real ?? 1}.00 Real = ₹{conversionRate}.00 Virtual
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-dash-text-muted">
                                    <span>Real Money to Deposit:</span>
                                    <span id="summaryRealAmount" className="font-mono text-dash-text">
                                        {formatINR(numericReal)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-2.5 border-t border-dash-border">
                                    <span className="text-xs font-medium text-dash-text">
                                        Virtual Money to Receive:
                                    </span>
                                    <span
                                        id="virtualAmountDisplay"
                                        className="font-mono text-base font-semibold text-primary-green"
                                    >
                                        {formatINR(virtualReceived)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-dash-text-muted pt-1">
                                    <span>Projected Available Margin:</span>
                                    <span id="projectedBalance" className="font-mono text-dash-text font-medium">
                                        {formatINR(projectedBalance)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-3">
                            <button
                                type="button"
                                id="proceedPaymentBtn"
                                onClick={handleOpenPayment}
                                className="w-full py-2.5 bg-primary-green text-white text-xs font-semibold rounded hover:bg-primary-green-hover transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
                            >
                                <span id="proceedBtnText">Proceed to Payment</span>
                            </button>
                            <p className="text-[11px] text-center text-dash-text-muted mt-2">
                                Instant credit to your virtual trading margin upon confirmation.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statement Ledger History Modal (Live API integration) */}
            <StatementModal
                isOpen={isStatementOpen}
                onClose={() => setIsStatementOpen(false)}
                overview={overview}
                formatINR={formatINR}
            />

            {/* Payment Checkout Modal */}
            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                realAmount={numericReal}
                virtualAmount={virtualReceived}
                onPaymentSuccess={handlePaymentSuccess}
                formatINR={formatINR}
            />
        </div>
    );
};
