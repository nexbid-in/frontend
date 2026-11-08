import { apiClient } from "@/config/apiClient";
import { API_ROUTES } from "@/constants/routes";
import type {
    PlaceOrderRequestDTO,
    OrderResponseDTO,
    OrderStatus,
    GetPositionsResponseDTO,
    PositionResponseDTO,
    PositionsFilter,
    MarketStatusInfo,
} from "../types";

export const tradingService = {
    /**
     * Retrieve Indian stock exchange market session status, trading hours, and AMO availability
     */
    getMarketStatus: async (): Promise<MarketStatusInfo> => {
        const response = await apiClient.get<{
            success: boolean;
            message: string;
            data: MarketStatusInfo;
        }>(API_ROUTES.ORDERS.MARKET_STATUS);
        return response.data.data;
    },

    /**
     * Place a new virtual order (Market or Limit, MIS or CNC, Regular or AMO)
     */
    placeOrder: async (data: PlaceOrderRequestDTO): Promise<OrderResponseDTO> => {
        const response = await apiClient.post<{
            success: boolean;
            message: string;
            data: OrderResponseDTO;
        }>(API_ROUTES.ORDERS.ROOT, data);
        return response.data.data;
    },

    /**
     * Retrieve user orders, optionally filtered by status (PENDING, EXECUTED, CANCELLED, REJECTED)
     */
    getOrders: async (status?: OrderStatus): Promise<OrderResponseDTO[]> => {
        const response = await apiClient.get<{
            success: boolean;
            message: string;
            data: OrderResponseDTO[];
        }>(API_ROUTES.ORDERS.ROOT, {
            params: status ? { status } : {},
        });
        return response.data.data;
    },

    /**
     * Cancel an active pending order to unlock reserved margin
     */
    cancelOrder: async (orderId: string): Promise<OrderResponseDTO> => {
        const response = await apiClient.delete<{
            success: boolean;
            message: string;
            data: OrderResponseDTO;
        }>(API_ROUTES.ORDERS.CANCEL(orderId));
        return response.data.data;
    },

    /**
     * Retrieve portfolio positions and aggregated summary (filter: 'OPEN' or 'ALL')
     */
    getPositions: async (filter: PositionsFilter = "OPEN"): Promise<GetPositionsResponseDTO> => {
        const response = await apiClient.get<{
            success: boolean;
            message: string;
            data: GetPositionsResponseDTO;
        }>(API_ROUTES.PORTFOLIO.POSITIONS, {
            params: { filter },
        });
        return response.data.data;
    },

    /**
     * Square off / exit an open position by placing an opposing market order
     */
    squareOffPosition: async (positionId: string): Promise<PositionResponseDTO> => {
        const response = await apiClient.post<{
            success: boolean;
            message: string;
            data: PositionResponseDTO;
        }>(API_ROUTES.PORTFOLIO.SQUARE_OFF(positionId));
        return response.data.data;
    },
};

