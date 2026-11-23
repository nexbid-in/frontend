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
export type PnlSegment = "ALL" | "CNC" | "MIS";

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
  neutralDays: number;
  days: PnlHeatmapDay[];
}

export interface PnlSummary {
  realizedPnL: number;      // Gross Realized P&L
  charges: number;          // Total charges & taxes
  netRealizedPnL: number;   // Net Realized P&L (realizedPnL - charges)
  unrealizedPnL: number;    // Open positions MTM P&L
  chargesBreakdown: PnlChargesBreakdown;
}

export interface PnlFifoLeg {
  status: "Closed" | "Open";
  productType: ProductType; // "CNC" | "MIS"
  buyDate: string;          // ISO date or YYYY-MM-DD
  sellDate: string | null;  // ISO date or null (displayed as "—" when Open)
  quantity: number;
  buyPrice: number;
  sellPrice: number;        // Exit fill price if Closed, or current LTP if Open
  isLtp: boolean;           // True if Open leg evaluated at market LTP
  tradePnL: number;         // Realized P&L if Closed, Unrealized P&L if Open
  charges: PnlChargesBreakdown;
  netPnL: number;           // tradePnL - totalCharges
}

export interface PnlSymbolSummary {
  symbol: string;
  exchange: string;         // e.g. "NSE"
  productType: ProductType; // "CNC" | "MIS"
  quantity: number;         // Matched closed quantity
  buyAvg: number;
  buyValue: number;
  sellAvg: number;
  sellValue: number;
  grossRealizedPnL: number;
  charges: number;
  netRealizedPnL: number;   // Net Realized P&L (Zerodha primary column)
  chargesBreakdown: PnlChargesBreakdown;
  unrealizedPnL: number;    // MTM on open quantity
  openQuantity: number;     // Open inventory still holding
  currentLtp: number;
  legs: PnlFifoLeg[];       // Granular FIFO trade breakdown
  tags?: string[];
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

