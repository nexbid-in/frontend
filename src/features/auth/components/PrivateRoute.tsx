import { APP_ROUTES } from "@/constants/routes";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

export function PrivateRoute() {
    const { isAuthenticated, isAuthLoading, user } = useAppSelector((state) => state.auth);

    if (isAuthLoading) {
        return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
    }
    
    if (!isAuthenticated) {
        return <Navigate to={APP_ROUTES.USER.SIGN_IN} replace />;
    }

    if (user?.role === 'ADMIN') {
        return <Navigate to={APP_ROUTES.ADMIN.DASHBOARD} replace />;
    }

    return <Outlet />;
}