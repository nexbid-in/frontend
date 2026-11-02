import { apiClient } from "@/config/apiClient";
import { API_ROUTES } from "@/constants/routes";

export interface HistoricalCandle {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
    turnover?: number;
}

export interface GetHistoricalCandlesParams {
    symbol: string;
    resolution: string;
    from?: number;
    to?: number;
}

export const marketService = {
    getHistoricalCandles: async (params: GetHistoricalCandlesParams): Promise<HistoricalCandle[]> => {
        const response = await apiClient.get<{
            success: boolean;
            message: string;
            data?: HistoricalCandle[];
        }>(API_ROUTES.MARKET.HISTORY, {
            params: {
                symbol: params.symbol,
                resolution: params.resolution,
                ...(typeof params.from === "number" && params.from > 0 ? { from: params.from } : {}),
                ...(typeof params.to === "number" && params.to > 0 ? { to: params.to } : {}),
            },
        });

        return response.data.data ?? [];
    },
};
