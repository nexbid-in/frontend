import { useEffect, useState } from "react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { formatINR } from "@/features/watchlist";
import { useAdminOrderDetailsQuery } from "../hooks/useAdminOrders";
import type { AdminOrderListItemDTO } from "../types";

interface AdminOrderDetailsDrawerProps {
    orderItem: AdminOrderListItemDTO | null;
    onClose: () => void;
    onRequestCancel: (order: AdminOrderListItemDTO) => void;
}

export function AdminOrderDetailsDrawer({
    orderItem,
    onClose,
    onRequestCancel,
}: AdminOrderDetailsDrawerProps) {
    const [copiedId, setCopiedId] = useState(false);

    const {
        data: orderDetails,
        isLoading,
        error,
    } = useAdminOrderDetailsQuery(orderItem?.id ?? null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    if (!orderItem) return null;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const formatDate = (dateValue: string | Date | null | undefined) => {
        if (!dateValue) return "—";
        const date = new Date(dateValue);
        return date.toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    };

    const isPending = orderItem.status === "PENDING";
    const displayData = orderDetails || orderItem;
    const user = orderDetails?.user || orderItem.user;
    const stock = orderDetails?.stock || orderItem.stock;
    const trades = orderDetails?.trades ?? [];

    const mobile = orderDetails?.user?.mobile;
    const isBlocked = orderDetails?.user?.isBlocked;
    const walletBalance = orderDetails?.user?.walletBalance;
    const sector = orderDetails?.stock?.sector;

    const fillPercentage = orderItem.quantity > 0
        ? Math.min(100, Math.round((orderItem.filledQuantity / orderItem.quantity) * 100))
        : 0;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
            <div
                className="w-full max-w-xl bg-panel border-l border-border-muted h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <header className="p-5 border-b border-border-muted flex items-center justify-between shrink-0 bg-panel-2/40">
                    <div className="flex items-center gap-3">
                        <span
                            className={`px-2 py-0.5 rounded text-xs font-bold tracking-wider uppercase ${
                                orderItem.side === "BUY"
                                    ? "bg-green/10 text-green border border-green/20"
                                    : "bg-red/10 text-red border border-red/20"
                            }`}
                        >
                            {orderItem.side}
                        </span>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-text-primary tracking-tight">
                                    {orderItem.symbol}
                                </h3>
                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-panel-2 border border-border-muted text-text-secondary">
                                    {stock.exchange || "NSE"}
                                </span>
                                {orderItem.isAmo && (
                                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-400 border border-purple-500/20">
                                        AMO
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-text-secondary mt-0.5 truncate max-w-xs">
                                {stock.name || orderItem.symbol}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-panel-2 transition-colors cursor-pointer"
                            aria-label="Close drawer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6 text-xs">
                    {/* Order ID Banner */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-panel-2 border border-border-muted">
                        <div>
                            <span className="text-[11px] text-text-secondary uppercase tracking-wider font-medium">Order ID</span>
                            <p className="text-sm font-mono font-semibold text-text-primary">{orderItem.id}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => copyToClipboard(orderItem.id)}
                            className="px-2.5 py-1 rounded bg-panel border border-border-muted text-[11px] font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        >
                            {copiedId ? "Copied!" : "Copy ID"}
                        </button>
                    </div>

                    {/* Status & Rejection Reason Banner */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-panel-2/50 border border-border-muted">
                            <span className="text-text-secondary font-medium">Execution Status</span>
                            <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                                    orderItem.status === "EXECUTED"
                                        ? "bg-green/10 text-green border border-green/20"
                                        : orderItem.status === "PENDING"
                                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                        : orderItem.status === "CANCELLED"
                                        ? "bg-muted text-text-secondary border border-border-muted"
                                        : "bg-red/10 text-red border border-red/20"
                                }`}
                            >
                                <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                        orderItem.status === "EXECUTED"
                                            ? "bg-green"
                                            : orderItem.status === "PENDING"
                                            ? "bg-amber-400 animate-pulse"
                                            : orderItem.status === "CANCELLED"
                                            ? "bg-text-secondary"
                                            : "bg-red"
                                    }`}
                                />
                                {orderItem.status}
                            </span>
                        </div>

                        {displayData.rejectionReason && (
                            <div className="p-3 rounded-lg bg-red/10 border border-red/20 text-red">
                                <span className="font-semibold block mb-0.5">Note / Reason:</span>
                                <span>{displayData.rejectionReason}</span>
                            </div>
                        )}
                    </div>

                    {/* User Profile Details */}
                    <section className="rounded-lg border border-border-muted bg-panel-2/40 p-4 space-y-3">
                        <h4 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                            Trader Information
                        </h4>
                        <div className="flex items-center gap-3">
                            <UserAvatar
                                src={user.profileImage}
                                firstName={user.firstName}
                                lastName={user.lastName}
                                size="md"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-text-primary">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-text-secondary truncate">{user.email}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-panel-2 border border-border-muted text-text-secondary">
                                    {user.id}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-muted/60 text-xs">
                            <div>
                                <span className="text-text-secondary">Mobile:</span>{" "}
                                <span className="text-text-primary font-medium">
                                    {mobile || "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-text-secondary">Account Status:</span>{" "}
                                <span className={`font-medium ${isBlocked ? "text-red" : "text-green"}`}>
                                    {isBlocked !== undefined ? (isBlocked ? "Blocked" : "Active") : "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-text-secondary">Wallet Balance:</span>{" "}
                                <span className="text-text-primary font-semibold">
                                    {walletBalance !== undefined ? `₹${formatINR(walletBalance)}` : "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-text-secondary">Blocked Margin:</span>{" "}
                                <span className="text-text-primary font-semibold">
                                    ₹{formatINR(orderItem.blockedMargin)}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Order Specs & Lifecycle */}
                    <section className="rounded-lg border border-border-muted bg-panel-2/40 p-4 space-y-3">
                        <h4 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                            Order Specifications
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div>
                                <span className="text-text-secondary block">Order Type</span>
                                <span className="text-text-primary font-semibold uppercase">{orderItem.orderType}</span>
                            </div>
                            <div>
                                <span className="text-text-secondary block">Product</span>
                                <span className="text-text-primary font-semibold">
                                    {orderItem.productType === "MIS" ? "Intraday (MIS)" : "Longterm (CNC)"}
                                </span>
                            </div>
                            <div>
                                <span className="text-text-secondary block">Order Mode</span>
                                <span className="text-text-primary font-semibold">
                                    {orderItem.isAmo ? "After-Market (AMO)" : "Regular (Day)"}
                                </span>
                            </div>
                            <div>
                                <span className="text-text-secondary block">Order Price</span>
                                <span className="text-text-primary font-semibold">
                                    {orderItem.price ? `₹${formatINR(orderItem.price)}` : "Market"}
                                </span>
                            </div>
                            <div>
                                <span className="text-text-secondary block">Average Fill Price</span>
                                <span className="text-text-primary font-semibold">
                                    {orderItem.averagePrice ? `₹${formatINR(orderItem.averagePrice)}` : "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-text-secondary block">Trigger Price</span>
                                <span className="text-text-primary font-semibold">
                                    {orderItem.triggerPrice ? `₹${formatINR(orderItem.triggerPrice)}` : "—"}
                                </span>
                            </div>
                        </div>

                        {/* Fill Progress */}
                        <div className="pt-2 border-t border-border-muted/60 space-y-1.5">
                            <div className="flex justify-between text-xs">
                                <span className="text-text-secondary">Execution Fill Progress</span>
                                <span className="font-semibold text-text-primary">
                                    {orderItem.filledQuantity} / {orderItem.quantity} Qty ({fillPercentage}%)
                                </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-panel border border-border-muted overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${
                                        orderItem.status === "EXECUTED"
                                            ? "bg-green"
                                            : orderItem.status === "PENDING"
                                            ? "bg-amber-400"
                                            : "bg-red"
                                    }`}
                                    style={{ width: `${fillPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Timing */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-muted/60 text-xs">
                            <div>
                                <span className="text-text-secondary block">Placed At</span>
                                <span className="text-text-primary">{formatDate(orderItem.createdAt)}</span>
                            </div>
                            <div>
                                <span className="text-text-secondary block">Updated At</span>
                                <span className="text-text-primary">{formatDate(orderItem.updatedAt)}</span>
                            </div>
                        </div>
                    </section>

                    {/* Stock Attributes */}
                    <section className="rounded-lg border border-border-muted bg-panel-2/40 p-4 space-y-2">
                        <h4 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                            Instrument Details
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <span className="text-text-secondary block">Symbol</span>
                                <span className="text-text-primary font-semibold">{stock.symbol}</span>
                            </div>
                            <div>
                                <span className="text-text-secondary block">Exchange</span>
                                <span className="text-text-primary font-semibold">{stock.exchange || "NSE"}</span>
                            </div>
                            <div>
                                <span className="text-text-secondary block">Sector / Class</span>
                                <span className="text-text-primary font-semibold">
                                    {sector || "Equities"}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Executed Trades Sub-Table */}
                    <section className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                                Executed Trades ({trades.length})
                            </h4>
                            {isLoading && (
                                <span className="text-[11px] text-text-secondary animate-pulse">Loading trades...</span>
                            )}
                        </div>

                        {error ? (
                            <p className="text-xs text-red">Failed to load trade executions.</p>
                        ) : trades.length === 0 ? (
                            <div className="p-4 rounded-lg bg-panel-2/30 border border-border-muted text-center text-text-secondary">
                                No trades have executed for this order yet.
                            </div>
                        ) : (
                            <div className="rounded-lg border border-border-muted bg-panel-2/30 overflow-hidden">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-border-muted bg-panel-2 text-text-secondary font-semibold">
                                            <th className="py-2 px-3">Trade ID</th>
                                            <th className="py-2 px-3">Qty</th>
                                            <th className="py-2 px-3">Price</th>
                                            <th className="py-2 px-3">Value</th>
                                            <th className="py-2 px-3 text-right">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-muted/50">
                                        {trades.map((t) => (
                                            <tr key={t.id} className="hover:bg-panel-2/50 transition-colors">
                                                <td className="py-2 px-3 font-mono text-[11px] text-text-secondary">
                                                    #{t.id.slice(0, 8)}
                                                </td>
                                                <td className="py-2 px-3 font-semibold text-text-primary">{t.quantity}</td>
                                                <td className="py-2 px-3 text-text-primary">₹{formatINR(t.price)}</td>
                                                <td className="py-2 px-3 font-medium text-text-primary">₹{formatINR(t.tradeValue)}</td>
                                                <td className="py-2 px-3 text-right text-text-secondary">
                                                    {formatDate(t.executedAt)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>

                {/* Footer Controls */}
                <footer className="p-4 border-t border-border-muted flex items-center justify-between shrink-0 bg-panel-2/40">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-panel border border-border-muted text-xs font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    >
                        Close
                    </button>

                    {isPending && (
                        <button
                            type="button"
                            onClick={() => onRequestCancel(orderItem)}
                            className="px-4 py-2 rounded-lg bg-red/10 border border-red/20 text-xs font-semibold text-red hover:bg-red/20 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel Order (Admin Override)
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
}
