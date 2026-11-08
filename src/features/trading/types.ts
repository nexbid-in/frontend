export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT';
export type ProductType = 'CNC' | 'MIS';
export type OrderStatus = 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'REJECTED';
export type PositionSide = 'LONG' | 'SHORT';

export interface PlaceOrderRequestDTO {
    symbol: string;
    side: OrderSide;
    orderType: OrderType;
    productType: ProductType;
    quantity: number;
    price?: number | null;
    triggerPrice?: number | null;
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

export type OrdersTabFilter = 'ALL' | 'PENDING' | 'EXECUTED' | 'CANCELLED';
export type PositionsFilter = 'OPEN' | 'ALL';

