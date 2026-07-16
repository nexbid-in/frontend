import { Link } from 'react-router-dom';

import heroIllustration from '../assets/about/hero-illustration.png';
import ourStoryImg from '../assets/about/our-story.png';
import financialChartsImg from '../assets/about/financial-charts.png';
import ctaImg from '../assets/cta-img.png';

export default function AboutPage() {
    return (
        <>
            {/* Navigation */}
            <nav className="w-full sticky top-0 bg-white z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-3xl font-extrabold text-primary-green tracking-tight">
                                nexbid
                            </Link>
                        </div>

                        <div className="hidden md:flex md:space-x-8">
                            <Link to="/about" className="uppercase text-sm font-semibold text-gray-500 hover:text-primary-green transition duration-150">WHO WE ARE?</Link>
                            <a href="#news" className="uppercase text-sm font-semibold text-gray-500 hover:text-primary-green transition duration-150">NEWS</a>
                            <a href="#products" className="uppercase text-sm font-semibold text-gray-500 hover:text-primary-green transition duration-150">PRODUCTS</a>
                            <a href="#pricing" className="uppercase text-sm font-semibold text-gray-500 hover:text-primary-green transition duration-150">PRICING</a>
                            <a href="#support" className="uppercase text-sm font-semibold text-gray-500 hover:text-primary-green transition duration-150">SUPPORT</a>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Link to="/signin" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-primary-green rounded-md transition duration-150">
                                Login
                            </Link>
                            <Link to="/signup" className="px-4 py-2 text-sm font-semibold text-white bg-primary-green hover:bg-primary-green-hover rounded-md shadow-sm transition duration-150">
                                Sign Up Now
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative bg-gradient-to-br from-primary-green-light via-white to-blue-50 pt-24 pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                        <div className="relative z-10">
                            <h1 className="text-4xl sm:text-5xl font-bold text-nexbid-dark leading-tight">
                                We’re on a mission to make trading education <span className="text-primary-green">real, safe, and accessible</span> to everyone.
                            </h1>
                            <p className="mt-6 text-lg text-nexbid-neutral max-w-xl">
                                NexBid empowers aspiring traders to learn and practice in real market conditions — without risking their hard-earned money.
                            </p>
                        </div>

                        <div className="flex items-center justify-center lg:justify-end">
                            <img className="w-full max-w-lg h-auto rounded-lg" src={heroIllustration} alt="Abstract illustration of a team collaborating on the NexBid mission" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Our Story Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="lg:order-last">
                            <h2 className="text-3xl font-bold text-nexbid-dark">Our  <span className="text-primary-green">Story</span></h2>
                            <p className="mt-6 text-lg text-nexbid-neutral leading-relaxed">
                                Most beginners lose money when they start trading — not because they lack potential, but because they lack experience. NexBid was built to change that.
                            </p>
                            <p className="mt-4 text-lg text-nexbid-neutral leading-relaxed">
                                We bring the real trading experience to a risk-free environment using virtual money, real-time data, and real market mechanics. Our goal is to help you build confidence before investing your hard-earned capital.
                            </p>
                        </div>

                        <div className="lg:order-first flex items-center justify-center">
                            <img className="w-full max-w-md h-auto rounded-lg" src={ourStoryImg} alt="Illustration showing the journey from learning to confident trading" />
                        </div>
                    </div>
                </div>
            </section>

            {/* nexbid Difference Section */}
            <section className="bg-gradient-to-br from-primary-green-light via-white to-blue-50 py-16 md:py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-nexbid-dark">What Makes <span className="text-primary-green">NexBid</span> Different</h2>
                            <p className="mt-6 text-lg text-nexbid-neutral leading-relaxed">
                                Unlike traditional simulators, NexBid doesn’t just give you virtual money — it gives you the complete real-world trading experience. From brokerage and taxes to leverage and reports, every detail is designed to make your learning as authentic as possible.
                            </p>
                            <ul className="mt-8 space-y-4">
                                <li className="flex items-center">
                                    <svg className="h-6 w-6 text-primary-green" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
                                    </svg>
                                    <span className="ml-3 font-medium text-nexbid-dark">Real Market Conditions</span>
                                </li>
                                <li className="flex items-center">
                                    <svg className="h-6 w-6 text-primary-green" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
                                    </svg>
                                    <span className="ml-3 font-medium text-nexbid-dark">Realistic Brokerage Simulation</span>
                                </li>
                                <li className="flex items-center">
                                    <svg className="h-6 w-6 text-primary-green" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
                                    </svg>
                                    <span className="ml-3 font-medium text-nexbid-dark">Complete Transparency</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex items-center justify-center">
                            <img className="w-full max-w-md h-auto rounded-lg" src={financialChartsImg} alt="A chart comparing NexBid's features against competitors" />
                        </div>
                    </div>
                </div>
            </section>

            {/* The People Behind nexbid section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-text-primary">
                            The People Behind <span className="text-primary-green">NexBid</span>
                        </h2>
                        <p className="mt-6 text-lg text-nexbid-neutral max-w-3xl mx-auto">
                            Behind NexBid is a team of traders, technologists, and designers passionate about helping beginners trade smarter and safer. We believe that learning should feel real, but never risky.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* <!-- Team Experts --> */}
                        <div className="rounded-xl shadow-md p-8 bg-gray-50 text-center">
                            <div className="flex justify-center mb-6">
                                <svg className="w-12 h-12 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Trading Experts</h3>
                            <p className="text-gray-600">Crafting real-world strategies and market insights.</p>
                        </div>

                        {/* <!-- Design Thinkers --> */}
                        <div className="rounded-xl shadow-md p-8 bg-gray-50 text-center">
                            <div className="flex justify-center mb-6">
                                <svg className="w-12 h-12 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Design Thinkers</h3>
                            <p className="text-gray-600">Building intuitive, human-centered experiences.</p>
                        </div>

                        {/* <!-- Tech Innovators --> */}
                        <div className="rounded-xl shadow-md p-8 bg-gray-50 text-center">
                            <div className="flex justify-center mb-6">
                                <svg className="w-12 h-12 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 8l-4 4 4 4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Tech Innovators</h3>
                            <p className="text-gray-600">Powering the platform with precision and scale.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Banner Section */}
            <section className="relative py-24 px-6 md:px-12 cta-color">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
                        <div className="w-52">
                            {/* Ensure image path is correct */}
                            <img src={ctaImg} alt="Start Trading" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-4xl mb-4 font-extrabold text-text-primary">
                                Start Your <span className="text-primary-green">Trading Journey</span> Today
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed max-w-[600px]">
                                Learn the markets, test strategies, and build confidence — all in one virtual trading platform powered by real market data.
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <Link to="/signup" className="px-8 py-3 bg-primary-green hover:bg-primary-green-hover text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-1 block">
                                Sign Up Now
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Top Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                        {/* Brand */}
                        <div>
                            <span className="text-3xl font-extrabold text-primary-green tracking-tight">nexbid</span>
                            <p className="text-sm text-gray-400 mt-2">
                                Practice Real Trading, Virtually.
                            </p>
                        </div>

                        {/* Resources */}
                        <div>
                            <h4 className="font-bold text-white mb-4 text-sm">Resources</h4>
                            <ul className="space-y-2 text-xs">
                                <li><a href="#" className="text-gray-400 hover:text-white">Downloads</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Haircut</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Fund Transfer</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Bug Bounty Program</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">nexbid System Status</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Industry Stocks</a></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="font-bold text-white mb-4 text-sm">Company</h4>
                            <ul className="space-y-2 text-xs">
                                <li><a href="#" className="text-gray-400 hover:text-white">Career</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Send Feedback</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Become a Partner</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Trust & Security</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Awards & Recognition</a></li>
                            </ul>
                        </div>

                        {/* Offerings */}
                        <div>
                            <h4 className="font-bold text-white mb-4 text-sm">Offerings</h4>
                            <ul className="space-y-2 text-xs">
                                <li><a href="#" className="text-gray-400 hover:text-white">Investments</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Research Reports</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Integrated Partners</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">TradingView</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Institutional Broking</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Calculators</a></li>
                            </ul>
                        </div>

                        {/* Policy */}
                        <div>
                            <h4 className="font-bold text-white mb-4 text-sm">Policy</h4>
                            <ul className="space-y-2 text-xs">
                                <li><a href="#" className="text-gray-400 hover:text-white">Terms & Conditions</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">API - Terms & Conditions</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">AP - Terms & Conditions</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">App - Privacy Policy</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Investor Charter - Depositories</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Investor Charter - Stock Brokers</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Social Icons */}
                    <div className="flex gap-6 mb-12 justify-center md:justify-start">
                        <a aria-label="LinkedIn" href="#" className="text-gray-400 hover:text-white">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                            </svg>
                        </a>
                        <a aria-label="Twitter" href="#" className="text-gray-400 hover:text-white">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                            </svg>
                        </a>
                        <a aria-label="Instagram" href="#" className="text-gray-400 hover:text-white">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0m5.521 17.948a6.994 6.994 0 01-11.042 0c-.533-.673-.997-1.405-1.365-2.173h3.379c.55.825 1.583 1.373 2.776 1.373s2.226-.548 2.776-1.373h3.379c-.368.768-.832 1.5-1.365 2.173m1.414-4.351h-2.265a7 7 0 00-.105-.949h2.265c.058.314.088.637.105.949zm-11.07 0H4.104c.017-.312.047-.635.105-.949h2.265a7 7 0 00-.105.949zm5.535-9.597a2.45 2.45 0 100 4.9 2.45 2.45 0 000-4.9z" />
                            </svg>
                        </a>
                    </div>

                    {/* Bottom */}
                    <div className="border-t border-gray-700 pt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <p className="text-gray-400">
                                © NexBid 2025. All rights reserved.
                            </p>
                            <div className="flex gap-4 md:justify-end">
                                <a href="#" className="text-gray-400 hover:text-white">Terms</a>
                                <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
                                <a href="#" className="text-gray-400 hover:text-white">Disclaimer</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}