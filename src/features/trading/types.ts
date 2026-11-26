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
    isExited?: boolean;
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
    exitedCount?: number;
}

export interface GetHoldingsResponse {
    holdings: HoldingItem[];
    exitedHoldings?: HoldingItem[];
    summary: HoldingsSummary;
}

export type PortfolioMainTab = 'POSITIONS' | 'HOLDINGS';
export type HoldingsFilter = 'ALL' | 'GAINERS' | 'LOSERS' | 'EXITED';

export type OrdersTabFilter = 'ALL' | 'PENDING' | 'EXECUTED' | 'CANCELLED';
export type PositionsFilter = 'OPEN' | 'ALL' | 'CLOSED';

// ============================================================================
// P&L STATEMENT TYPES (Zerodha-Standard FIFO Architecture)
// ============================================================================
export type PnlViewType = "COMBINED" | "REALIZED" | "UNREALIZED";
export type PnlSegment = "ALL" | "CNC" | "MIS" | "COMBINED" | "DELIVERY" | "INTRADAY";

export interface PnlChargesBreakdown {
  brokerage: number;
  stt: number;
  exchangeTurnoverCharges: number;
  sebiCharges: number;
  stampDuty: number;
  gst: number;
  totalCharges: number;
}

export interface PnlHeatmapDay {
  date: string; // 'YYYY-MM-DD'
  grossPnL: number;
  netPnL: number;
  tradesCount: number;
}

export interface PnlHeatmapSummary {
  greenDays: number;
  redDays: number;
  days: PnlHeatmapDay[];
}

export interface PnlSummary {
  realizedPnL: number;      // Gross Realized P&L
  charges: number;          // Total charges & taxes
  netRealizedPnL: number;   // Net Realized P&L (realizedPnL - charges)
  unrealizedPnL: number;    // Open positions MTM P&L
  chargesBreakdown: PnlChargesBreakdown;
}

export interface PnlSymbolSummary {
  symbol: string;
  exchange: string;         // e.g. "NSE"
  quantity: number;         // Matched closed quantity
  buyAvg: number;
  buyValue: number;
  sellAvg: number;
  sellValue: number;
  netRealizedPnL: number;   // Net Realized P&L (Zerodha primary column)
  unrealizedPnL: number;    // MTM on open quantity
  openQuantity: number;     // Open inventory still holding
}

export interface PnlStatementResponse {
  success: boolean;
  message: string;
  data: {
    summary: PnlSummary;
    heatmap: PnlHeatmapSummary;
    symbols: PnlSymbolSummary[];
    fromDate?: string;
    toDate?: string;
    segment: PnlSegment;
  };
}

export interface PnlStatementQueryParams {
  from?: string;
  to?: string;
  symbol?: string;
  pnlType?: PnlViewType;
  segment?: PnlSegment;
}

// ============================================================================
// TRADEBOOK TYPES (Zerodha-Standard Execution Ledger)
// ============================================================================
export type TradebookSegment = "ALL" | "CNC" | "MIS" | "COMBINED" | "DELIVERY" | "INTRADAY";
export type TradebookSide = "ALL" | "BUY" | "SELL";

export interface TradeChargesItem {
  brokerage: number;
  stt: number;
  exchangeTurnoverCharges: number;
  sebiCharges: number;
  stampDuty: number;
  gst: number;
  total: number;
}

export interface TradebookItem {
  id: string;
  orderId: string;
  symbol: string;
  exchange: string;
  productType: ProductType;
  side: OrderSide;
  quantity: number;
  price: number;
  tradeValue: number;
  charges: TradeChargesItem;
  executedAt: string;
}

export interface TradebookSummary {
  totalTrades: number;
  totalBuyTurnover: number;
  totalSellTurnover: number;
  totalCharges: number;
  chargesBreakdown?: PnlChargesBreakdown;
}

export interface TradebookPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface TradebookQueryParams {
  from?: string;
  to?: string;
  symbol?: string;
  segment?: TradebookSegment;
  side?: TradebookSide;
  page?: number;
  limit?: number;
}

export interface GetTradebookResponse {
  trades: TradebookItem[];
  summary: TradebookSummary;
  pagination: TradebookPagination;
}

export interface TradebookApiResponse {
  success: boolean;
  message: string;
  data: GetTradebookResponse;
}


