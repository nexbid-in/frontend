import type { FC } from "react";
import type { PnlFifoLeg } from "../../types";
import { formatCurrencyINR } from "../../utils/pnlFormatters";

interface PnlTradeLotsRowProps {
    symbol: string;
    legs: PnlFifoLeg[];
    colSpan: number;
}

export const PnlTradeLotsRow: FC<PnlTradeLotsRowProps> = ({ symbol, legs, colSpan }) => {
    const totalLegs = legs?.length ?? 0;

    return (
        <tr className="bg-dash-panel-2/30 border-b border-dash-border">
            <td colSpan={colSpan} className="p-0">
                <div className="py-4 px-6 sm:px-8 bg-dash-panel-2/20 border-y border-dash-border/60">
                    {/* FIFO Header */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-dash-text">
                            FIFO trade breakdown — <span className="font-bold text-dash-text">{symbol}</span>
                        </span>
                        <span className="text-xs text-dash-text-muted font-medium">
                            {totalLegs} leg{totalLegs !== 1 ? "s" : ""}
                        </span>
                    </div>

                    {/* Legs Table */}
                    <div className="overflow-x-auto rounded border border-dash-border/70 bg-dash-panel">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-dash-border/70 text-[11px] font-medium text-dash-text-muted bg-dash-panel-2/50 select-none">
                                    <th className="py-2.5 px-4 font-normal">Status</th>
                                    <th className="py-2.5 px-4 font-normal">Buy date</th>
                                    <th className="py-2.5 px-4 font-normal">Sell date</th>
                                    <th className="py-2.5 px-4 text-right font-normal">Qty.</th>
                                    <th className="py-2.5 px-4 text-right font-normal">Buy price</th>
                                    <th className="py-2.5 px-4 text-right font-normal">Sell / LTP</th>
                                    <th className="py-2.5 px-4 text-right font-normal">Trade P&L</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dash-border/40 font-mono text-xs">
                                {legs.map((leg, index) => {
                                    const isOpen = leg.status === "Open";
                                    const isProfit = leg.tradePnL >= 0;

                                    return (
                                        <tr key={`${leg.buyDate}-${index}`} className="hover:bg-dash-panel-2/30 transition-colors">
                                            {/* Status Badge */}
                                            <td className="py-2.5 px-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[11px] font-medium inline-block font-sans ${
                                                        isOpen
                                                            ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                                                            : "bg-dash-panel-3 text-dash-text-muted border border-dash-border"
                                                    }`}
                                                >
                                                    {leg.status}
                                                </span>
                                            </td>

                                            {/* Buy date */}
                                            <td className="py-2.5 px-4 whitespace-nowrap text-dash-text">
                                                {leg.buyDate}
                                            </td>

                                            {/* Sell date */}
                                            <td className="py-2.5 px-4 whitespace-nowrap text-dash-text-muted">
                                                {leg.sellDate ?? "—"}
                                            </td>

                                            {/* Qty. */}
                                            <td className="py-2.5 px-4 text-right whitespace-nowrap text-dash-text font-medium">
                                                {leg.quantity}
                                            </td>

                                            {/* Buy price */}
                                            <td className="py-2.5 px-4 text-right whitespace-nowrap text-dash-text">
                                                {formatCurrencyINR(leg.buyPrice, false, false)}
                                            </td>

                                            {/* Sell / LTP */}
                                            <td className="py-2.5 px-4 text-right whitespace-nowrap text-dash-text">
                                                <span>{formatCurrencyINR(leg.sellPrice, false, false)}</span>
                                                {leg.isLtp && (
                                                    <span className="text-[10px] text-dash-text-muted ml-1 font-sans">
                                                        (LTP)
                                                    </span>
                                                )}
                                            </td>

                                            {/* Trade P&L */}
                                            <td className="py-2.5 px-4 text-right whitespace-nowrap">
                                                <span className={`font-semibold ${isProfit ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                                                    {formatCurrencyINR(leg.tradePnL, true, true)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </td>
        </tr>
    );
};
