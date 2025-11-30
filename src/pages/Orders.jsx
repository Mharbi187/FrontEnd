import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const extractList = (res) => {
    const data = res?.data;
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.orders)) return data.orders;
    if (Array.isArray(data.items)) return data.items;
    return [];
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/commandes/mes-commandes');
      setOrders(extractList(res));
    } catch (e) {
      setError(e.response?.data?.message || 'Impossible de charger vos commandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = orders.filter((o) => {
    const id = (o.id || o._id || '').toString();
    const status = (o.status || o.statut || '').toString().toLowerCase();
    return id.includes(query) || status.includes(query.toLowerCase());
  });

  const getStatusConfig = (status) => {
    const s = status.toLowerCase();
    if (s === 'delivered' || s === 'livrée' || s === 'livré') {
      return { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: '✅', label: 'Livrée' };
    }
    if (s === 'processing' || s === 'en cours' || s === 'en traitement') {
      return { bg: 'bg-amber-100', text: 'text-amber-800', icon: '⏳', label: 'En cours' };
    }
    if (s === 'shipped' || s === 'expédiée' || s === 'en transit') {
      return { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🚚', label: 'Expédiée' };
    }
    if (s === 'cancelled' || s === 'annulée') {
      return { bg: 'bg-red-100', text: 'text-red-800', icon: '❌', label: 'Annulée' };
    }
    if (s === 'pending' || s === 'en attente') {
      return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '🕐', label: 'En attente' };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '📦', label: status };
  };

  // Stats
  const stats = {
    total: orders.length,
    delivered: orders.filter(o => ['delivered', 'livrée', 'livré'].includes((o.status || o.statut || '').toLowerCase())).length,
    pending: orders.filter(o => ['pending', 'en attente', 'processing', 'en cours'].includes((o.status || o.statut || '').toLowerCase())).length,
    totalAmount: orders.reduce((sum, o) => sum + (o.total || o.montant || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mb-4">
            📦 Suivi de commandes
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mes Commandes</h1>
          <p className="text-gray-600">Consultez l'historique et le statut de vos commandes</p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: '📦', label: 'Total Commandes', value: stats.total, color: 'from-emerald-500 to-teal-600' },
            { icon: '✅', label: 'Livrées', value: stats.delivered, color: 'from-green-500 to-emerald-600' },
            { icon: '⏳', label: 'En cours', value: stats.pending, color: 'from-amber-500 to-orange-600' },
            { icon: '💰', label: 'Total dépensé', value: `${stats.totalAmount.toFixed(2)} TND`, color: 'from-purple-500 to-indigo-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Search & Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par statut ou ID..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 bg-gray-50 transition-all"
              />
            </div>
            <button
              onClick={fetchOrders}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Rafraîchir
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de vos commandes...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <p className="font-medium text-red-800">Erreur de chargement</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 text-center"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📭</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune commande trouvée</h3>
            <p className="text-gray-600 mb-6">
              {query ? `Aucun résultat pour "${query}"` : "Vous n'avez pas encore passé de commande"}
            </p>
            <button
              onClick={() => navigate('/produits')}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Découvrir nos produits
            </button>
          </motion.div>
        )}

        {/* Orders List */}
        <AnimatePresence>
          <div className="space-y-4">
            {filtered.map((order, index) => {
              const id = order.id || order._id;
              const status = order.status || order.statut || 'Inconnu';
              const statusConfig = getStatusConfig(status);
              const total = order.total || order.montant || 0;
              const date = order.date || order.createdAt || '';
              const items = order.items || order.produits || order.lignes || [];
              
              return (
                <motion.div 
                  key={id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">📦</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">Commande #{id?.slice(-8)}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {date ? new Date(date).toLocaleDateString('fr-FR', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Date inconnue'}
                          </p>
                          {Array.isArray(items) && items.length > 0 && (
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                              {items.length} article{items.length > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status & Total */}
                      <div className="flex items-center gap-4 lg:gap-6">
                        <div className={`px-4 py-2 rounded-xl ${statusConfig.bg} ${statusConfig.text} font-medium flex items-center gap-2`}>
                          <span>{statusConfig.icon}</span>
                          {statusConfig.label}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="text-xl font-bold text-gray-900">{Number(total).toFixed(2)} TND</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="bg-gray-50 px-5 py-3 flex items-center justify-between border-t border-gray-100">
                    <button
                      onClick={() => setSelectedOrder(selectedOrder === id ? null : id)}
                      className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Voir les détails
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Aide
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Orders;


