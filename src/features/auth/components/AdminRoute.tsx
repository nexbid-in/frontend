import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { APP_ROUTES } from '@/constants/routes';

export const AdminRoute = () => {
    const { isAuthenticated, user, isAuthLoading } = useAppSelector((state) => state.auth);

    if (isAuthLoading) {
        return <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-primary-green font-bold">Loading...</div>;
    }

    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return <Navigate to={APP_ROUTES.ADMIN.SIGN_IN} replace />;
    }

    return <Outlet />;
};
