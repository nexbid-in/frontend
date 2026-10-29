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

export interface SearchStocksResponseDTO {
    stocks: StockItemDTO[];
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
