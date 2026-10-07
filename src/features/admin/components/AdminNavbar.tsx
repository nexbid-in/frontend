import { useLocation } from "react-router-dom";
import { APP_ROUTES } from "@/constants/routes";

interface AdminNavbarProps {
    title?: string;
    onToggleMobileSidebar?: () => void;
}

export function AdminNavbar({ title, onToggleMobileSidebar }: AdminNavbarProps) {
    const location = useLocation();

    const getAutoTitle = () => {
        if (title) return title;
        switch (location.pathname) {
            case APP_ROUTES.ADMIN.DASHBOARD:
                return "Dashboard";
            case APP_ROUTES.ADMIN.USERS:
                return "User Accounts";
            case APP_ROUTES.ADMIN.FUNDS:
                return "Funds";
            case APP_ROUTES.ADMIN.LEVERAGE_COSTS:
                return "Leverage & Costs";
            case APP_ROUTES.ADMIN.ORDERS:
                return "Orders";
            case APP_ROUTES.ADMIN.COMMUNITY:
                return "Community";
            case APP_ROUTES.ADMIN.SUPPORT:
                return "Support";
            default:
                return "Admin Console";
        }
    };

    const formattedDate = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <header className="min-h-[72px] py-5 px-6 lg:px-8 bg-panel/80 backdrop-blur border-b border-border-muted flex items-center justify-between sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-3">
                {/* Mobile Menu Trigger */}
                <button
                    type="button"
                    onClick={onToggleMobileSidebar}
                    aria-label="Open sidebar navigation"
                    className="lg:hidden p-2 -ml-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-panel-2 transition-colors cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <h1 className="text-base sm:text-lg font-semibold text-text-primary tracking-tight">
                    {getAutoTitle()}
                </h1>
            </div>

            <div className="flex items-center gap-3">
                {/* Date Display */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary font-medium">
                    <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formattedDate}</span>
                </div>
            </div>
        </header>
    );
}
