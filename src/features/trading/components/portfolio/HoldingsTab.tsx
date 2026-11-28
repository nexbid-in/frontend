import { useState, useMemo, type FC } from "react";
import { APP_ROUTES } from "@/constants/routes";
import { marketWebSocketService, formatINR } from "@/features/watchlist";
import { OrderPlacementModal } from "../OrderPlacementModal";
import type { PortfolioHoldingsSummary } from "../../hooks/usePortfolioLiveData";
import { formatSignedINR, formatSignedPercent } from "../../utils/pnlFormatters";
import type { HoldingItem, HoldingsFilter, OrderSide } from "../../types";
import { HoldingTableRow } from "./HoldingTableRow";
import { PortfolioEmptyState, type PortfolioEmptyStateConfig } from "./PortfolioEmptyState";
import { PortfolioFilterPill } from "./PortfolioFilterPill";

interface HoldingsTabProps {
    holdings: HoldingItem[];
    exitedHoldings: HoldingItem[];
    isLoading: boolean;
    summary: PortfolioHoldingsSummary;
    livePrices: Record<string, number>;
    searchQuery: string;
    onClearSearch: () => void;
}

const EXPLORE_WATCHLIST_ACTION = {
    kind: "link",
    label: "Explore Watchlist",
    to: APP_ROUTES.USER.WATCHLIST,
} as const;

const NO_HOLDINGS_STATE: PortfolioEmptyStateConfig = {
    title: "No delivery holdings found",
    description:
        "You don't have any CNC delivery stocks in your portfolio yet. Buy stocks using CNC product type to build your long-term portfolio.",
    action: EXPLORE_WATCHLIST_ACTION,
};

function getHoldingsEmptyStateConfig(
    searchQuery: string,
    holdingsFilter: HoldingsFilter,
    summary: PortfolioHoldingsSummary,
    onClearSearch: () => void,
    onChangeFilter: (filter: HoldingsFilter) => void
): PortfolioEmptyStateConfig {
    if (searchQuery.trim() !== "") {
        return {
            title: `No holdings matching "${searchQuery.trim()}"`,
            description:
                "No stocks match your search criteria. Try a different symbol or clear your search query.",
            action: { kind: "button", label: "Clear Search", onClick: onClearSearch },
        };
    }

    if (holdingsFilter === "GAINERS") {
        if (summary.holdingsCount > 0) {
            return {
                title: "No gainers in holdings",
                description:
                    "None of your delivery holdings are currently in profit. Once a stock trades above its buy price, it will show up here.",
                action: {
                    kind: "button",
                    label: `View All Holdings (${summary.holdingsCount})`,
                    onClick: () => onChangeFilter("ALL"),
                    variant: "secondary",
                },
            };
        }
        return NO_HOLDINGS_STATE;
    }

    if (holdingsFilter === "LOSERS") {
        if (summary.holdingsCount > 0) {
            return {
                title: "No losers in holdings",
                description:
                    "Great news! None of your delivery holdings are currently in loss. All stocks are trading in profit or at break-even.",
                action: {
                    kind: "button",
                    label: `View All Holdings (${summary.holdingsCount})`,
                    onClick: () => onChangeFilter("ALL"),
                    variant: "secondary",
                },
            };
        }
        return NO_HOLDINGS_STATE;
    }

    if (holdingsFilter === "EXITED") {
        if (summary.holdingsCount > 0) {
            return {
                title: "No exited holdings today",
                description:
                    "You haven't exited or sold any delivery holdings today. Fully exited CNC positions from today's session will appear here.",
                action: {
                    kind: "button",
                    label: `View Active Holdings (${summary.holdingsCount})`,
                    onClick: () => onChangeFilter("ALL"),
                    variant: "secondary",
                },
            };
        }
        return {
            title: "No exited holdings today",
            description: "You haven't exited or sold any delivery holdings today.",
            action: EXPLORE_WATCHLIST_ACTION,
        };
    }

    if (summary.exitedCount > 0) {
        return {
            title: "No active delivery holdings",
            description: `You have exited all previous delivery holdings. You have ${summary.exitedCount} exited stock(s) from today's session.`,
            action: {
                kind: "button",
                label: `View Exited Today (${summary.exitedCount})`,
                onClick: () => onChangeFilter("EXITED"),
                variant: "secondary",
            },
        };
    }

    return NO_HOLDINGS_STATE;
}

