import { Link, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

export function AppLayout() {
    const user = useAppSelector((state) => state.auth.user);
    const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '??';

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-dash-bg text-dash-text font-sans">
            <nav className="h-[60px] bg-dash-panel flex items-center justify-between px-6 border-b border-dash-border">
                <div className="flex items-center gap-5">
                    <Link to="/app" className="text-2xl font-bold text-primary-green tracking-tight">
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
                    <Link to="/app" className="text-primary-green px-3 py-1.5 rounded-md font-medium">Markets</Link>
                    <Link to="/app/watchlist" className="text-[#d1d5db] hover:text-white">Watchlist</Link>
                    <Link to="/app/portfolio" className="text-[#d1d5db] hover:text-white">Portfolio</Link>
                    <Link to="/app/orders" className="text-[#d1d5db] hover:text-white">Orders</Link>
                    <Link to="/app/funds" className="text-[#d1d5db] hover:text-white">Funds</Link>
                </div>

                <div className="flex items-center gap-5 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-[#a1a1aa]">Margin Available:</span>
                        <span className="font-medium text-[#e5e5e5]">₹3757.30</span>
                    </div>
                    
                    <button className="text-[#d1d5db] text-xs font-medium border border-[#4b5563] px-3 py-1.5 rounded-md hover:border-white">
                        Add Funds
                    </button>
                    
                    {/* Dynamic User Initials */}
                    <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center font-semibold text-white cursor-pointer hover:bg-violet-700 transition">
                        <span>{initials}</span>
                    </div>
                </div>
            </nav>

            <main className="flex-1 overflow-hidden h-[calc(100vh-60px)]">
                <Outlet />
            </main>
        </div>
    );
}
