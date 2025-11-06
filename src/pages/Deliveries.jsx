import React, { useEffect, useState } from 'react';
import { FiRefreshCw, FiSearch, FiMapPin, FiTruck, FiCalendar } from 'react-icons/fi';
import api from '../api/axios';

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

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
      const res = await api.get('/livraisons/mes-livraisons');
      setDeliveries(extractList(res));
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
    const address = (d.adresse || d.address || '').toString().toLowerCase();
    return id.includes(query) || status.includes(query.toLowerCase()) || address.includes(query.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Mes Livraisons</h1>
              <p className="text-gray-600">Suivez le statut de vos livraisons</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher par statut, ID ou adresse"
                  className="pl-10 pr-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 bg-white/50"
                />
              </div>
              <button
                onClick={fetchDeliveries}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg flex items-center gap-2"
              >
                <FiRefreshCw /> Rafraîchir
              </button>
            </div>
          </div>

          {loading && (
            <div className="py-20 text-center">Chargement…</div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="py-20 text-center text-gray-600">Aucune livraison trouvée.</div>
          )}

          <div className="space-y-4">
            {filtered.map((d) => {
              const id = d.id || d._id;
              const status = d.status || d.statut || 'Inconnu';
              const date = d.date || d.updatedAt || d.createdAt || '';
              const address = d.adresse || d.address || '-';
              const carrier = d.transporteur || d.carrier || '—';
              return (
                <div key={id} className="border border-gray-200 rounded-xl p-4 bg-white/70">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <FiTruck className="text-blue-600" />
                      <div>
                        <div className="font-semibold">Livraison #{id}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <FiCalendar /> {new Date(date).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        status.toLowerCase() === 'livrée' || status.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800'
                        : status.toLowerCase() === 'en transit' || status.toLowerCase() === 'shipped' ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>{status}</span>
                      <div className="text-gray-600 text-sm flex items-center gap-2">
                        <FiMapPin /> {address}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">Transporteur: {carrier}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deliveries;


