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

export interface UploadSignatureDTO {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
}

export interface UpdateProfileDTO {
    firstName?: string;
    lastName?: string;
    mobile?: string | null;
    profileImage?: string | null;
}

export interface ChangePasswordDTO {
    currentPassword: string;
    newPassword: string;
}

export const profileService = {
    getProfile: async (): Promise<UserProfileDTO> => {
        const response = await apiClient.get<{ success: boolean; message: string; data: UserProfileDTO }>(
            API_ROUTES.USER.PROFILE
        );
        return response.data.data;
    },
    getUploadSignature: async (): Promise<UploadSignatureDTO> => {
        const response = await apiClient.get<{ success: boolean; message: string; data: UploadSignatureDTO }>(
            API_ROUTES.USER.UPLOAD_SIGNATURE
        );
        return response.data.data;
    },
    uploadImageToCloudinary: async (file: File): Promise<string> => {
        const signatureData = await profileService.getUploadSignature();

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signatureData.apiKey);
        formData.append("timestamp", signatureData.timestamp.toString());
        formData.append("signature", signatureData.signature);
        formData.append("folder", signatureData.folder);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData?.error?.message || "Failed to upload image");
        }

        const data = await response.json();
        return data.secure_url;
    },
    updateProfile: async (data: UpdateProfileDTO): Promise<UserProfileDTO> => {
        const response = await apiClient.patch<{ success: boolean; message: string; data: UserProfileDTO }>(
            API_ROUTES.USER.PROFILE,
            data
        );
        return response.data.data;
    },
    changePassword: async (data: ChangePasswordDTO): Promise<string> => {
        const response = await apiClient.patch<{ success: boolean; message: string }>(
            API_ROUTES.USER.CHANGE_PASSWORD,
            data
        );
        return response.data.message;
    },
};
