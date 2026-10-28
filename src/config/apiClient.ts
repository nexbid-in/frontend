import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { store } from "@/store/store";
import { logout, setAccountBlocked } from "@/features/auth/store/authSlice";
import { API_ROUTES } from "@/constants/routes";
import { queryClient } from "./queryClient";
import { env } from "./env";

export const apiClient = axios.create({
    baseURL: env.API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

export interface ApiErrorResponse<T = unknown> {
    success: false;
    error: {
        code: string;
        message: string;
        details?: T;
    };
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        const errorData = error.response?.data;
        const errorCode = errorData?.error?.code;
        const message =
            errorData?.error?.message ||
            error.message ||
            'An unexpected error occurred';

        if (errorCode === 'ACCOUNT_BLOCKED') {
            store.dispatch(setAccountBlocked());
            return Promise.reject(new Error(message));
        }

        const GUEST_AUTH_ROUTES = [
            API_ROUTES.AUTH.LOGIN,
            API_ROUTES.AUTH.REGISTER,
            API_ROUTES.AUTH.FORGOT_PASSWORD,
            API_ROUTES.AUTH.RESET_PASSWORD,
            API_ROUTES.AUTH.VERIFY_OTP,
            API_ROUTES.AUTH.RESEND_OTP,
            API_ROUTES.AUTH.GOOGLE,
        ];

        const isAuthRoute = GUEST_AUTH_ROUTES.some((route) => originalRequest?.url?.includes(route));

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
            if (originalRequest.url?.includes(API_ROUTES.AUTH.REFRESH)) {
                queryClient.clear();
                store.dispatch(logout());
                return Promise.reject(new Error(message));
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => apiClient(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await apiClient.post(API_ROUTES.AUTH.REFRESH);
                processQueue(null);
                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                queryClient.clear();
                store.dispatch(logout());
                return Promise.reject(new Error(message));
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(new Error(message));
    }
);
