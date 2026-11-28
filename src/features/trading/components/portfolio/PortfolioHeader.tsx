import type { FC } from "react";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "@/constants/routes";
import type { PortfolioMainTab } from "../../types";
import { PortfolioFilterPill } from "./PortfolioFilterPill";

interface PortfolioHeaderProps {
    mainTab: PortfolioMainTab;
    onChangeTab: (tab: PortfolioMainTab) => void;
    openPositionsCount: number;
    holdingsCount: number;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onRefresh: () => void;
    isFetching: boolean;
}

export const PortfolioHeader: FC<PortfolioHeaderProps> = ({
    mainTab,
    onChangeTab,
    openPositionsCount,
    holdingsCount,
    searchQuery,
    onSearchChange,
    onRefresh,
    isFetching,
}) => {
    const tabs: Array<{ key: PortfolioMainTab; label: string; count: number }> = [
        { key: "POSITIONS", label: "Positions", count: openPositionsCount },
        { key: "HOLDINGS", label: "Holdings", count: holdingsCount },
    ];

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-dash-border shrink-0">
            <div className="flex items-center gap-2">
                {tabs.map((tab) => (
                    <PortfolioFilterPill
                        key={tab.key}
                        label={tab.label}
                        count={tab.count}
                        isActive={mainTab === tab.key}
                        onClick={() => onChangeTab(tab.key)}
                        size="md"
                    />
                ))}

                <Link
                    to={APP_ROUTES.USER.PROFILE_PNL}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border border-dash-border text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 transition-colors duration-150 cursor-pointer select-none ml-1"
                    title="Open Profit & Loss Statement and trade charges transparency"
                >
                    <span>P&L Statement</span>
                    <span className="text-[10px] text-dash-text-muted">↗</span>
                </Link>

                <Link
                    to={APP_ROUTES.USER.PROFILE_TRADE_BOOK}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border border-dash-border text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 transition-colors duration-150 cursor-pointer select-none"
                    title="Open Trade Execution Book"
                >
                    <span>Trade Book</span>
                    <span className="text-[10px] text-dash-text-muted">↗</span>
                </Link>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative">
                    <input
                        type="text"
                        placeholder={
                            mainTab === "POSITIONS"
                                ? "Search position..."
                                : "Search holdings..."
                        }
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
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
                    onClick={onRefresh}
                    disabled={isFetching}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-dash-border text-xs text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 transition-colors cursor-pointer disabled:opacity-50"
                    title="Refresh portfolio"
                >
                    <svg
                        className={`w-3.5 h-3.5 ${
                            isFetching ? "animate-spin text-primary-green" : ""
                        }`}
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
    );
};
