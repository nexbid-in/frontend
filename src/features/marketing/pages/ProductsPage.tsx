import { CtaBanner } from '../components/CTABanner';

import heroIllustration from '../assets/products/hero-illustration.png';
import webImg from '../assets/products/web-img.svg';
import communityImg from '../assets/products/community-preview.png';
import journalImg from '../assets/products/journal-img.webp'

export default function ProductsPage() {
    return (
        <>
            {/* Hero Section */}
            <header className="relative bg-gradient-to-br from-primary-green-light via-white to-blue-50 pt-12 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="text-center lg:text-left">
                            <h1 className="text-4xl lg:text-5xl font-bold text-[#0F172A] mb-4">Everything You Need to <span className="text-primary-green">Learn, Trade, and Grow</span>  in One Platform.</h1>
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
            <CtaBanner />
        </>
    );
}