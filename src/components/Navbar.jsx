import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const navigate = useNavigate();
  
  let isLoggedIn = false;
  let userRole = '';
  let userName = '';

  try {
    if (token) {
      const decoded = jwtDecode(token);
      isLoggedIn = true;
      userRole = decoded.role || '';
      userName = decoded.prenom || '';
    }
  } catch (error) {
    console.error('Error decoding token:', error);
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Don't show navbar on login/register pages
  if (
  ['/login', '/register'].includes(location.pathname) ||
  location.pathname.startsWith('/admin-dashboard') ||
  location.pathname.startsWith('/client-dashboard') ||
  location.pathname.startsWith('/fournisseur-dashboard')
) 
{
  return null;
}


  // Guest Navigation
  if (!isLoggedIn) {
    return (
      <nav className="w-full bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-white text-2xl font-bold">
                LIVRINI
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md">
                Accueil
              </Link>
              <Link to="/services" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md">
                Services
              </Link>
              <Link to="/products" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md">
                Produits
              </Link>
              <div className="flex space-x-2 ml-4">
                <Link to="/login" className="text-blue-600 bg-white hover:bg-gray-100 px-4 py-2 rounded-md">
                  Se Connecter
                </Link>
                <Link to="/register" className="text-white bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded-md shadow-sm">
                  S'inscrire
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Logged-in Navigation (simple top bar for dashboard layouts)
  return (
    <nav className="w-full bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <span className="text-white text-xl font-bold">Bonjour, {userName}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-white hover:bg-blue-700 px-4 py-2 rounded-md"
            >
              <FaSignOutAlt /> Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;