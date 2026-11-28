import { useState, useMemo, type FC } from "react";
import { APP_ROUTES } from "@/constants/routes";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useSquareOffPositionMutation } from "../../hooks/useTrading";
import type { PortfolioPositionsSummary } from "../../hooks/usePortfolioLiveData";
import { formatSignedINR } from "../../utils/pnlFormatters";
import type { PositionResponseDTO, PositionsFilter } from "../../types";
import { PositionTableRow } from "./PositionTableRow";
import { PortfolioEmptyState, type PortfolioEmptyStateConfig } from "./PortfolioEmptyState";
import { PortfolioFilterPill } from "./PortfolioFilterPill";

interface PositionsTabProps {
    positions: PositionResponseDTO[];
    isLoading: boolean;
    summary: PortfolioPositionsSummary;
    searchQuery: string;
    onClearSearch: () => void;
}

const GO_TO_WATCHLIST_ACTION = {
    kind: "link",
    label: "Go to Watchlist",
    to: APP_ROUTES.USER.WATCHLIST,
} as const;

function getPositionsEmptyStateConfig(
    searchQuery: string,
    selectedFilter: PositionsFilter,
    counts: PortfolioPositionsSummary["positionsCount"],
    onClearSearch: () => void,
    onChangeFilter: (filter: PositionsFilter) => void
): PortfolioEmptyStateConfig {
    if (searchQuery.trim() !== "") {
        return {
            title: `No positions matching "${searchQuery.trim()}"`,
            description:
                "No positions match your search criteria. Try a different symbol or clear your search query.",
            action: { kind: "button", label: "Clear Search", onClick: onClearSearch },
        };
    }

    if (selectedFilter === "OPEN") {
        if (counts.closed > 0) {
            return {
                title: "No open positions",
                description: "All your intraday positions for today have been squared off.",
                action: {
                    kind: "button",
                    label: `View All Positions (${counts.total})`,
                    onClick: () => onChangeFilter("ALL"),
                    variant: "secondary",
                },
            };
        }
        return {
            title: "No open positions found",
            description:
                "You don't have any active intraday positions yet. Select instruments from your watchlist to open an MIS position.",
            action: GO_TO_WATCHLIST_ACTION,
        };
    }

    if (selectedFilter === "CLOSED") {
        if (counts.open > 0) {
            return {
                title: "No closed positions",
                description: "You haven't squared off or exited any intraday positions today.",
                action: {
                    kind: "button",
                    label: `View Open Positions (${counts.open})`,
                    onClick: () => onChangeFilter("OPEN"),
                    variant: "secondary",
                },
            };
        }
        return {
            title: "No closed positions found",
            description: "You don't have any closed intraday positions today.",
            action: GO_TO_WATCHLIST_ACTION,
        };
    }

    return {
        title: "No intraday positions found",
        description:
            "You don't have any active intraday positions yet! Select instruments from your watchlist to open an MIS position.",
        action: GO_TO_WATCHLIST_ACTION,
    };
}

