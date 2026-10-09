import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { store } from "@/store/store";
import { logout } from "@/features/auth/store/authSlice";
import { API_ROUTES } from "@/constants/routes";

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:7000/api',
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

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        const message = 
            (error.response?.data as any)?.error?.message || 
            (error.response?.data as any)?.message || 
            error.message || 
            'An unexpected error occurred';

        const isAuthLogin = originalRequest?.url?.includes(API_ROUTES.AUTH.LOGIN);

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthLogin) {
            if (originalRequest.url?.includes(API_ROUTES.AUTH.REFRESH)) {
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
                store.dispatch(logout());
                return Promise.reject(new Error(message));
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(new Error(message));
    }
);
