import { APP_ROUTES } from "@/constants/routes";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/features/auth/store/authSlice";
import { authService } from "@/features/auth/services/authService";

import { hideToast, showToast } from "@/store/uiSlice";
import { Toast, ConfirmModal, UserAvatar } from "@/components/ui";

import { useState, useEffect, useRef } from "react";

export function AppLayout() {
    const user = useAppSelector((state) => state.auth.user);
    const toast = useAppSelector((state) => state.ui.toast);
    const theme = useAppSelector((state) => state.ui.theme);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showSignOutModal, setShowSignOutModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSignOut = async () => {
        try {
            await authService.logout();
            dispatch(logout());
            navigate(APP_ROUTES.USER.SIGN_IN);
        } catch (error) {
            console.error("Failed to sign out", error);
        }
    };

    useEffect(() => {
        if (location.state?.toast) {
            dispatch(showToast(location.state.toast));
            window.history.replaceState({}, document.title);
        }
    }, [location.state, dispatch]);

    // Close dropdown on click outside or Escape key
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isDropdownOpen]);

    // Close dropdown on route changes
    useEffect(() => {
        setIsDropdownOpen(false);
    }, [location.pathname]);

    const fullName = user
        ? `${user.firstName || ""}${user.lastName && user.lastName !== "undefined" ? ` ${user.lastName}` : ""}`.trim() || "User"
        : "User";
    const isMarketsActive = location.pathname === APP_ROUTES.USER.DASHBOARD;
    const isFundsActive = location.pathname === APP_ROUTES.USER.FUNDS;

    return (
        <div className="dashboard-root flex flex-col h-screen overflow-hidden bg-dash-bg text-dash-text font-sans" data-theme={theme}>
            <nav className="h-[60px] bg-dash-panel flex items-center justify-between px-6 border-b border-dash-border">
                <div className="flex items-center gap-5">
                    <Link to={APP_ROUTES.USER.DASHBOARD} className="text-2xl font-bold text-primary-green tracking-tight">
                        nexbid
                    </Link>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-dash-text-muted">NIFTY50 Index</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm font-semibold text-dash-text">25,492.30</span>
                            <span className="text-xs font-medium text-[#ef4444]">-17.40 (-0.07%)</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <Link
                        to={APP_ROUTES.USER.DASHBOARD}
                        className={`${
                            isMarketsActive
                                ? "text-primary-green font-medium"
                                : "text-dash-text-muted hover:text-dash-text"
                        } px-3 py-1.5 rounded-md transition-colors`}
                    >
                        Markets
                    </Link>
                    <Link to={APP_ROUTES.USER.WATCHLIST} className="text-dash-text-muted hover:text-dash-text transition-colors">Watchlist</Link>
                    <Link to={APP_ROUTES.USER.PORTFOLIO} className="text-dash-text-muted hover:text-dash-text transition-colors">Portfolio</Link>
                    <Link to={APP_ROUTES.USER.ORDERS} className="text-dash-text-muted hover:text-dash-text transition-colors">Orders</Link>
                    <Link
                        to={APP_ROUTES.USER.FUNDS}
                        className={`${
                            isFundsActive
                                ? "text-primary-green font-medium"
                                : "text-dash-text-muted hover:text-dash-text"
                        } px-3 py-1.5 rounded-md transition-colors`}
                    >
                        Funds
                    </Link>
                </div>

                <div className="flex items-center gap-5 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-dash-text-muted">Margin Available:</span>
                        <span className="font-medium text-dash-text">₹3757.30</span>
                    </div>

                    <Link
                        to={APP_ROUTES.USER.FUNDS}
                        className="text-dash-text-muted hover:text-dash-text text-xs font-medium border border-dash-border hover:border-dash-text-muted hover:bg-dash-panel-2 px-3 py-1.5 rounded-md transition-all duration-150 cursor-pointer"
                    >
                        Add Funds
                    </Link>

                    {/* Dynamic User Profile Avatar & Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        {/* Profile Avatar Button (Click to toggle dropdown) */}
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen((prev) => !prev)}
                            aria-expanded={isDropdownOpen}
                            aria-haspopup="menu"
                            className={`rounded-full shrink-0 select-none cursor-pointer transition-all ${
                                isDropdownOpen
                                    ? "ring-2 ring-primary-green"
                                    : "hover:ring-2 hover:ring-dash-border focus:outline-none focus:ring-2 focus:ring-primary-green"
                            }`}
                        >
                            <UserAvatar
                                src={user?.profileImage}
                                firstName={user?.firstName}
                                lastName={user?.lastName}
                                size="sm"
                                fallbackClassName="bg-violet-600 text-white"
                            />
                        </button>

                        {/* Dropdown Menu (Opened on click) */}
                        {isDropdownOpen && (
                            <div
                                role="menu"
                                className="absolute right-0 mt-2 w-64 bg-dash-panel border border-dash-border rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                            >
                                {/* First Section: Profile image, Full name, Email (Google & GitHub style) */}
                                <div className="px-4 py-3 border-b border-dash-border flex items-center gap-3">
                                    <UserAvatar
                                        src={user?.profileImage}
                                        firstName={user?.firstName}
                                        lastName={user?.lastName}
                                        size="md"
                                        fallbackClassName="bg-violet-600 text-white"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-dash-text truncate leading-tight">
                                            {fullName}
                                        </p>
                                        <p
                                            className="text-xs text-dash-text-muted truncate mt-0.5"
                                            title={user?.email || ""}
                                        >
                                            {user?.email || ""}
                                        </p>
                                    </div>
                                </div>

                                {/* Menu Navigation Links */}
                                <div className="py-1">
                                    <Link
                                        to={APP_ROUTES.USER.PROFILE}
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 transition-colors font-medium"
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
                                            <circle cx="12" cy="8" r="4" />
                                            <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" />
                                        </svg>
                                        <span>My Account</span>
                                    </Link>
                                </div>

                                {/* Sign out Section */}
                                <div className="pt-1 border-t border-dash-border">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            setShowSignOutModal(true);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 transition-colors font-medium cursor-pointer text-left"
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
                            </div>
                        )}
                    </div>
                </div>
                
            </nav>

            <main className="flex-1 overflow-hidden h-[calc(100vh-60px)]">
                <Outlet />
            </main>

            {/* Notification Toast */}
            {toast && (
                <Toast
                    title={toast.title}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => dispatch(hideToast())}
                />
            )}

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
