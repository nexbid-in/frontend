import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { LandingPage, AboutPage, ProductsPage, PricingPage, SupportPage, MarketingLayout } from '@/features/marketing';
import { SignUpPage, SignInPage, ForgotPasswordPage, ResetPasswordPage } from "@/features/auth";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";

import { PrivateRoute, PublicRoute } from "@/features/auth";
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
                path: APP_ROUTES.HOME,
                element: <MarketingLayout />,
                children: [
                    { index: true, element: <LandingPage /> },
                    { path: APP_ROUTES.ABOUT.replace('/', ''), element: <AboutPage /> },
                    { path: APP_ROUTES.PRODUCTS.replace('/', ''), element: <ProductsPage /> },
                    { path: APP_ROUTES.PRICING.replace('/', ''), element: <PricingPage /> },
                    { path: APP_ROUTES.SUPPORT.replace('/', ''), element: <SupportPage /> }
                ]
            },
            {
                path: APP_ROUTES.SIGN_UP,
                element: <SignUpPage />
            },
            {
                path: APP_ROUTES.SIGN_IN,
                element: <SignInPage />
            },
            {
                path: APP_ROUTES.FORGOT_PASSWORD,
                element: <ForgotPasswordPage />
            },
            {
                path: APP_ROUTES.RESET_PASSWORD,
                element: <ResetPasswordPage />
            }
        ]
    },
    
    // ------------------------------------
    // PROTECTED ROUTES (Authenticated Only)
    // ------------------------------------
    {
        path: APP_ROUTES.DASHBOARD,
        element: <PrivateRoute />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { index: true, element: <DashboardPage /> }
                ]
            }
        ]
    }
]);

export function AppRoutes() {
    return <RouterProvider router={router} />
}
