import { APP_ROUTES } from "@/constants/routes";
import { Link } from 'react-router-dom';

import { CtaBanner } from '../components/CTABanner';

import heroIllustration from '../assets/landing/hero-illustration.png';
import marketingRoiImg from '../assets/landing/marketing-roi.jpg';
import communityPreviewImg from '../assets/landing/community-preview.png';

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-primary-green-light via-white to-blue-50 pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl font-extrabold text-text-primary tracking-tight">
                Your Gateway to <span className="text-primary-green">Confident</span> Trading.
              </h1>
              <p className="mt-6 text-xl text-text-secondary max-w-lg mx-auto lg:mx-0">
                Practice trading with live market data. Build strategies, test ideas, and level up your investing game.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to={APP_ROUTES.USER.SIGN_UP} className="px-8 py-3 text-lg font-semibold text-white bg-primary-green hover:bg-primary-green-hover rounded-lg shadow-lg transition duration-300 transform hover:scale-105 text-center">
                  Start Paper Trading
                </Link>
                <a href="#features" className="px-8 py-3 text-lg font-semibold text-primary-green bg-white border-2 border-primary-green hover:bg-primary-green-light rounded-lg shadow-lg transition duration-300 transform hover:scale-105 text-center">
                  Explore Features
                </a>
              </div>
            </div>

            <div className="hidden lg:flex justify-center">
              {/* Ensure this image path is correct in your React public folder */}
              <img className="w-full max-w-md" src={heroIllustration} alt="NexBid Hero" />
            </div>
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-text-primary">
              Trade, Learn, and Grow — The <span className="text-primary-green">nexbid</span> Way.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border-l-4 border-primary-green p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Create Account</h3>
              </div>
              <p className="text-gray-600">Get ₹10,000 virtual money instantly.</p>
            </div>

            <div className="bg-white border-l-4 border-teal-500 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.25 18L9 11.25l3 3L21.75 4.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Trade Real Stocks</h3>
              </div>
              <p className="text-gray-600">Experience real brokerage, taxes, and leverage.</p>
            </div>

            <div className="bg-white border-l-4 border-primary-green p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Level Up</h3>
              </div>
              <p className="text-gray-600">Analyze your trades, track performance, and learn safely.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-text-primary">
              Everything You Expect from a Real <span className="text-primary-green">Trading Platform.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Real-Time Market Data</h3>
              <p className="text-sm text-gray-600">Live prices and tickers.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Brokerage & Tax Simulation</h3>
              <p className="text-sm text-gray-600">Simulated charges replicate real-world trading.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Leverage Support</h3>
              <p className="text-sm text-gray-600">Practice margin and leverage strategies.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Global P&L & Reports</h3>
              <p className="text-sm text-gray-600">Detailed P&L statements and trade book.</p>
            </div>

            {/* Feature 5 */}
            <div className="feature-card bg-white p-6 rounded-xl shadow-md">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4v10" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Portfolio Tracking</h3>
              <p className="text-sm text-gray-600">Track positions, holdings, and returns.</p>
            </div>

            {/* Feature 6 */}
            <div className="feature-card bg-white p-6 rounded-xl shadow-md">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Fund Management</h3>
              <p className="text-sm text-gray-600">Virtual wallet & top-up flow.</p>
            </div>

            {/* Feature 7 */}
            <div className="feature-card bg-white p-6 rounded-xl shadow-md">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747 0-6.002-4.5-10.747-10-10.747z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Trading Journal</h3>
              <p className="text-sm text-gray-600">Capture trade rationale and review performance.</p>
            </div>

            {/* Feature 8 */}
            <div className="feature-card bg-white p-6 rounded-xl shadow-md">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 10H9m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Community for Traders</h3>
              <p className="text-sm text-gray-600">Share strategies and learn from peers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl font-extrabold text-text-primary mb-10">
                Why Traders Choose <span className="text-primary-green">nexbid ?</span>
              </h2>

              <ul className="space-y-6">
                <li className="flex items-start space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="w-7 h-7 text-primary-green flex-shrink-0 mt-0.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Practice Before You Risk</h3>
                    <p className="text-text-secondary mt-1">Build confidence by testing strategies with zero financial consequences.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="w-7 h-7 text-primary-green flex-shrink-0 mt-0.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Realistic Experience, Zero Loss</h3>
                    <p className="text-text-secondary mt-1">Our simulation includes brokerage, taxes, and leverage for true-to-life practice.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="w-7 h-7 text-primary-green flex-shrink-0 mt-0.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Learn Like a Pro</h3>
                    <p className="text-text-secondary mt-1">Use detailed P&L reports and a trading journal to find your edge.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="w-7 h-7 text-primary-green flex-shrink-0 mt-0.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Affordable Virtual Credits</h3>
                    <p className="text-text-secondary mt-1">Keep practicing without breaking the bank with easy virtual top-ups.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="w-7 h-7 text-primary-green flex-shrink-0 mt-0.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Modern, Fast, Secure</h3>
                    <p className="text-text-secondary mt-1">A sleek, high-performance platform that protects your data.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="order-1 lg:order-2 flex justify-center">
              <img src={marketingRoiImg} alt="nexbid" />
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="bg-primary-green-light py-16 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center -space-x-4 mb-8">
            <img className="w-full max-w-md" src={communityPreviewImg} alt="community-img" />
          </div>

          <h2 className="text-4xl font-extrabold text-text-primary mb-5">
            Learn Together, <span className="text-primary-green">Trade Smarter.</span>
          </h2>
          <p className="text-xl text-text-secondary mb-10">
            Join the NexBid trading community to connect with peers, share insights, discuss market trends, and learn from other traders in a collaborative environment.
          </p>
          <a href="#" className="px-8 py-3 text-lg font-semibold text-white bg-primary-green hover:bg-primary-green-hover rounded-lg shadow-lg transition duration-300 transform hover:scale-105">
            Join the Community
          </a>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-text-primary">
              What Our <span className="text-primary-green">Early Users</span> Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="testimonial-card p-8 rounded-xl shadow-md">
              <p className="text-gray-700 mb-6 leading-relaxed">
                "NexBid helped me understand trading without fear. The virtual money approach is perfect for beginners like me."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-green-light flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary-green">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Rohan</p>
                  <p className="text-sm text-gray-600">Beginner Trader</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="testimonial-card p-8 rounded-xl shadow-md">
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Feels just like real trading, but risk-free. I've tested strategies I would never try with real money. Brilliant!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-green-light flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary-green">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Ananya</p>
                  <p className="text-sm text-gray-600">Student Investor</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="testimonial-card p-8 rounded-xl shadow-md">
              <p className="text-gray-700 mb-6 leading-relaxed">
                "NexBid gave me the exact tools I needed to build my trading confidence without losing my hard-earned savings."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-green-light flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary-green">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Rahul</p>
                  <p className="text-sm text-gray-600">Aspiring Trader</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <CtaBanner />
    </>
  );
}