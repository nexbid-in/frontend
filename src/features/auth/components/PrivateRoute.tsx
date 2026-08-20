import { Navigate, Outlet } from "react-router-dom";

export function PrivateRoute() {
    const isAuthenticated = false;

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    return <Outlet />;
}