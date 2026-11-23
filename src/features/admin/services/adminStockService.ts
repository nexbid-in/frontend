import { apiClient } from "@/config/apiClient";
import { API_ROUTES } from "@/constants/routes";
import type {
    AdminStocksQuery,
    AdminStocksData,
    AdminStockItem,
    CreateStockInput,
    UpdateStockInput,
    UpdateStockStatusInput,
} from "@/types/adminStock";

export const adminStockService = {
    getAdminStocks: async (query: AdminStocksQuery = {}): Promise<AdminStocksData> => {
        const params = new URLSearchParams();
        if (query.page !== undefined) params.append("page", query.page.toString());
        if (query.limit !== undefined) params.append("limit", query.limit.toString());
        if (query.query && query.query.trim()) params.append("query", query.query.trim());
        if (query.type && query.type !== "ALL") params.append("type", query.type);
        if (query.isActive !== undefined) params.append("isActive", String(query.isActive));
        if (query.isTradable !== undefined) params.append("isTradable", String(query.isTradable));

        const queryString = params.toString();
        const url = queryString ? `${API_ROUTES.ADMIN.STOCKS}?${queryString}` : API_ROUTES.ADMIN.STOCKS;

        const response = await apiClient.get<{ data: AdminStocksData }>(url);
        return response.data.data;
    },

    createStock: async (payload: CreateStockInput): Promise<AdminStockItem> => {
        const response = await apiClient.post<{ data: AdminStockItem }>(
            API_ROUTES.ADMIN.STOCKS,
            payload
        );
        return response.data.data;
    },

    updateStockStatus: async (
        stockId: string,
        payload: UpdateStockStatusInput
    ): Promise<AdminStockItem> => {
        const response = await apiClient.patch<{ data: AdminStockItem }>(
            API_ROUTES.ADMIN.STOCK_STATUS(stockId),
            payload
        );
        return response.data.data;
    },

    updateStock: async (
        stockId: string,
        payload: UpdateStockInput
    ): Promise<AdminStockItem> => {
        const response = await apiClient.put<{ data: AdminStockItem }>(
            API_ROUTES.ADMIN.STOCK_DETAILS(stockId),
            payload
        );
        return response.data.data;
    },

    deleteStock: async (stockId: string): Promise<void> => {
        await apiClient.delete(API_ROUTES.ADMIN.STOCK_DETAILS(stockId));
    },
};
