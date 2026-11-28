import type { FC } from "react";
import { useLiveStockQuote, formatINR } from "@/features/watchlist";
import { formatSignedINR, formatSignedPercent } from "../../utils/pnlFormatters";
import type { HoldingItem } from "../../types";

interface HoldingTableRowProps {
    item: HoldingItem;
    onBuy: (item: HoldingItem) => void;
    onSell: (item: HoldingItem) => void;
}

interface SignedPnlCellProps {
    amount: number;
    percentage: number;
    percentagePositive?: boolean;
}

const SignedPnlCell: FC<SignedPnlCellProps> = ({
    amount,
    percentage,
    percentagePositive,
}) => {
    const amountColor = amount >= 0 ? "text-[#22c55e]" : "text-[#ef4444]";
    const pctColor = (percentagePositive ?? amount >= 0) ? "text-[#22c55e]" : "text-[#ef4444]";

    return (
        <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
            <span className={`font-semibold ${amountColor}`}>
                {formatSignedINR(amount)}
            </span>
            <span className={`text-[10px] block ${pctColor}`}>
                ({formatSignedPercent(percentage)})
            </span>
        </td>
    );
};

export const HoldingTableRow: FC<HoldingTableRowProps> = ({ item, onBuy, onSell }) => {
    const quote = useLiveStockQuote(item.symbol);

    const liveLtp = quote.price > 0 ? quote.price : item.currentLtp;
    const liveCurrentValue = item.isExited
        ? item.currentValue
        : +(liveLtp * item.quantity).toFixed(2);
    const liveTotalPnL = item.isExited
        ? item.totalPnL
        : +((liveLtp - item.buyAvgPrice) * item.quantity).toFixed(2);
    const liveTotalPnLPercentage = item.isExited
        ? item.totalPnLPercentage
        : item.investedAmount > 0
        ? +((liveTotalPnL / item.investedAmount) * 100).toFixed(2)
        : 0;

    const liveDayPnL = item.isExited
        ? item.dayPnL
        : item.isBoughtToday
        ? liveTotalPnL
        : quote.hasLiveTick
        ? +((quote.change ?? 0) * item.quantity).toFixed(2)
        : item.dayPnL;

    const dayChange = quote.hasLiveTick
        ? quote.change ?? 0
        : item.isBoughtToday
        ? +(liveLtp - item.buyAvgPrice).toFixed(2)
        : item.dayChange;

    const dayChangePercentage = quote.hasLiveTick
        ? quote.changePercent ?? 0
        : item.isBoughtToday
        ? liveTotalPnLPercentage
        : item.dayChangePercentage;

    const isDayChangePositive = dayChange >= 0;

    return (
        <tr className="border-b border-dash-border hover:bg-dash-panel-2/60 transition-[background-color] duration-150 group">
            <td className="py-3 px-3 font-medium whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                    <span className="text-dash-text font-semibold">{item.symbol}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-dash-panel-2 text-dash-text-muted border border-dash-border">
                        NSE
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                        CNC
                    </span>
                </div>
            </td>

            <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                <span className="font-semibold text-dash-text">{item.quantity}</span>
            </td>

            <td className="py-3 px-3 text-right font-mono text-dash-text whitespace-nowrap">
                ₹{formatINR(item.buyAvgPrice)}
            </td>

            <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                <span
                    className={`font-semibold transition-colors duration-200 ${
                        quote.flashDirection === "up"
                            ? "text-[#22c55e]"
                            : quote.flashDirection === "down"
                            ? "text-[#ef4444]"
                            : "text-dash-text"
                    }`}
                >
                    ₹{formatINR(liveLtp)}
                </span>
                <span
                    className={`text-[10px] block font-mono ${
                        isDayChangePositive ? "text-[#22c55e]" : "text-[#ef4444]"
                    }`}
                >
                    {isDayChangePositive ? `+${dayChange.toFixed(2)}` : dayChange.toFixed(2)} (
                    {formatSignedPercent(dayChangePercentage)})
                </span>
            </td>

            <td className="py-3 px-3 text-right font-mono text-dash-text whitespace-nowrap">
                ₹{formatINR(item.investedAmount)}
            </td>

            <td className="py-3 px-3 text-right font-mono text-dash-text whitespace-nowrap">
                ₹{formatINR(liveCurrentValue)}
            </td>

            <SignedPnlCell amount={liveTotalPnL} percentage={liveTotalPnLPercentage} />

            {!item.isExited && (
                <SignedPnlCell
                    amount={liveDayPnL}
                    percentage={dayChangePercentage}
                    percentagePositive={isDayChangePositive}
                />
            )}

            <td className="py-3 px-3 text-right whitespace-nowrap">
                <div className="inline-flex items-center gap-1.5 justify-end">
                    <button
                        type="button"
                        onClick={() => onBuy(item)}
                        className="w-6 h-6 rounded bg-[#00873e]/15 text-[#00873e] hover:bg-[#00873e] hover:text-white border border-[#00873e]/30 font-bold text-[11px] flex items-center justify-center transition-all cursor-pointer"
                        title={
                            item.isExited
                                ? `Buy ${item.symbol} again (CNC)`
                                : `Buy more ${item.symbol} (CNC)`
                        }
                    >
                        B
                    </button>
                    {!item.isExited && (
                        <button
                            type="button"
                            onClick={() => onSell(item)}
                            className="w-6 h-6 rounded bg-[#c83200]/15 text-[#c83200] hover:bg-[#c83200] hover:text-white border border-[#c83200]/30 font-bold text-[11px] flex items-center justify-center transition-all cursor-pointer"
                            title={`Sell ${item.quantity} qty of ${item.symbol} (CNC)`}
                        >
                            S
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};
