import { Link } from 'react-router-dom';

import heroIllustration from '../assets/support/hero-illustration.png';

export default function SupportPage() {
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
            <header className="relative bg-gradient-to-br from-primary-green-light via-white to-blue-50 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h1 className="text-5xl font-bold text-heading mb-4">We’re Here to <span className="text-primary-green">Help.</span></h1>
                            <p className="text-lg text-body mb-6 leading-relaxed">Have questions about trading, your account, or virtual money? Find answers below or reach out — our team is ready to help.</p>
                            <a href="#contact" className="bg-primary-green text-white rounded-lg px-6 py-3 font-medium hover-primary transition shadow-md">Contact Support</a>
                        </div>

                        <div className="hidden lg:flex justify-center">
                            <img className="w-full max-w-md" src={heroIllustration} alt="NexBid" />
                        </div>
                    </div>
                </div>
            </header>


            <section className="py-24 bg-white">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-3xl font-semibold text-heading text-center mb-12">Frequently Asked Questions</h2>

                    <h3 className="text-xl font-semibold text-primary-green mb-4 border-b border-gray-200 pb-2">Trading</h3>
                    <details className="bg-[#F8FAFC] p-4 rounded-lg shadow-sm mb-3 group">
                        <summary className="font-medium text-heading cursor-pointer flex justify-between items-center">
                            How does paper trading work in NexBid?
                            <svg className="w-4 h-4 text-primary-green group-open:rotate-180 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </summary>
                        <p className="text-body border-t border-gray-200 mt-2 pt-2">NexBid simulates real stock trading using virtual money and live market data so you can learn safely without risking real capital.</p>
                    </details>
                    <details className="bg-[#F8FAFC] p-4 rounded-lg shadow-sm mb-6 group">
                        <summary className="font-medium text-heading cursor-pointer flex justify-between items-center">
                            Is live market data included?
                            <svg className="w-4 h-4 text-primary-green group-open:rotate-180 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </summary>
                        <p className="text-body border-t border-gray-200 mt-2 pt-2">Yes. All virtual trades are based on live, real-time market prices to provide the most authentic trading experience possible.</p>
                    </details>

                    <h3 className="text-xl font-semibold text-primary-green mb-4 border-b border-gray-200 pb-2">Virtual Funds</h3>
                    <details className="bg-[#F8FAFC] p-4 rounded-lg shadow-sm mb-3 group">
                        <summary className="font-medium text-heading cursor-pointer flex justify-between items-center">
                            How do I add more virtual money?
                            <svg className="w-4 h-4 text-primary-green group-open:rotate-180 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </summary>
                        <p className="text-body border-t border-gray-200 mt-2 pt-2">Go to your Funds section and add real money (minimum ₹100). Every ₹1 added gives ₹10 in virtual balance.</p>
                    </details>
                    <details className="bg-[#F8FAFC] p-4 rounded-lg shadow-sm mb-6 group">
                        <summary className="font-medium text-heading cursor-pointer flex justify-between items-center">
                            Is there any fee for adding funds?
                            <svg className="w-4 h-4 text-primary-green group-open:rotate-180 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </summary>
                        <p className="text-body border-t border-gray-200 mt-2 pt-2">No subscriptions or hidden fees — you only pay the one-time top-up amount when you choose to add more virtual money to your account.</p>
                    </details>

                    <h3 className="text-xl font-semibold text-primary-green mb-4 border-b border-gray-200 pb-2">Account & Security</h3>
                    <details className="bg-[#F8FAFC] p-4 rounded-lg shadow-sm mb-3 group">
                        <summary className="font-medium text-heading cursor-pointer flex justify-between items-center">
                            How do I reset my login PIN?
                            <svg className="w-4 h-4 text-primary-green group-open:rotate-180 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </summary>
                        <p className="text-body border-t border-gray-200 mt-2 pt-2">Go to the "Settings" menu, select "Security," and then "Reset PIN." You will be guided through a simple verification process.</p>
                    </details>
                    <details className="bg-[#F8FAFC] p-4 rounded-lg shadow-sm mb-6 group">
                        <summary className="font-medium text-heading cursor-pointer flex justify-between items-center">
                            Can I delete my NexBid account?
                            <svg className="w-4 h-4 text-primary-green group-open:rotate-180 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </summary>
                        <p className="text-body border-t border-gray-200 mt-2 pt-2">Yes. Please contact our dedicated support team via the form below for account deletion and data removal assistance.</p>
                    </details>
                </div>
            </section>


            <section id="contact" className="py-20 bg-[#F8FAFC]">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 px-6 items-start">
                    <div className="p-6 md:p-0">
                        <h3 className="text-3xl font-semibold text-heading mb-4">Still Need Help?</h3>
                        <p className="text-lg text-body mb-6">Can’t find what you’re looking for in our FAQ? Send us a message — we’re happy to assist you personally.</p>
                        <p className="text-sm text-gray-500 mb-6">You can also email us directly at <span className="text-primary-green font-medium">support@nexbid.com</span> for less urgent inquiries.</p>
                        <div className="flex items-center space-x-3 text-body">
                            <svg className="w-6 h-6 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            <p className="font-medium">support@nexbid.com</p>
                        </div>
                    </div>

                    <form className="bg-white p-8 rounded-xl shadow-lg space-y-4 border border-gray-100">
                        <h4 className="text-xl font-semibold text-heading mb-2">Send us a Message</h4>
                        <input type="text" placeholder="Your Name" aria-label="Your Name" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary transition" />
                        <input type="email" placeholder="Your Email" aria-label="Your Email" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary transition" />
                        <input type="text" placeholder="Subject" aria-label="Subject" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary transition" />
                        <textarea rows={4} placeholder="Your Message" aria-label="Your Message" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary transition"></textarea>
                        <button type="submit" className="bg-primary-green text-white px-6 py-3 rounded-lg font-medium hover-primary transition w-full shadow-md">Send Message</button>
                    </form>
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