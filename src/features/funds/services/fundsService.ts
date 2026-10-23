import { apiClient } from "@/config/apiClient";
import { API_ROUTES } from "@/constants/routes";
import type {
    WalletOverviewDTO,
    PaginatedWalletStatementResponseDTO,
    GetWalletStatementParams,
} from "../types";

export const fundsService = {
    getOverview: async (): Promise<WalletOverviewDTO> => {
        const response = await apiClient.get<{
            success: boolean;
            message: string;
            data: WalletOverviewDTO;
        }>(API_ROUTES.WALLET.OVERVIEW);
        return response.data.data;
    },

    getStatement: async (
        params: GetWalletStatementParams = {}
    ): Promise<PaginatedWalletStatementResponseDTO> => {
        const queryParams: Record<string, string | number> = {
            page: params.page ?? 1,
            limit: params.limit ?? 10,
        };

        if (params.search && params.search.trim() !== "") {
            queryParams.search = params.search.trim();
        }

        if (params.type && params.type !== "ALL") {
            queryParams.type = params.type;
        }

        if (params.startDate) {
            queryParams.startDate = params.startDate;
        }

        if (params.endDate) {
            queryParams.endDate = params.endDate;
        }

        const response = await apiClient.get<{
            success: boolean;
            message: string;
            data: PaginatedWalletStatementResponseDTO;
        }>(API_ROUTES.WALLET.STATEMENT, {
            params: queryParams,
        });

        return response.data.data;
    },
};
