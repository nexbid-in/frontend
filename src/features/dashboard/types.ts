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
    statusText: string;
}

export interface DashboardBenchmarkIndex {
    symbol: string;
    name: string;
    ltp: number;
    change: number;
    changePercent: number;
}

export interface DashboardMargins {
    availableMargin: number;
    usedMargin: number;
    availableCash: number;
    openingBalance: number;
    tradingStatus: string;
}

export interface HoldingAllocationItem {
    symbol: string;
    quantity: number;
    currentLtp: number;
    investmentValue: number;
    currentValue: number;
    totalPnl: number;
    totalPnlPercentage: number;
    weightagePercentage: number;
}

export interface DashboardHoldingsOverview {
    totalHoldingsCount: number;
    totalInvestmentValue: number;
    totalCurrentValue: number;
    totalPnl: number;
    totalPnlPercentage: number;
    dayPnl: number;
    dayPnlPercentage: number;
    allocation: HoldingAllocationItem[];
}

export interface RecentPositionItem {
    id: string;
    symbol: string;
    productType: string;
    side: string;
    quantity: number;
    averagePrice: number;
    ltp: number;
    unrealizedPnL: number;
    pnlPercentage: number;
}

export interface DashboardPositionsOverview {
    openPositionsCount: number;
    dayRealizedPnL: number;
    dayUnrealizedPnL: number;
    dayNetPnL: number;
    recentPositions: RecentPositionItem[];
}

export interface DashboardOverviewData {
    user: DashboardUserProfile;
    marketStatus: DashboardMarketStatus;
    indices: DashboardBenchmarkIndex[];
    margins: DashboardMargins;
    holdings: DashboardHoldingsOverview;
    positions: DashboardPositionsOverview;
}

export interface DashboardOverviewApiResponse {
    success: boolean;
    message: string;
    data: DashboardOverviewData;
}