export const PositionsTab: FC<PositionsTabProps> = ({
    positions,
    isLoading,
    summary,
    searchQuery,
    onClearSearch,
}) => {
    const [selectedFilter, setSelectedFilter] = useState<PositionsFilter>("ALL");
    const [squaringOffPosition, setSquaringOffPosition] = useState<PositionResponseDTO | null>(null);
    const squareOffMutation = useSquareOffPositionMutation();

    const filteredPositions = useMemo(() => {
        const normalizedQuery = searchQuery.toLowerCase().trim();
        return positions
            .filter((pos) => {
                if (selectedFilter === "OPEN" && pos.quantity <= 0) return false;
                if (selectedFilter === "CLOSED" && pos.quantity > 0) return false;
                if (normalizedQuery && !pos.symbol.toLowerCase().includes(normalizedQuery)) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => {
                const aOpen = a.quantity > 0 ? 1 : 0;
                const bOpen = b.quantity > 0 ? 1 : 0;
                if (aOpen !== bOpen) return bOpen - aOpen;
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            });
    }, [positions, selectedFilter, searchQuery]);

    const emptyState = useMemo(
        () =>
            getPositionsEmptyStateConfig(
                searchQuery,
                selectedFilter,
                summary.positionsCount,
                onClearSearch,
                setSelectedFilter
            ),
        [searchQuery, selectedFilter, summary.positionsCount, onClearSearch]
    );

    const handleConfirmSquareOff = async () => {
        if (!squaringOffPosition) return;
        try {
            await squareOffMutation.mutateAsync(squaringOffPosition.id);
            setSquaringOffPosition(null);
        } catch {
            /* Handled in mutation hook */
        }
    };

    const summaryMetrics = [
        { label: "Realized P&L", value: summary.totalRealizedPnL },
        { label: "Unrealized P&L", value: summary.totalUnrealizedPnL },
        { label: "Total P&L", value: summary.netPnL },
    ];

    const filterTabs: Array<{ key: PositionsFilter; label: string; count: number }> = [
        { key: "ALL", label: "All", count: summary.positionsCount.total },
        { key: "OPEN", label: "Open", count: summary.positionsCount.open },
        { key: "CLOSED", label: "Closed", count: summary.positionsCount.closed },
    ];

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 border-b border-dash-border shrink-0">
                {summaryMetrics.map((metric) => (
                    <div key={metric.label} className="p-3 bg-dash-panel-2 border border-dash-border rounded-lg">
                        <span className="text-[11px] text-dash-text-muted block">
                            {metric.label}
                        </span>
                        <span
                            className={`text-sm md:text-base font-bold font-mono mt-1 block ${
                                metric.value >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"
                            }`}
                        >
                            {formatSignedINR(metric.value)}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 py-3 border-b border-dash-border shrink-0">
                {filterTabs.map((tab) => (
                    <PortfolioFilterPill
                        key={tab.key}
                        label={tab.label}
                        count={tab.count}
                        isActive={selectedFilter === tab.key}
                        onClick={() => setSelectedFilter(tab.key)}
                    />
                ))}
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar mt-3">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-dash-text-muted gap-2">
                        <div className="w-6 h-6 border-2 border-primary-green/20 border-t-primary-green rounded-full animate-spin" />
                        <span className="text-xs">Loading positions...</span>
                    </div>
                ) : filteredPositions.length === 0 ? (
                    <PortfolioEmptyState icon="positions" {...emptyState} />
                ) : (
                    <table className="w-full text-left border-collapse text-xs">
                        <thead className="sticky top-0 bg-dash-panel z-10 border-b border-dash-border">
                            <tr className="text-dash-text-muted font-medium select-none">
                                <th className="py-2.5 px-3">Instrument</th>
                                <th className="py-2.5 px-3">Side</th>
                                <th className="py-2.5 px-3 text-right">Net Qty</th>
                                <th className="py-2.5 px-3 text-right">Avg Price</th>
                                <th className="py-2.5 px-3 text-right">LTP</th>
                                <th className="py-2.5 px-3 text-right">Total P&L</th>
                                <th className="py-2.5 px-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPositions.map((pos) => (
                                <PositionTableRow
                                    key={pos.id}
                                    position={pos}
                                    onSquareOff={(p) => setSquaringOffPosition(p)}
                                    isSquaringOff={squareOffMutation.isPending}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <ConfirmModal
                isOpen={squaringOffPosition !== null}
                title="Square Off Position"
                message={
                    squaringOffPosition ? (
                        <div className="space-y-2">
                            <p>
                                Are you sure you want to exit your{" "}
                                <strong className="text-dash-text">
                                    {squaringOffPosition.side}
                                </strong>{" "}
                                position for{" "}
                                <strong className="text-dash-text">
                                    {squaringOffPosition.quantity}
                                </strong>{" "}
                                qty of{" "}
                                <strong className="text-dash-text">
                                    {squaringOffPosition.symbol}
                                </strong>{" "}
                                at market price?
                            </p>
                            <p className="text-xs text-dash-text-muted">
                                An opposing market order will be submitted immediately to close this
                                position and release margin.
                            </p>
                        </div>
                    ) : null
                }
                confirmText={squareOffMutation.isPending ? "Exiting..." : "Yes, Exit Position"}
                cancelText="Keep Open"
                confirmButtonVariant="danger"
                onConfirm={handleConfirmSquareOff}
                onCancel={() => setSquaringOffPosition(null)}
            />
        </>
    );
};
