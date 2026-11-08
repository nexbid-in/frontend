import React, { useState, useEffect, useMemo, useRef } from "react";
import { usePlaceOrderMutation } from "../hooks/useTrading";
import { useWalletOverview } from "@/features/funds";
import { useLiveStockQuote, formatINR } from "@/features/watchlist";
import type { OrderSide, OrderType, ProductType } from "../types";

export interface OrderPlacementModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialSymbol?: string;
    initialSide?: OrderSide;
    initialExchange?: string;
    stockName?: string;
    initialPrice?: number;
}

interface OrderPlacementFormProps {
    onClose: () => void;
    initialSymbol: string;
    initialSide: OrderSide;
    initialExchange: string;
    stockName?: string;
    initialPrice?: number;
}

const OrderPlacementForm: React.FC<OrderPlacementFormProps> = ({
    onClose,
    initialSymbol,
    initialSide,
    initialExchange,
    stockName,
    initialPrice,
}) => {
    const symbol = initialSymbol.toUpperCase().trim();
    const liveQuote = useLiveStockQuote(symbol);
    const { data: wallet } = useWalletOverview({ enabled: true });
    const placeOrderMutation = usePlaceOrderMutation();

    // Current applicable price
    const currentPrice = liveQuote.price > 0 ? liveQuote.price : initialPrice ?? 0;

    // Form states initialize cleanly with the props (no setState in useEffect needed!)
    const [side, setSide] = useState<OrderSide>(initialSide);
    const [productType, setProductType] = useState<ProductType>("MIS");
    const [orderType, setOrderType] = useState<OrderType>("MARKET");
    const [quantity, setQuantity] = useState<number>(1);
    const [limitPrice, setLimitPrice] = useState<string>(() =>
        currentPrice > 0 ? currentPrice.toFixed(2) : ""
    );

    const qtyInputRef = useRef<HTMLInputElement>(null);

    // Focus quantity input on open
    useEffect(() => {
        const timer = setTimeout(() => {
            qtyInputRef.current?.focus();
            qtyInputRef.current?.select();
        }, 50);
        return () => clearTimeout(timer);
    }, []);

    // Handle Escape key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // When switching to LIMIT, auto-fill current LTP if empty
    const handleOrderTypeChange = (type: OrderType) => {
        setOrderType(type);
        if (type === "LIMIT" && (!limitPrice || Number(limitPrice) <= 0)) {
            setLimitPrice(currentPrice.toFixed(2));
        }
    };

    // Margin Calculations
    const effectivePrice =
        orderType === "LIMIT" && Number(limitPrice) > 0 ? Number(limitPrice) : currentPrice;
    const totalOrderValue = Math.max(0, quantity * effectivePrice);

    // MIS gives 5x leverage (20% margin requirement), CNC is 100% (1x)
    const marginRequired = productType === "MIS" ? totalOrderValue / 5 : totalOrderValue;
    const marginAvailable = wallet?.balance ?? 0;
    const isShortOnMargin = marginRequired > marginAvailable && marginAvailable > 0;
    const isZeroBalance = marginAvailable <= 0;

    const isFormValid = useMemo(() => {
        if (quantity < 1 || !Number.isInteger(quantity)) return false;
        if (orderType === "LIMIT" && (isNaN(Number(limitPrice)) || Number(limitPrice) <= 0))
            return false;
        if (isShortOnMargin || isZeroBalance) return false;
        return true;
    }, [quantity, orderType, limitPrice, isShortOnMargin, isZeroBalance]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid || placeOrderMutation.isPending) return;

        try {
            await placeOrderMutation.mutateAsync({
                symbol,
                side,
                orderType,
                productType,
                quantity,
                price: orderType === "LIMIT" ? Number(limitPrice) : undefined,
            });
            onClose();
        } catch {
            // Error notification is dispatched within the mutation hook
        }
    };

    const isBuy = side === "BUY";
    const accentColor = isBuy ? "text-[#00873e]" : "text-[#c83200]";
    const accentBg = isBuy ? "bg-[#00873e]" : "bg-[#c83200]";
    const accentBorder = isBuy ? "border-[#00873e]" : "border-[#c83200]";
    const subtleBg = isBuy ? "bg-[#00873e]/10" : "bg-[#c83200]/10";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            {/* Modal Card */}
            <div
                className="w-full max-w-md bg-dash-panel border border-dash-border rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 1. Header with dynamic Buy/Sell brand banner */}
                <div className={`p-4 border-b border-dash-border ${subtleBg} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-base font-bold text-dash-text tracking-tight">
                                    {symbol}
                                </span>
                                <span className="text-[10px] font-semibold text-dash-text-muted px-1.5 py-0.5 rounded bg-dash-panel border border-dash-border">
                                    {initialExchange}
                                </span>
                            </div>
                            {stockName && (
                                <span className="text-xs text-dash-text-muted line-clamp-1 mt-0.5">
                                    {stockName}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Live LTP & Directional Flash */}
                    <div className="flex flex-col items-end">
                        <div className="flex items-baseline gap-1.5 font-mono">
                            <span
                                className={`text-base font-bold transition-colors duration-200 ${
                                    liveQuote.flashDirection === "up"
                                        ? "text-[#22c55e]"
                                        : liveQuote.flashDirection === "down"
                                        ? "text-[#ef4444]"
                                        : "text-dash-text"
                                }`}
                            >
                                ₹{formatINR(currentPrice)}
                            </span>
                        </div>
                        <div
                            className={`text-xs font-mono font-medium ${
                                liveQuote.isPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                            }`}
                        >
                            {liveQuote.isPositive ? `+${liveQuote.change.toFixed(2)}` : liveQuote.change.toFixed(2)}{" "}
                            ({liveQuote.isPositive ? `+${liveQuote.changePercent.toFixed(2)}%` : `${liveQuote.changePercent.toFixed(2)}%`})
                        </div>
                    </div>
                </div>

                {/* 2. Order Side Toggle (BUY vs SELL) */}
                <div className="p-4 border-b border-dash-border">
                    <div className="grid grid-cols-2 p-1 bg-dash-panel-2 rounded-lg border border-dash-border gap-1">
                        <button
                            type="button"
                            onClick={() => setSide("BUY")}
                            className={`py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                isBuy
                                    ? "bg-[#00873e] text-white shadow-xs"
                                    : "text-dash-text-muted hover:text-dash-text"
                            }`}
                        >
                            BUY
                        </button>
                        <button
                            type="button"
                            onClick={() => setSide("SELL")}
                            className={`py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                !isBuy
                                    ? "bg-[#c83200] text-white shadow-xs"
                                    : "text-dash-text-muted hover:text-dash-text"
                            }`}
                        >
                            SELL
                        </button>
                    </div>
                </div>

                {/* 3. Form Body */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Product Type (Intraday MIS vs Longterm CNC) */}
                    <div>
                        <div className="flex items-center justify-between text-xs font-medium text-dash-text-muted mb-2">
                            <span>Product Type</span>
                            <span className="text-[10px] text-dash-text-muted">
                                {productType === "MIS" ? "5x Leverage active" : "Full Delivery"}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setProductType("MIS")}
                                className={`flex flex-col p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                                    productType === "MIS"
                                        ? `${accentBorder} ${subtleBg}`
                                        : "border-dash-border hover:bg-dash-panel-2"
                                }`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-xs font-bold text-dash-text">Intraday MIS</span>
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary-green/20 text-primary-green">
                                        5x
                                    </span>
                                </div>
                                <span className="text-[10px] text-dash-text-muted mt-0.5">
                                    Square off by 3:15 PM
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setProductType("CNC")}
                                className={`flex flex-col p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                                    productType === "CNC"
                                        ? `${accentBorder} ${subtleBg}`
                                        : "border-dash-border hover:bg-dash-panel-2"
                                }`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-xs font-bold text-dash-text">Longterm CNC</span>
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-dash-card text-dash-text-muted">
                                        1x
                                    </span>
                                </div>
                                <span className="text-[10px] text-dash-text-muted mt-0.5">
                                    Delivery / Holdings
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Order Type (MARKET vs LIMIT) */}
                    <div>
                        <span className="text-xs font-medium text-dash-text-muted block mb-2">
                            Order Type
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleOrderTypeChange("MARKET")}
                                className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all cursor-pointer ${
                                    orderType === "MARKET"
                                        ? `${accentBorder} ${subtleBg} ${accentColor}`
                                        : "border-dash-border text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2"
                                }`}
                            >
                                Market
                            </button>
                            <button
                                type="button"
                                onClick={() => handleOrderTypeChange("LIMIT")}
                                className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all cursor-pointer ${
                                    orderType === "LIMIT"
                                        ? `${accentBorder} ${subtleBg} ${accentColor}`
                                        : "border-dash-border text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2"
                                }`}
                            >
                                Limit
                            </button>
                        </div>
                    </div>

                    {/* Quantity & Price Inputs */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Quantity Input */}
                        <div>
                            <label htmlFor="order-qty-input" className="block text-xs font-medium text-dash-text-muted mb-1.5">
                                Quantity
                            </label>
                            <div className="relative flex items-center">
                                <button
                                    type="button"
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                    className="absolute left-1 p-1 text-dash-text-muted hover:text-dash-text rounded hover:bg-dash-card transition-colors cursor-pointer"
                                    tabIndex={-1}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                                <input
                                    id="order-qty-input"
                                    ref={qtyInputRef}
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value, 10);
                                        setQuantity(isNaN(val) ? 1 : Math.max(1, val));
                                    }}
                                    className="w-full text-center bg-dash-panel-2 border border-dash-border rounded-lg py-2 px-7 text-xs font-mono font-semibold text-dash-text focus:outline-none focus:border-primary-green transition-colors"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setQuantity((q) => q + 1)}
                                    className="absolute right-1 p-1 text-dash-text-muted hover:text-dash-text rounded hover:bg-dash-card transition-colors cursor-pointer"
                                    tabIndex={-1}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Price Input */}
                        <div>
                            <label htmlFor="order-price-input" className="block text-xs font-medium text-dash-text-muted mb-1.5">
                                Price (₹)
                            </label>
                            <input
                                id="order-price-input"
                                type="number"
                                step="0.05"
                                min="0.05"
                                disabled={orderType === "MARKET"}
                                value={orderType === "MARKET" ? "Market" : limitPrice}
                                onChange={(e) => setLimitPrice(e.target.value)}
                                placeholder="0.00"
                                className={`w-full text-center border rounded-lg py-2 px-3 text-xs font-mono font-semibold transition-colors ${
                                    orderType === "MARKET"
                                        ? "bg-dash-panel-2/50 border-dash-border text-dash-text-muted cursor-not-allowed italic"
                                        : "bg-dash-panel-2 border-dash-border text-dash-text focus:outline-none focus:border-primary-green"
                                }`}
                                required={orderType === "LIMIT"}
                            />
                        </div>
                    </div>

                    {/* Quick Quantity Chips */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-dash-text-muted mr-1">Quick Qty:</span>
                        {[10, 25, 50, 100].map((addQty) => (
                            <button
                                key={addQty}
                                type="button"
                                onClick={() => setQuantity((q) => q + addQty)}
                                className="px-2 py-0.5 text-[10px] font-mono rounded bg-dash-panel-2 border border-dash-border text-dash-text-muted hover:text-dash-text hover:border-dash-text-muted transition-colors cursor-pointer"
                            >
                                +{addQty}
                            </button>
                        ))}
                    </div>

                    {/* Margin & Funds Breakdown Box */}
                    <div className="p-3 bg-dash-panel-2 border border-dash-border rounded-lg space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-dash-text-muted">Margin Required:</span>
                            <span className="font-mono font-bold text-dash-text">
                                ₹{formatINR(marginRequired)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-dash-text-muted">Margin Available:</span>
                            <span className="font-mono font-medium text-dash-text">
                                ₹{formatINR(marginAvailable)}
                            </span>
                        </div>

                        {/* Insufficient Funds Warning */}
                        {isShortOnMargin && (
                            <div className="pt-1 text-[11px] text-[#ef4444] font-medium flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span>
                                    Insufficient funds (Need ₹{formatINR(marginRequired - marginAvailable)} more)
                                </span>
                            </div>
                        )}
                        {isZeroBalance && (
                            <div className="pt-1 text-[11px] text-[#ef4444] font-medium flex items-center gap-1">
                                <span>No margin available. Please add funds to trade.</span>
                            </div>
                        )}
                    </div>

                    {/* 4. Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 rounded-lg border border-transparent transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={!isFormValid || placeOrderMutation.isPending}
                            className={`px-6 py-2 text-xs font-bold text-white rounded-lg transition-all shadow-md flex items-center gap-2 ${
                                !isFormValid
                                    ? "opacity-50 cursor-not-allowed bg-dash-card text-dash-text-muted"
                                    : `${accentBg} hover:brightness-110 active:scale-98 cursor-pointer`
                            }`}
                        >
                            {placeOrderMutation.isPending ? (
                                <>
                                    <svg
                                        className="w-3.5 h-3.5 animate-spin text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8H4z"
                                        />
                                    </svg>
                                    <span>Placing Order...</span>
                                </>
                            ) : (
                                <span>
                                    {side} {quantity} {symbol}
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const OrderPlacementModal: React.FC<OrderPlacementModalProps> = ({
    isOpen,
    onClose,
    initialSymbol = "TATAMOTORS",
    initialSide = "BUY",
    initialExchange = "NSE",
    stockName,
    initialPrice,
}) => {
    if (!isOpen) return null;

    return (
        <OrderPlacementForm
            key={`${initialSymbol}-${initialSide}-${initialPrice ?? 0}`}
            onClose={onClose}
            initialSymbol={initialSymbol}
            initialSide={initialSide}
            initialExchange={initialExchange}
            stockName={stockName}
            initialPrice={initialPrice}
        />
    );
};

