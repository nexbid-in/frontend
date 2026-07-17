import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    `uppercase text-sm font-semibold transition duration-150 hover:text-primary-green ${
      isActive ? 'text-primary-green' : 'text-gray-500'
    }`;

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
            <NavLink to="/about" className={getNavLinkClass}>WHO WE ARE?</NavLink>
            
            <a href="#news" className="uppercase text-sm font-semibold text-gray-500 hover:text-primary-green transition duration-150">
              NEWS
            </a>
            
            <NavLink to="/products" className={getNavLinkClass}>PRODUCTS</NavLink>
            <NavLink to="/pricing" className={getNavLinkClass}>PRICING</NavLink>
            <NavLink to="/support" className={getNavLinkClass}>SUPPORT</NavLink>
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
