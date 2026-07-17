import { Link } from 'react-router-dom';

import heroIllustration from '../assets/products/hero-illustration.png';
import webImg from '../assets/products/web-img.svg';
import communityImg from '../assets/products/community-preview.png';
import journalImg from '../assets/products/journal-img.webp'
import ctaImg from '../assets/cta-img.png';

export default function ProductsPage() {
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
                            <Link to="/products" className="uppercase text-sm font-semibold text-gray-500 hover:text-primary-green transition duration-150">PRODUCTS</Link>
                            <Link to="/pricing" className="uppercase text-sm font-semibold text-gray-500 hover:text-primary-green transition duration-150">PRICING</Link>
                            <Link to="/support" className="uppercase text-sm font-semibold text-gray-500 hover:text-primary-green transition duration-150">SUPPORT</Link>
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
            <header className="relative bg-gradient-to-br from-primary-green-light via-white to-blue-50 pt-12 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="text-center lg:text-left">
                            <h1 className="text-4xl lg:text-5xl font-bold text-[#0F172A] mb-4 leading-tight">Everything You Need to <span className="text-primary-green">Learn, Trade, and Grow</span>  in One Platform.</h1>
                            <p className="text-lg text-[#374151] mb-8 leading-relaxed">NexBid’s suite of tools helps you trade confidently, connect with traders, and track your progress — all powered by real-market simulation.</p>
                        </div>

                        <div className="flex justify-center lg:justify-end">
                            <img
                                src={heroIllustration}
                                alt="NexBid products illustration showing a web interface, people connecting, and a journal"
                                className="w-full max-w-md"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Web Section  */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center px-8">
                    <div>
                        <h2 className="text-3xl font-semibold text-[#0F172A] mb-4"><span className="text-primary-green">nexbid Web</span>  — Trade Like It’s Real. Learn Without Risk.</h2>
                        <p className="text-lg text-[#374151] mb-6 leading-relaxed">Experience full-fledged stock trading with virtual money. Practice with real-time market data, leverage, taxes, and brokerage just like a real platform — but without losing real money.</p>
                        <ul className="space-y-3 text-[#374151] mb-8">
                            <li className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-[#059669]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 14.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                Real-time market data
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-[#059669]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 14.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                Leverage & brokerage simulation
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-[#059669]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 14.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                P&L & trade reports
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-[#059669]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 14.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                Portfolio tracking
                            </li>
                        </ul>
                    </div>
                    <img src={webImg} alt="Screenshot of the NexBid Web trading interface with charts and portfolio data" />
                </div>
            </section>

            {/* Community Section  */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center px-8">
                    <img src={communityImg} alt="NexBid Community interface showing a feed of trader discussions and charts" />
                        <div className="order-1 md:order-2">
                            <h2 className="text-3xl font-semibold text-[#0F172A] mb-4"><span className="text-primary-green">nexbid Community</span> — Where Traders Grow Together.</h2>
                            <p className="text-lg text-[#374151] mb-6 leading-relaxed">Join a vibrant community of traders sharing strategies, discussing markets, and growing together. Learn faster through collaboration, not isolation.</p>
                            <ul className="space-y-3 text-[#374151] mb-8">
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-[#059669]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 14.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                    Share trades & ideas
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-[#059669]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 14.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                    Discuss strategies
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-[#059669]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 14.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                    Build your network
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-[#059669]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 14.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                    Learn collectively
                                </li>
                            </ul>
                        </div>
                </div>
            </section>

            {/* Journal Section  */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center px-8">
                    <div>
                        <h2 className="text-3xl font-semibold text-[#0F172A] mb-4"><span className="text-primary-green">nexbid Journal</span> — Reflect. Improve. Progress.</h2>
                        <p className="text-lg text-[#374151] mb-6 leading-relaxed">Your personal space to document your trading journey. Record your trades, track your performance, and refine your strategies for better results.</p>
                        <ul className="space-y-3 text-[#374151] mb-8">
                            <li className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-[#059669]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 14.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                Track every trade
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-[#059669]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 14.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                Add personal notes
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-[#059669]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 14.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                Review mistakes
                            </li>
                            <li className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-[#059669]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 14.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                Measure growth
                            </li>
                        </ul>
                    </div>
                    <img src={journalImg} alt="Screenshot of the NexBid Journal interface with space for notes and performance charts" />
                </div>
            </section>


            <section className="py-16 bg-gray-50 text-center">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-3xl font-semibold text-[#0F172A] mb-4">Three Products. One Seamless Learning <span className="text-primary-green">Ecosystem</span>.</h2>
                    <p className="text-lg text-[#374151] mb-12">NexBid Web, Community, and Journal work together to help you trade smarter, connect deeply, and grow continuously.</p>
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