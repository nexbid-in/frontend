import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useOrdersQuery, useCancelOrderMutation, useMarketStatusQuery } from "../hooks/useTrading";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { formatINR } from "@/features/watchlist";
import { APP_ROUTES } from "@/constants/routes";
import type { OrderResponseDTO, OrdersTabFilter } from "../types";

export const OrdersPage: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<OrdersTabFilter>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [cancellingOrder, setCancellingOrder] = useState<OrderResponseDTO | null>(null);

    const { data: orders = [], isLoading, isFetching, refetch } = useOrdersQuery();
    const { data: marketStatus } = useMarketStatusQuery();
    const cancelMutation = useCancelOrderMutation();

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchesQuery =
                searchQuery.trim() === "" ||
                order.symbol.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
                order.id.toLowerCase().includes(searchQuery.toLowerCase().trim());

            if (!matchesQuery) return false;

            if (selectedTab === "ALL") return true;
            if (selectedTab === "PENDING") return order.status === "PENDING";
            if (selectedTab === "EXECUTED") return order.status === "EXECUTED";
            if (selectedTab === "CANCELLED")
                return order.status === "CANCELLED" || order.status === "REJECTED";
            return true;
        });
    }, [orders, selectedTab, searchQuery]);

    const counts = useMemo(() => {
        let pending = 0;
        let executed = 0;
        let cancelled = 0;

        orders.forEach((o) => {
            if (o.status === "PENDING") pending++;
            else if (o.status === "EXECUTED") executed++;
            else if (o.status === "CANCELLED" || o.status === "REJECTED") cancelled++;
        });

        return {
            all: orders.length,
            pending,
            executed,
            cancelled,
        };
    }, [orders]);

    const handleConfirmCancel = async () => {
        if (!cancellingOrder) return;
        try {
            await cancelMutation.mutateAsync(cancellingOrder.id);
            setCancellingOrder(null);
        } catch {
            /* Handled in mutation hook */
        }
    };

    const formatOrderTime = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return {
                time: date.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                }),
                date: date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                }),
            };
        } catch {
            return { time: "—", date: "—" };
        }
    };

    return (
        <div className="h-full p-2 overflow-hidden">
            <section className="h-full bg-dash-panel border border-dash-border rounded-md p-5 flex flex-col overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-dash-border shrink-0">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-base font-semibold text-dash-text tracking-tight">Order Book</h1>
                            {marketStatus && (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-dash-panel-2 border border-dash-border text-[10px]">
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                            marketStatus.isOpen
                                                ? "bg-emerald-500 animate-pulse"
                                                : "bg-amber-500"
                                        }`}
                                    />
                                    <span className="font-semibold text-dash-text">
                                        {marketStatus.isOpen ? "Market Open" : "Market Closed"}
                                    </span>
                                    <span className="text-dash-text-muted">({marketStatus.currentIstTime})</span>
                                    {marketStatus.isAmoAllowed && (
                                        <span className="px-1 rounded bg-indigo-500/20 text-indigo-400 font-bold uppercase text-[9px]">
                                            AMO
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-dash-text-muted mt-0.5">
                            Real-time order statuses, fills, and pending limit executions
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search symbol or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-48 sm:w-60 bg-dash-panel-2 border border-dash-border rounded-md pl-8 pr-3 py-1.5 text-xs text-dash-text placeholder-dash-text-muted focus:outline-none focus:border-primary-green transition-colors"
                            />
                            <svg
                                className="w-3.5 h-3.5 text-dash-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                            </svg>
                        </div>

                        <button
                            type="button"
                            onClick={() => void refetch()}
                            disabled={isFetching}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-dash-border text-xs text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 transition-colors cursor-pointer disabled:opacity-50"
                            title="Refresh orders"
                        >
                            <svg
                                className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-primary-green" : ""}`}
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
                    </div>
                </div>

                <div className="flex items-center gap-2 py-3 border-b border-dash-border shrink-0 overflow-x-auto custom-scrollbar">
                    {(
                        [
                            { id: "ALL", label: "All Orders", count: counts.all },
                            { id: "PENDING", label: "Open / Pending", count: counts.pending },
                            { id: "EXECUTED", label: "Executed", count: counts.executed },
                            { id: "CANCELLED", label: "Cancelled / Rejected", count: counts.cancelled },
                        ] as const
                    ).map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setSelectedTab(tab.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer select-none ${
                                selectedTab === tab.id
                                    ? "bg-primary-green/15 text-primary-green border border-primary-green/30"
                                    : "text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 border border-transparent"
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                    selectedTab === tab.id
                                        ? "bg-primary-green/20 text-primary-green"
                                        : "bg-dash-panel-2 text-dash-text-muted"
                                }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar mt-3">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center text-dash-text-muted gap-2">
                            <div className="w-6 h-6 border-2 border-primary-green/20 border-t-primary-green rounded-full animate-spin" />
                            <span className="text-xs">Loading orders...</span>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-dash-text-muted">
                            <div className="w-12 h-12 rounded-full bg-dash-panel-2 border border-dash-border flex items-center justify-center mb-3 text-dash-text-muted">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-dash-text mb-1">
                                No {selectedTab !== "ALL" ? selectedTab.toLowerCase() : ""} orders found
                            </h3>
                            <p className="text-xs text-dash-text-muted max-w-sm mb-4">
                                {searchQuery
                                    ? `No orders matching "${searchQuery}". Try a different search keyword.`
                                    : "You haven't placed any orders in this category yet. Explore the market and place trades directly from your watchlist."}
                            </p>
                            <Link
                                to={APP_ROUTES.USER.WATCHLIST}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary-green text-black font-semibold text-xs hover:brightness-110 transition-all cursor-pointer"
                            >
                                <span>Go to Watchlist</span>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="sticky top-0 bg-dash-panel z-10 border-b border-dash-border">
                                <tr className="text-dash-text-muted font-medium select-none">
                                    <th className="py-2.5 px-3">Time</th>
                                    <th className="py-2.5 px-3">Instrument</th>
                                    <th className="py-2.5 px-3">Type</th>
                                    <th className="py-2.5 px-3">Side</th>
                                    <th className="py-2.5 px-3 text-right">Qty</th>
                                    <th className="py-2.5 px-3 text-right">Order Price</th>
                                    <th className="py-2.5 px-3 text-right">Avg. Executed</th>
                                    <th className="py-2.5 px-3 text-right">Blocked Margin</th>
                                    <th className="py-2.5 px-3 text-center">Status</th>
                                    <th className="py-2.5 px-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dash-border">
                                {filteredOrders.map((order) => {
                                    const { time, date } = formatOrderTime(order.createdAt);
                                    const isBuy = order.side === "BUY";
                                    const isPending = order.status === "PENDING";
                                    const isExecuted = order.status === "EXECUTED";
                                    const isCancelled = order.status === "CANCELLED";
                                    const isRejected = order.status === "REJECTED";

                                    return (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-dash-panel-2/60 transition-colors group"
                                        >
                                            <td className="py-3 px-3 font-mono whitespace-nowrap">
                                                <div className="text-dash-text font-medium">{time}</div>
                                                <div className="text-[10px] text-dash-text-muted">{date}</div>
                                            </td>

                                            <td className="py-3 px-3 font-medium whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-dash-text font-semibold">{order.symbol}</span>
                                                    <span className="text-[9px] px-1 py-0.2 rounded bg-dash-panel-2 text-dash-text-muted border border-dash-border">
                                                        NSE
                                                    </span>
                                                    {order.isAmo && (
                                                        <span
                                                            className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider"
                                                            title="After Market Order (Dispatched when market opens at 09:15 AM IST)"
                                                        >
                                                            AMO
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-3 px-3 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-dash-panel-2 border border-dash-border text-dash-text">
                                                        {order.productType}
                                                    </span>
                                                    <span className="text-[10px] text-dash-text-muted">
                                                        {order.orderType}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-3 px-3 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider inline-block ${
                                                        isBuy
                                                            ? "bg-[#00873e]/15 text-[#00873e] border border-[#00873e]/30"
                                                            : "bg-[#c83200]/15 text-[#c83200] border border-[#c83200]/30"
                                                    }`}
                                                >
                                                    {order.side}
                                                </span>
                                            </td>

                                            <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                                                <span className="text-dash-text font-semibold">
                                                    {order.filledQuantity}
                                                </span>
                                                <span className="text-dash-text-muted"> / {order.quantity}</span>
                                            </td>

                                            <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                                                {order.orderType === "MARKET" ? (
                                                    <span className="text-dash-text-muted italic">Market</span>
                                                ) : (
                                                    <span className="text-dash-text">
                                                        ₹{formatINR(order.price ?? 0)}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                                                {order.averagePrice !== null && order.averagePrice > 0 ? (
                                                    <span className="text-dash-text font-semibold">
                                                        ₹{formatINR(order.averagePrice)}
                                                    </span>
                                                ) : (
                                                    <span className="text-dash-text-muted">—</span>
                                                )}
                                            </td>

                                            <td className="py-3 px-3 text-right font-mono text-dash-text-muted whitespace-nowrap">
                                                ₹{formatINR(order.blockedMargin)}
                                            </td>

                                            <td className="py-3 px-3 text-center whitespace-nowrap">
                                                {isPending && (
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                            order.isAmo
                                                                ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30 cursor-help"
                                                                : "bg-amber-500/15 text-amber-500 border-amber-500/30"
                                                        }`}
                                                        title={
                                                            order.isAmo
                                                                ? "After Market Order queued for execution upon market open (09:15 AM IST)"
                                                                : undefined
                                                        }
                                                    >
                                                        {order.isAmo ? "PENDING (AMO)" : "PENDING"}
                                                    </span>
                                                )}
                                                {isExecuted && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                                                        EXECUTED
                                                    </span>
                                                )}
                                                {isCancelled && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-500/15 text-zinc-400 border border-zinc-500/30">
                                                        CANCELLED
                                                    </span>
                                                )}
                                                {isRejected && (
                                                    <span
                                                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-500 border border-rose-500/30 cursor-help"
                                                        title={order.rejectionReason ?? "Order rejected by exchange"}
                                                    >
                                                        REJECTED
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3 px-3 text-right whitespace-nowrap">
                                                {isPending ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setCancellingOrder(order)}
                                                        className="px-2.5 py-1 text-[11px] font-medium text-rose-500 hover:text-white hover:bg-rose-500 rounded border border-rose-500/30 transition-all cursor-pointer"
                                                    >
                                                        Cancel
                                                    </button>
                                                ) : (
                                                    <span className="text-[11px] text-dash-text-muted">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            <ConfirmModal
                isOpen={cancellingOrder !== null}
                title="Cancel Order"
                message={
                    cancellingOrder ? (
                        <div className="space-y-2">
                            <p>
                                Are you sure you want to cancel the pending{" "}
                                <strong className="text-dash-text">{cancellingOrder.side}</strong> order for{" "}
                                <strong className="text-dash-text">{cancellingOrder.quantity}</strong> qty of{" "}
                                <strong className="text-dash-text">{cancellingOrder.symbol}</strong>?
                            </p>
                            <p className="text-xs text-dash-text-muted">
                                Reserved margin of ₹{formatINR(cancellingOrder.blockedMargin)} will be unlocked immediately.
                            </p>
                        </div>
                    ) : null
                }
                confirmText={cancelMutation.isPending ? "Cancelling..." : "Yes, Cancel Order"}
                cancelText="Keep Order"
                confirmButtonVariant="danger"
                onConfirm={handleConfirmCancel}
                onCancel={() => setCancellingOrder(null)}
            />
        </div>
    );
};

