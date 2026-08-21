
export function DashboardPage() {
    return (
        <div className="flex h-full p-4 gap-4">
            
            {/* Sidebar specific to Dashboard */}
            <aside className="w-[400px] bg-dash-panel border border-dash-border rounded-md flex flex-col h-full overflow-y-auto custom-scrollbar">
                <div className="flex justify-between p-4 text-dash-text-muted text-xs font-medium border-b border-dash-border">
                    <span className="w-2/5">Index</span>
                    <span className="w-1/5 text-left">Price</span>
                    <span className="w-1/5 text-center">Chg</span>
                    <span className="w-1/5 text-right">% Chg</span>
                </div>

                <div>
                    <div className="text-xs font-semibold text-[#9ca3af] px-4 py-4 border-b border-dash-border">Most Popular Indices</div>
                    <div className="flex items-center justify-between p-4 border-b border-dash-border hover:bg-[#1b1b1b] cursor-pointer">
                        <span className="w-2/5 text-xs text-[#e5e5e5] font-medium">NIFTY 50</span>
                        <span className="w-1/5 text-xs text-left text-[#e5e5e5]">25,492.30</span>
                        <span className="w-1/5 text-xs text-center text-[#ef4444]">-17.40</span>
                        <span className="w-1/5 text-xs text-right text-[#ef4444]">-0.07%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 border-b border-dash-border hover:bg-[#1b1b1b] cursor-pointer">
                        <span className="w-2/5 text-xs text-[#e5e5e5] font-medium">NIFTY BANK</span>
                        <span className="w-1/5 text-xs text-left text-[#e5e5e5]">56,334.10</span>
                        <span className="w-1/5 text-xs text-center text-[#22c55e]">102.80</span>
                        <span className="w-1/5 text-xs text-right text-[#22c55e]">0.18%</span>
                    </div>
                </div>
            </aside>

            {/* Main Trading Dashboard Content */}
            <section className="flex-1 bg-dash-panel border border-dash-border rounded-md p-6 h-full overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-6">

                    <div className="border-b border-dash-border pb-4">
                        <div className="text-base font-semibold text-[#e5e5e5] mb-2">Holdings</div>
                        <div className="flex items-center gap-40">
                            <div>
                                <div className="text-xs text-[#9ca3af]">Invested</div>
                                <div className="text-lg font-bold text-[#e5e5e5]">₹102.30</div>
                            </div>
                            <div>
                                <div className="text-xs text-[#9ca3af]">Current</div>
                                <div className="text-lg font-bold text-[#e5e5e5]">₹63.39</div>
                            </div>
                            <div>
                                <div className="text-xs text-[#9ca3af]">Total P&L</div>
                                <div className="text-lg font-bold text-[#ef4444]">-₹38.91 (-38.04%)</div>
                            </div>
                            <div>
                                <div className="text-xs text-[#9ca3af]">Today's P&L</div>
                                <div className="text-base font-medium text-[#ef4444]">-₹0.39 (-0.61%)</div>
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-dash-border pb-6">
                        <div className="text-base font-semibold text-[#e5e5e5] mb-2">Positions</div>
                        <p className="text-sm text-dash-text-muted mt-2">You don't have any positions yet! Use our screeners for market opportunities. <a href="#" className="text-accent font-medium hover:underline">Go to Screeners →</a></p>
                    </div>

                    <div>
                        <div className="text-base font-semibold text-[#e5e5e5] mb-4">Market Snapshot <span className="text-sm text-dash-text-muted ml-4">As on 07-Nov-2025 16:00 IST</span></div>
                        
                        <div className="flex gap-x-8 py-4">
                            <button className="text-[#d1d5db] text-xs font-medium border border-[#4b5563] px-3 py-1.5 rounded-md hover:border-white">
                                GAINERS
                            </button>
                            <button className="text-[#d1d5db] text-xs font-medium px-3 py-1.5 rounded-md hover:border-white">
                                LOSERS
                            </button>
                        </div>
                    
                        <div className="flex-1">
                            <div>
                                <div className="flex justify-between p-4 text-[#a1a1aa] text-xs font-medium border-b border-dash-border">
                                    <span className="w-2/5">Symbol</span>
                                    <span className="w-1/5 text-left">Price</span>
                                    <span className="w-1/5 text-center">Chg</span>
                                    <span className="w-1/5 text-right">% Chg</span>
                                </div>
                                <div className="flex items-center justify-between p-4 border-b border-dash-border hover:bg-[#1b1b1b] cursor-pointer">
                                    <span className="w-2/5 text-xs text-[#e5e5e5] font-medium">HBSL </span>
                                    <span className="w-1/5 text-xs text-left text-[#e5e5e5]">99.81</span>
                                    <span className="w-1/5 text-xs text-center text-primary-green">16.63</span>
                                    <span className="w-1/5 text-xs text-right text-primary-green">19.99</span>
                                </div>
                                <div className="flex items-center justify-between p-4 hover:bg-[#1b1b1b] cursor-pointer">
                                    <span className="w-2/5 text-xs text-[#e5e5e5] font-medium">INTERARCH</span>
                                    <span className="w-1/5 text-xs text-left text-[#e5e5e5]">2,542.00</span>
                                    <span className="w-1/5 text-xs text-center text-primary-green">347.60</span>
                                    <span className="w-1/5 text-xs text-right text-primary-green">15.84</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
