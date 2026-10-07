import { apiClient } from "@/config/apiClient";
import { API_ROUTES } from "@/constants/routes";

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

        const response = await apiClient.get<{ data: PaginatedUsersResponseDTO }>(`${API_ROUTES.ADMIN.GET_USERS}?${params.toString()}`);
        return response.data.data;
    },
};
