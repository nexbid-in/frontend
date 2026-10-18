import { Link } from "react-router-dom";
import { APP_ROUTES } from "@/constants/routes";

export default function AccountSuspendedPage() {

    return (
        <div className="h-screen w-full bg-[#F8FAFC] text-gray-900 flex flex-col justify-between items-center px-4 py-3 sm:px-6 sm:py-4 overflow-hidden select-none">
            {/* Top Brand Header */}
            <header className="w-full max-w-5xl flex items-center justify-between py-2 sm:py-3 shrink-0">
                <Link to={APP_ROUTES.USER.HOME} className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-primary-green tracking-tight">nexbid</span>
                </Link>
                <div className="flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Security & Compliance Notice
                </div>
            </header>

            {/* Main Center Card */}
            <main className="w-full max-w-lg my-auto flex flex-col justify-center">
                <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 shadow-xl shadow-gray-200/60 text-center relative">
                    {/* Shield Icon Badge */}
                    <div className="relative mx-auto w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-4 sm:mb-5 shadow-sm">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.002A11.959 11.959 0 0112 2.714zM12 15.75h.007v.008H12v-.008z"
                            />
                        </svg>
                    </div>

                    {/* Headings */}
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2 tracking-tight">
                        Account Suspended
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 mb-5 sm:mb-6 leading-relaxed max-w-md mx-auto">
                        Your Nexbid account has been restricted by administration. All active trading sessions have been terminated to safeguard your account.
                    </p>

                    {/* Status Information Box */}
                    <div className="bg-gray-50 border border-gray-200/70 rounded-xl p-3.5 sm:p-4 mb-5 sm:mb-6 text-left space-y-2.5 sm:space-y-3">
                        <div className="flex items-start gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-gray-900">Current Status: Restricted</p>
                                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-relaxed">
                                    All live orders, simulated positions, and profile actions have been locked pending administrative review.
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-gray-200/70 pt-2.5 flex items-start gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-gray-900">Resolution & Support</p>
                                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-relaxed">
                                    If you believe this suspension was made in error or wish to request an account review, our support desk is ready to assist you.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            to={APP_ROUTES.USER.SUPPORT}
                            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-primary-green hover:bg-primary-green-hover text-white transition-all shadow-sm hover:shadow cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                            </svg>
                            <span>Contact Support</span>
                        </Link>

                        <Link
                            to={APP_ROUTES.USER.SIGN_IN}
                            className="flex-1 inline-flex items-center justify-center py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 transition-colors cursor-pointer"
                        >
                            Return to Sign In
                        </Link>
                    </div>
                </div>
            </main>

            {/* Bottom Footer Note */}
            <footer className="w-full max-w-5xl text-center py-2 sm:py-3 text-[11px] sm:text-xs text-gray-500 shrink-0">
                <p>Nexbid Risk & Compliance Desk · Automated Security Safeguard</p>
            </footer>
        </div>
    );
}
