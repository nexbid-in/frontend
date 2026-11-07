import React from "react";
import { useWalletOverview } from "@/features/funds";
import { formatINR } from "@/features/watchlist";
import { useAppSelector } from "@/store/hooks";

/**
 * Isolated dynamic margin indicator for the top navigation bar.
 * Connects directly to TanStack Query's wallet cache and automatically
 * updates when funds are added or orders are executed.
 */
export const NavbarMarginAvailable: React.FC = () => {
    const user = useAppSelector((state) => state.auth.user);
    const { data: walletOverview, isLoading } = useWalletOverview({
        enabled: !!user,
    });

    const availableMargin = walletOverview?.balance ?? 0;

    return (
        <div className="flex items-center gap-2">
            <span className="text-dash-text-muted">Margin Available:</span>
            {isLoading && !walletOverview ? (
                <span className="inline-block w-16 h-4 bg-dash-border/60 animate-pulse rounded my-0.5" />
            ) : (
                <span className="font-medium text-dash-text font-mono">
                    ₹{formatINR(availableMargin)}
                </span>
            )}
        </div>
    );
};

