import { apiClient } from "@/config/apiClient";
import { API_ROUTES } from "@/constants/routes";
import type {
    AdminOrdersQueryDTO,
    AdminOrderMetricsDTO,
    AdminOrderDetailsDTO,
    PaginatedAdminOrdersResponseDTO,
} from "../types";

export type AdminUserListItemDTO = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage: string | null;
    isBlocked: boolean;
    createdAt: string | Date;
    lastActiveAt: string | Date | null;
};

export type PaginatedUsersResponseDTO = {
    users: AdminUserListItemDTO[];
    pagination: {
        page: number;
        limit: number;
        totalUsers: number;
        totalPages: number;
    };
};

export const adminService = {
    getUsers: async (
        page: number = 1,
        limit: number = 6,
        search?: string,
        status?: string
    ): Promise<PaginatedUsersResponseDTO> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (search) params.append("search", search);
        if (status && status !== "all") params.append("status", status.toUpperCase());

        const response = await apiClient.get<{ data: PaginatedUsersResponseDTO }>(
            `${API_ROUTES.ADMIN.USERS}?${params.toString()}`
        );
        return response.data.data;
    },

    updateUserStatus: async (userId: string): Promise<void> => {
        await apiClient.patch(API_ROUTES.ADMIN.USER_STATUS(userId));
    },

    getOrders: async (query: AdminOrdersQueryDTO): Promise<PaginatedAdminOrdersResponseDTO> => {
        const params = new URLSearchParams();
        params.append("page", query.page.toString());
        params.append("limit", query.limit.toString());

        if (query.search?.trim()) {
            params.append("search", query.search.trim());
        }
        if (query.status && query.status !== "ALL") {
            params.append("status", query.status);
        }
        if (query.side && query.side !== "ALL") {
            params.append("side", query.side);
        }
        if (query.productType && query.productType !== "ALL") {
            params.append("productType", query.productType);
        }
        if (query.isAmo !== undefined) {
            params.append("isAmo", query.isAmo ? "true" : "false");
        }
        if (query.startDate) {
            params.append("startDate", query.startDate);
        }
        if (query.endDate) {
            params.append("endDate", query.endDate);
        }

        const response = await apiClient.get<{ data: PaginatedAdminOrdersResponseDTO }>(
            `${API_ROUTES.ADMIN.ORDERS}?${params.toString()}`
        );
        return response.data.data;
    },

    getOrderMetrics: async (): Promise<AdminOrderMetricsDTO> => {
        const response = await apiClient.get<{ data: AdminOrderMetricsDTO }>(
            API_ROUTES.ADMIN.ORDER_METRICS
        );
        return response.data.data;
    },

    getOrderDetails: async (orderId: string): Promise<AdminOrderDetailsDTO> => {
        const response = await apiClient.get<{ data: AdminOrderDetailsDTO }>(
            API_ROUTES.ADMIN.ORDER_DETAILS(orderId)
        );
        return response.data.data;
    },

    cancelOrder: async (orderId: string): Promise<void> => {
        await apiClient.post(API_ROUTES.ADMIN.CANCEL_ORDER(orderId));
    },
};
