import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaChartBar, FaWpforms, FaEnvelope, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';

export default function ClientDashboard() {
  // Example chart data
  const lineData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Commandes',
        data: [270, 200, 400, 350, 300, 450],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        fill: true,
      },
    ],
  };

  const barData = {
    labels: ['Produit A', 'Produit B', 'Produit C', 'Produit D'],
    datasets: [
      {
        label: 'Ventes',
        data: [50, 70, 30, 90],
        backgroundColor: ['#4CAF50', '#FFC107', '#2196F3', '#F44336'],
      },
    ],
  };

  const doughnutData = {
    labels: ['Livrées', 'En attente', 'Annulées'],
    datasets: [
      {
        data: [65, 25, 10],
        backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
      },
    ],
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 font-bold text-xl flex items-center gap-2 border-b border-gray-700">
          <div className="bg-green-500 w-8 h-8 rounded-sm"></div>
          <span>COMPANY LOGO</span>
        </div>
        <nav className="flex-1 p-4 space-y-4">
          <Link to="/dashboard" className="flex items-center gap-3 hover:text-green-400">
            <FaHome /> Dashboard
          </Link>
          <Link to="/charts" className="flex items-center gap-3 hover:text-green-400">
            <FaChartBar /> Statistiques
          </Link>
          <Link to="/orders" className="flex items-center gap-3 hover:text-green-400">
            <FaWpforms /> Commandes
          </Link>
          <Link to="/messages" className="flex items-center gap-3 hover:text-green-400">
            <FaEnvelope /> Messages
          </Link>
          <Link to="/profile" className="flex items-center gap-3 hover:text-green-400">
            <FaUser /> Profil
          </Link>
          <Link to="/settings" className="flex items-center gap-3 hover:text-green-400">
            <FaCog /> Paramètres
          </Link>
        </nav>
        <button className="p-4 flex items-center gap-3 bg-gray-800 hover:bg-red-600 transition">
          <FaSignOutAlt /> Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tableau de bord Client</h1>
          <input
            type="text"
            placeholder="Rechercher..."
            className="border border-gray-300 rounded-lg p-2 w-64"
          />
        </header>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <Line data={lineData} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <Doughnut data={doughnutData} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <Bar data={barData} />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-bold mb-2">Commandes récentes</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Commande #12345</span>
                <span className="text-green-500 font-bold">Livrée</span>
              </li>
              <li className="flex justify-between">
                <span>Commande #12346</span>
                <span className="text-yellow-500 font-bold">En attente</span>
              </li>
              <li className="flex justify-between">
                <span>Commande #12347</span>
                <span className="text-red-500 font-bold">Annulée</span>
              </li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-bold mb-2">Messages récents</h2>
            <ul className="space-y-2 text-sm">
              <li>Support : Votre colis arrive demain.</li>
              <li>Commercial : Nouvelle offre disponible.</li>
              <li>Support : Votre demande a été résolue.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
