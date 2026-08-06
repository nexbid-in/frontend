import axios from "axios";


export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:7000/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

apiClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = 
            error.response?.data?.error?.message || 
            error.response?.data?.message || 
            error.message || 
            'An unexpected error occurred';
            
        return Promise.reject(new Error(message));
    }
);
