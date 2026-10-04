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

    return (
        <div className="bg-slate-950 text-slate-100 min-h-screen font-sans">
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-slate-900/40 backdrop-blur">
                    <div className="flex flex-col items-center justify-center px-6 py-6 border-b border-white/5">
                        <a href="#" className="text-2xl font-bold text-primary-green tracking-tight">
                            nexbid
                        </a>
                        <p className="text-sm tracking-wide text-white/70">Admin Console</p>
                    </div>
                    
                    <nav className="flex-1 px-4 py-6 space-y-2 text-sm">
                        <a className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 bg-white/5 text-white" href="#">
                            Dashboard
                            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                        </a>
                        <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white transition" href="#">User Accounts</a>
                        <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white transition" href="#">Funds</a>
                        <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white transition" href="#">Leverage &amp; Costs</a>
                        <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white transition" href="#">Orders</a>
                        <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white transition" href="#">Community</a>
                        <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white transition" href="#">Support</a>
                    </nav>
                    
                    <div className="px-6 py-6 border-t border-white/5 text-sm text-white/70">
                        <button 
                            onClick={handleLogout}
                            className="flex items-center w-full gap-3 rounded-lg px-3 py-2 text-white/70 hover:bg-red-500/10 hover:text-red-400 transition cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>
                </aside>

                {/* Main area */}
                <main className="flex-1 px-6 py-8 space-y-8">
                    {/* Top bar */}
                    <header className="flex flex-wrap gap-4 items-center justify-between">
                        <div>
                            <p className="text-sm text-white/60">Admin Control Center</p>
                            <h1 className="text-2xl font-semibold">Paper Trading Dashboard</h1>
                        </div>
                        <div className="text-right">
                            <p className="text-xs uppercase tracking-wide text-white/40">Date</p>
                            <p className="text-lg font-semibold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</p>
                        </div>
                    </header>

                    {/* KPI cards */}
                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <article className="rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:bg-white/10 cursor-pointer">
                            <p className="text-xs uppercase tracking-wide text-white/50">Total Users</p>
                            <p className="text-3xl font-semibold mt-3">18,420</p>
                            <p className="text-emerald-400 text-sm mt-2">+420 new this week</p>
                        </article>
                        <article className="rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:bg-white/10 cursor-pointer">
                            <p className="text-xs uppercase tracking-wide text-white/50">Active Users</p>
                            <p className="text-3xl font-semibold mt-3">9,678</p>
                            <p className="text-white/60 text-sm mt-2">52% daily engagement</p>
                        </article>
                        <article className="rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:bg-white/10 cursor-pointer">
                            <p className="text-xs uppercase tracking-wide text-white/50">Total Trades</p>
                            <p className="text-3xl font-semibold mt-3">482,301</p>
                            <p className="text-white/60 text-sm mt-2">+12.4% month over month</p>
                        </article>
                        <article className="rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:bg-white/10 cursor-pointer">
                            <p className="text-xs uppercase tracking-wide text-white/50">Revenue</p>
                            <p className="text-3xl font-semibold mt-3">&#8377;15.2&nbsp;Cr</p>
                            <p className="text-emerald-400 text-sm mt-2">+6.3% vs last quarter</p>
                        </article>
                    </section>

                    {/* Charts */}
                    <section className="grid gap-6 lg:grid-cols-2">
                        <article className="rounded-2xl border border-white/5 bg-white/5 p-6 transition hover:bg-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Total Trades</h2>
                                <p className="text-sm text-white/50">Last 12 months</p>
                            </div>
                            <div className="h-72 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-white/30 text-sm">
                                Chart placeholder
                            </div>
                        </article>

                        <article className="rounded-2xl border border-white/5 bg-white/5 p-6 transition hover:bg-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Revenue</h2>
                                <p className="text-sm text-white/50">Year to date</p>
                            </div>
                            <div className="h-72 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-white/30 text-sm">
                                Chart placeholder
                            </div>
                        </article>
                    </section>
                </main>
            </div>
        </div>
    );
}
