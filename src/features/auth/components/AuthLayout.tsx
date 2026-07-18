import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthLayoutProps {
    children: React.ReactNode;
    heroTitle: React.ReactNode;
    heroSubtitle: string;
}

export function AuthLayout({ children, heroTitle, heroSubtitle }: AuthLayoutProps) {
    const navigate = useNavigate();

    return (
        <div className="bg-white text-gray-900 h-screen flex overflow-hidden">
            {/* Left Section (Branding & Features) */}
            <div
                className="hidden lg:flex lg:w-[55%] flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-primary-green-light via-white to-blue-50 relative border-r border-green-100">
                {/* Subtle radial gradient overlay */}
                <div
                    className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent pointer-events-none">
                </div>

                <div className="z-10">
                    <div className="flex items-center space-x-2 mb-12">
                        <span className="text-3xl font-extrabold text-primary-green tracking-tight">nexbid</span>
                    </div>

                    <h1 className="text-3xl xl:text-4xl font-bold mb-4 text-gray-900">
                        {heroTitle}
                    </h1>
                    <p className="text-gray-500 text-sm xl:text-base max-w-md">
                        {heroSubtitle}
                    </p>
                </div>

                <div className="z-10 mt-8">
                    {/* Stats */}
                    <div className="flex space-x-10 mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">3M+</h3>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">Traders Love NexBid</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">#No.1</h3>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">Top Trading Platform</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">1M+</h3>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">Downloads</p>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-5">
                        <div className="flex items-start space-x-3">
                            <div className="p-1.5 bg-green-100 rounded-md text-primary-green">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
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

            {/* Right Section (Login Form) */}
            <div className="w-full lg:w-[45%] bg-white flex flex-col justify-center items-center p-6 xl:p-12 relative">
                <div className="absolute top-6 left-6">
                    <button onClick={() => navigate(-1)}
                        className="text-gray-500 hover:text-gray-800 flex items-center text-sm font-medium transition cursor-pointer">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Back
                    </button>
                </div>

                <div className="w-full max-w-[360px]">
                    {children}
                </div>
            </div>
        </div>
    );
}
