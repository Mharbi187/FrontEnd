import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch, FaShoppingCart, FaBoxOpen, FaTruck, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import { jwtDecode } from 'jwt-decode';

export default function ClientDashboard() {
  // Get token from localStorage and decode it
  const token = localStorage.getItem('token');
  let username = 'Client'; // Default value
  
  if (token) {
    try {
      const decoded = jwtDecode(token);
      username = (decoded.name || 'Client').toUpperCase(); // Use 'name' from token which contains prenom
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Example chart data for order history
  const orderHistoryData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Mes Commandes',
        data: [2, 3, 5, 1, 4, 2],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        fill: true,
      },
    ],
  };

  const productCategoriesData = {
    labels: ['Électronique', 'Vêtements', 'Alimentation', 'Maison'],
    datasets: [
      {
        label: 'Achats par Catégorie',
        data: [4, 6, 3, 2],
        backgroundColor: ['#4CAF50', '#FFC107', '#2196F3', '#F44336'],
      },
    ],
  };

  const orderStatusData = {
    labels: ['Livrées', 'En cours', 'Annulées'],
    datasets: [
      {
        data: [10, 3, 1],
        backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
      },
    ],
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-2xl">
        <div className="p-6 font-bold text-xl flex items-center gap-2 border-b border-gray-700">
          <div className="bg-gradient-to-br from-green-400 to-green-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"></div>
          <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">LIVRINI</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-all hover:translate-x-1">
            <FaHome /> Acceuil
          </Link>
          <Link to="/products" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-all hover:translate-x-1">
            <FaSearch /> Rechercher produits
          </Link>
          <Link to="/cart" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-all hover:translate-x-1">
            <FaShoppingCart /> Mon panier
          </Link>
          <Link to="/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-all hover:translate-x-1">
            <FaBoxOpen /> Mes commandes
          </Link>
          <Link to="/deliveries" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-all hover:translate-x-1">
            <FaTruck /> Suivi livraison
          </Link>
          <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-all hover:translate-x-1">
            <FaUser /> Mon profil
          </Link>
        </nav>
        <button 
          onClick={handleLogout}
          className="m-4 p-4 flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all shadow-lg transform hover:scale-105"
        >
          <FaSignOutAlt /> Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">BONJOUR, {username}</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher des produits..."
              className="border border-gray-300 rounded-lg p-2 pl-10 w-64"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </header>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-xl border border-white/20 hover:shadow-2xl transition-all">
            <h3 className="font-bold mb-4 text-gray-800">Historique de commandes</h3>
            <Line data={orderHistoryData} />
          </div>
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-xl border border-white/20 hover:shadow-2xl transition-all">
            <h3 className="font-bold mb-4 text-gray-800">Statut des commandes</h3>
            <Doughnut data={orderStatusData} />
          </div>
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-xl border border-white/20 hover:shadow-2xl transition-all">
            <h3 className="font-bold mb-4 text-gray-800">Catégories préférées</h3>
            <Bar data={productCategoriesData} />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-xl border border-white/20 hover:shadow-2xl transition-all">
            <h2 className="font-bold mb-4 text-xl text-gray-800">Dernières commandes</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between items-center p-2 hover:bg-gray-50">
                <div>
                  <span className="font-medium">#CMD-78945</span>
                  <span className="block text-xs text-gray-500">2 produits | Total: 450 TND</span>
                </div>
                <span className="text-green-500 font-bold">Livrée</span>
              </li>
              <li className="flex justify-between items-center p-2 hover:bg-gray-50">
                <div>
                  <span className="font-medium">#CMD-78946</span>
                  <span className="block text-xs text-gray-500">1 produit | Total: 199 TND</span>
                </div>
                <span className="text-yellow-500 font-bold">En cours</span>
              </li>
              <li className="flex justify-between items-center p-2 hover:bg-gray-50">
                <div>
                  <span className="font-medium">#CMD-78947</span>
                  <span className="block text-xs text-gray-500">3 produits | Total: 620 TND</span>
                </div>
                <span className="text-blue-500 font-bold">Expédiée</span>
              </li>
            </ul>
            <Link to="/orders" className="text-green-500 text-sm mt-2 inline-block hover:underline">
              Voir toutes mes commandes →
            </Link>
          </div>
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-xl border border-white/20 hover:shadow-2xl transition-all">
            <h2 className="font-bold mb-4 text-xl text-gray-800">Suivi de livraison</h2>
            <ul className="space-y-3 text-sm">
              <li className="p-2 hover:bg-gray-50">
                <div className="flex justify-between">
                  <span className="font-medium">#CMD-78945</span>
                  <span className="text-green-500">Livré</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Livré le 15/06/2023 à votre domicile
                </div>
              </li>
              <li className="p-2 hover:bg-gray-50">
                <div className="flex justify-between">
                  <span className="font-medium">#CMD-78946</span>
                  <span className="text-yellow-500">En transit</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Dernière mise à jour: En route vers le centre de distribution
                </div>
              </li>
              <li className="p-2 hover:bg-gray-50">
                <div className="flex justify-between">
                  <span className="font-medium">#CMD-78944</span>
                  <span className="text-blue-500">Préparation</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Votre commande est en cours de préparation
                </div>
              </li>
            </ul>
            <Link to="/deliveries" className="text-green-500 text-sm mt-2 inline-block hover:underline">
              Voir tous les suivis →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};