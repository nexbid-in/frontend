import type { FC } from "react";
import type { DashboardMarketStatus, DashboardUserProfile } from "../types";

interface MarketStatusHeaderProps {
    user?: DashboardUserProfile;
    marketStatus?: DashboardMarketStatus;
    isFetching?: boolean;
    onRefresh: () => void;
}

export const MarketStatusHeader: FC<MarketStatusHeaderProps> = ({
    user,
    marketStatus,
    isFetching = false,
    onRefresh,
}) => {
    const userName = user?.name ? user.name.split(" ")[0] : "Trader";
    const isOpen = marketStatus?.isOpen ?? false;
    const session = marketStatus?.session ?? "CLOSED";
    const statusText = marketStatus?.statusText ?? (isOpen ? "Market is open" : "Market is closed");
    const istTime = marketStatus?.currentIstTime ?? "";

    // Status badge colors
    const isRegular = isOpen && session === "REGULAR";
    const isPrePost = session === "PRE_MARKET" || session === "POST_MARKET";

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-dash-border">
            {/* Greeting */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-dash-text tracking-tight flex items-center gap-2">
                    <span>Hi, {userName}</span>
                    <span className="text-xl">👋</span>
                </h1>
                <p className="text-xs text-dash-text-muted mt-0.5">
                    Welcome to your trading dashboard overview.
                </p>
            </div>

            {/* Market Status & Refresh */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dash-panel-2 border border-dash-border text-xs">
                    <span className="relative flex h-2 w-2">
                        {isRegular && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        )}
                        <span
                            className={`relative inline-flex rounded-full h-2 w-2 ${
                                isRegular
                                    ? "bg-emerald-500"
                                    : isPrePost
                                    ? "bg-amber-500"
                                    : "bg-dash-text-muted/60"
                            }`}
                        />
                    </span>

                    <span className="font-medium text-dash-text">
                        {statusText}
                    </span>

                    {istTime && (
                        <span className="text-[11px] font-mono text-dash-text-muted pl-1 border-l border-dash-border">
                            {istTime}
                        </span>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={isFetching}
                    title="Refresh dashboard metrics"
                    aria-label="Refresh dashboard metrics"
                    className="p-1.5 rounded-lg bg-dash-panel-2 hover:bg-dash-panel border border-dash-border text-dash-text-muted hover:text-dash-text transition-colors cursor-pointer disabled:opacity-50"
                >
                    <svg
                        className={`w-4 h-4 ${isFetching ? "animate-spin text-blue-500" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
