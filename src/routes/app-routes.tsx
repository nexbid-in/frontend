import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { LandingPage, AboutPage, ProductsPage, PricingPage, SupportPage, MarketingLayout } from '@/features/marketing';
import { SignUpPage, VerifyEmailPage, SignInPage, ForgotPasswordPage, ResetPasswordPage } from "@/features/auth";


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
        path: '/verify-email',
        element: <VerifyEmailPage />
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
]);

export function AppRoutes() {
    return <RouterProvider router={router} />
}