export const HoldingsTab: FC<HoldingsTabProps> = ({
    holdings,
    exitedHoldings,
    isLoading,
    summary,
    livePrices,
    searchQuery,
    onClearSearch,
}) => {
    const [holdingsFilter, setHoldingsFilter] = useState<HoldingsFilter>("ALL");
    const [orderModal, setOrderModal] = useState<{
        isOpen: boolean;
        symbol: string;
        side: OrderSide;
        quantity: number;
    }>({
        isOpen: false,
        symbol: "",
        side: "BUY",
        quantity: 1,
    });

    const filteredHoldings = useMemo(() => {
        const normalizedQuery = searchQuery.toLowerCase().trim();

        if (holdingsFilter === "EXITED") {
            return exitedHoldings.filter((item) =>
                normalizedQuery ? item.symbol.toLowerCase().includes(normalizedQuery) : true
            );
        }

        return holdings.filter((item) => {
            if (normalizedQuery && !item.symbol.toLowerCase().includes(normalizedQuery)) {
                return false;
            }

            const cachedTick = marketWebSocketService.getLatestTick(item.symbol);
            const ltp =
                livePrices[item.symbol] ?? cachedTick?.ltp ?? item.currentLtp ?? item.buyAvgPrice;
            const currVal = ltp * item.quantity;
            const isGainer = currVal >= item.investedAmount;

            if (holdingsFilter === "GAINERS") return isGainer;
            if (holdingsFilter === "LOSERS") return !isGainer;
            return true;
        });
    }, [holdings, exitedHoldings, searchQuery, holdingsFilter, livePrices]);

    const emptyState = useMemo(
        () =>
            getHoldingsEmptyStateConfig(
                searchQuery,
                holdingsFilter,
                summary,
                onClearSearch,
                setHoldingsFilter
            ),
        [searchQuery, holdingsFilter, summary, onClearSearch]
    );

    const summaryCards: Array<{
        label: string;
        value: string;
        colorClass: string;
        percentText?: string;
    }> = [
        {
            label: "Invested",
            value: `₹${formatINR(summary.totalInvested)}`,
            colorClass: "text-dash-text",
        },
        {
            label: "Current Value",
            value: `₹${formatINR(summary.currentValue)}`,
            colorClass: "text-dash-text",
        },
        {
            label: "Today's P&L",
            value: formatSignedINR(summary.todayPnL),
            percentText: formatSignedPercent(summary.todayPnLPercentage),
            colorClass: summary.todayPnL >= 0 ? "text-[#22c55e]" : "text-[#ef4444]",
        },
        {
            label: "Total P&L",
            value: formatSignedINR(summary.totalPnL),
            percentText: formatSignedPercent(summary.totalPnLPercentage),
            colorClass: summary.totalPnL >= 0 ? "text-[#22c55e]" : "text-[#ef4444]",
        },
    ];

    const filterButtons: Array<{
        key: HoldingsFilter;
        label: string;
        count: number;
        activeClass?: string;
        badgeClass?: string;
    }> = [
        { key: "ALL", label: "All", count: summary.holdingsCount },
        {
            key: "GAINERS",
            label: "Gainers",
            count: summary.gainersCount,
            activeClass: "bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30",
            badgeClass: "bg-[#22c55e]/20 text-[#22c55e]",
        },
        {
            key: "LOSERS",
            label: "Losers",
            count: summary.losersCount,
            activeClass: "bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30",
            badgeClass: "bg-[#ef4444]/20 text-[#ef4444]",
        },
        { key: "EXITED", label: "Exited", count: summary.exitedCount },
    ];

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4 border-b border-dash-border shrink-0">
                {summaryCards.map((card) => (
                    <div key={card.label} className="p-3 bg-dash-panel-2 border border-dash-border rounded-lg">
                        <span className="text-[11px] text-dash-text-muted block">{card.label}</span>
                        <span className={`text-sm md:text-base font-bold font-mono mt-1 block ${card.colorClass}`}>
                            {card.value}
                            {card.percentText && (
                                <span className="text-xs font-normal"> ({card.percentText})</span>
                            )}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 py-3 border-b border-dash-border shrink-0">
                {filterButtons.map((btn) => (
                    <PortfolioFilterPill
                        key={btn.key}
                        label={btn.label}
                        count={btn.count}
                        isActive={holdingsFilter === btn.key}
                        onClick={() => setHoldingsFilter(btn.key)}
                        activeClassName={btn.activeClass}
                        activeBadgeClassName={btn.badgeClass}
                    />
                ))}
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar mt-3">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-dash-text-muted gap-2">
                        <div className="w-6 h-6 border-2 border-primary-green/20 border-t-primary-green rounded-full animate-spin" />
                        <span className="text-xs">Loading holdings...</span>
                    </div>
                ) : filteredHoldings.length === 0 ? (
                    <PortfolioEmptyState icon="holdings" {...emptyState} />
                ) : (
                    <table className="w-full text-left border-collapse text-xs">
                        <thead className="sticky top-0 bg-dash-panel z-10 border-b border-dash-border">
                            <tr className="text-dash-text-muted font-medium select-none">
                                <th className="py-2.5 px-3">Instrument</th>
                                <th className="py-2.5 px-3 text-right">Qty</th>
                                <th className="py-2.5 px-3 text-right">Buy Avg (₹)</th>
                                <th className="py-2.5 px-3 text-right">LTP</th>
                                <th className="py-2.5 px-3 text-right">Invested</th>
                                <th className="py-2.5 px-3 text-right">Current</th>
                                {holdingsFilter === "EXITED" ? (
                                    <th className="py-2.5 px-3 text-right">Realized P&L</th>
                                ) : (
                                    <>
                                        <th className="py-2.5 px-3 text-right">Total P&L</th>
                                        <th className="py-2.5 px-3 text-right">Day's P&L</th>
                                    </>
                                )}
                                <th className="py-2.5 px-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHoldings.map((item) => (
                                <HoldingTableRow
                                    key={item.id}
                                    item={item}
                                    onBuy={(h) =>
                                        setOrderModal({
                                            isOpen: true,
                                            symbol: h.symbol,
                                            side: "BUY",
                                            quantity: 1,
                                        })
                                    }
                                    onSell={(h) =>
                                        setOrderModal({
                                            isOpen: true,
                                            symbol: h.symbol,
                                            side: "SELL",
                                            quantity: h.quantity,
                                        })
                                    }
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {orderModal.isOpen && (
                <OrderPlacementModal
                    isOpen={orderModal.isOpen}
                    onClose={() =>
                        setOrderModal({ isOpen: false, symbol: "", side: "BUY", quantity: 1 })
                    }
                    initialSymbol={orderModal.symbol}
                    initialSide={orderModal.side}
                    initialProductType="CNC"
                    initialQuantity={orderModal.quantity}
                />
            )}
        </>
    );
};
