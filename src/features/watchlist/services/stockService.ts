import { apiClient } from "@/config/apiClient";
import { API_ROUTES } from "@/constants/routes";
import type { SearchStocksParams, SearchStocksResponseDTO, StockItemDTO } from "../types";

export const stockService = {
    searchStocks: async (
        queryOrParams?: string | SearchStocksParams,
        legacyLimit: number = 20
    ): Promise<StockItemDTO[]> => {
        const params: SearchStocksParams =
            typeof queryOrParams === "string"
                ? { query: queryOrParams, limit: legacyLimit }
                : (queryOrParams ?? {});

        const result = await stockService.searchInstruments(params);
        return result.stocks;
    },

    searchInstruments: async (
        params: SearchStocksParams = {}
    ): Promise<SearchStocksResponseDTO> => {
        const trimmed = params.query?.trim();

        const response = await apiClient.get<{
            success: boolean;
            message: string;
            data: SearchStocksResponseDTO;
        }>(API_ROUTES.STOCKS.SEARCH, {
            params: {
                ...(trimmed ? { q: trimmed } : {}),
                ...(params.type ? { type: params.type } : {}),
                ...(params.page ? { page: params.page } : { page: 1 }),
                ...(params.limit ? { limit: params.limit } : { limit: 20 }),
            },
        });

        return response.data.data;
    },
};
