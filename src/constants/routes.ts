export const APP_ROUTES = {
    USER: {
        // Public Routes
        HOME: '/',
        SIGN_IN: '/signin',
        SIGN_UP: '/signup',
        FORGOT_PASSWORD: '/forgot-password',
        RESET_PASSWORD: '/reset-password',

        // Marketing Pages
        ABOUT: '/about',
        PRODUCTS: '/products',
        PRICING: '/pricing',
        SUPPORT: '/support',

        // Protected Routes
        DASHBOARD: '/app',
        WATCHLIST: '/app/watchlist',
        PORTFOLIO: '/app/portfolio',
        ORDERS: '/app/orders',
        FUNDS: '/app/funds',
    },
    ADMIN: {
        SIGN_IN: '/admin/login',
        DASHBOARD: '/admin/dashboard',
    }
} as const;

export const API_ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        VERIFY_OTP: '/auth/verify-email',
        RESEND_OTP: '/auth/resend-otp',
        LOGOUT: '/auth/logout',
        ME: '/auth/me',
    }
} as const;
