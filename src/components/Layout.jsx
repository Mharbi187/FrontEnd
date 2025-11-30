import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Check if current page is a dashboard
  const isDashboard = 
    location.pathname.startsWith('/admin-dashboard') ||
    location.pathname.startsWith('/client-dashboard') ||
    location.pathname.startsWith('/fournisseur-dashboard');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Add padding-top to account for fixed navbar (only for non-dashboard pages) */}
      <main className={`flex-grow ${!isDashboard ? 'pt-16 lg:pt-20' : ''}`}>
        {children}
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
};

export default Layout;
