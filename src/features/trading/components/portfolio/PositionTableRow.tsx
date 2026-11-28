import type { FC } from "react";
import { useLiveStockQuote, formatINR } from "@/features/watchlist";
import { formatSignedINR, formatSignedPercent } from "../../utils/pnlFormatters";
import type { PositionResponseDTO } from "../../types";

interface PositionTableRowProps {
    position: PositionResponseDTO;
    onSquareOff: (position: PositionResponseDTO) => void;
    isSquaringOff: boolean;
}

export const PositionTableRow: FC<PositionTableRowProps> = ({
    position,
    onSquareOff,
    isSquaringOff,
}) => {
    const quote = useLiveStockQuote(position.symbol);

    const liveLtp = quote.price > 0 ? quote.price : position.currentLtp;
    const isLong = position.side === "LONG";
    const isOpen = position.quantity > 0;

    const liveUnrealizedPnL = isOpen
        ? isLong
            ? (liveLtp - position.averagePrice) * position.quantity
            : (position.averagePrice - liveLtp) * position.quantity
        : 0;

    const liveTotalPnL = position.realizedPnL + liveUnrealizedPnL;

    const liveReturnPercent =
        position.averagePrice > 0 && isOpen
            ? ((liveLtp - position.averagePrice) / position.averagePrice) * 100 * (isLong ? 1 : -1)
            : position.pnlPercentage;

    const isPnLPositive = liveTotalPnL >= 0;
    const pnlTextColor = isPnLPositive ? "text-[#22c55e]" : "text-[#ef4444]";

    return (
        <tr
            className={`border-b border-dash-border transition-[background-color,opacity] duration-150 group ${
                isOpen
                    ? "hover:bg-dash-panel-2/60"
                    : "hover:bg-dash-panel-2/30 opacity-60 hover:opacity-85"
            }`}
        >
            <td className="py-3 px-3 font-medium whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-dash-text">{position.symbol}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-dash-panel-2 text-dash-text-muted border border-dash-border">
                        NSE
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-dash-panel-2 text-dash-text border border-dash-border font-semibold">
                        {position.productType}
                    </span>
                </div>
            </td>

            <td className="py-3 px-3 whitespace-nowrap">
                {isOpen ? (
                    <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider inline-block ${
                            isLong
                                ? "bg-[#00873e]/15 text-[#00873e] border border-[#00873e]/30"
                                : "bg-[#c83200]/15 text-[#c83200] border border-[#c83200]/30"
                        }`}
                    >
                        {position.side}
                    </span>
                ) : (
                    <span className="text-dash-text-muted font-mono pl-2 select-none">—</span>
                )}
            </td>

            <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                <span className="font-semibold text-dash-text">{position.quantity}</span>
            </td>

            <td className="py-3 px-3 text-right font-mono text-dash-text whitespace-nowrap">
                ₹{formatINR(position.averagePrice)}
            </td>

            <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                <span
                    className={`font-semibold transition-colors duration-200 ${
                        isOpen
                            ? quote.flashDirection === "up"
                                ? "text-[#22c55e]"
                                : quote.flashDirection === "down"
                                ? "text-[#ef4444]"
                                : "text-dash-text"
                            : "text-dash-text"
                    }`}
                >
                    ₹{formatINR(liveLtp)}
                </span>
            </td>

            <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                <span className={`font-semibold ${pnlTextColor}`}>
                    {formatSignedINR(liveTotalPnL)}
                </span>
                <span className={`text-[10px] block ${pnlTextColor}`}>
                    ({formatSignedPercent(liveReturnPercent)})
                </span>
            </td>

            <td className="py-3 px-3 text-right whitespace-nowrap">
                {isOpen ? (
                    <button
                        type="button"
                        disabled={isSquaringOff}
                        onClick={() => onSquareOff(position)}
                        className="px-2.5 py-1 text-[11px] font-medium text-red hover:text-white hover:bg-red rounded border border-red/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                        Exit
                    </button>
                ) : (
                    <span className="text-dash-text-muted font-mono pr-2 select-none">—</span>
                )}
            </td>
        </tr>
    );
};
