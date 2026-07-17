import { CtaBanner } from '../components/CTABanner';

import heroIllustration from '../assets/about/hero-illustration.png';
import ourStoryImg from '../assets/about/our-story.png';
import financialChartsImg from '../assets/about/financial-charts.png';

export default function AboutPage() {
    return (
        <>
            {/* Hero Section */}
            <header className="relative bg-gradient-to-br from-primary-green-light via-white to-blue-50 pt-24 pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                        <div className="relative z-10">
                            <h1 className="text-4xl sm:text-5xl font-bold text-nexbid-dark">
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
                            <h2 className="text-3xl font-bold text-nexbid-dark">What Makes <span className="text-primary-green">nexbid</span> Different</h2>
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
                            The People Behind <span className="text-primary-green">nexbid</span>
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
            <CtaBanner />
        </>
    );
}