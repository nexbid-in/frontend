export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT';
export type ProductType = 'CNC' | 'MIS';
export type OrderStatus = 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'REJECTED';
export type PositionSide = 'LONG' | 'SHORT';

export type MarketSession = 'REGULAR' | 'PRE_MARKET' | 'POST_MARKET' | 'CLOSED';

export interface MarketStatusInfo {
    isOpen: boolean;
    isMisAllowed: boolean;
    isAmoAllowed: boolean;
    session: MarketSession;
    currentIstTime: string;
    enforceMarketHours: boolean;
}

export interface PlaceOrderRequestDTO {
    symbol: string;
    side: OrderSide;
    orderType: OrderType;
    productType: ProductType;
    quantity: number;
    price?: number | null;
    triggerPrice?: number | null;
    isAmo?: boolean;
}

export interface OrderResponseDTO {
    id: string;
    userId: string;
    stockId: string;
    symbol: string;
    side: OrderSide;
    orderType: OrderType;
    productType: ProductType;
    status: OrderStatus;
    quantity: number;
    filledQuantity: number;
    price: number | null;
    averagePrice: number | null;
    triggerPrice: number | null;
    rejectionReason: string | null;
    blockedMargin: number;
    isAmo: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PositionResponseDTO {
    id: string;
    userId: string;
    stockId: string;
    symbol: string;
    productType: ProductType;
    side: PositionSide;
    quantity: number;
    buyQty: number;
    buyAmount: number;
    sellQty: number;
    sellAmount: number;
    averagePrice: number;
    currentLtp: number;
    unrealizedPnL: number;
    realizedPnL: number;
    totalPnL: number;
    pnlPercentage: number;
    blockedMargin: number;
    createdAt: string;
    updatedAt: string;
}

export interface PortfolioSummaryDTO {
    totalInvestment: number;
    currentPortfolioValue: number;
    totalUnrealizedPnL: number;
    totalRealizedPnL: number;
    netPnL: number;
    overallReturnPercentage: number;
    positionsCount: {
        total: number;
        open: number;
        closed: number;
    };
}

export interface GetPositionsResponseDTO {
    positions: PositionResponseDTO[];
    summary: PortfolioSummaryDTO;
}

export interface HoldingItem {
    id: string;
    stockId: string;
    symbol: string;
    quantity: number;
    buyAvgPrice: number;
    currentLtp: number;
    investedAmount: number;
    currentValue: number;
    totalPnL: number;
    totalPnLPercentage: number;
    dayChange: number;
    dayChangePercentage: number;
    dayPnL: number;
    isBoughtToday?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface HoldingsSummary {
    totalInvested: number;
    currentValue: number;
    totalPnL: number;
    totalPnLPercentage: number;
    todayPnL: number;
    todayPnLPercentage: number;
    holdingsCount: number;
}

export interface GetHoldingsResponse {
    holdings: HoldingItem[];
    summary: HoldingsSummary;
}

export type PortfolioMainTab = 'POSITIONS' | 'HOLDINGS';
export type HoldingsFilter = 'ALL' | 'GAINERS' | 'LOSERS';

export type OrdersTabFilter = 'ALL' | 'PENDING' | 'EXECUTED' | 'CANCELLED';
export type PositionsFilter = 'OPEN' | 'ALL';

