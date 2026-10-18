import { Link } from "react-router-dom";
import { APP_ROUTES } from "@/constants/routes";

export default function AccountSuspendedPage() {
    return (
        <div className="min-h-screen bg-[#0d0e11] text-[#E6E7EA] flex flex-col justify-between items-center p-6 relative overflow-hidden select-none">
            {/* Background ambient lighting */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary-green/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Top brand header */}
            <header className="w-full max-w-5xl flex items-center justify-between py-4 z-10">
                <Link to={APP_ROUTES.USER.HOME} className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold text-primary-green tracking-tight">nexbid</span>
                </Link>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    Security Notice
                </div>
            </header>

            {/* Main Center Card */}
            <main className="w-full max-w-lg my-auto z-10">
                <div className="bg-[#141517] border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl text-center">
                    {/* Top gradient accent line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />

                    {/* Shield Icon Badge */}
                    <div className="relative mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.25)]">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.002A11.959 11.959 0 0112 2.714zM12 15.75h.007v.008H12v-.008z"
                            />
                        </svg>
                    </div>

                    {/* Headings */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#E6E7EA] mb-2 tracking-tight">
                        Account Suspended
                    </h1>
                    <p className="text-sm text-[#9AA0A6] mb-8 leading-relaxed max-w-md mx-auto">
                        Your Nexbid account has been temporarily blocked by administration. Active trading sessions have been terminated to safeguard your account.
                    </p>

                    {/* Status & Explanation Box */}
                    <div className="bg-[#1a1c20] border border-white/5 rounded-xl p-4 mb-8 text-left space-y-3.5">
                        <div className="flex items-start gap-3">
                            <span className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-[#E6E7EA]">Current Status: Restricted</p>
                                <p className="text-[12px] text-[#9AA0A6] mt-0.5 leading-relaxed">
                                    All market orders, open positions, and account modifications are frozen pending administrative review.
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-white/5 pt-3 flex items-start gap-3">
                            <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-[#E6E7EA]">Resolution & Support</p>
                                <p className="text-[12px] text-[#9AA0A6] mt-0.5 leading-relaxed">
                                    If you believe this suspension is in error or wish to request an account review, our compliance support desk is available to assist you.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <a
                            href="mailto:support@nexbid.com?subject=Nexbid%20Account%20Suspension%20Inquiry"
                            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-primary-green hover:bg-primary-green-hover text-white transition-all shadow-md cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                            <span>Contact Support</span>
                        </a>

                        <Link
                            to={APP_ROUTES.USER.SIGN_IN}
                            className="flex-1 inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-medium text-[#9AA0A6] hover:text-[#E6E7EA] hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
                        >
                            Return to Sign In
                        </Link>
                    </div>
                </div>
            </main>

            {/* Bottom Footer Note */}
            <footer className="w-full max-w-5xl text-center py-4 text-xs text-[#9AA0A6] z-10">
                <p>Nexbid Risk & Compliance Desk · Automated Security System</p>
            </footer>
        </div>
    );
}
