import { APP_ROUTES } from "@/constants/routes";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

export function PrivateRoute() {
    const { isAuthenticated, isAuthLoading, isBlocked, user } = useAppSelector((state) => state.auth);

    if (isAuthLoading) {
        return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
    }

    if (isBlocked) {
        return <Navigate to={APP_ROUTES.USER.ACCOUNT_SUSPENDED} replace />;
    }
    
    if (!isAuthenticated) {
        return <Navigate to={APP_ROUTES.USER.SIGN_IN} replace />;
    }

    if (user?.role === 'ADMIN') {
        return <Navigate to={APP_ROUTES.ADMIN.DASHBOARD} replace />;
    }

    return <Outlet />;
}