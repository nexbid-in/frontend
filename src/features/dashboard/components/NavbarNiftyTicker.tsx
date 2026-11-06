import React from "react";
import { useLiveStockQuote, formatINR } from "@/features/watchlist";

interface NavbarNiftyTickerProps {
    symbol?: string;
    label?: string;
}

/**
 * Isolated live index ticker for the top navigation bar.
 * Scopes WebSocket tick re-renders strictly to this component,
 * preventing expensive layout re-renders of the AppLayout shell.
 */
export const NavbarNiftyTicker: React.FC<NavbarNiftyTickerProps> = ({
    symbol = "NIFTY 50",
    label = "NIFTY50 Index",
}) => {
    const quote = useLiveStockQuote(symbol);

    return (
        <div className="flex items-center gap-3 select-none">
            <span className="text-sm font-medium text-dash-text-muted">{label}</span>
            <div className="flex items-baseline gap-2">
                <span
                    className={`text-sm font-semibold font-mono transition-colors duration-200 ${
                        quote.flashDirection === "up"
                            ? "text-[#22c55e]"
                            : quote.flashDirection === "down"
                            ? "text-[#ef4444]"
                            : "text-dash-text"
                    }`}
                >
                    {formatINR(quote.price)}
                </span>
                <span
                    className={`text-xs font-mono font-medium ${
                        quote.isPositive ? "text-[#22c55e]" : "text-[#ef4444]"
                    }`}
                >
                    {quote.isPositive ? `+${quote.change.toFixed(2)}` : quote.change.toFixed(2)}{" "}
                    ({quote.isPositive ? `+${quote.changePercent.toFixed(2)}%` : `${quote.changePercent.toFixed(2)}%`})
                </span>
            </div>
        </div>
    );
};

