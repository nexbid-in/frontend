import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

export function PublicRoute() {
    const { isAuthenticated, isAuthLoading } = useAppSelector((state) => state.auth);

    if (isAuthLoading) {
        return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
    }
    
    if (isAuthenticated) {
        return <Navigate to="/app" replace />;
    }

    return <Outlet />;
}
