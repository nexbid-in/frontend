import { apiClient } from "@/config/apiClient"; // Import your new instance
import { type SignUpFormData, type SignInFormData } from "../schemas";

export const authService = {
    register: async (data: Omit<SignUpFormData, 'confirmPassword'>) => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },

    verifyOtp: async (email: string, otp: string) => {
        const response = await apiClient.post('/auth/verify-otp', { email, otp });
        return response.data; 
    },

    resendOtp: async (email: string) => {
        const response = await apiClient.post('/auth/resend-otp', { email });
        return response.data;
    },

    login: async (data: SignInFormData) => {
        const response = await apiClient.post('/auth/login', data);
        return response.data;
    }
};
