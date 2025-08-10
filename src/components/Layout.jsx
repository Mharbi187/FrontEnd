import React from 'react';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  // Hide footer for login/register/dashboard
  const hideFooter =
    ['/login', '/register'].includes(location.pathname) ||
    location.pathname.startsWith('/admin-dashboard') ||
    location.pathname.startsWith('/client-dashboard') ||
    location.pathname.startsWith('/fournisseur-dashboard');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      {!hideFooter && (
        <footer className="w-full bg-gray-800 text-white py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>© {new Date().getFullYear()} LIVRINI. Tous droits réservés.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
