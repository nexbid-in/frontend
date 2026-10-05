import { apiClient } from "@/config/apiClient"; // Import your new instance
import { type SignUpFormData, type SignInFormData } from "../schemas";
import { API_ROUTES } from "@/constants/routes";

export const authService = {
    register: async (data: Omit<SignUpFormData, 'confirmPassword'>) => {
        const response = await apiClient.post(API_ROUTES.AUTH.REGISTER, data);
        return response.data;
    },

    verifyOtp: async (email: string, otp: string) => {
        const response = await apiClient.post(API_ROUTES.AUTH.VERIFY_OTP, { email, otp });
        return response.data; 
    },

    resendOtp: async (email: string) => {
        const response = await apiClient.post(API_ROUTES.AUTH.RESEND_OTP, { email });
        return response.data;
    },

    login: async (data: SignInFormData, portal: "USER" | "ADMIN" = "USER") => {
        const payload = { ...data, portal };
        const response = await apiClient.post(API_ROUTES.AUTH.LOGIN, payload);
        return response.data;
    },

    logout: async () => {
        const response = await apiClient.post(API_ROUTES.AUTH.LOGOUT);
        return response.data;
    },

    getMe: async () => {
        const response = await apiClient.get(API_ROUTES.AUTH.ME);
        return response.data;
    }
};
