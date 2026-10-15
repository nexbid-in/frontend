export const env = {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:7000/api',
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
} as const;
