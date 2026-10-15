import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/features/auth/store/authSlice";
import { authService } from "@/features/auth/services/authService";
import { APP_ROUTES } from "@/constants/routes";
import { ConfirmModal } from "@/components/ui";

interface ProfileNavItem {
    path: string;
    label: string;
    exact?: boolean;
}

const PROFILE_NAV_ITEMS: ProfileNavItem[] = [
    { path: APP_ROUTES.USER.PROFILE, label: "Personal details", exact: true },
    { path: APP_ROUTES.USER.PROFILE_PNL, label: "P&L Statement" },
    { path: APP_ROUTES.USER.PROFILE_TRADE_BOOK, label: "Trade Book" },
    { path: APP_ROUTES.USER.PROFILE_JOURNAL, label: "Journal" },
    { path: APP_ROUTES.USER.PROFILE_TICKETS, label: "My Tickets" },
];

export function ProfileLayout() {
    const user = useAppSelector((state) => state.auth.user);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [imageError, setImageError] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const getInitials = () => {
        if (!user) return "VR";

        const first = user.firstName?.trim() || "";
        const last = user.lastName && user.lastName !== "undefined" ? user.lastName.trim() : "";

        if (first && last) {
            return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
        }
        if (first) {
            return first.charAt(0).toUpperCase();
        }
        return "VR";
    };

    const initials = getInitials();
    const displayName = user?.firstName || "Vaisakh";
    const clientCode = user?.userCode || (user?.id ? `XV${user.id.replace(/-/g, "").slice(0, 5).toUpperCase()}` : "XV16644");

    const handleLogout = async () => {
        try {
            await authService.logout();
            dispatch(logout());
            navigate(APP_ROUTES.USER.SIGN_IN);
        } catch (error) {
            console.error("Failed to logout", error);
        }
    };

    const isLinkActive = (path: string, exact?: boolean) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    return (
        <div className="flex flex-1 overflow-hidden h-full p-4 gap-4">
            <section className="flex-1 bg-dash-panel border border-dash-border rounded-md h-full flex flex-col md:flex-row overflow-hidden">
                {/* Profile Navigation Sidebar */}
                <aside className="w-full md:w-64 p-6 bg-dash-panel-2 border-b md:border-b-0 md:border-r border-dash-border flex flex-col justify-between shrink-0 overflow-y-auto">
                    <div>
                        {/* User Avatar & Identification */}
                        <div className="flex flex-col items-center pb-4 mb-4 border-b border-dash-border">
                            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold text-white mb-2 overflow-hidden shadow-inner select-none">
                                {user?.profileImage && !imageError ? (
                                    <img
                                        src={user.profileImage}
                                        alt={displayName}
                                        className="w-full h-full object-cover"
                                        onError={() => setImageError(true)}
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-lg text-dash-text">{displayName}</p>
                                <p className="text-sm text-dash-text-muted">{clientCode}</p>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav className="space-y-1">
                            {PROFILE_NAV_ITEMS.map((item) => {
                                const isActive = isLinkActive(item.path, item.exact);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`block w-full text-left p-2.5 rounded-lg transition-colors font-medium text-sm ${
                                            isActive
                                                ? "text-green font-semibold bg-dash-panel"
                                                : "text-gray-300 hover:bg-[#1f2226]"
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Logout Option */}
                    <div className="pt-4 border-t border-dash-border mt-4">
                        <button
                            type="button"
                            onClick={() => setShowLogoutModal(true)}
                            className="w-full text-left p-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-[#1f2226] transition-colors font-medium text-sm flex items-center gap-2 cursor-pointer"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Profile Child Content Area */}
                <main className="flex-1 p-8 md:p-10 overflow-y-auto custom-scrollbar flex flex-col">
                    <Outlet />
                </main>
            </section>

            {/* Logout Confirmation Modal */}
            <ConfirmModal
                isOpen={showLogoutModal}
                title="Confirm Logout"
                message="Are you sure you want to log out of your account?"
                confirmText="Log Out"
                cancelText="Cancel"
                confirmButtonVariant="danger"
                onConfirm={() => {
                    setShowLogoutModal(false);
                    handleLogout();
                }}
                onCancel={() => setShowLogoutModal(false)}
            />
        </div>
    );
}
