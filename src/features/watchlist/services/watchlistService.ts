import { apiClient } from "@/config/apiClient";
import { API_ROUTES } from "@/constants/routes";
import type {
    GetWatchlistResponseDTO,
    WatchlistItemDTO,
    AddToWatchlistResponseDTO,
    RemoveFromWatchlistResponseDTO,
} from "../types";

export const watchlistService = {
    getWatchlist: async (): Promise<WatchlistItemDTO[]> => {
        const response = await apiClient.get<{
            success: boolean;
            message: string;
            data: GetWatchlistResponseDTO;
        }>(API_ROUTES.WATCHLIST.ROOT);

        return response.data.data.items;
    },

    addToWatchlist: async (stockId: string): Promise<WatchlistItemDTO> => {
        const response = await apiClient.post<{
            success: boolean;
            message: string;
            data: AddToWatchlistResponseDTO;
        }>(API_ROUTES.WATCHLIST.ROOT, { stockId });

        return response.data.data.item;
    },

    removeFromWatchlist: async (stockId: string): Promise<RemoveFromWatchlistResponseDTO> => {
        const response = await apiClient.delete<{
            success: boolean;
            message: string;
            data: RemoveFromWatchlistResponseDTO;
        }>(API_ROUTES.WATCHLIST.ITEM(stockId));

        return response.data.data;
    },
};
