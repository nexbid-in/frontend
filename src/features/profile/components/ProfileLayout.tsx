import { useEffect, useState } from "react";
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
    icon: React.ReactNode;
}

const PROFILE_NAV_ITEMS: ProfileNavItem[] = [
    {
        path: APP_ROUTES.USER.PROFILE,
        label: "Personal details",
        exact: true,
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" />
            </svg>
        ),
    },
    {
        path: APP_ROUTES.USER.PROFILE_PNL,
        label: "P&L Statement",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
        ),
    },
    {
        path: APP_ROUTES.USER.PROFILE_TRADE_BOOK,
        label: "Trade Book",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
        ),
    },
    {
        path: APP_ROUTES.USER.PROFILE_JOURNAL,
        label: "Journal",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
        ),
    },
    {
        path: APP_ROUTES.USER.PROFILE_TICKETS,
        label: "My Tickets",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
            </svg>
        ),
    },
];

export function ProfileLayout() {
    const user = useAppSelector((state) => state.auth.user);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [imageError, setImageError] = useState(false);
    const [showSignOutModal, setShowSignOutModal] = useState(false);

    useEffect(() => {
        setImageError(false);
    }, [user?.profileImage]);

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

    const handleSignOut = async () => {
        try {
            await authService.logout();
            dispatch(logout());
            navigate(APP_ROUTES.USER.SIGN_IN);
        } catch (error) {
            console.error("Failed to sign out", error);
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
                                        alt={user.firstName}
                                        className="w-full h-full object-cover"
                                        onError={() => setImageError(true)}
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-lg text-dash-text">{user?.firstName}</p>
                                <p className="text-sm text-dash-text-muted">{user?.id}</p>
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
                                        className={`flex items-center gap-2.5 w-full text-left p-2.5 rounded-lg transition-colors font-medium text-sm ${
                                            isActive
                                                ? "text-green font-semibold bg-dash-panel"
                                                : "text-gray-300 hover:text-white hover:bg-[#1f2226]"
                                        }`}
                                    >
                                        <span className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-green" : "text-dash-text-muted"}`}>
                                            {item.icon}
                                        </span>
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Sign out Option */}
                    <div className="pt-4 border-t border-dash-border mt-4">
                        <button
                            type="button"
                            onClick={() => setShowSignOutModal(true)}
                            className="w-full text-left p-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-[#1f2226] transition-colors font-medium text-sm flex items-center gap-2.5 cursor-pointer"
                        >
                            <svg
                                className="w-4 h-4 text-dash-text-muted"
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
                            <span>Sign out</span>
                        </button>
                    </div>
                </aside>

                {/* Profile Child Content Area */}
                <main className="flex-1 p-8 md:p-10 overflow-y-auto custom-scrollbar flex flex-col">
                    <Outlet />
                </main>
            </section>

            {/* Sign Out Confirmation Modal */}
            <ConfirmModal
                isOpen={showSignOutModal}
                title="Confirm Sign Out"
                message="Are you sure you want to sign out of your account?"
                confirmText="Sign Out"
                cancelText="Cancel"
                confirmButtonVariant="danger"
                onConfirm={() => {
                    setShowSignOutModal(false);
                    handleSignOut();
                }}
                onCancel={() => setShowSignOutModal(false)}
            />
        </div>
    );
}
