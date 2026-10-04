import { APP_ROUTES } from "@/constants/routes";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

export function PublicRoute() {
    const { isAuthenticated, isAuthLoading, user } = useAppSelector((state) => state.auth);

    if (isAuthLoading) {
        return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
    }
    
    if (isAuthenticated) {
        if (user?.role === 'ADMIN') {
            return <Navigate to={APP_ROUTES.ADMIN.DASHBOARD} replace />;
        }
        return <Navigate to={APP_ROUTES.USER.DASHBOARD} replace />;
    }

    return <Outlet />;
}
