import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/features/auth/store/authSlice";
import { authService } from "@/features/auth/services/authService";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "@/constants/routes";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface AdminSidebarProps {
    isMobileOpen?: boolean;
    onCloseMobile?: () => void;
}

export function AdminSidebar({ isMobileOpen = false, onCloseMobile }: AdminSidebarProps) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogoutConfirm = async () => {
        try {
            await authService.logout();
            dispatch(logout());
            setIsLogoutModalOpen(false);
            navigate(APP_ROUTES.ADMIN.SIGN_IN);
        } catch (error) {
            console.error("Failed to logout admin", error);
        }
    };

    const getLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
            isActive
                ? "bg-muted/60 text-text-primary border border-border-muted/60"
                : "text-text-secondary hover:text-text-primary hover:bg-panel-2 border border-transparent"
        }`;

    const sidebarContent = (
        <aside className="w-64 flex flex-col bg-panel border-r border-border-muted shrink-0 h-full">
            {/* Brand Header */}
            <div className="py-6 px-6 border-b border-border-muted flex flex-col items-center justify-center text-center">
                <NavLink to={APP_ROUTES.ADMIN.DASHBOARD} onClick={onCloseMobile} className="flex flex-col items-center">
                    <span className="text-2xl font-bold tracking-tight text-primary-green">nexbid</span>
                    <span className="text-sm font-medium text-text-secondary mt-1">Admin Console</span>
                </NavLink>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6 text-sm">
                {/* Main Group */}
                <div className="space-y-1">
                    <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary/60 mb-2">
                        Overview
                    </p>
                    <NavLink
                        to={APP_ROUTES.ADMIN.DASHBOARD}
                        onClick={onCloseMobile}
                        className={getLinkClass}
                    >
                        {({ isActive }) => (
                            <>
                                <svg
                                    className={`w-4 h-4 ${isActive ? "text-primary-green" : "text-current"}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                    />
                                </svg>
                                Dashboard
                            </>
                        )}
                    </NavLink>
                    <NavLink
                        to={APP_ROUTES.ADMIN.USERS}
                        onClick={onCloseMobile}
                        className={getLinkClass}
                    >
                        {({ isActive }) => (
                            <>
                                <svg
                                    className={`w-4 h-4 ${isActive ? "text-primary-green" : "text-current"}`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                User Accounts
                            </>
                        )}
                    </NavLink>
                </div>

                {/* Trading & Finance Group */}
                <div className="space-y-1">
                    <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary/60 mb-2">
                        Trading & Finance
                    </p>
                    <NavLink
                        to={APP_ROUTES.ADMIN.FUNDS}
                        onClick={onCloseMobile}
                        className={getLinkClass}
                    >
                        {({ isActive }) => (
                            <>
                                <svg
                                    className={`w-4 h-4 ${isActive ? "text-primary-green" : "text-current"}`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M18 5H6m12 4H6m4 0a4 4 0 0 1 0 8H6m4 0 6 6" />
                                </svg>
                                Funds
                            </>
                        )}
                    </NavLink>
                    <NavLink
                        to={APP_ROUTES.ADMIN.LEVERAGE_COSTS}
                        onClick={onCloseMobile}
                        className={getLinkClass}
                    >
                        {({ isActive }) => (
                            <>
                                <svg
                                    className={`w-4 h-4 ${isActive ? "text-primary-green" : "text-current"}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                                    />
                                </svg>
                                Leverage & Costs
                            </>
                        )}
                    </NavLink>
                    <NavLink
                        to={APP_ROUTES.ADMIN.ORDERS}
                        onClick={onCloseMobile}
                        className={getLinkClass}
                    >
                        {({ isActive }) => (
                            <>
                                <svg
                                    className={`w-4 h-4 ${isActive ? "text-primary-green" : "text-current"}`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    viewBox="0 0 24 24"
                                >
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                    <polyline points="17 6 23 6 23 12"></polyline>
                                </svg>
                                Orders
                            </>
                        )}
                    </NavLink>
                </div>

                {/* Operations Group */}
                <div className="space-y-1">
                    <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary/60 mb-2">
                        Operations
                    </p>
                    <NavLink
                        to={APP_ROUTES.ADMIN.COMMUNITY}
                        onClick={onCloseMobile}
                        className={getLinkClass}
                    >
                        {({ isActive }) => (
                            <>
                                <svg
                                    className={`w-4 h-4 ${isActive ? "text-primary-green" : "text-current"}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                                    />
                                </svg>
                                Community
                            </>
                        )}
                    </NavLink>
                    <NavLink
                        to={APP_ROUTES.ADMIN.SUPPORT}
                        onClick={onCloseMobile}
                        className={getLinkClass}
                    >
                        {({ isActive }) => (
                            <>
                                <svg
                                    className={`w-4 h-4 ${isActive ? "text-primary-green" : "text-current"}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                                Support
                            </>
                        )}
                    </NavLink>
                </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-border-muted">
                <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-panel-2 transition-colors group cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <svg
                            className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                        >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span className="text-sm font-medium">Sign out of Console</span>
                    </div>
                </button>
            </div>
        </aside>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex shrink-0">
                {sidebarContent}
            </div>

            {/* Mobile Drawer */}
            {isMobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={onCloseMobile}
                    />
                    {/* Drawer Content */}
                    <div className="relative z-10 w-64 max-w-[80vw] h-full shadow-2xl">
                        {sidebarContent}
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={isLogoutModalOpen}
                title="Sign Out"
                message="Are you sure you want to sign out of the Admin Console?"
                confirmText="Sign Out"
                cancelText="Stay Signed In"
                confirmButtonVariant="danger"
                onConfirm={handleLogoutConfirm}
                onCancel={() => setIsLogoutModalOpen(false)}
            />
        </>
    );
}
