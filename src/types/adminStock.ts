export type InstrumentType = 'EQUITY' | 'INDEX';

export interface AdminStockItem {
    id: string;
    symbol: string;
    name: string;
    exchange: string;
    sector: string | null;
    type: InstrumentType;
    feedSymbol: string | null;
    isActive: boolean;
    isTradable: boolean;
    createdAt: string;
    updatedAt: string;
    orderCount: number;
}

export interface AdminStockMetrics {
    totalStocks: number;
    activeStocks: number;
    tradableStocks: number;
    totalSectors: number;
}

export interface AdminStocksPagination {
    page: number;
    limit: number;
    totalStocks: number;
    totalPages: number;
}

export interface AdminStocksData {
    stocks: AdminStockItem[];
    pagination: AdminStocksPagination;
    metrics: AdminStockMetrics;
}

export interface AdminStocksQuery {
    page?: number;
    limit?: number;
    query?: string;
    type?: 'ALL' | 'EQUITY' | 'INDEX';
    isActive?: boolean;
    isTradable?: boolean;
    sector?: string;
}

export interface CreateStockInput {
    symbol: string;
    name: string;
    exchange: string;
    sector?: string | null;
    type: InstrumentType;
    feedSymbol?: string | null;
    isActive: boolean;
    isTradable: boolean;
}

export interface UpdateStockInput {
    name: string;
    exchange: string;
    sector?: string | null;
    type: InstrumentType;
    feedSymbol?: string | null;
}

export interface UpdateStockStatusInput {
    isActive?: boolean;
    isTradable?: boolean;
}
