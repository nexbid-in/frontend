import { apiClient } from "@/config/apiClient";
import { API_ROUTES } from "@/constants/routes";

export interface UserProfileDTO {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    mobile: string | null;
    profileImage: string | null;
    createdAt: string;
    hasPassword: boolean;
    isGoogleLinked: boolean;
}

export const profileService = {
    getProfile: async (): Promise<UserProfileDTO> => {
        const response = await apiClient.get<{ success: boolean; message: string; data: UserProfileDTO }>(
            API_ROUTES.USER.PROFILE
        );
        return response.data.data;
    },
};
