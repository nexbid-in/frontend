import type { FC } from "react";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "@/constants/routes";

export const DashboardQuickLinks: FC = () => {
    const links = [
        {
            to: APP_ROUTES.USER.WATCHLIST,
            label: "Watchlist",
            description: "Explore market instruments & charts",
            icon: (
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
            ),
        },
        {
            to: APP_ROUTES.USER.PORTFOLIO,
            label: "Holdings & Positions",
            description: "Manage equity and intraday trades",
            icon: (
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                </svg>
            ),
        },
        {
            to: APP_ROUTES.USER.ORDERS,
            label: "Order Book",
            description: "Active, executed, and AMO orders",
            icon: (
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                </svg>
            ),
        },
        {
            to: APP_ROUTES.USER.PROFILE_PNL,
            label: "P&L Statement",
            description: "Zerodha Console fiscal reporting & heatmaps",
            icon: (
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
            ),
        },
        {
            to: APP_ROUTES.USER.PROFILE_TRADE_BOOK,
            label: "Trade Book",
            description: "Itemized trade executions and charges ledger",
            icon: (
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
            ),
        },
        {
            to: APP_ROUTES.USER.FUNDS,
            label: "Funds & Wallet",
            description: "Razorpay deposits, withdrawals & ledger",
            icon: (
                <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6H2.25m0 0v8.25m0-8.25H3m10.5 0h.75A.75.75 0 0 1 15 6v.75m0 0v8.25m0-8.25H13.5m0 0H3m12 0h6m-6 8.25H3m12 0h6m-6 0v.75A.75.75 0 0 1 15 15h.75m0 0v-8.25m-15 0h15" />
                </svg>
            ),
        },
    ];

    return (
        <div className="bg-dash-panel border border-dash-border rounded-lg p-5 flex flex-col space-y-3">
            <span className="text-sm font-bold text-dash-text tracking-tight uppercase">
                Quick Navigation
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {links.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className="bg-dash-panel-2 hover:bg-dash-panel-3 border border-dash-border hover:border-dash-border-hover rounded-lg p-3 transition-colors flex items-start gap-3 group"
                    >
                        <div className="p-2 rounded-md bg-dash-panel border border-dash-border/60 group-hover:scale-105 transition-transform shrink-0">
                            {link.icon}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-dash-text group-hover:text-primary-green transition-colors flex items-center gap-1">
                                <span>{link.label}</span>
                                <span className="text-[10px] text-dash-text-muted group-hover:text-primary-green">→</span>
                            </span>
                            <span className="text-[11px] text-dash-text-muted truncate mt-0.5">
                                {link.description}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};
