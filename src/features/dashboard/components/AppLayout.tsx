import { APP_ROUTES } from "@/constants/routes";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";

import { hideToast, showToast } from "@/store/uiSlice";
import { Toast } from "@/components/ui";

import { useState, useEffect } from "react";

export function AppLayout() {
    const user = useAppSelector((state) => state.auth.user);
    const toast = useAppSelector((state) => state.ui.toast);
    const dispatch = useAppDispatch();
    const location = useLocation();
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (location.state?.toast) {
            dispatch(showToast(location.state.toast));
            window.history.replaceState({}, document.title);
        }
    }, [location.state, dispatch]);

    const getInitials = () => {
        if (!user) return '??';

        const first = user.firstName?.trim() || '';
        const last = user.lastName && user.lastName !== 'undefined' ? user.lastName.trim() : '';

        if (first && last) {
            return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
        }
        if (first) {
            return first.charAt(0).toUpperCase();
        }
        return '?';
    };

    const initials = getInitials();
    const isMarketsActive = location.pathname === APP_ROUTES.USER.DASHBOARD;

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-dash-bg text-dash-text font-sans">
            <nav className="h-[60px] bg-dash-panel flex items-center justify-between px-6 border-b border-dash-border">
                <div className="flex items-center gap-5">
                    <Link to={APP_ROUTES.USER.DASHBOARD} className="text-2xl font-bold text-primary-green tracking-tight">
                        nexbid
                    </Link>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-[#d1d5db]">NIFTY50 Index</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm font-semibold text-[#f5f5f5]">25,492.30</span>
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
                                : "text-[#d1d5db] hover:text-white"
                        } px-3 py-1.5 rounded-md transition-colors`}
                    >
                        Markets
                    </Link>
                    <Link to={APP_ROUTES.USER.WATCHLIST} className="text-[#d1d5db] hover:text-white">Watchlist</Link>
                    <Link to={APP_ROUTES.USER.PORTFOLIO} className="text-[#d1d5db] hover:text-white">Portfolio</Link>
                    <Link to={APP_ROUTES.USER.ORDERS} className="text-[#d1d5db] hover:text-white">Orders</Link>
                    <Link to={APP_ROUTES.USER.FUNDS} className="text-[#d1d5db] hover:text-white">Funds</Link>
                </div>

                <div className="flex items-center gap-5 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-[#a1a1aa]">Margin Available:</span>
                        <span className="font-medium text-[#e5e5e5]">₹3757.30</span>
                    </div>

                    <button className="text-[#d1d5db] text-xs font-medium border border-[#4b5563] px-3 py-1.5 rounded-md hover:border-white cursor-pointer">
                        Add Funds
                    </button>

                    {/* Dynamic User Profile Avatar */}
                    <div className="relative group cursor-pointer pb-2 pt-2">
                        {/* Profile Avatar (No direct redirect on avatar click) */}
                        <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center font-semibold text-white group-hover:bg-violet-700 transition-colors overflow-hidden shrink-0 select-none">
                            {user?.profileImage && !imageError ? (
                                <img
                                    src={user.profileImage}
                                    alt={user.firstName || "Profile"}
                                    className="w-full h-full object-cover"
                                    onError={() => setImageError(true)}
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <span className="text-xs font-semibold">{initials}</span>
                            )}
                        </div>

                        {/* Dropdown Menu (Hidden by default, shown on hover) */}
                        <div className="absolute right-0 mt-2 w-44 bg-dash-panel border border-dash-border rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="px-4 py-2 border-b border-dash-border mb-1">
                                <p className="text-xs text-dash-text-muted">Signed in as</p>
                                <p className="text-sm font-semibold truncate text-[#e5e5e5]">
                                    {user?.firstName}{user?.lastName && user.lastName !== 'undefined' ? ` ${user.lastName}` : ''}
                                </p>
                            </div>
                            <Link
                                to={APP_ROUTES.USER.PROFILE}
                                className="block w-full text-left px-4 py-2 text-sm text-[#d1d5db] hover:text-white hover:bg-[#1b1b1b] transition-colors font-medium"
                            >
                                My Profile
                            </Link>
                        </div>
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
        </div>
    );
}
