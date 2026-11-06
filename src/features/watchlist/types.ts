export const InstrumentType = {
    EQUITY: "EQUITY",
    INDEX: "INDEX",
} as const;

export type InstrumentType = (typeof InstrumentType)[keyof typeof InstrumentType];

export interface StockItemDTO {
    id: string;
    symbol: string;
    name: string;
    exchange: string;
    sector: string | null;
    type: InstrumentType;
    isActive: boolean;
    isTradable: boolean;
}

export interface WatchlistItemDTO {
    id: string;
    stockId: string;
    order: number;
    addedAt: string | Date;
    stock: StockItemDTO;
}

export interface PaginationDTO {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

export interface InstrumentCountsDTO {
    all: number;
    equities: number;
    indices: number;
}

export interface SearchStocksParams {
    query?: string;
    type?: "ALL" | "EQUITY" | "INDEX";
    page?: number;
    limit?: number;
}

export interface SearchStocksResponseDTO {
    stocks: StockItemDTO[];
    pagination?: PaginationDTO;
    counts?: InstrumentCountsDTO;
}

export interface GetWatchlistResponseDTO {
    items: WatchlistItemDTO[];
}

export interface AddToWatchlistResponseDTO {
    success: boolean;
    item: WatchlistItemDTO;
}

export interface RemoveFromWatchlistResponseDTO {
    success: boolean;
    message: string;
}

export interface StockOverviewVitalsDTO {
    ltp: number;
    change: number;
    changePercent: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    atp: number;
    lowerCircuit: number | null;
    upperCircuit: number | null;
    totalBuyQty: number | null;
    totalSellQty: number | null;
    bidPrice: number | null;
    askPrice: number | null;
}

export interface StockRange52WDTO {
    high: number;
    low: number;
}

export interface StockPerformanceReturnsDTO {
    oneWeek: number | null;
    oneMonth: number | null;
    oneYear: number | null;
}

export interface StockOverviewResponseDTO {
    symbol: string;
    name: string;
    exchange: string;
    sector: string | null;
    type: string;
    isTradable: boolean;
    isActive: boolean;
    vitals: StockOverviewVitalsDTO;
    range52W: StockRange52WDTO;
    performance: StockPerformanceReturnsDTO;
    lastUpdated: number;
}
