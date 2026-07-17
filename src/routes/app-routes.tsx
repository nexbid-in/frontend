import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { LandingPage, AboutPage, ProductsPage, PricingPage, SupportPage } from '@/features/marketing';


const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />
    }, 
    {
        path: '/about',
        element: <AboutPage />
    },
    {
        path: '/products',
        element: <ProductsPage />
    },
    {
        path: '/pricing',
        element: <PricingPage />
    },
    {
        path: '/support',
        element: <SupportPage />
    }
]);

export function AppRoutes() {
    return <RouterProvider router={router} />
}