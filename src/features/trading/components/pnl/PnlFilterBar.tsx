import type { FC } from "react";
import type { PnlSegment, PnlViewType } from "../../types";
import type { FilterSelectOption } from "./FilterSelect";
import { ReportFilterBar } from "./ReportFilterBar";

const PNL_VIEW_OPTIONS: readonly FilterSelectOption<PnlViewType>[] = [
    { value: "COMBINED", label: "Combined" },
    { value: "REALIZED", label: "Realised" },
    { value: "UNREALIZED", label: "Unrealised" },
];

export interface PnlFilterState {
    segment: PnlSegment;
    pnlType: PnlViewType;
    symbol: string;
    fromDate: string;
    toDate: string;
}

interface PnlFilterBarProps {
    filters: PnlFilterState;
    onChange: (filters: PnlFilterState) => void;
    onSubmit: () => void;
    isLoading?: boolean;
}

export const PnlFilterBar: FC<PnlFilterBarProps> = ({
    filters,
    onChange,
    onSubmit,
    isLoading = false,
}) => {
    return (
        <ReportFilterBar<PnlViewType>
            segment={filters.segment}
            onSegmentChange={(segment) => onChange({ ...filters, segment })}
            secondaryLabel="P&L"
            secondaryValue={filters.pnlType}
            secondaryOptions={PNL_VIEW_OPTIONS}
            onSecondaryChange={(pnlType) => onChange({ ...filters, pnlType })}
            symbol={filters.symbol}
            onSymbolChange={(symbol) => onChange({ ...filters, symbol })}
            fromDate={filters.fromDate}
            toDate={filters.toDate}
            onDateRangeChange={(fromDate, toDate) => onChange({ ...filters, fromDate, toDate })}
            onSubmit={onSubmit}
            isLoading={isLoading}
            submitTitle="Submit / Apply Filters"
        />
    );
};
