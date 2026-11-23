export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'SL' | 'SL_M';
export type ProductType = 'CNC' | 'MIS';
export type OrderStatus = 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'REJECTED';

export type AdminOrderFilterStatus = 'ALL' | OrderStatus;
export type AdminOrderFilterSide = 'ALL' | OrderSide;
export type AdminOrderFilterProduct = 'ALL' | ProductType;
export type AdminOrderFilterAmo = 'ALL' | 'AMO_ONLY' | 'REGULAR_ONLY';

export interface AdminOrdersQueryDTO {
    page: number;
    limit: number;
    search?: string;
    status?: AdminOrderFilterStatus;
    side?: AdminOrderFilterSide;
    productType?: AdminOrderFilterProduct;
    isAmo?: boolean;
    startDate?: string;
    endDate?: string;
}

export interface AdminOrderListItemDTO {
    id: string;
    userId: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        profileImage: string | null;
    };
    stockId: string;
    symbol: string;
    stock: {
        symbol: string;
        name: string;
        exchange: string;
    };
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

export interface PaginatedAdminOrdersResponseDTO {
    orders: AdminOrderListItemDTO[];
    pagination: {
        page: number;
        limit: number;
        totalOrders: number;
        totalPages: number;
    };
}

export interface AdminOrderMetricsDTO {
    todayOrdersCount: number;
    todayTurnover: number;
    pendingAmoCount: number;
    todayExecutedCount: number;
    todayRejectedCount: number;
    todayCancelledCount: number;
}

export interface AdminOrderTradeDTO {
    id: string;
    side: OrderSide;
    productType: ProductType;
    quantity: number;
    price: number;
    tradeValue: number;
    realizedPnL: number;
    executedAt: string;
}

export interface AdminOrderDetailsDTO {
    id: string;
    userId: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        mobile: string | null;
        profileImage: string | null;
        isBlocked: boolean;
        createdAt: string;
        walletBalance: number;
    };
    stockId: string;
    symbol: string;
    stock: {
        id: string;
        symbol: string;
        name: string;
        exchange: string;
        sector: string | null;
        type: string;
    };
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
    trades: AdminOrderTradeDTO[];
}

export * from "@/types/adminStock";

