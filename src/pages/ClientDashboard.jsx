// Enhanced Client Dashboard with Modern Design
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, FaSearch, FaShoppingCart, FaBoxOpen, FaTruck, 
  FaUser, FaSignOutAlt, FaHeart, FaBell, FaCreditCard,
  FaHistory, FaStar, FaGift, FaHeadset
} from 'react-icons/fa';
import { 
  FiMenu, FiX, FiChevronRight, FiPackage, FiClock,
  FiCheckCircle, FiTruck, FiMapPin, FiCalendar
} from 'react-icons/fi';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';
import toast from 'react-hot-toast';
import NotificationPanel from '../components/NotificationPanel';

// Register Chart.js
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [userName, setUserName] = useState('Client');
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistItems, setWishlistItems] = useState([]);

  // Update cart count from localStorage
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    setCartCount(totalItems);
  };

  // Update wishlist from localStorage
  const updateWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlistItems(wishlist);
    setWishlistCount(wishlist.length);
  };

  // Remove item from wishlist
  const removeFromWishlist = (productId) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const updatedWishlist = wishlist.filter(item => item._id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    setWishlistItems(updatedWishlist);
    setWishlistCount(updatedWishlist.length);
    window.dispatchEvent(new Event('wishlistUpdated'));
    toast.success('Retiré des favoris');
  };

  // Add to cart from wishlist
  const addToCartFromWishlist = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item._id === product._id);
    
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success(`${product.nom} ajouté au panier!`);
  };

  // Listen for cart and wishlist updates
  useEffect(() => {
    updateCartCount();
    updateWishlist();
    
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('wishlistUpdated', updateWishlist);
    window.addEventListener('storage', () => {
      updateCartCount();
      updateWishlist();
    });
    
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('wishlistUpdated', updateWishlist);
      window.removeEventListener('storage', () => {
        updateCartCount();
        updateWishlist();
      });
    };
  }, []);

  // Decode token for user info
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName((decoded.name || 'Client').toUpperCase());
        
        // Check token expiry
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch orders and deliveries
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersRes, deliveriesRes] = await Promise.all([
          api.get('/commandes/mes-commandes'),
          api.get('/livraisons/mes-livraisons')
        ]);
        
        const ordersData = ordersRes.data?.data || ordersRes.data || [];
        const deliveriesData = deliveriesRes.data?.data || deliveriesRes.data || [];
        
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setDeliveries(Array.isArray(deliveriesData) ? deliveriesData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Déconnexion réussie');
    navigate('/');
  };

  // Chart data
  const orderHistoryData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [{
      label: 'Mes Commandes',
      data: [2, 3, 5, 1, 4, 2],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const orderStatusData = {
    labels: ['Livrées', 'En cours', 'En attente'],
    datasets: [{
      data: [
        orders.filter(o => (o.status || o.statut || '').toLowerCase().includes('livr')).length || 10,
        orders.filter(o => (o.status || o.statut || '').toLowerCase().includes('cours')).length || 3,
        orders.filter(o => (o.status || o.statut || '').toLowerCase().includes('attente')).length || 1
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#6366f1'],
      borderWidth: 0
    }]
  };

  const spendingData = {
    labels: ['Électronique', 'Vêtements', 'Alimentation', 'Maison', 'Autre'],
    datasets: [{
      label: 'Dépenses par catégorie (TND)',
      data: [450, 320, 180, 290, 150],
      backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'],
      borderRadius: 8
    }]
  };

  // Sidebar menu items
  const menuItems = [
    { id: 'overview', label: 'Tableau de bord', icon: <FaHome /> },
    { id: 'orders', label: 'Mes commandes', icon: <FaBoxOpen /> },
    { id: 'deliveries', label: 'Mes livraisons', icon: <FaTruck /> },
    { id: 'cart', label: 'Mon panier', icon: <FaShoppingCart />, badge: cartCount },
    { id: 'wishlist', label: 'Favoris', icon: <FaHeart />, badge: wishlistCount },
    { id: 'history', label: 'Historique', icon: <FaHistory /> },
    { id: 'support', label: 'Support', icon: <FaHeadset /> },
    { id: 'profile', label: 'Mon profil', icon: <FaUser /> },
  ];

  // Stats
  const stats = {
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, o) => sum + (o.total || o.montant || 0), 0),
    pendingDeliveries: deliveries.filter(d => !(d.statutLivraison || '').toLowerCase().includes('livr')).length,
    loyaltyPoints: 1250
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-gradient-to-b from-emerald-800 via-emerald-700 to-teal-800 text-white flex flex-col shadow-2xl z-20"
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-lg">
              <FaShoppingCart className="text-xl" />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xl font-bold"
                >
                  LIVRINI
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* User Info */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 border-b border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                  {userName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{userName}</p>
                  <p className="text-xs text-white/70">Client Premium</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (item.id === 'profile') navigate('/profile');
                else if (item.id === 'cart') navigate('/cart');
                else setActiveSection(item.id);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                activeSection === item.id
                  ? 'bg-white/20 shadow-lg'
                  : 'hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              {item.badge > 0 && sidebarOpen && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </motion.button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all"
          >
            <FaSignOutAlt className="text-xl" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Déconnexion
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              Bonjour, {userName}! 👋
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des produits..."
                className="pl-10 pr-4 py-2 w-64 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Notifications */}
            <NotificationPanel userRole="client" />

            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-xl">
              <FaShoppingCart size={20} className="text-gray-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Overview Section */}
              {activeSection === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Total Commandes</p>
                          <h3 className="text-3xl font-bold mt-1">{stats.totalOrders}</h3>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <FaBoxOpen className="text-2xl" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-100 text-sm">Total Dépensé</p>
                          <h3 className="text-3xl font-bold mt-1">{stats.totalSpent} TND</h3>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <FaCreditCard className="text-2xl" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-amber-100 text-sm">En Livraison</p>
                          <h3 className="text-3xl font-bold mt-1">{stats.pendingDeliveries}</h3>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <FaTruck className="text-2xl" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Points Fidélité</p>
                          <h3 className="text-3xl font-bold mt-1">{stats.loyaltyPoints}</h3>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <FaGift className="text-2xl" />
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-4">Historique des Commandes</h3>
                      <Line data={orderHistoryData} options={{ responsive: true, maintainAspectRatio: true }} />
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-4">Statut des Commandes</h3>
                      <Doughnut data={orderStatusData} options={{ responsive: true, maintainAspectRatio: true }} />
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-4">Dépenses par Catégorie</h3>
                      <Bar data={spendingData} options={{ responsive: true, maintainAspectRatio: true }} />
                    </div>
                  </div>

                  {/* Quick Actions & Recent Orders */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Commandes Récentes</h3>
                        <button
                          onClick={() => setActiveSection('orders')}
                          className="text-emerald-600 text-sm hover:underline flex items-center gap-1"
                        >
                          Voir tout <FiChevronRight />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {orders.slice(0, 4).map((order, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <FiPackage className="text-emerald-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">#{order._id?.slice(-6) || order.id}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(order.dateCommande || order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">{order.total || order.montant || 0} TND</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                (order.statutCommande || order.status || '').toLowerCase().includes('livr')
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {order.statutCommande || order.status || 'En cours'}
                              </span>
                            </div>
                          </div>
                        ))}
                        {orders.length === 0 && (
                          <p className="text-center text-gray-500 py-8">Aucune commande</p>
                        )}
                      </div>
                    </div>

                    {/* Delivery Tracking */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Suivi des Livraisons</h3>
                        <button
                          onClick={() => setActiveSection('deliveries')}
                          className="text-emerald-600 text-sm hover:underline flex items-center gap-1"
                        >
                          Voir tout <FiChevronRight />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {deliveries.slice(0, 3).map((delivery, idx) => (
                          <div key={idx} className="p-4 border border-gray-200 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Livraison #{delivery._id?.slice(-6) || idx}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                (delivery.statutLivraison || '').toLowerCase().includes('livr')
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {delivery.statutLivraison || 'En transit'}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 gap-4">
                              <span className="flex items-center gap-1">
                                <FiMapPin size={14} /> {delivery.adresseLivraison || 'Adresse'}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiCalendar size={14} /> {new Date(delivery.dateExpedition || delivery.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                        {deliveries.length === 0 && (
                          <p className="text-center text-gray-500 py-8">Aucune livraison en cours</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/products" className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all group">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FaSearch className="text-blue-600 text-xl" />
                      </div>
                      <h4 className="font-bold text-gray-900">Parcourir</h4>
                      <p className="text-sm text-gray-500">Explorer les produits</p>
                    </Link>

                    <Link to="/orders" className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all group">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FaBoxOpen className="text-emerald-600 text-xl" />
                      </div>
                      <h4 className="font-bold text-gray-900">Mes Commandes</h4>
                      <p className="text-sm text-gray-500">Voir l'historique</p>
                    </Link>

                    <Link to="/deliveries" className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all group">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FaTruck className="text-amber-600 text-xl" />
                      </div>
                      <h4 className="font-bold text-gray-900">Livraisons</h4>
                      <p className="text-sm text-gray-500">Suivre mes colis</p>
                    </Link>

                    <Link to="/profile" className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all group">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FaUser className="text-purple-600 text-xl" />
                      </div>
                      <h4 className="font-bold text-gray-900">Mon Profil</h4>
                      <p className="text-sm text-gray-500">Gérer mon compte</p>
                    </Link>
                  </div>
                </div>
              )}

              {/* Orders Section */}
              {activeSection === 'orders' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Mes Commandes</h2>
                      <p className="text-gray-500">{orders.length} commandes au total</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    {orders.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {orders.map((order, idx) => (
                          <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                  <FiPackage className="text-white text-2xl" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900">Commande #{order._id?.slice(-8) || order.id}</h4>
                                  <p className="text-sm text-gray-500">
                                    {new Date(order.dateCommande || order.createdAt).toLocaleDateString('fr-FR', {
                                      day: 'numeric', month: 'long', year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-gray-900">{order.total || order.montant || 0} TND</p>
                                <span className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full ${
                                  (order.statutCommande || order.status || '').toLowerCase().includes('livr')
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : (order.statutCommande || order.status || '').toLowerCase().includes('cours')
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {(order.statutCommande || order.status || '').toLowerCase().includes('livr') && <FiCheckCircle />}
                                  {(order.statutCommande || order.status || '').toLowerCase().includes('cours') && <FiTruck />}
                                  {order.statutCommande || order.status || 'En attente'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <FaBoxOpen className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">Aucune commande</h3>
                        <p className="text-gray-500 mb-6">Vous n'avez pas encore passé de commande</p>
                        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                          <FaSearch /> Parcourir les produits
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Deliveries Section */}
              {activeSection === 'deliveries' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Mes Livraisons</h2>
                      <p className="text-gray-500">Suivez vos colis en temps réel</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {deliveries.length > 0 ? deliveries.map((delivery, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => navigate(`/track-delivery/${delivery._id}`)}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 cursor-pointer hover:shadow-xl hover:border-emerald-200 transition-all"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                              <FiTruck className="text-white text-2xl" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">Livraison #{delivery._id?.slice(-8) || idx}</h4>
                              <p className="text-sm text-gray-500 flex items-center gap-2">
                                <FiMapPin size={14} /> 
                                {typeof delivery.adresseLivraison === 'object' 
                                  ? [delivery.adresseLivraison.rue, delivery.adresseLivraison.ville].filter(Boolean).join(', ') || 'Adresse non spécifiée'
                                  : delivery.adresseLivraison || 'Adresse non spécifiée'}
                              </p>
                            </div>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                            (delivery.statutLivraison || '').toLowerCase().includes('livr')
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {delivery.statutLivraison || 'En transit'}
                          </span>
                        </div>

                        {/* Timeline */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2 text-sm">
                            <FiClock className="text-gray-400" />
                            <span className="text-gray-600">
                              Expédié le {new Date(delivery.dateExpedition || delivery.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {delivery.dateLivraisonPrevue && (
                            <div className="flex items-center gap-2 text-sm">
                              <FiCalendar className="text-emerald-500" />
                              <span className="text-emerald-600 font-medium">
                                Livraison prévue: {new Date(delivery.dateLivraisonPrevue).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Track Button */}
                        <div className="mt-4 flex justify-end">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/track-delivery/${delivery._id}`);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium text-sm hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center gap-2"
                          >
                            <FiMapPin size={16} />
                            Suivre sur la carte
                          </button>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                        <FaTruck className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">Aucune livraison</h3>
                        <p className="text-gray-500">Vous n'avez pas de livraison en cours</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Wishlist Section */}
              {activeSection === 'wishlist' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Mes Favoris</h2>
                      <p className="text-gray-500">{wishlistItems.length} produit(s) dans vos favoris</p>
                    </div>
                    {wishlistItems.length > 0 && (
                      <button
                        onClick={() => {
                          localStorage.setItem('wishlist', '[]');
                          setWishlistItems([]);
                          setWishlistCount(0);
                          window.dispatchEvent(new Event('wishlistUpdated'));
                          toast.success('Favoris vidés');
                        }}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Vider les favoris
                      </button>
                    )}
                  </div>
                  
                  {wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlistItems.map((item, idx) => (
                        <motion.div
                          key={item._id || idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all"
                        >
                          <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                            <img
                              src={item.imageURL || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&h=300&fit=crop'}
                              alt={item.nom}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&h=300&fit=crop';
                              }}
                            />
                            <button
                              onClick={() => removeFromWishlist(item._id)}
                              className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-lg"
                            >
                              <FaHeart />
                            </button>
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold text-gray-900 mb-1">{item.nom}</h4>
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-emerald-600">{item.prix} TND</span>
                              <button
                                onClick={() => addToCartFromWishlist(item)}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
                              >
                                <FaShoppingCart /> Ajouter
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                      <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900">Liste de favoris vide</h3>
                      <p className="text-gray-500 mb-6">Ajoutez des produits à vos favoris pour les retrouver facilement</p>
                      <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                        <FaSearch /> Parcourir les produits
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Support Section */}
              {activeSection === 'support' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Support Client</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                        <FaHeadset className="text-blue-600 text-2xl" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">Chat en Direct</h3>
                      <p className="text-gray-500 mb-4">Discutez avec notre équipe de support en temps réel</p>
                      <button className="btn-primary w-full">Démarrer le chat</button>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                        <FaStar className="text-emerald-600 text-2xl" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">FAQ</h3>
                      <p className="text-gray-500 mb-4">Trouvez des réponses aux questions fréquentes</p>
                      <button className="btn-secondary w-full">Voir la FAQ</button>
                    </div>
                  </div>
                </div>
              )}

              {/* History Section */}
              {activeSection === 'history' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Historique d'Activité</h2>
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="space-y-4">
                      {[
                        { action: 'Commande passée', date: '2024-01-15', icon: <FaBoxOpen className="text-blue-500" /> },
                        { action: 'Livraison reçue', date: '2024-01-10', icon: <FaTruck className="text-emerald-500" /> },
                        { action: 'Profil mis à jour', date: '2024-01-05', icon: <FaUser className="text-purple-500" /> },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.action}</p>
                            <p className="text-sm text-gray-500">{item.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
