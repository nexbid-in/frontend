import { APP_ROUTES } from "@/constants/routes";
import { Link } from 'react-router-dom';

import { CtaBanner } from '../components/CTABanner';

import heroIllustration from '../assets/pricing/hero-illustration.png';
import financialGrowthImg from '../assets/pricing/financial-growth.png';

export default function PricingPage() {
    return (
        <>
            {/* Hero Section */}
            <header className="relative bg-gradient-to-br from-primary-green-light via-white to-blue-50 pt-24 pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="text-center lg:text-left">
                            <h1 className="text-5xl font-bold text-heading mb-4">Add Virtual <span className="text-primary-green">Funds Anytime</span> You Need.</h1>
                            <p className="text-body mb-4 leading-relaxed">Every NexBid user starts with <span className=" font-bold">₹10,000 in virtual money</span> to trade risk-free. When your balance runs out, simply add real money to refill your account with <span className=" font-bold">10× value</span>.</p>
                            <p className="text-sm text-gray-500 mb-6">Minimum add amount: <span className="text-primary-green font-bold">₹100</span> real money = <span className="text-primary-green font-bold">₹1,000</span> virtual money.</p>
                            <Link to={APP_ROUTES.USER.SIGN_UP} className="bg-primary-green text-white rounded-lg px-6 py-3 font-medium hover-primary transition shadow-md">Create Free Account</Link>
                        </div>

                        <div className="hidden lg:flex justify-center">
                            <img className="w-full max-w-md" src={heroIllustration} alt="NexBid" />
                        </div>
                    </div>
                </div>
            </header>

            {/* How Pricing Work section */}
            <section className="py-24 bg-white text-center">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-3xl font-semibold text-heading mb-12">How NexBid <span className="text-primary-green font-bold">Pricing</span> Works</h2>
                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="p-6 rounded-lg">
                            <div className="text-primary-green text-5xl mb-4 font-extrabold">1</div>
                            <h3 className="text-xl font-semibold mb-2 text-heading">Create Account</h3>
                            <p className="text-body leading-relaxed">Sign up and get ₹10,000 virtual money instantly, no credit card needed.</p>
                        </div>
                        <div className="p-6 rounded-lg">
                            <div className="text-primary-green text-5xl mb-4 font-extrabold">2</div>
                            <h3 className="text-xl font-semibold mb-2 text-heading">Practice Trading</h3>
                            <p className="text-body leading-relaxed">Learn real trading without real risks using live market data and features.</p>
                        </div>
                        <div className="p-6 rounded-lg">
                            <div className="text-primary-green text-5xl mb-4 font-extrabold">3</div>
                            <h3 className="text-xl font-semibold mb-2 text-heading">Top Up Anytime</h3>
                            <p className="text-body leading-relaxed">Buy more virtual balance when you need it for one-time fees. No subscriptions.</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-10 font-medium">No subscriptions. No fixed plans. Add only what you need, when you need it.</p>
                </div>
            </section>

            {/* Conversion Section  */}
            <section className="py-24 bg-primary-green-light">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-semibold text-heading mb-4"><span className=" text-primary-green">Simple,</span> Transparent Conversion</h2>
                    <p className="text-lg text-body mb-10">Every <span className="font-semibold text-primary-green">₹1</span> you add gives you <span className="font-semibold text-primary-green">₹10</span> in virtual trading balance. No hidden multipliers.</p>

                    <div className="grid md:grid-cols-4 gap-6 mb-12">
                        <div className="bg-white shadow-md rounded-xl p-6 border-b-4 border-blue-200">
                            <p className="text-sm text-gray-500">Real Money</p>
                            <p className="text-2xl font-semibold text-heading">₹100</p>
                            <span className="text-xl text-primary-green font-bold mt-2 inline-block">→ ₹1,000 V</span>
                        </div>
                        <div className="bg-white shadow-md rounded-xl p-6 border-b-4 border-blue-200">
                            <p className="text-sm text-gray-500">Real Money</p>
                            <p className="text-2xl font-semibold text-heading">₹250</p>
                            <span className="text-xl text-primary-green font-bold mt-2 inline-block">→ ₹2,500 V</span>
                        </div>
                        <div className="bg-white shadow-md rounded-xl p-6 border-b-4 border-blue-200">
                            <p className="text-sm text-gray-500">Real Money</p>
                            <p className="text-2xl font-semibold text-heading">₹500</p>
                            <span className="text-xl text-primary-green font-bold mt-2 inline-block">→ ₹5,000 V</span>
                        </div>
                        <div className="bg-white shadow-md rounded-xl p-6 border-b-4 border-blue-200">
                            <p className="text-sm text-gray-500">Real Money</p>
                            <p className="text-2xl font-semibold text-heading">₹1,000</p>
                            <span className="text-xl text-primary-green font-bold mt-2 inline-block">→ ₹10,000 V</span>
                        </div>
                    </div>

                    <p className="mt-8 text-sm text-gray-500">Add any amount equal to or greater than ₹100 using the in-app deposit feature.</p>
                </div>
            </section>

            {/* Pays Off Section  */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center px-8">
                    <div>
                        <h2 className="text-3xl font-semibold text-heading mb-6">Why Adding <span className=" text-primary-green">Virtual Funds</span> Pays Off.</h2>
                        <p className="text-lg text-body mb-8">Refilling your virtual balance is an investment in your trading education, allowing you to:</p>
                        <ul className="space-y-4 text-body text-base">
                            <li className="flex items-start">
                                <span className="text-primary-green mr-3 text-xl font-bold">✓</span> <p><strong>Continue Practicing:</strong> Keep learning and executing trades after your initial balance hits zero.</p>
                            </li>
                            <li className="flex items-start">
                                <span className="text-primary-green mr-3 text-xl font-bold">✓</span> <p><strong>Improve Risk Management:</strong> Practice capital allocation and position sizing with higher, more realistic balances.</p>
                            </li>
                            <li className="flex items-start">
                                <span className="text-primary-green mr-3 text-xl font-bold">✓</span> <p><strong>Experience Scenarios:</strong> Trade through diverse market conditions and learn advanced strategies without real-world risk.</p>
                            </li>
                            <li className="flex items-start">
                                <span className="text-primary-green mr-3 text-xl font-bold">✓</span> <p><strong>Track Long-Term Growth:</strong> Review your performance over months or years, refining your strategy for future real investment.</p>
                            </li>
                        </ul>
                    </div>
                    <img src={financialGrowthImg} alt="Growth graph illustration" />
                </div>
            </section>

            {/* CTA Banner Section */}
            <CtaBanner />
        </>
    );
}