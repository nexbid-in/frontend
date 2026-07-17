import heroIllustration from '../assets/support/hero-illustration.png';

export default function SupportPage() {
    return (
        <>
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
        </>
    );
}