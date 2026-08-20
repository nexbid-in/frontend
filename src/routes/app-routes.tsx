import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { LandingPage, AboutPage, ProductsPage, PricingPage, SupportPage, MarketingLayout } from '@/features/marketing';
import { SignUpPage, SignInPage, ForgotPasswordPage, ResetPasswordPage } from "@/features/auth";

import { PrivateRoute } from "@/features/auth";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";

const router = createBrowserRouter([
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
    },
    
    // Protected Routes
    {
        path: '/app',
        element: <PrivateRoute />,
        children: [
            { index: true, element: <DashboardPage /> }
        ]
    }
]);

export function AppRoutes() {
    return <RouterProvider router={router} />
}