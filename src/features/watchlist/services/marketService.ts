import { apiClient } from "@/config/apiClient";
import { API_ROUTES } from "@/constants/routes";
import type { KLineData } from "klinecharts";

export interface GetHistoricalCandlesParams {
    symbol: string;
    resolution: string;
    from?: number;
    to?: number;
}

export const marketService = {
    getHistoricalCandles: async (params: GetHistoricalCandlesParams): Promise<KLineData[]> => {
        const response = await apiClient.get<{
            success: boolean;
            message: string;
            data?: KLineData[];
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
