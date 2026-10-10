import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { LandingPage, AboutPage, ProductsPage, PricingPage, SupportPage, MarketingLayout } from '@/features/marketing';
import { SignUpPage, SignInPage, AdminSignInPage, ForgotPasswordPage } from "@/features/auth";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { AdminDashboardPage, AdminUsersPage, AdminLayout } from "@/features/admin";

import { PrivateRoute, PublicRoute, AdminRoute } from "@/features/auth";
import { AppLayout } from "@/features/dashboard/components/AppLayout";

import { APP_ROUTES } from "@/constants/routes";

const router = createBrowserRouter([
    // ------------------------------------
    // PUBLIC ROUTES (Guests Only)
    // ------------------------------------
    {
        element: <PublicRoute />,
        children: [
            {
                path: APP_ROUTES.USER.HOME,
                element: <MarketingLayout />,
                children: [
                    { index: true, element: <LandingPage /> },
                    { path: APP_ROUTES.USER.ABOUT.replace('/', ''), element: <AboutPage /> },
                    { path: APP_ROUTES.USER.PRODUCTS.replace('/', ''), element: <ProductsPage /> },
                    { path: APP_ROUTES.USER.PRICING.replace('/', ''), element: <PricingPage /> },
                    { path: APP_ROUTES.USER.SUPPORT.replace('/', ''), element: <SupportPage /> }
                ]
            },
            {
                path: APP_ROUTES.USER.SIGN_UP,
                element: <SignUpPage />
            },
            {
                path: APP_ROUTES.USER.SIGN_IN,
                element: <SignInPage />
            },
            {
                path: APP_ROUTES.ADMIN.SIGN_IN,
                element: <AdminSignInPage />
            },
            {
                path: APP_ROUTES.USER.FORGOT_PASSWORD,
                element: <ForgotPasswordPage />
            }
        ]
    },
    
    // ------------------------------------
    // PROTECTED ROUTES (Authenticated Only)
    // ------------------------------------
    {
        path: APP_ROUTES.USER.DASHBOARD,
        element: <PrivateRoute />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { index: true, element: <DashboardPage /> }
                ]
            }
        ]
    },

    // ------------------------------------
    // ADMIN ROUTES (Admin Only)
    // ------------------------------------
    {
        element: <AdminRoute />,
        children: [
            {
                element: <AdminLayout />,
                children: [
                    {
                        path: APP_ROUTES.ADMIN.DASHBOARD,
                        element: <AdminDashboardPage />
                    },
                    {
                        path: APP_ROUTES.ADMIN.USERS,
                        element: <AdminUsersPage />
                    }
                ]
            }
        ]
    }
]);

export function AppRoutes() {
    return <RouterProvider router={router} />
}
