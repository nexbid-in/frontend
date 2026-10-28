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


export interface CreateTopupOrderRequestDTO {
    realAmount: number;
}

export interface CreateTopupOrderResponseDTO {
    orderId: string;
    paymentOrderId: string;
    amount: number; 
    currency: string;
    virtualAmount: number;
    keyId: string;
}

export interface VerifyTopupPaymentRequestDTO {
    orderId: string;
    paymentId: string;
    signature: string;
}

export interface VerifyTopupPaymentResponseDTO {
    success: boolean;
    balance: number;
    virtualAmountAdded: number;
}

export interface FailTopupPaymentRequestDTO {
    orderId: string;
    paymentId?: string | null;
    reason?: string | null;
}

export interface FailTopupPaymentResponseDTO {
    success: boolean;
    orderId: string;
    status: 'FAILED';
}

export type PaymentOrderStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface TopupHistoryItemDTO {
    id: string;
    orderId: string;
    paymentId: string | null;
    realAmount: number;
    virtualAmount: number;
    status: PaymentOrderStatus;
    createdAt: string;
    updatedAt: string;
}

export interface TopupHistoryPagination {
    page: number;
    limit: number;
    totalOrders: number;
    totalPages: number;
}

export interface PaginatedTopupHistoryResponseDTO {
    orders: TopupHistoryItemDTO[];
    pagination: TopupHistoryPagination;
}

export interface GetTopupHistoryParams {
    page?: number;
    limit?: number;
    status?: PaymentOrderStatus | 'ALL';
    search?: string;
    startDate?: string;
    endDate?: string;
}

export interface RazorpaySuccessHandlerArgs {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}


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
