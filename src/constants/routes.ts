export const APP_ROUTES = {
    USER: {
        // Public Routes
        HOME: '/',
        SIGN_IN: '/signin',
        SIGN_UP: '/signup',
        FORGOT_PASSWORD: '/forgot-password',

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
        USERS: '/admin/users',
        FUNDS: '/admin/funds',
        LEVERAGE_COSTS: '/admin/leverage-costs',
        ORDERS: '/admin/orders',
        COMMUNITY: '/admin/community',
        SUPPORT: '/admin/support',
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
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        REFRESH: '/auth/refresh',
    },
    ADMIN: {
        GET_USERS: '/admin/getusers',
        UPDATE_USER_STATUS: (userId: string) => `/admin/users/${userId}/update-status`,
    }
} as const;
