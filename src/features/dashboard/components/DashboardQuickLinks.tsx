import type { FC } from "react";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "@/constants/routes";

export const DashboardQuickLinks: FC = () => {
    const links = [
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
            to: APP_ROUTES.USER.PROFILE_JOURNAL,
            label: "My Journal",
            description: "Trading notes, rules, and post-trade reflections",
            icon: (
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
            ),
        },
    ];

    return (
        <div className="flex flex-col space-y-3">
            <span className="text-sm font-semibold text-dash-text tracking-tight">
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
