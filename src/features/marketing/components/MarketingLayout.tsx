import { Outlet, ScrollRestoration } from 'react-router-dom';
import Header from './Navbar';
import Footer from './Footer';

export default function MarketingLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollRestoration />
      
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
