import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaChartBar, FaBoxes, FaTruck, FaEnvelope, 
  FaUser, FaCog, FaSignOutAlt, FaPlus, FaEdit, FaSearch 
} from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import { motion } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';

export default function FournisseurDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: ''
  });
  const [userName, setUserName] = useState('');

  // Get user name from token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token); 
        setUserName(decoded.prenom || 'Fournisseur'); // Fallback to 'Fournisseur' if name not available
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  // Supplier-specific chart data
  const stockData = {
    labels: ['Produit A', 'Produit B', 'Produit C', 'Produit D'],
    datasets: [
      {
        label: 'Stock disponible',
        data: [120, 80, 65, 90],
        backgroundColor: ['#4CAF50', '#FFC107', '#2196F3', '#F44336'],
      },
    ],
  };

  const ordersData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Commandes reçues',
        data: [15, 20, 18, 25, 22, 30],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
      },
    ],
  };

  const deliveryStatusData = {
    labels: ['Livrées', 'En préparation', 'Retard'],
    datasets: [
      {
        data: [75, 15, 10],
        backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
      },
    ],
  };

  const recentOrders = [
    { id: 'CMD-78945', products: 3, amount: 250, status: 'À expédier' },
    { id: 'CMD-78946', products: 5, amount: 420, status: 'En préparation' },
    { id: 'CMD-78947', products: 2, amount: 180, status: 'En attente' }
  ];

  const lowStockProducts = [
    { name: 'Chaise ergonomique', stock: 3 },
    { name: 'Bureau en verre', stock: 5 },
    { name: 'Lampe LED', stock: 2 }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleAddProduct = () => {
    // Implement product addition logic
    console.log('Adding product:', newProduct);
    setShowAddProductModal(false);
    setNewProduct({ name: '', price: '', stock: '', category: '' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen bg-gray-100"
    >
      {/* Sidebar - Supplier Specific */}
      <motion.aside 
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="w-64 bg-blue-900 text-white flex flex-col"
      >
        <div className="p-6 font-bold text-xl flex items-center gap-2 border-b border-blue-700">
          <div className="bg-white w-8 h-8 rounded-sm"></div>
          <span>Bonjour, {userName}</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-4">
          <Link 
            to="/fournisseur-dashboard" 
            className={`flex items-center gap-3 hover:text-blue-300 ${activeTab === 'dashboard' ? 'text-blue-300' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FaHome /> Tableau de bord
          </Link>
          <Link 
            to="/fournisseur-stats" 
            className={`flex items-center gap-3 hover:text-blue-300 ${activeTab === 'stats' ? 'text-blue-300' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <FaChartBar /> Mes statistiques
          </Link>
          <Link 
            to="/fournisseur-products" 
            className={`flex items-center gap-3 hover:text-blue-300 ${activeTab === 'products' ? 'text-blue-300' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <FaBoxes /> Mes produits
          </Link>
          <Link 
            to="/fournisseur-orders" 
            className={`flex items-center gap-3 hover:text-blue-300 ${activeTab === 'orders' ? 'text-blue-300' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FaTruck /> Commandes
          </Link>
          <Link 
            to="/fournisseur-messages" 
            className={`flex items-center gap-3 hover:text-blue-300 ${activeTab === 'messages' ? 'text-blue-300' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <FaEnvelope /> Messages
          </Link>
          <Link 
            to="/fournisseur-profile" 
            className={`flex items-center gap-3 hover:text-blue-300 ${activeTab === 'profile' ? 'text-blue-300' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> Mon profil
          </Link>
          <Link 
            to="/fournisseur-settings" 
            className={`flex items-center gap-3 hover:text-blue-300 ${activeTab === 'settings' ? 'text-blue-300' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog /> Paramètres
          </Link>
        </nav>
        
        <button 
          onClick={handleLogout}
          className="p-4 flex items-center gap-3 bg-blue-800 hover:bg-red-600 transition"
        >
          <FaSignOutAlt /> Déconnexion
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="flex justify-between items-center mb-6">
          <motion.h1 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-2xl font-bold"
          >
            Tableau de bord - {userName}
          </motion.h1>
          
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <input
                type="text"
                placeholder="Rechercher produits/commandes..."
                className="border border-gray-300 rounded-lg p-2 pl-10 w-64"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </motion.div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              <FaSignOutAlt /> Déconnexion
            </motion.button>
          </div>
        </header>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-lg shadow"
          >
            <h3 className="font-semibold mb-2">Commandes mensuelles</h3>
            <Line data={ordersData} />
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-lg shadow"
          >
            <h3 className="font-semibold mb-2">Statut des livraisons</h3>
            <Doughnut data={deliveryStatusData} />
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-lg shadow"
          >
            <h3 className="font-semibold mb-2">Stock disponible</h3>
            <Bar data={stockData} />
          </motion.div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 rounded-lg shadow"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold">Commandes récentes</h2>
              <button 
                onClick={() => navigate('/fournisseur-orders')}
                className="text-blue-600 text-sm hover:underline"
              >
                Voir toutes →
              </button>
            </div>
            
            <ul className="space-y-3">
              {recentOrders.map((order, index) => (
                <motion.li
                  key={order.id}
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                >
                  <div>
                    <span className="block font-medium">{order.id}</span>
                    <span className="text-sm text-gray-500">{order.products} produits · {order.amount}€</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    order.status === 'À expédier' ? 'bg-green-100 text-green-800' :
                    order.status === 'En préparation' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Low Stock Products */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 rounded-lg shadow"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold">Produits à réapprovisionner</h2>
              <button 
                onClick={() => setShowAddProductModal(true)}
                className="flex items-center gap-1 text-blue-600 text-sm hover:underline"
              >
                <FaPlus size={12} /> Ajouter
              </button>
            </div>
            
            <ul className="space-y-3">
              {lowStockProducts.map((product, index) => (
                <motion.li
                  key={product.name}
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                >
                  <div>
                    <span className="block font-medium">{product.name}</span>
                    <span className="text-sm text-gray-500">Stock: {product.stock} unités</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                      onClick={() => navigate(`/fournisseur-products/edit/${product.name}`)}
                    >
                      <FaEdit size={10} />
                    </button>
                    <button className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200">
                      Commander
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Add Product Modal */}
        {showAddProductModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white p-6 rounded-lg w-full max-w-md"
            >
              <h3 className="font-bold text-lg mb-4">Ajouter un nouveau produit</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded p-2"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded p-2"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock initial</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded p-2"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    className="w-full border border-gray-300 rounded p-2"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="meuble">Meuble</option>
                    <option value="decoration">Décoration</option>
                    <option value="electromenager">Électroménager</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Ajouter le produit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
}