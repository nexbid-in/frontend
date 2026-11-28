import type { FC } from "react";
import type { TradebookSegment, TradebookSide } from "../../types";
import { ReportFilterBar, type FilterSelectOption } from "../pnl";

const TRADEBOOK_SIDE_OPTIONS: readonly FilterSelectOption<TradebookSide>[] = [
    { value: "ALL", label: "All Sides" },
    { value: "BUY", label: "Buy" },
    { value: "SELL", label: "Sell" },
];

export interface TradebookFilterState {
    segment: TradebookSegment;
    side: TradebookSide;
    symbol: string;
    fromDate: string;
    toDate: string;
}

interface TradebookFilterBarProps {
    filters: TradebookFilterState;
    onChange: (filters: TradebookFilterState) => void;
    onSubmit: () => void;
    isLoading?: boolean;
}

export const TradebookFilterBar: FC<TradebookFilterBarProps> = ({
    filters,
    onChange,
    onSubmit,
    isLoading = false,
}) => {
    return (
        <ReportFilterBar<TradebookSide>
            segment={filters.segment}
            onSegmentChange={(segment) => onChange({ ...filters, segment })}
            secondaryLabel="Side"
            secondaryValue={filters.side}
            secondaryOptions={TRADEBOOK_SIDE_OPTIONS}
            onSecondaryChange={(side) => onChange({ ...filters, side })}
            symbol={filters.symbol}
            onSymbolChange={(symbol) => onChange({ ...filters, symbol })}
            fromDate={filters.fromDate}
            toDate={filters.toDate}
            onDateRangeChange={(fromDate, toDate) => onChange({ ...filters, fromDate, toDate })}
            onSubmit={onSubmit}
            isLoading={isLoading}
            submitTitle="Search trades"
        />
    );
};
