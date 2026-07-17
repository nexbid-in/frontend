import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { LandingPage, AboutPage, ProductsPage, PricingPage, SupportPage, MarketingLayout } from '@/features/marketing';


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
]);

export function AppRoutes() {
    return <RouterProvider router={router} />
}