const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';
const defaultWsUrl = apiUrl.replace(/^http/, 'ws').replace(/\/api\/?$/, '');

export const env = {
    API_URL: apiUrl,
    WS_URL: import.meta.env.VITE_WS_URL || defaultWsUrl,
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
} as const;

