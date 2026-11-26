import { useState, useEffect, type FC } from "react";
import type { DashboardMarketStatus, DashboardUserProfile } from "../types";

interface MarketStatusHeaderProps {
    user?: DashboardUserProfile;
    marketStatus?: DashboardMarketStatus;
    initialTime?: string;
    isFetching?: boolean;
    onRefresh: () => void;
}

function getFormattedIstTime(): string {
    try {
        const formatter = new Intl.DateTimeFormat("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
        return `${formatter.format(new Date())} IST`;
    } catch {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const ist = new Date(utc + 3600000 * 5.5);
        const hours = String(ist.getHours()).padStart(2, "0");
        const minutes = String(ist.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes} IST`;
    }
}

const LiveIstTime: FC<{ initialTime?: string }> = ({ initialTime }) => {
    const [time, setTime] = useState<string>(() => initialTime || getFormattedIstTime());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(getFormattedIstTime());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <span className="text-xs sm:text-sm font-mono text-dash-text-muted select-none">
            {time}
        </span>
    );
};

export const MarketStatusHeader: FC<MarketStatusHeaderProps> = ({
    user,
    marketStatus,
    initialTime,
    isFetching = false,
    onRefresh,
}) => {
    const userName = user?.name ? user.name.split(" ")[0] : "Trader";
    const resolvedInitialTime = initialTime ?? marketStatus?.currentIstTime;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-dash-border">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-dash-text tracking-tight flex items-center gap-2">
                    <span>Hi, {userName}</span>
                    <span className="text-xl">👋</span>
                </h1>
                <p className="text-xs text-dash-text-muted mt-0.5">
                    Welcome to your trading dashboard overview.
                </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
                <LiveIstTime initialTime={resolvedInitialTime} />

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
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};
