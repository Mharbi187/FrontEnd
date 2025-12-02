// Enhanced Fournisseur Dashboard with Modern Design
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome, FaBoxOpen, FaTruck, FaChartLine, FaUsers, FaSignOutAlt,
  FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaBell, FaCog,
  FaWarehouse, FaClipboardList, FaMoneyBillWave, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import { FiMenu, FiX, FiPackage, FiTrendingUp, FiAlertTriangle, FiCheck, FiClock } from 'react-icons/fi';
import { Line, Doughnut, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';
import toast from 'react-hot-toast';
import NotificationPanel from '../components/NotificationPanel';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

export default function FournisseurDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [userName, setUserName] = useState('Fournisseur');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    nom: '', description: '', prix: '', quantite: '', categorie: ''
  });

  // Check auth and decode token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName((decoded.name || 'Fournisseur').toUpperCase());
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (error) {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/produits'),
          api.get('/categories')
        ]);
        
        setProducts(productsRes.data?.data || productsRes.data || []);
        setCategories(categoriesRes.data?.data || categoriesRes.data || []);
        
        // Try fetching orders/deliveries
        try {
          const ordersRes = await api.get('/commandes');
          setOrders(ordersRes.data?.data || ordersRes.data || []);
        } catch (e) { console.log('No orders access'); }
        
        try {
          const deliveriesRes = await api.get('/livraisons');
          setDeliveries(deliveriesRes.data?.data || deliveriesRes.data || []);
        } catch (e) { console.log('No deliveries access'); }
        
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

  // Product CRUD
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/produits/${editingProduct._id}`, productForm);
        toast.success('Produit mis à jour');
      } else {
        await api.post('/produits', productForm);
        toast.success('Produit créé');
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({ nom: '', description: '', prix: '', quantite: '', categorie: '' });
      
      // Refresh products
      const res = await api.get('/produits');
      setProducts(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Erreur: ' + (error.response?.data?.message || 'Opération échouée'));
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Supprimer ce produit?')) {
      try {
        await api.delete(`/produits/${id}`);
        toast.success('Produit supprimé');
        setProducts(products.filter(p => p._id !== id));
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      nom: product.nom || '',
      description: product.description || '',
      prix: product.prix || '',
      quantite: product.quantite || product.stock || '',
      categorie: product.categorie?._id || product.categorie || ''
    });
    setShowProductModal(true);
  };

  // Stats calculations
  const stats = {
    totalProducts: products.length,
    lowStock: products.filter(p => (p.quantite || p.stock || 0) < 10).length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.total || o.montant || 0), 0),
    pendingOrders: orders.filter(o => !(o.statutCommande || '').toLowerCase().includes('livr')).length
  };

  // Chart data
  const salesData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
    datasets: [{
      label: 'Ventes (TND)',
      data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const inventoryData = {
    labels: ['En stock', 'Stock faible', 'Rupture'],
    datasets: [{
      data: [
        products.filter(p => (p.quantite || p.stock || 0) >= 10).length || 20,
        products.filter(p => (p.quantite || p.stock || 0) > 0 && (p.quantite || p.stock || 0) < 10).length || 5,
        products.filter(p => (p.quantite || p.stock || 0) === 0).length || 2
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0
    }]
  };

  const orderStatusData = {
    labels: ['Livrées', 'En cours', 'En attente', 'Annulées'],
    datasets: [{
      data: [45, 20, 10, 5],
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
      borderWidth: 0
    }]
  };

  const categoryRevenueData = {
    labels: categories.slice(0, 5).map(c => c.nom || c.name) || ['Cat 1', 'Cat 2', 'Cat 3', 'Cat 4', 'Cat 5'],
    datasets: [{
      label: 'Revenus par catégorie',
      data: [15000, 12000, 8000, 6000, 4000],
      backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'],
      borderRadius: 8
    }]
  };

  // Sidebar menu
  const menuItems = [
    { id: 'overview', label: 'Tableau de bord', icon: <FaHome /> },
    { id: 'products', label: 'Mes Produits', icon: <FaBoxOpen />, badge: products.length },
    { id: 'inventory', label: 'Inventaire', icon: <FaWarehouse /> },
    { id: 'orders', label: 'Commandes', icon: <FaClipboardList />, badge: stats.pendingOrders },
    { id: 'deliveries', label: 'Livraisons', icon: <FaTruck /> },
    { id: 'analytics', label: 'Analytique', icon: <FaChartLine /> },
    { id: 'settings', label: 'Paramètres', icon: <FaCog /> },
  ];

  // Filter products
  const filteredProducts = products.filter(p =>
    (p.nom || p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-gradient-to-b from-indigo-900 via-indigo-800 to-purple-900 text-white flex flex-col shadow-2xl z-20"
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-lg">
              <FaWarehouse className="text-xl" />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <span className="text-xl font-bold">LIVRINI</span>
                  <p className="text-xs text-white/60">Espace Fournisseur</p>
                </motion.div>
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg font-bold">
                  {userName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{userName}</p>
                  <p className="text-xs text-white/70">Fournisseur Vérifié ✓</p>
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
              onClick={() => setActiveSection(item.id)}
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
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-medium">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              {item.badge > 0 && sidebarOpen && (
                <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </motion.button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
          >
            <FaUsers className="text-xl" />
            <AnimatePresence>
              {sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Mon Profil</motion.span>}
            </AnimatePresence>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all"
          >
            <FaSignOutAlt className="text-xl" />
            <AnimatePresence>
              {sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Déconnexion</motion.span>}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Bienvenue, {userName}!</h1>
              <p className="text-sm text-gray-500">Gérez votre activité fournisseur</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <NotificationPanel userRole="fournisseur" />

            <button
              onClick={() => { setEditingProduct(null); setProductForm({ nom: '', description: '', prix: '', quantite: '', categorie: '' }); setShowProductModal(true); }}
              className="btn-primary flex items-center gap-2"
            >
              <FaPlus /> Nouveau Produit
            </button>
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
                    <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Total Produits</p>
                          <h3 className="text-3xl font-bold mt-1">{stats.totalProducts}</h3>
                          <p className="text-xs text-blue-200 mt-1 flex items-center gap-1">
                            <FaArrowUp /> +12% ce mois
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <FaBoxOpen className="text-2xl" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-100 text-sm">Revenus</p>
                          <h3 className="text-3xl font-bold mt-1">{stats.totalRevenue} TND</h3>
                          <p className="text-xs text-emerald-200 mt-1 flex items-center gap-1">
                            <FaArrowUp /> +8% ce mois
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <FaMoneyBillWave className="text-2xl" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-amber-100 text-sm">Commandes</p>
                          <h3 className="text-3xl font-bold mt-1">{stats.totalOrders}</h3>
                          <p className="text-xs text-amber-200 mt-1">{stats.pendingOrders} en attente</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <FaClipboardList className="text-2xl" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg shadow-red-500/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-100 text-sm">Stock Faible</p>
                          <h3 className="text-3xl font-bold mt-1">{stats.lowStock}</h3>
                          <p className="text-xs text-red-200 mt-1 flex items-center gap-1">
                            <FiAlertTriangle /> À réapprovisionner
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <FaWarehouse className="text-2xl" />
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-4">Évolution des Ventes</h3>
                      <Line data={salesData} options={{ responsive: true, maintainAspectRatio: true }} />
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-4">Revenus par Catégorie</h3>
                      <Bar data={categoryRevenueData} options={{ responsive: true, maintainAspectRatio: true }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-4">État du Stock</h3>
                      <Doughnut data={inventoryData} options={{ responsive: true, maintainAspectRatio: true }} />
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-4">Statut Commandes</h3>
                      <Pie data={orderStatusData} options={{ responsive: true, maintainAspectRatio: true }} />
                    </div>
                    
                    {/* Recent Activity */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-4">Activité Récente</h3>
                      <div className="space-y-3">
                        {[
                          { text: 'Nouveau commande reçue', time: 'Il y a 5 min', icon: <FiPackage className="text-blue-500" /> },
                          { text: 'Stock mis à jour', time: 'Il y a 1h', icon: <FiCheck className="text-emerald-500" /> },
                          { text: 'Livraison expédiée', time: 'Il y a 2h', icon: <FaTruck className="text-amber-500" /> },
                          { text: 'Produit ajouté', time: 'Il y a 5h', icon: <FaPlus className="text-purple-500" /> },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              {item.icon}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{item.text}</p>
                              <p className="text-xs text-gray-500">{item.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Section */}
              {activeSection === 'products' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Mes Produits</h2>
                      <p className="text-gray-500">{filteredProducts.length} produits trouvés</p>
                    </div>
                    <button
                      onClick={() => { setEditingProduct(null); setProductForm({ nom: '', description: '', prix: '', quantite: '', categorie: '' }); setShowProductModal(true); }}
                      className="btn-primary flex items-center gap-2"
                    >
                      <FaPlus /> Ajouter un produit
                    </button>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product, idx) => (
                      <motion.div
                        key={product._id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all"
                      >
                        <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          {product.image ? (
                            <img src={product.image} alt={product.nom} className="w-full h-full object-cover" />
                          ) : (
                            <FaBoxOpen className="text-5xl text-white/50" />
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-gray-900 truncate">{product.nom || product.name}</h4>
                          <p className="text-sm text-gray-500 truncate">{product.description || 'Aucune description'}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xl font-bold text-indigo-600">{product.prix} TND</span>
                            <span className={`text-sm px-2 py-1 rounded-full ${
                              (product.quantite || product.stock || 0) > 10
                                ? 'bg-emerald-100 text-emerald-700'
                                : (product.quantite || product.stock || 0) > 0
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              Stock: {product.quantite || product.stock || 0}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => openEditModal(product)}
                              className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1"
                            >
                              <FaEdit /> Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="btn-danger text-sm py-2 px-3"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                      <FaBoxOpen className="text-6xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900">Aucun produit</h3>
                      <p className="text-gray-500 mb-6">Commencez par ajouter votre premier produit</p>
                      <button onClick={() => setShowProductModal(true)} className="btn-primary">
                        <FaPlus className="inline mr-2" /> Ajouter un produit
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Inventory Section */}
              {activeSection === 'inventory' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Gestion d'Inventaire</h2>
                  
                  {/* Low Stock Alerts */}
                  {stats.lowStock > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <FiAlertTriangle className="text-amber-500 text-xl" />
                        <h3 className="font-bold text-amber-800">Alertes Stock Faible ({stats.lowStock})</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.filter(p => (p.quantite || p.stock || 0) < 10).map((product, idx) => (
                          <div key={idx} className="bg-white rounded-xl p-4 border border-amber-200">
                            <p className="font-medium text-gray-900">{product.nom || product.name}</p>
                            <p className="text-sm text-red-600">Stock: {product.quantite || product.stock || 0} unités</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inventory Table */}
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Produit</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Prix</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Stock</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Statut</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {products.map((product, idx) => {
                            const stock = product.quantite || product.stock || 0;
                            return (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                      <FaBoxOpen className="text-indigo-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{product.nom || product.name}</p>
                                      <p className="text-xs text-gray-500">{product.categorie?.nom || 'Non catégorisé'}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6 font-bold text-gray-900">{product.prix} TND</td>
                                <td className="py-4 px-6">{stock} unités</td>
                                <td className="py-4 px-6">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    stock > 10 ? 'bg-emerald-100 text-emerald-700' :
                                    stock > 0 ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {stock > 10 ? 'En stock' : stock > 0 ? 'Stock faible' : 'Rupture'}
                                  </span>
                                </td>
                                <td className="py-4 px-6">
                                  <button onClick={() => openEditModal(product)} className="text-indigo-600 hover:text-indigo-800">
                                    <FaEdit />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Section */}
              {activeSection === 'orders' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Commandes Reçues</h2>
                  
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    {orders.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {orders.map((order, idx) => (
                          <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                  <FiPackage className="text-white text-2xl" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900">Commande #{order._id?.slice(-8) || order.id}</h4>
                                  <p className="text-sm text-gray-500">
                                    Client: {order.client?.name || order.client?.nom || 'N/A'}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {new Date(order.dateCommande || order.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-gray-900">{order.total || order.montant || 0} TND</p>
                                <span className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full ${
                                  (order.statutCommande || '').toLowerCase().includes('livr')
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : (order.statutCommande || '').toLowerCase().includes('cours')
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {(order.statutCommande || '').toLowerCase().includes('livr') && <FiCheck />}
                                  {(order.statutCommande || '').toLowerCase().includes('cours') && <FiClock />}
                                  {order.statutCommande || 'En attente'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <FaClipboardList className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">Aucune commande</h3>
                        <p className="text-gray-500">Vous n'avez pas encore reçu de commandes</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Deliveries Section */}
              {activeSection === 'deliveries' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Livraisons</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {deliveries.length > 0 ? deliveries.map((delivery, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                              <FaTruck className="text-white text-xl" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">#{delivery._id?.slice(-6) || idx}</h4>
                              <p className="text-sm text-gray-500">{delivery.adresseLivraison || 'Adresse'}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            (delivery.statutLivraison || '').toLowerCase().includes('livr')
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {delivery.statutLivraison || 'En transit'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Expédié: {new Date(delivery.dateExpedition || delivery.createdAt).toLocaleDateString()}
                        </div>
                      </motion.div>
                    )) : (
                      <div className="col-span-2 text-center py-16 bg-white rounded-2xl shadow-lg">
                        <FaTruck className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">Aucune livraison</h3>
                        <p className="text-gray-500">Pas de livraison en cours</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Analytics Section */}
              {activeSection === 'analytics' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Analytique</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-4">Performance des Ventes</h3>
                      <Line data={salesData} options={{ responsive: true }} />
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-4">Distribution par Catégorie</h3>
                      <Bar data={categoryRevenueData} options={{ responsive: true }} />
                    </div>
                  </div>
                  
                  {/* KPIs */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Taux conversion', value: '3.2%', change: '+0.5%', positive: true },
                      { label: 'Panier moyen', value: '156 TND', change: '+12 TND', positive: true },
                      { label: 'Retours', value: '2.1%', change: '-0.3%', positive: true },
                      { label: 'Satisfaction', value: '4.8/5', change: '+0.2', positive: true },
                    ].map((kpi, idx) => (
                      <div key={idx} className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                        <p className="text-sm text-gray-500">{kpi.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                        <p className={`text-xs flex items-center gap-1 ${kpi.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                          {kpi.positive ? <FaArrowUp /> : <FaArrowDown />} {kpi.change}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings Section */}
              {activeSection === 'settings' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
                  
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Paramètres du compte</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">Notifications par email</p>
                          <p className="text-sm text-gray-500">Recevoir des notifications pour les nouvelles commandes</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">Alertes de stock</p>
                          <p className="text-sm text-gray-500">Être notifié quand le stock est faible</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {showProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProductModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </h3>
              
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                  <input
                    type="text"
                    value={productForm.nom}
                    onChange={(e) => setProductForm({ ...productForm, nom: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="input-field"
                    rows="3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix (TND)</label>
                    <input
                      type="number"
                      value={productForm.prix}
                      onChange={(e) => setProductForm({ ...productForm, prix: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                    <input
                      type="number"
                      value={productForm.quantite}
                      onChange={(e) => setProductForm({ ...productForm, quantite: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    value={productForm.categorie}
                    onChange={(e) => setProductForm({ ...productForm, categorie: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.nom || cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 btn-secondary">
                    Annuler
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    {editingProduct ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
