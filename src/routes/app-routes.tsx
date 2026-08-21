import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { LandingPage, AboutPage, ProductsPage, PricingPage, SupportPage, MarketingLayout } from '@/features/marketing';
import { SignUpPage, SignInPage, ForgotPasswordPage, ResetPasswordPage } from "@/features/auth";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";

import { PrivateRoute, PublicRoute } from "@/features/auth";
import { AppLayout } from "@/features/dashboard/components/AppLayout";

const router = createBrowserRouter([
    // ------------------------------------
    // PUBLIC ROUTES (Guests Only)
    // ------------------------------------
    {
        element: <PublicRoute />,
        children: [
            {
                path: '/',
                element: <MarketingLayout />,
                children: [
                    { index: true, element: <LandingPage /> },
                    { path: 'about', element: <AboutPage /> },
                    { path: 'products', element: <ProductsPage /> },
                    { path: 'pricing', element: <PricingPage /> },
                    { path: 'support', element: <SupportPage /> }
                ]
            },
            {
                path: '/signup',
                element: <SignUpPage />
            },
            {
                path: '/signin',
                element: <SignInPage />
            },
            {
                path: '/forgot-password',
                element: <ForgotPasswordPage />
            },
            {
                path: '/reset-password',
                element: <ResetPasswordPage />
            }
        ]
    },
    
    // ------------------------------------
    // PROTECTED ROUTES (Authenticated Only)
    // ------------------------------------
    {
        path: '/app',
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
