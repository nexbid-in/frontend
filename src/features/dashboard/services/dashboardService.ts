import { apiClient } from "@/config/apiClient";
import { API_ROUTES } from "@/constants/routes";
import type { DashboardOverviewData, DashboardOverviewApiResponse } from "../types";

export const dashboardService = {
    getOverview: async (): Promise<DashboardOverviewData> => {
        const response = await apiClient.get<DashboardOverviewApiResponse>(
            API_ROUTES.DASHBOARD.OVERVIEW
        );
        return response.data.data;
    },
};
