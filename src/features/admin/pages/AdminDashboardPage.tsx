import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/features/auth/store/authSlice";
import { authService } from "@/features/auth/services/authService";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "@/constants/routes";

export function AdminDashboardPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await authService.logout();
            dispatch(logout());
            navigate(APP_ROUTES.ADMIN.SIGN_IN);
        } catch (error) {
            console.error("Failed to logout admin", error);
        }
    };

    const formattedDate = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="admin-theme bg-bg text-text-primary font-sans antialiased selection:bg-primary-green/20 selection:text-primary-green flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col bg-panel border-r border-border-muted shrink-0">
                {/* Brand Header */}
                <div className="py-6 px-6 border-b border-border-muted flex flex-col items-center justify-center text-center">
                    <a href="#" className="flex flex-col items-center">
                        <span className="text-2xl font-bold tracking-tight text-primary-green">nexbid</span>
                        <span className="text-sm font-medium text-text-secondary mt-1">Admin Console</span>
                    </a>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6 text-sm">
                    {/* Main Group */}
                    <div className="space-y-1">
                        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary/60 mb-2">
                            Overview
                        </p>
                        <a
                            href="#"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/60 text-text-primary font-medium border border-border-muted/60"
                        >
                            <svg className="w-4 h-4 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Dashboard
                        </a>
                        <a
                            href="#"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-panel-2 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            User Accounts
                        </a>
                    </div>

                    {/* Trading & Finance Group */}
                    <div className="space-y-1">
                        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary/60 mb-2">
                            Trading & Finance
                        </p>
                        <a
                            href="#"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-panel-2 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M18 5H6m12 4H6m4 0a4 4 0 0 1 0 8H6m4 0 6 6" />
                            </svg>
                            Funds
                        </a>
                        <a
                            href="#"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-panel-2 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            Leverage & Costs
                        </a>
                        <a
                            href="#"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-panel-2 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                <polyline points="17 6 23 6 23 12"></polyline>
                            </svg>
                            Orders
                        </a>
                    </div>

                    {/* Operations Group */}
                    <div className="space-y-1">
                        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary/60 mb-2">
                            Operations
                        </p>
                        <a
                            href="#"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-panel-2 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                            </svg>
                            Community
                        </a>
                        <a
                            href="#"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-panel-2 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Support
                        </a>
                    </div>
                </nav>

                {/* Sidebar Footer */}
                <div className="p-3 border-t border-border-muted">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-panel-2 transition-colors group cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            <span className="text-sm font-medium">Sign out of Console</span>
                        </div>
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                {/* Standard Top Header Bar */}
                <header className="min-h-[72px] py-5 px-6 lg:px-8 bg-panel/80 backdrop-blur border-b border-border-muted flex items-center justify-between sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Trigger */}
                        <button className="lg:hidden p-2 -ml-2 rounded-lg text-text-secondary hover:text-text-primary">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-base sm:text-lg font-semibold text-text-primary tracking-tight">
                            Dashboard
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

                {/* Main Workspace */}
                <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
                    {/* KPI Cards Grid */}
                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {/* Card 1 */}
                        <article className="rounded-xl border border-border-muted bg-card p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-text-secondary">Total Users</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-green/10 text-green">
                                    +2.3%
                                </span>
                            </div>
                            <p className="text-2xl font-semibold text-text-primary mt-2">18,420</p>
                            <p className="text-xs text-text-secondary mt-1">+420 joined this week</p>
                        </article>

                        {/* Card 2 */}
                        <article className="rounded-xl border border-border-muted bg-card p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-text-secondary">Active Users</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-text-secondary">
                                    52% DAU
                                </span>
                            </div>
                            <p className="text-2xl font-semibold text-text-primary mt-2">9,678</p>
                            <p className="text-xs text-text-secondary mt-1">Daily active paper traders</p>
                        </article>

                        {/* Card 3 */}
                        <article className="rounded-xl border border-border-muted bg-card p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-text-secondary">Total Trades</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-green/10 text-green">
                                    +12.4%
                                </span>
                            </div>
                            <p className="text-2xl font-semibold text-text-primary mt-2">482,301</p>
                            <p className="text-xs text-text-secondary mt-1">Month over month volume</p>
                        </article>

                        {/* Card 4 */}
                        <article className="rounded-xl border border-border-muted bg-card p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-text-secondary">Platform Revenue</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-green/10 text-green">
                                    +6.3%
                                </span>
                            </div>
                            <p className="text-2xl font-semibold text-text-primary mt-2">₹15.2 Cr</p>
                            <p className="text-xs text-text-secondary mt-1">Compared to last quarter</p>
                        </article>
                    </section>

                    {/* Charts Section */}
                    <section className="grid gap-6 lg:grid-cols-2">
                        {/* Total Trades Chart Card */}
                        <article className="rounded-xl border border-border-muted bg-card p-5 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-sm font-semibold text-text-primary">Total Trades Executed</h2>
                                    <p className="text-xs text-text-secondary">Monthly order execution volume</p>
                                </div>
                                <select className="bg-panel-2 border border-border-muted rounded-lg px-2.5 py-1 text-xs text-text-secondary focus:outline-none focus:border-primary-green">
                                    <option>Last 12 months</option>
                                    <option>Last 30 days</option>
                                    <option>Last 7 days</option>
                                </select>
                            </div>

                            {/* Clean Visual Bar Chart */}
                            <div className="h-60 flex items-end justify-between gap-2 pt-6 px-2 border-b border-border-muted/60">
                                <div className="w-full bg-muted/50 hover:bg-primary-green/60 transition-colors rounded-t h-[35%]"></div>
                                <div className="w-full bg-muted/50 hover:bg-primary-green/60 transition-colors rounded-t h-[45%]"></div>
                                <div className="w-full bg-muted/50 hover:bg-primary-green/60 transition-colors rounded-t h-[40%]"></div>
                                <div className="w-full bg-muted/50 hover:bg-primary-green/60 transition-colors rounded-t h-[60%]"></div>
                                <div className="w-full bg-muted/50 hover:bg-primary-green/60 transition-colors rounded-t h-[50%]"></div>
                                <div className="w-full bg-muted/50 hover:bg-primary-green/60 transition-colors rounded-t h-[70%]"></div>
                                <div className="w-full bg-muted/50 hover:bg-primary-green/60 transition-colors rounded-t h-[65%]"></div>
                                <div className="w-full bg-muted/50 hover:bg-primary-green/60 transition-colors rounded-t h-[80%]"></div>
                                <div className="w-full bg-muted/50 hover:bg-primary-green/60 transition-colors rounded-t h-[75%]"></div>
                                <div className="w-full bg-muted/50 hover:bg-primary-green/60 transition-colors rounded-t h-[85%]"></div>
                                <div className="w-full bg-muted/50 hover:bg-primary-green/60 transition-colors rounded-t h-[90%]"></div>
                                <div className="w-full bg-primary-green rounded-t h-[95%]"></div>
                            </div>
                            <div className="flex justify-between text-[11px] text-text-secondary pt-2 px-1">
                                <span>Dec</span>
                                <span>Jan</span>
                                <span>Feb</span>
                                <span>Mar</span>
                                <span>Apr</span>
                                <span>May</span>
                                <span>Jun</span>
                                <span>Jul</span>
                                <span>Aug</span>
                                <span>Sep</span>
                                <span>Oct</span>
                                <span>Nov</span>
                            </div>
                        </article>

                        {/* Revenue Chart Card */}
                        <article className="rounded-xl border border-border-muted bg-card p-5 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-sm font-semibold text-text-primary">Revenue Growth</h2>
                                    <p className="text-xs text-text-secondary">Year-to-date cumulative performance</p>
                                </div>
                                <span className="text-xs font-medium text-text-secondary bg-panel-2 px-2.5 py-1 rounded-lg border border-border-muted">
                                    YTD 2025
                                </span>
                            </div>

                            {/* Clean Visual Area Chart */}
                            <div className="h-60 relative flex items-end border-b border-border-muted/60 overflow-hidden">
                                <svg className="w-full h-48 overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 150">
                                    <defs>
                                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,120 Q50,110 80,90 T160,75 T240,50 T320,35 T400,15 L400,150 L0,150 Z" fill="url(#chartGrad)" />
                                    <path d="M0,120 Q50,110 80,90 T160,75 T240,50 T320,35 T400,15" fill="none" stroke="#10b981" strokeWidth="2" />
                                </svg>
                            </div>
                            <div className="flex justify-between text-[11px] text-text-secondary pt-2 px-1">
                                <span>Q1</span>
                                <span>Q2</span>
                                <span>Q3</span>
                                <span>Q4</span>
                            </div>
                        </article>
                    </section>

                    {/* Standard Recent Orders Table */}
                    <section className="rounded-xl border border-border-muted bg-card overflow-hidden">
                        <div className="px-5 py-4 border-b border-border-muted flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-text-primary">Recent Paper Orders</h2>
                                <p className="text-xs text-text-secondary">Latest simulated trades across user accounts</p>
                            </div>
                            <a href="#" className="text-xs font-medium text-primary-green hover:underline">
                                View all orders &rarr;
                            </a>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border-muted bg-panel-2/50 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                                        <th className="py-3 px-5">Order ID</th>
                                        <th className="py-3 px-5">User</th>
                                        <th className="py-3 px-5">Instrument</th>
                                        <th className="py-3 px-5">Side</th>
                                        <th className="py-3 px-5">Qty</th>
                                        <th className="py-3 px-5">Price</th>
                                        <th className="py-3 px-5 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-muted text-sm">
                                    <tr className="hover:bg-panel-2/40 transition-colors">
                                        <td className="py-3 px-5 font-mono text-xs text-text-secondary">#ORD-9482</td>
                                        <td className="py-3 px-5 font-medium text-text-primary">Rohan Sharma</td>
                                        <td className="py-3 px-5 text-text-secondary">NIFTY 25NOV 24500 CE</td>
                                        <td className="py-3 px-5">
                                            <span className="text-xs font-medium text-green">BUY</span>
                                        </td>
                                        <td className="py-3 px-5 text-text-secondary">150</td>
                                        <td className="py-3 px-5 text-text-primary">₹142.50</td>
                                        <td className="py-3 px-5 text-right">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green/10 text-green">
                                                Executed
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-panel-2/40 transition-colors">
                                        <td className="py-3 px-5 font-mono text-xs text-text-secondary">#ORD-9481</td>
                                        <td className="py-3 px-5 font-medium text-text-primary">Priya Nair</td>
                                        <td className="py-3 px-5 text-text-secondary">RELIANCE EQ</td>
                                        <td className="py-3 px-5">
                                            <span className="text-xs font-medium text-red">SELL</span>
                                        </td>
                                        <td className="py-3 px-5 text-text-secondary">50</td>
                                        <td className="py-3 px-5 text-text-primary">₹1,284.00</td>
                                        <td className="py-3 px-5 text-right">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green/10 text-green">
                                                Executed
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-panel-2/40 transition-colors">
                                        <td className="py-3 px-5 font-mono text-xs text-text-secondary">#ORD-9480</td>
                                        <td className="py-3 px-5 font-medium text-text-primary">Vikram Patel</td>
                                        <td className="py-3 px-5 text-text-secondary">BANKNIFTY 25NOV FUT</td>
                                        <td className="py-3 px-5">
                                            <span className="text-xs font-medium text-green">BUY</span>
                                        </td>
                                        <td className="py-3 px-5 text-text-secondary">30</td>
                                        <td className="py-3 px-5 text-text-primary">₹51,890.00</td>
                                        <td className="py-3 px-5 text-right">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-text-secondary">
                                                Pending
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
