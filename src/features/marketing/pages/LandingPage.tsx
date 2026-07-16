import { Link } from 'react-router-dom';

import heroIllustration from '../assets/landing/hero-illustration.png';
import marketingRoiImg from '../assets/landing/marketing-roi.jpg';
import communityPreviewImg from '../assets/landing/community-preview.png';
import ctaImg from '../assets/cta-img.png';

export default function LandingPage() {
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl font-extrabold text-text-primary tracking-tight leading-tight">
                Your Gateway to <span className="text-primary-green">Confident</span> Trading.
              </h1>
              <p className="mt-6 text-xl text-text-secondary max-w-lg mx-auto lg:mx-0">
                Practice trading with live market data. Build strategies, test ideas, and level up your investing game.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/signup" className="px-8 py-3 text-lg font-semibold text-white bg-primary-green hover:bg-primary-green-hover rounded-lg shadow-lg transition duration-300 transform hover:scale-105 text-center">
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