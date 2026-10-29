import { apiClient } from "@/config/apiClient";
import { API_ROUTES } from "@/constants/routes";
import type { SearchStocksResponseDTO, StockItemDTO } from "../types";

export const stockService = {
    searchStocks: async (query: string, limit: number = 15): Promise<StockItemDTO[]> => {
        const trimmed = query.trim();
        if (!trimmed) {
            return [];
        }

        const response = await apiClient.get<{
            success: boolean;
            message: string;
            data: SearchStocksResponseDTO;
        }>(API_ROUTES.STOCKS.SEARCH, {
            params: {
                q: trimmed,
                limit,
            },
        });

        return response.data.data.stocks;
    },
};
