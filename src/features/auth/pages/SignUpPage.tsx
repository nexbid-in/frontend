import { Link } from "react-router-dom"


export default function SignUpPage() {
    return (
        <div className="bg-white text-gray-900 h-screen flex overflow-hidden">

            {/* <!-- Left Section (Branding & Features) --> */}
            <div
                className="hidden lg:flex lg:w-[55%] flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-primary-green-light via-white to-blue-50 relative border-r border-green-100">
                {/* <!-- Subtle radial gradient overlay --> */}
                <div
                    className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent pointer-events-none">
                </div>

                <div className="z-10">
                    <div className="flex items-center space-x-2 mb-12">
                        <span className="text-3xl font-extrabold text-primary-green tracking-tight">nexbid</span>
                    </div>

                    <h1 className="text-3xl xl:text-4xl font-bold mb-4 text-gray-900">
                        Your Gateway to <br /><span className="text-primary-green">Confident</span> Trading.
                    </h1>
                    <p className="text-gray-500 text-sm xl:text-base max-w-md">
                        Practice trading with live market data. Build strategies, test ideas, and level up your investing game.
                    </p>
                </div>

                <div className="z-10 mt-8">
                    {/* <!-- Stats --> */}
                    <div className="flex space-x-10 mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">3M+</h3>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">Traders Love NexBid
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">#No.1</h3>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">Top Trading
                                Platform</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">1M+</h3>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">Downloads</p>
                        </div>
                    </div>

                    {/* <!-- Features --> */}
                    <div className="space-y-5">
                        <div className="flex items-start space-x-3">
                            <div className="p-1.5 bg-green-100 rounded-md text-primary-green">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                                    </path>
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-800">Advanced Trading Charts</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Institutional-grade volume analysis tools</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="p-1.5 bg-green-100 rounded-md text-primary-green">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                                    </path>
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-800">Live Market Data</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Futures, Stocks, Crypto, Forex & Options</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="p-1.5 bg-green-100 rounded-md text-primary-green">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z">
                                    </path>
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-800">NexBid Challenge</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Compete, track your edge, earn rewards</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* <!-- Right Section (Login Form) --> */}
            <div className="w-full lg:w-[45%] bg-white flex flex-col justify-center items-center p-6 xl:p-12 relative">
                <div className="absolute top-6 left-6">
                    <a href="javascript:history.back()"
                        className="text-gray-500 hover:text-gray-800 flex items-center text-sm font-medium transition">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Back
                    </a>
                </div>

                <div className="w-full max-w-[360px]">
                    <h2 className="text-2xl font-bold mb-1.5 text-gray-900">Create your account</h2>
                    <p className="text-sm text-gray-500 mb-8">Free forever. No credit card required.</p>

                    <form className="space-y-4">
                        {/* <!-- Name Row --> */}
                        <div className="flex space-x-3">
                            <div className="w-1/2">
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">First Name</label>
                                <input type="text" placeholder="Will" required
                                    className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition placeholder-gray-400" />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Last Name</label>
                                <input type="text" placeholder="Smith" required
                                    className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition placeholder-gray-400" />
                            </div>
                        </div>

                        {/* <!-- Email Address --> */}
                        <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                            <input type="email" placeholder="name@gmail.com" required
                                className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition placeholder-gray-400" />
                        </div>

                        {/* <!-- Password --> */}
                        <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                            <div className="relative">
                                <input type="password" placeholder="Minimum 8 characters" required
                                    className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition placeholder-gray-400" />
                                <button type="button" className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* <!-- Confirm Password --> */}
                        <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
                            <input type="password" placeholder="Repeat password" required
                                className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition placeholder-gray-400" />
                        </div>

                        <button type="submit"
                            className="w-full bg-primary-green text-white font-medium text-sm py-2.5 rounded-md hover:bg-primary-green-hover transition shadow-sm">
                            Create Free Account
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-between">
                        <hr className="w-full border-gray-200" />
                        <span className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Or sign up with</span>
                        <hr className="w-full border-gray-200" />
                    </div>

                    <div className="mt-5">
                        <button
                            className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 rounded-md py-2 hover:bg-gray-50 transition shadow-sm">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-xs font-medium text-gray-700">Continue with Google</span>
                        </button>
                    </div>

                    <div className="mt-5 text-center text-[10px] text-gray-500">
                        By signing up I agree to the <a href="#" className="text-primary-green hover:underline">Terms of Service</a> and <a href="#" className="text-primary-green hover:underline">Privacy Policy</a>
                    </div>

                    <div className="mt-6 text-center text-xs text-gray-500">
                        Already have an account? <Link to="/signin" className="text-primary-green hover:text-primary-green-hover font-medium transition">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}