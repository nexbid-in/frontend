import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { LandingPage, AboutPage } from '@/features/marketing';


const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />
    }, 
    {
        path: '/about',
        element: <AboutPage />
    }
]);

export function AppRoutes() {
    return <RouterProvider router={router} />
}