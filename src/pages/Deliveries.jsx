import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../api/axios';

// Helper function to format address (handles both string and object)
const formatAddress = (addr) => {
  if (!addr) return '-';
  if (typeof addr === 'string') return addr;
  if (typeof addr === 'object') {
    const parts = [addr.rue, addr.ville, addr.codePostal, addr.pays].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '-';
  }
  return String(addr);
};

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const extractList = (res) => {
    const data = res?.data;
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.deliveries)) return data.deliveries;
    if (Array.isArray(data.items)) return data.items;
    return [];
  };

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get livraisons first, then fall back to commandes
      let data = [];
      
      try {
        const livraisonsRes = await api.get('/livraisons/mes-livraisons');
        data = extractList(livraisonsRes);
      } catch (e) {
        // If livraisons fails, it's okay - we'll try commandes
      }
      
      // Also get commandes (orders) - show ALL orders
      try {
        const commandesRes = await api.get('/commandes/mes-commandes');
        const commandes = extractList(commandesRes);
        
        // Transform commandes to delivery format - include ALL orders
        const commandeDeliveries = commandes.map(c => ({
            _id: c._id,
            id: c._id,
            numeroCommande: c.numeroCommande,
            statut: c.statutCommande || c.statut || 'En Attente',
            status: c.statutCommande || c.statut || 'En Attente',
            adresse: c.adresseLivraison || c.adresse || '-',
            address: c.adresseLivraison || c.adresse || '-',
            date: c.updatedAt || c.createdAt,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            montant: c.montantTotal || c.montant || 0,
            transporteur: 'LIVRINI Express',
            commande: c
          }));
        
        // Merge and deduplicate by ID
        const existingIds = new Set(data.map(d => d._id?.toString()));
        const newDeliveries = commandeDeliveries.filter(d => !existingIds.has(d._id?.toString()));
        data = [...data, ...newDeliveries];
      } catch (e) {
        // Commandes fetch failed
        console.log('Commandes fetch error:', e);
      }
      
      setDeliveries(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Impossible de charger vos livraisons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeliveries(); }, []);

  const filtered = deliveries.filter((d) => {
    const id = (d.id || d._id || '').toString();
    const status = (d.status || d.statut || '').toString().toLowerCase();
    const address = formatAddress(d.adresse || d.address).toLowerCase();
    return id.includes(query) || status.includes(query.toLowerCase()) || address.includes(query.toLowerCase());
  });

  const getStatusConfig = (status) => {
    const s = (status || '').toLowerCase().replace(/_/g, ' ');
    if (s === 'livrée' || s === 'delivered' || s === 'livré' || s === 'livree') {
      return { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: '✅', label: 'Livrée', progress: 100 };
    }
    if (s === 'en transit' || s === 'shipped' || s === 'expédiée' || s === 'expediee') {
      return { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🚚', label: 'En transit', progress: 66 };
    }
    if (s === 'en préparation' || s === 'processing' || s === 'préparation' || s === 'en preparation' || s === 'confirmee' || s === 'confirmé') {
      return { bg: 'bg-amber-100', text: 'text-amber-800', icon: '📦', label: 'En préparation', progress: 33 };
    }
    if (s === 'en attente' || s === 'pending' || s === 'en_attente') {
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳', label: 'En attente', progress: 10 };
    }
    if (s === 'annulée' || s === 'cancelled' || s === 'annulee') {
      return { bg: 'bg-red-100', text: 'text-red-800', icon: '❌', label: 'Annulée', progress: 0 };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '📋', label: status || 'Inconnu', progress: 0 };
  };

  // Stats
  const stats = {
    total: deliveries.length,
    delivered: deliveries.filter(d => ['livrée', 'delivered', 'livré'].includes((d.status || d.statut || '').toLowerCase())).length,
    inTransit: deliveries.filter(d => ['en transit', 'shipped', 'expédiée'].includes((d.status || d.statut || '').toLowerCase())).length,
    pending: deliveries.filter(d => ['en préparation', 'processing', 'préparation'].includes((d.status || d.statut || '').toLowerCase())).length
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
            🚚 Suivi de livraisons
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mes Livraisons</h1>
          <p className="text-gray-600">Suivez le statut de vos livraisons en temps réel</p>
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
            { icon: '📦', label: 'Total', value: stats.total, color: 'from-emerald-500 to-teal-600' },
            { icon: '✅', label: 'Livrées', value: stats.delivered, color: 'from-green-500 to-emerald-600' },
            { icon: '🚚', label: 'En transit', value: stats.inTransit, color: 'from-blue-500 to-indigo-600' },
            { icon: '⏳', label: 'En préparation', value: stats.pending, color: 'from-amber-500 to-orange-600' },
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
                placeholder="Rechercher par statut, ID ou adresse..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 bg-gray-50 transition-all"
              />
            </div>
            <button
              onClick={fetchDeliveries}
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
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🚚</span>
              </div>
            </div>
            <p className="text-gray-600">Chargement de vos livraisons...</p>
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
              <span className="text-4xl">🚫</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune livraison trouvée</h3>
            <p className="text-gray-600 mb-6">
              {query ? `Aucun résultat pour "${query}"` : "Vous n'avez pas encore de livraison en cours"}
            </p>
          </motion.div>
        )}

        {/* Deliveries List */}
        <AnimatePresence>
          <div className="space-y-4">
            {filtered.map((d, index) => {
              const id = d.id || d._id;
              const status = d.status || d.statut || 'Inconnu';
              const statusConfig = getStatusConfig(status);
              const date = d.date || d.updatedAt || d.createdAt || '';
              const address = formatAddress(d.adresse || d.address);
              const carrier = d.transporteur || d.carrier || 'LIVRINI Express';
              
              return (
                <motion.div 
                  key={id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Delivery Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">🚚</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">Livraison #{id?.slice(-8)}</h3>
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
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {address}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className={`px-4 py-2 rounded-xl ${statusConfig.bg} ${statusConfig.text} font-medium flex items-center gap-2 self-start`}>
                        <span>{statusConfig.icon}</span>
                        {statusConfig.label}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>Préparation</span>
                        <span>En transit</span>
                        <span>Livrée</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${statusConfig.progress}%` }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Carrier Info */}
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Transporteur: <strong>{carrier}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="bg-gray-50 px-5 py-3 flex items-center justify-between border-t border-gray-100">
                    <Link
                      to={`/track-delivery/${id}`}
                      className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      Suivre sur la carte
                    </Link>
                    <button className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Contacter le livreur
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

export default Deliveries;


