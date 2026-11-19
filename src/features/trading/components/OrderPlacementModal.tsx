import React, { useState, useEffect, useMemo, useRef } from "react";
import { usePlaceOrderMutation, useMarketStatusQuery } from "../hooks/useTrading";
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

interface ModalPosition {
    x: number;
    y: number;
}

const STORAGE_KEY = "nexbid_order_modal_position";

let lastSessionPosition: ModalPosition | null = (() => {
    if (typeof window === "undefined") return null;
    try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (typeof parsed?.x === "number" && typeof parsed?.y === "number") {
                return parsed as ModalPosition;
            }
        }
    } catch {
        /* Ignore storage errors */
    }
    return null;
})();

const saveModalPosition = (pos: ModalPosition) => {
    lastSessionPosition = pos;
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
    } catch {
        /* Ignore storage errors */
    }
};

const getInitialPosition = (): ModalPosition => {
    const modalWidth = typeof window !== "undefined" ? Math.min(window.innerWidth - 32, 576) : 576;
    const modalHeight = 330;
    const maxX = typeof window !== "undefined" ? Math.max(16, window.innerWidth - modalWidth - 16) : 500;
    const maxY = typeof window !== "undefined" ? Math.max(16, window.innerHeight - modalHeight - 16) : 400;

    if (lastSessionPosition && typeof window !== "undefined") {
        const clampedX = Math.min(maxX, Math.max(16, lastSessionPosition.x));
        const clampedY = Math.min(maxY, Math.max(16, lastSessionPosition.y));
        return { x: clampedX, y: clampedY };
    }

    const x = typeof window !== "undefined" ? Math.max(16, Math.round((window.innerWidth - modalWidth) / 2)) : 100;
    const y = typeof window !== "undefined" ? Math.max(20, Math.round((window.innerHeight - modalHeight) / 2)) : 100;
    return { x, y };
};

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
    const { data: marketStatus } = useMarketStatusQuery();
    const placeOrderMutation = usePlaceOrderMutation();

    const isEnforcingHours = Boolean(marketStatus?.enforceMarketHours);
    const isMarketClosed = isEnforcingHours && marketStatus ? !marketStatus.isOpen : false;
    const isMisBlocked = isEnforcingHours && Boolean(marketStatus?.isOpen && !marketStatus.isMisAllowed);

    const currentPrice = liveQuote.price > 0 ? liveQuote.price : initialPrice ?? 0;

    const [side, setSide] = useState<OrderSide>(initialSide);
    const [productType, setProductType] = useState<ProductType>(() => (isMisBlocked ? "CNC" : "MIS"));
    const [orderType, setOrderType] = useState<OrderType>("MARKET");
    const [quantity, setQuantity] = useState<string>("1");
    const [limitPrice, setLimitPrice] = useState<string>(() =>
        currentPrice > 0 ? currentPrice.toFixed(2) : ""
    );
    const [manualAmo, setManualAmo] = useState<boolean>(false);

    const isAmo = isEnforcingHours ? isMarketClosed : manualAmo;

    const modalRef = useRef<HTMLDivElement>(null);
    const qtyInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const [position, setPosition] = useState<ModalPosition>(getInitialPosition);

    const posRef = useRef<ModalPosition>(position);

    useEffect(() => {
        posRef.current = position;
    }, [position]);

    useEffect(() => {
        if (!lastSessionPosition && modalRef.current) {
            const rect = modalRef.current.getBoundingClientRect();
            const x = Math.max(16, Math.round((window.innerWidth - rect.width) / 2));
            const y = Math.max(20, Math.round((window.innerHeight - rect.height) / 2));
            const centered = { x, y };
            posRef.current = centered;
            saveModalPosition(centered);
            setPosition(centered);
        }
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const modalWidth = modalRef.current?.offsetWidth ?? 576;
            const modalHeight = modalRef.current?.offsetHeight ?? 330;
            const maxX = Math.max(16, window.innerWidth - modalWidth - 16);
            const maxY = Math.max(16, window.innerHeight - modalHeight - 16);
            const clampedX = Math.min(maxX, Math.max(16, posRef.current.x));
            const clampedY = Math.min(maxY, Math.max(16, posRef.current.y));

            const clamped = { x: clampedX, y: clampedY };
            posRef.current = clamped;
            saveModalPosition(clamped);
            if (modalRef.current) {
                modalRef.current.style.left = `${clampedX}px`;
                modalRef.current.style.top = `${clampedY}px`;
            }
            setPosition(clamped);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        return () => {
            if (posRef.current) {
                saveModalPosition(posRef.current);
            }
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, []);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        const target = e.target as HTMLElement;
        if (target.closest("button, input, select, textarea, a, label")) {
            return;
        }

        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const startPosX = posRef.current.x;
        const startPosY = posRef.current.y;

        setIsDragging(true);
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";

        let animFrameId: number | null = null;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            const modalWidth = modalRef.current?.offsetWidth ?? 576;
            const modalHeight = modalRef.current?.offsetHeight ?? 330;

            const maxX = Math.max(16, window.innerWidth - modalWidth - 16);
            const maxY = Math.max(16, window.innerHeight - modalHeight - 16);

            const newX = Math.min(maxX, Math.max(16, startPosX + dx));
            const newY = Math.min(maxY, Math.max(16, startPosY + dy));

            posRef.current = { x: newX, y: newY };

            if (animFrameId !== null) {
                cancelAnimationFrame(animFrameId);
            }

            animFrameId = requestAnimationFrame(() => {
                if (modalRef.current) {
                    modalRef.current.style.left = `${newX}px`;
                    modalRef.current.style.top = `${newY}px`;
                }
            });
        };

        const cleanup = () => {
            if (animFrameId !== null) {
                cancelAnimationFrame(animFrameId);
            }
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
            window.removeEventListener("pointercancel", onPointerUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            setIsDragging(false);
            const finalPos = { ...posRef.current };
            saveModalPosition(finalPos);
            setPosition(finalPos);
        };

        const onPointerUp = () => {
            cleanup();
        };

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        window.addEventListener("pointercancel", onPointerUp);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            qtyInputRef.current?.focus();
        }, 50);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleOrderTypeChange = (type: OrderType) => {
        setOrderType(type);
        if (type === "LIMIT" && (!limitPrice || Number(limitPrice) <= 0)) {
            setLimitPrice(currentPrice.toFixed(2));
        }
    };

    const effectivePrice =
        orderType === "LIMIT" && Number(limitPrice) > 0 ? Number(limitPrice) : currentPrice;
    const parsedQty = parseInt(quantity, 10);
    const numericQty = !isNaN(parsedQty) && parsedQty > 0 ? parsedQty : 0;
    const totalOrderValue = Math.max(0, numericQty * effectivePrice);

    const marginRequired = productType === "MIS" ? totalOrderValue / 5 : totalOrderValue;
    const marginAvailable = wallet?.availableMargin ?? wallet?.balance ?? 0;
    const isShortOnMargin = marginRequired > marginAvailable && marginAvailable > 0;
    const isZeroBalance = marginAvailable <= 0;

    const isQtyEmpty = quantity.trim() === "";
    const isQtyInvalid = isQtyEmpty || isNaN(parsedQty) || parsedQty < 1;

    const isFormValid = useMemo(() => {
        const parsed = parseInt(quantity, 10);
        if (!quantity.trim() || isNaN(parsed) || parsed < 1 || !Number.isInteger(parsed)) return false;
        if (orderType === "LIMIT" && (isNaN(Number(limitPrice)) || Number(limitPrice) <= 0))
            return false;
        if (isShortOnMargin || isZeroBalance) return false;
        if (isMisBlocked && productType === "MIS") return false;
        return true;
    }, [quantity, orderType, limitPrice, isShortOnMargin, isZeroBalance, isMisBlocked, productType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = parseInt(quantity, 10);
        if (!isFormValid || placeOrderMutation.isPending || isNaN(parsed) || parsed < 1) return;

        try {
            await placeOrderMutation.mutateAsync({
                symbol,
                side,
                orderType,
                productType,
                quantity: parsed,
                price: orderType === "LIMIT" ? Number(limitPrice) : undefined,
                isAmo,
            });
            onClose();
        } catch {
            /* Handled in mutation hook */
        }
    };

    const isBuy = side === "BUY";
    const accentBg = isBuy ? "bg-[#00873e]" : "bg-[#c83200]";
    const accentBorder = isBuy ? "border-[#00873e]" : "border-[#c83200]";
    const subtleBg = isBuy ? "bg-[#00873e]/10" : "bg-[#c83200]/10";

    return (
        <>
            {isDragging && (
                <div
                    className="fixed inset-0 z-[99] cursor-grabbing select-none pointer-events-auto"
                    style={{ cursor: "grabbing" }}
                />
            )}

            <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden animate-in fade-in duration-150">
                <div
                    ref={modalRef}
                    style={{
                        position: "fixed",
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                        width: "calc(100vw - 32px)",
                        maxWidth: "36rem",
                    }}
                    className="pointer-events-auto bg-dash-panel border border-dash-border rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        onPointerDown={handlePointerDown}
                        style={{ cursor: isDragging ? "grabbing" : "grab" }}
                        className={`px-5 py-3.5 border-b border-dash-border ${subtleBg} flex items-center justify-between select-none touch-none cursor-grab active:cursor-grabbing`}
                        title="Drag to reposition window"
                    >
                        <div className="flex items-center gap-3 select-none cursor-grab active:cursor-grabbing">
                            <div className="flex flex-col cursor-grab active:cursor-grabbing">
                                <div className="flex items-baseline gap-2 cursor-grab active:cursor-grabbing">
                                    <span className="text-base font-bold text-dash-text tracking-tight cursor-grab active:cursor-grabbing">
                                        {symbol}
                                    </span>
                                    <span className="text-[10px] font-semibold text-dash-text-muted px-1.5 py-0.5 rounded bg-dash-panel-2 border border-dash-border cursor-grab active:cursor-grabbing">
                                        {initialExchange}
                                    </span>
                                </div>
                                {stockName && (
                                    <span className="text-[11px] text-dash-text-muted line-clamp-1 cursor-grab active:cursor-grabbing">
                                        {stockName}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-baseline gap-1.5 font-mono ml-1 cursor-grab active:cursor-grabbing">
                                <span
                                    className={`text-sm font-bold transition-colors duration-200 cursor-grab active:cursor-grabbing ${
                                        liveQuote.flashDirection === "up"
                                            ? "text-[#22c55e]"
                                            : liveQuote.flashDirection === "down"
                                            ? "text-[#ef4444]"
                                            : "text-dash-text"
                                    }`}
                                >
                                    ₹{formatINR(currentPrice)}
                                </span>
                                <span
                                    className={`text-[11px] font-mono font-medium cursor-grab active:cursor-grabbing ${
                                        liveQuote.isPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                                    }`}
                                >
                                    {liveQuote.isPositive ? `+${liveQuote.change.toFixed(2)}` : liveQuote.change.toFixed(2)}{" "}
                                    ({liveQuote.isPositive ? `+${liveQuote.changePercent.toFixed(2)}%` : `${liveQuote.changePercent.toFixed(2)}%`})
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                        <div className="flex items-center p-0.5 bg-dash-panel-2 rounded-lg border border-dash-border">
                            <button
                                type="button"
                                onClick={() => setSide("BUY")}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
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
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                    !isBuy
                                        ? "bg-[#c83200] text-white shadow-xs"
                                        : "text-dash-text-muted hover:text-dash-text"
                                }`}
                            >
                                SELL
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1 text-dash-text-muted hover:text-dash-text rounded-md hover:bg-dash-panel-2 transition-colors cursor-pointer"
                            aria-label="Close"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {isAmo && (
                    <div className="px-5 py-2 bg-indigo-500/10 border-b border-indigo-500/20 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 shrink-0">
                                AMO
                            </span>
                            <span className="text-dash-text-muted text-[11px]">
                                Market is closed{marketStatus?.currentIstTime ? ` (${marketStatus.currentIstTime})` : ""}. Order will be placed upon market open at 09:15 AM IST.
                            </span>
                        </div>
                        {!isEnforcingHours && (
                            <button
                                type="button"
                                onClick={() => setManualAmo(false)}
                                className="text-[10px] text-dash-text-muted hover:text-dash-text underline cursor-pointer shrink-0 ml-2"
                            >
                                Disable
                            </button>
                        )}
                    </div>
                )}

                {isMisBlocked && (
                    <div className="px-5 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-[11px] text-amber-400">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>MIS Cutoff: Intraday blocked after 03:20 PM IST. Please select Longterm CNC.</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <label
                                onClick={() => !isMisBlocked && setProductType("MIS")}
                                className={`inline-flex items-center gap-2 cursor-pointer select-none ${
                                    isMisBlocked ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                                <span
                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                                        productType === "MIS"
                                            ? `${accentBorder} bg-transparent`
                                            : "border-dash-border"
                                    }`}
                                >
                                    {productType === "MIS" && (
                                        <span className={`w-1.5 h-1.5 rounded-full ${accentBg}`} />
                                    )}
                                </span>
                                <span className={`text-xs font-semibold ${productType === "MIS" ? "text-dash-text" : "text-dash-text-muted"}`}>
                                    Intraday <span className="text-[11px] font-normal text-dash-text-muted">MIS</span>
                                </span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary-green/20 text-primary-green font-mono">
                                    5x
                                </span>
                            </label>

                            <label
                                onClick={() => setProductType("CNC")}
                                className="inline-flex items-center gap-2 cursor-pointer select-none"
                            >
                                <span
                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                                        productType === "CNC"
                                            ? `${accentBorder} bg-transparent`
                                            : "border-dash-border"
                                    }`}
                                >
                                    {productType === "CNC" && (
                                        <span className={`w-1.5 h-1.5 rounded-full ${accentBg}`} />
                                    )}
                                </span>
                                <span className={`text-xs font-semibold ${productType === "CNC" ? "text-dash-text" : "text-dash-text-muted"}`}>
                                    Longterm <span className="text-[11px] font-normal text-dash-text-muted">CNC</span>
                                </span>
                            </label>
                        </div>

                        <span className="text-[11px] text-dash-text-muted">
                            {productType === "MIS" ? "5x Leverage active" : "Full Delivery (1x)"}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="order-qty-input" className="block text-xs font-medium text-dash-text-muted mb-1.5">
                                Quantity
                            </label>
                            <div className="relative flex items-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const q = parseInt(quantity, 10);
                                        const next = isNaN(q) ? 1 : Math.max(1, q - 1);
                                        setQuantity(String(next));
                                    }}
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
                                        const val = e.target.value;
                                        if (val === "") {
                                            setQuantity("");
                                            return;
                                        }
                                        const parsed = parseInt(val, 10);
                                        setQuantity(isNaN(parsed) ? "" : String(Math.max(0, parsed)));
                                    }}
                                    className={`w-full text-center bg-dash-panel-2 border rounded-lg py-2 px-7 text-xs font-mono font-semibold text-dash-text focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                        isQtyInvalid
                                            ? "border-[#ef4444] focus:border-[#ef4444]"
                                            : "border-dash-border focus:border-primary-green"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const q = parseInt(quantity, 10);
                                        const next = isNaN(q) ? 1 : q + 1;
                                        setQuantity(String(next));
                                    }}
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

                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-6">
                            <label
                                onClick={() => handleOrderTypeChange("MARKET")}
                                className="inline-flex items-center gap-2 cursor-pointer select-none"
                            >
                                <span
                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                                        orderType === "MARKET"
                                            ? `${accentBorder} bg-transparent`
                                            : "border-dash-border"
                                    }`}
                                >
                                    {orderType === "MARKET" && (
                                        <span className={`w-1.5 h-1.5 rounded-full ${accentBg}`} />
                                    )}
                                </span>
                                <span className={`text-xs font-semibold ${orderType === "MARKET" ? "text-dash-text" : "text-dash-text-muted"}`}>
                                    Market
                                </span>
                            </label>

                            <label
                                onClick={() => handleOrderTypeChange("LIMIT")}
                                className="inline-flex items-center gap-2 cursor-pointer select-none"
                            >
                                <span
                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                                        orderType === "LIMIT"
                                            ? `${accentBorder} bg-transparent`
                                            : "border-dash-border"
                                    }`}
                                >
                                    {orderType === "LIMIT" && (
                                        <span className={`w-1.5 h-1.5 rounded-full ${accentBg}`} />
                                    )}
                                </span>
                                <span className={`text-xs font-semibold ${orderType === "LIMIT" ? "text-dash-text" : "text-dash-text-muted"}`}>
                                    Limit
                                </span>
                            </label>
                        </div>

                        {!isEnforcingHours && !isAmo && (
                            <button
                                type="button"
                                onClick={() => setManualAmo(true)}
                                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                            >
                                Test AMO
                            </button>
                        )}
                    </div>

                    {isShortOnMargin && (
                        <div className="text-[11px] text-[#ef4444] font-medium flex items-center gap-1.5 pt-1">
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>Insufficient funds (Need ₹{formatINR(marginRequired - marginAvailable)} more)</span>
                        </div>
                    )}
                    {isZeroBalance && (
                        <div className="text-[11px] text-[#ef4444] font-medium pt-1">
                            No margin available. Please add funds to trade.
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-dash-border/60">
                        <div className="flex items-center gap-3 text-xs">
                            <div>
                                <span className="text-[11px] text-dash-text-muted mr-1.5">Margin:</span>
                                <span className="font-mono font-bold text-dash-text">
                                    ₹{formatINR(marginRequired)}
                                </span>
                            </div>
                            <span className="text-dash-border">|</span>
                            <div>
                                <span className="text-[11px] text-dash-text-muted mr-1.5">Available:</span>
                                <span className="font-mono font-medium text-dash-text-muted">
                                    ₹{formatINR(marginAvailable)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
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
                                className={`px-5 py-2 text-xs font-bold text-white rounded-lg transition-all shadow-md flex items-center gap-2 ${
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
                                        <span>Placing {isAmo ? "AMO" : "Order"}...</span>
                                    </>
                                ) : (
                                    <span>
                                        {isAmo
                                            ? `Place AMO ${side}${quantity.trim() ? ` (${quantity} Qty)` : ""}`
                                            : `${side}${quantity.trim() ? ` ${quantity}` : ""} ${symbol}`}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        </>
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

