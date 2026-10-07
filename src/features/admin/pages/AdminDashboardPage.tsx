export function AdminDashboardPage() {
    return (
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
    );
}
