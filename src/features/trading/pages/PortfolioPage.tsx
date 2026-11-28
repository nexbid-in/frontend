import { useState, type FC } from "react";
import { useSearchParams } from "react-router-dom";
import { usePortfolioLiveData } from "../hooks/usePortfolioLiveData";
import { PortfolioHeader, PositionsTab, HoldingsTab } from "../components/portfolio";
import type { PortfolioMainTab } from "../types";

export const PortfolioPage: FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get("tab")?.toUpperCase();
    const mainTab: PortfolioMainTab = tabParam === "HOLDINGS" ? "HOLDINGS" : "POSITIONS";

    const [searchQuery, setSearchQuery] = useState("");
    const { livePrices, positionsQuery, holdingsQuery, positionsSummary, holdingsSummary } =
        usePortfolioLiveData();

    const setMainTab = (tab: PortfolioMainTab) => {
        if (tab === "HOLDINGS") {
            setSearchParams({ tab: "holdings" });
        } else {
            setSearchParams({});
        }
    };

    const handleRefresh = () => {
        if (mainTab === "POSITIONS") {
            void positionsQuery.refetch();
        } else {
            void holdingsQuery.refetch();
        }
    };

    const isFetching =
        mainTab === "POSITIONS" ? positionsQuery.isFetching : holdingsQuery.isFetching;

    return (
        <div className="h-full p-2 overflow-hidden">
            <section className="h-full bg-dash-panel border border-dash-border rounded-md p-5 flex flex-col overflow-hidden">
                <PortfolioHeader
                    mainTab={mainTab}
                    onChangeTab={setMainTab}
                    openPositionsCount={positionsSummary.positionsCount.open}
                    holdingsCount={holdingsSummary.holdingsCount}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onRefresh={handleRefresh}
                    isFetching={isFetching}
                />

                {mainTab === "POSITIONS" ? (
                    <PositionsTab
                        positions={positionsQuery.data?.positions ?? []}
                        isLoading={positionsQuery.isLoading}
                        summary={positionsSummary}
                        searchQuery={searchQuery}
                        onClearSearch={() => setSearchQuery("")}
                    />
                ) : (
                    <HoldingsTab
                        holdings={holdingsQuery.data?.holdings ?? []}
                        exitedHoldings={holdingsQuery.data?.exitedHoldings ?? []}
                        isLoading={holdingsQuery.isLoading}
                        summary={holdingsSummary}
                        livePrices={livePrices}
                        searchQuery={searchQuery}
                        onClearSearch={() => setSearchQuery("")}
                    />
                )}
            </section>
        </div>
    );
};
