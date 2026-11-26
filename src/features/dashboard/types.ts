export interface DashboardUserProfile {
    id: string;
    name: string;
    email: string;
}

export type MarketSessionType = "REGULAR" | "PRE_MARKET" | "POST_MARKET" | "CLOSED";

export interface DashboardMarketStatus {
    isOpen: boolean;
    session: MarketSessionType;
    currentIstTime: string;
}

export interface DashboardMargins {
    availableMargin: number;
    usedMargin: number;
    availableCash: number;
    openingBalance: number;
    tradingStatus: string;
}

export interface DashboardHoldingsOverview {
    totalHoldingsCount: number;
    totalInvestmentValue: number;
    totalCurrentValue: number;
    totalPnl: number;
    totalPnlPercentage: number;
    dayPnl: number;
    dayPnlPercentage: number;
}

export interface DashboardPositionsOverview {
    openPositionsCount: number;
    dayRealizedPnL: number;
    dayUnrealizedPnL: number;
    dayNetPnL: number;
    sessionPositionsCount: number;
}

export interface DashboardOverviewData {
    user: DashboardUserProfile;
    marketStatus: DashboardMarketStatus;
    margins: DashboardMargins;
    holdings: DashboardHoldingsOverview;
    positions: DashboardPositionsOverview;
}

export interface DashboardOverviewApiResponse {
    success: boolean;
    message: string;
    data: DashboardOverviewData;
}
