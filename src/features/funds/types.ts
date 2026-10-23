export type WalletTransactionType = 'TOPUP' | 'BUY' | 'SELL' | 'BONUS';

export interface WalletExchangeRate {
    real: number;
    virtual: number;
    ratio: number;
}

export interface WalletOverviewDTO {
    balance: number;
    usedMargin: number;
    totalVirtualMoneyBought: number;
    totalRealMoneyUsed: number;
    tradingStatus: 'ACTIVE' | 'FROZEN' | 'SUSPENDED' | string;
    exchangeRate: WalletExchangeRate;
}

export interface WalletStatementItemDTO {
    id: string;
    referenceId: string;
    type: WalletTransactionType;
    amount: number;
    balanceAfter: number;
    description: string;
    metadata?: Record<string, unknown> | null;
    createdAt: string;
}

export interface WalletStatementPagination {
    page: number;
    limit: number;
    totalTransactions: number;
    totalPages: number;
}

export interface PaginatedWalletStatementResponseDTO {
    transactions: WalletStatementItemDTO[];
    pagination: WalletStatementPagination;
}

export interface GetWalletStatementParams {
    page?: number;
    limit?: number;
    search?: string;
    type?: WalletTransactionType | 'ALL';
    startDate?: string;
    endDate?: string;
}

// Legacy aliases for backward compatibility if referenced elsewhere
export interface TransactionRecord {
    id: string;
    txnNumber: string;
    date: string;
    type: string;
    realAmount: number;
    virtualAmount: number;
    paymentMethod: string;
    status: 'Completed' | 'Pending' | 'Failed';
}

export interface FundsSummary {
    availableVirtual: number;
    usedMargin: number;
    totalVirtualBought: number;
    totalRealUsed: number;
}
