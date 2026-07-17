import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
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
  );
}
