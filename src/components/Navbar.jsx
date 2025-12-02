import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSignOutAlt, 
  FaUser, 
  FaShoppingCart, 
  FaBars, 
  FaTimes,
  FaHome,
  FaBoxOpen,
  FaTachometerAlt,
  FaServicestack
} from 'react-icons/fa';

const Navbar = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  
  let isLoggedIn = false;
  let userRole = '';
  let userName = '';

  // Update cart count from localStorage
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    setCartCount(totalItems);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for cart updates
  useEffect(() => {
    updateCartCount(); // Initial load
    
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('storage', updateCartCount);
    
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  try {
    if (token) {
      const decoded = jwtDecode(token);
      isLoggedIn = true;
      userRole = decoded.role || '';
      userName = decoded.name || '';
    }
  } catch (error) {
    // Invalid token - clear it
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getDashboardPath = () => {
    switch (userRole.toLowerCase()) {
      case 'admin': return '/admin-dashboard';
      case 'fournisseur': return '/fournisseur-dashboard';
      case 'client': return '/client-dashboard';
      default: return '/';
    }
  };

  // Hide navbar only for dashboard pages
  if (
    location.pathname.startsWith('/admin-dashboard') ||
    location.pathname.startsWith('/client-dashboard') ||
    location.pathname.startsWith('/fournisseur-dashboard')
  ) {
    return null;
  }

  const navLinks = [
    { to: '/', label: 'Accueil', icon: <FaHome /> },
    { to: '/services', label: 'Services', icon: <FaServicestack /> },
    { to: '/products', label: 'Produits', icon: <FaBoxOpen /> },
  ];

  // Guest Navigation
  if (!isLoggedIn) {
    return (
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100' 
            : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <motion.div 
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
            >
              <Link to="/" className={`text-2xl lg:text-3xl font-bold ${
                isScrolled ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600' : 'text-white'
              }`}>
                LIVRINI
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <motion.div key={link.to} whileHover={{ scale: 1.05 }}>
                  <Link 
                    to={link.to} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      isScrolled 
                        ? 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600' 
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    } ${location.pathname === link.to ? (isScrolled ? 'bg-emerald-50 text-emerald-600' : 'bg-white/20 text-white') : ''}`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              <div className="flex items-center space-x-3 ml-6">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/login" 
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                      isScrolled 
                        ? 'text-emerald-600 border-2 border-emerald-600 hover:bg-emerald-600 hover:text-white' 
                        : 'text-emerald-600 bg-white hover:bg-gray-100'
                    }`}
                  >
                    Se Connecter
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/register" 
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg ${
                      isScrolled 
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-xl' 
                        : 'bg-white/20 text-white border-2 border-white/50 hover:bg-white/30'
                    }`}
                  >
                    S'inscrire
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Mobile menu button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg ${isScrolled ? 'text-gray-700' : 'text-white'}`}
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t shadow-xl"
            >
              <div className="px-4 py-6 space-y-3">
                {navLinks.map((link) => (
                  <Link 
                    key={link.to}
                    to={link.to} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 font-medium"
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 space-y-3 border-t">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-xl text-emerald-600 border-2 border-emerald-600 font-semibold"
                  >
                    Se Connecter
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold"
                  >
                    S'inscrire
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    );
  }

  // Logged-in Navigation
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100' 
          : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo & Welcome */}
          <div className="flex items-center gap-6">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link to="/" className={`text-2xl lg:text-3xl font-bold ${
                isScrolled ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600' : 'text-white'
              }`}>
                LIVRINI
              </Link>
            </motion.div>
            <span className={`hidden lg:block text-sm font-medium ${
              isScrolled ? 'text-gray-600' : 'text-white/80'
            }`}>
              Bonjour, <span className="font-bold">{userName}</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <motion.div key={link.to} whileHover={{ scale: 1.05 }}>
                <Link 
                  to={link.to} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    isScrolled 
                      ? 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600' 
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              </motion.div>
            ))}
            
            <div className="flex items-center space-x-3 ml-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/cart" 
                  className={`relative p-2.5 rounded-xl transition-all ${
                    isScrolled ? 'bg-gray-100 text-gray-700 hover:bg-emerald-100' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <FaShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to={getDashboardPath()}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                    isScrolled 
                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <FaTachometerAlt />
                  Dashboard
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/profile"
                  className={`p-2.5 rounded-xl transition-all ${
                    isScrolled ? 'bg-gray-100 text-gray-700 hover:bg-emerald-100' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <FaUser size={18} />
                </Link>
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                  isScrolled 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'bg-red-500/80 text-white hover:bg-red-500'
                }`}
              >
                <FaSignOutAlt />
                <span className="hidden lg:inline">Déconnexion</span>
              </motion.button>
            </div>
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg ${isScrolled ? 'text-gray-700' : 'text-white'}`}
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t shadow-xl"
          >
            <div className="px-4 py-6 space-y-3">
              <div className="pb-4 border-b">
                <p className="text-gray-600">Bonjour, <span className="font-bold text-gray-900">{userName}</span></p>
              </div>
              {navLinks.map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 font-medium"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              <Link 
                to="/cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-emerald-50 font-medium"
              >
                <FaShoppingCart />
                Panier {cartCount > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">{cartCount}</span>}
              </Link>
              <Link 
                to={getDashboardPath()}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-600 bg-emerald-50 font-medium"
              >
                <FaTachometerAlt />
                Mon Dashboard
              </Link>
              <Link 
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-emerald-50 font-medium"
              >
                <FaUser />
                Mon Profil
              </Link>
              <button
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 bg-red-50 font-medium"
              >
                <FaSignOutAlt />
                Déconnexion
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
