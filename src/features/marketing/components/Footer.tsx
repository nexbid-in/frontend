export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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
  );
}
