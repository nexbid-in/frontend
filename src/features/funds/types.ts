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
