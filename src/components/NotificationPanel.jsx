import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBell, FaCheck, FaCheckDouble, FaTrash, FaBox, 
  FaTruck, FaExclamationTriangle, FaInfoCircle, FaGift,
  FaShoppingCart, FaUserPlus, FaClock, FaTimes
} from 'react-icons/fa';
import api from '../api/axios';

// Notification types with their icons and colors
const notificationTypes = {
  order: { icon: FaShoppingCart, color: 'bg-blue-500', lightColor: 'bg-blue-50', textColor: 'text-blue-600' },
  delivery: { icon: FaTruck, color: 'bg-emerald-500', lightColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
  stock: { icon: FaExclamationTriangle, color: 'bg-amber-500', lightColor: 'bg-amber-50', textColor: 'text-amber-600' },
  promo: { icon: FaGift, color: 'bg-purple-500', lightColor: 'bg-purple-50', textColor: 'text-purple-600' },
  info: { icon: FaInfoCircle, color: 'bg-gray-500', lightColor: 'bg-gray-50', textColor: 'text-gray-600' },
  user: { icon: FaUserPlus, color: 'bg-teal-500', lightColor: 'bg-teal-50', textColor: 'text-teal-600' },
  product: { icon: FaBox, color: 'bg-indigo-500', lightColor: 'bg-indigo-50', textColor: 'text-indigo-600' },
};

// Format time ago
const formatTimeAgo = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  return new Date(date).toLocaleDateString('fr-FR');
};

export default function NotificationPanel({ userRole = 'client' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread
  const panelRef = useRef(null);

  // Sample notifications based on role
  const generateSampleNotifications = (role) => {
    const baseNotifications = [
      {
        id: 1,
        type: 'info',
        title: 'Bienvenue sur LIVRINI!',
        message: 'Découvrez nos nouvelles fonctionnalités et profitez de nos offres.',
        createdAt: new Date(Date.now() - 300000),
        read: false,
      },
    ];

    if (role === 'client') {
      return [
        ...baseNotifications,
        {
          id: 2,
          type: 'order',
          title: 'Commande confirmée',
          message: 'Votre commande #CMD-2024-001 a été confirmée et est en cours de préparation.',
          createdAt: new Date(Date.now() - 1800000),
          read: false,
        },
        {
          id: 3,
          type: 'delivery',
          title: 'Livraison en cours',
          message: 'Votre colis est en route! Livraison prévue aujourd\'hui entre 14h et 18h.',
          createdAt: new Date(Date.now() - 3600000),
          read: false,
        },
        {
          id: 4,
          type: 'promo',
          title: '🎉 Offre spéciale!',
          message: 'Profitez de -20% sur votre prochaine commande avec le code LIVRINI20.',
          createdAt: new Date(Date.now() - 86400000),
          read: true,
        },
      ];
    }

    if (role === 'fournisseur' || role === 'supplier') {
      return [
        ...baseNotifications,
        {
          id: 2,
          type: 'order',
          title: 'Nouvelle commande reçue',
          message: 'Vous avez reçu une nouvelle commande #CMD-2024-045 de 3 articles.',
          createdAt: new Date(Date.now() - 900000),
          read: false,
        },
        {
          id: 3,
          type: 'stock',
          title: '⚠️ Stock faible',
          message: 'Le produit "Laptop Pro X" n\'a plus que 3 unités en stock.',
          createdAt: new Date(Date.now() - 7200000),
          read: false,
        },
        {
          id: 4,
          type: 'product',
          title: 'Produit approuvé',
          message: 'Votre produit "Écouteurs Bluetooth" a été approuvé et est maintenant visible.',
          createdAt: new Date(Date.now() - 172800000),
          read: true,
        },
      ];
    }

    if (role === 'admin') {
      return [
        ...baseNotifications,
        {
          id: 2,
          type: 'user',
          title: 'Nouvel utilisateur',
          message: 'Un nouveau fournisseur s\'est inscrit et attend validation.',
          createdAt: new Date(Date.now() - 600000),
          read: false,
        },
        {
          id: 3,
          type: 'stock',
          title: '🚨 Alerte stock critique',
          message: '5 produits sont en rupture de stock et nécessitent une action.',
          createdAt: new Date(Date.now() - 3600000),
          read: false,
        },
        {
          id: 4,
          type: 'order',
          title: 'Commandes en attente',
          message: '12 commandes sont en attente de traitement depuis plus de 24h.',
          createdAt: new Date(Date.now() - 14400000),
          read: false,
        },
        {
          id: 5,
          type: 'info',
          title: 'Rapport hebdomadaire',
          message: 'Le rapport de la semaine est disponible. Consultez les statistiques.',
          createdAt: new Date(Date.now() - 259200000),
          read: true,
        },
      ];
    }

    return baseNotifications;
  };

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      try {
        // Try to fetch from API first
        const response = await api.get('/notifications');
        if (response.data?.data?.length > 0) {
          setNotifications(response.data.data);
        } else {
          // Fall back to sample notifications
          setNotifications(generateSampleNotifications(userRole));
        }
      } catch (error) {
        // API endpoint might not exist, use sample data
        setNotifications(generateSampleNotifications(userRole));
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [userRole]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    // Try to update on server
    api.put(`/notifications/${id}/read`).catch(() => {});
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    api.put('/notifications/read-all').catch(() => {});
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    api.delete(`/notifications/${id}`).catch(() => {});
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    api.delete('/notifications').catch(() => {});
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(n => 
    filter === 'all' ? true : !n.read
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-xl bg-white/80 hover:bg-white shadow-lg border border-gray-200 transition-all"
      >
        <FaBell className={`text-xl ${unreadCount > 0 ? 'text-emerald-600' : 'text-gray-500'}`} />
        
        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse animation for unread */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75"></span>
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaBell className="text-white text-lg" />
                  <h3 className="text-white font-bold text-lg">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                      {unreadCount} nouvelles
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-white text-emerald-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Toutes
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    filter === 'unread'
                      ? 'bg-white text-emerald-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Non lues
                </button>
              </div>
            </div>

            {/* Actions bar */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  <FaCheckDouble /> Tout marquer comme lu
                </button>
                <button
                  onClick={clearAll}
                  className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                >
                  <FaTrash /> Effacer tout
                </button>
              </div>
            )}

            {/* Notifications list */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-500 mt-2 text-sm">Chargement...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaBell className="text-2xl text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Aucune notification</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {filter === 'unread' ? 'Toutes les notifications ont été lues' : 'Vous êtes à jour!'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map((notification, index) => {
                    const typeConfig = notificationTypes[notification.type] || notificationTypes.info;
                    const IconComponent = typeConfig.icon;

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-emerald-50/50' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-xl ${typeConfig.lightColor} flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className={typeConfig.textColor} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`font-semibold text-sm ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1.5"></span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <FaClock className="text-[10px]" />
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              >
                                <FaTrash className="text-xs" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 bg-gray-50 border-t text-center">
                <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  Voir toutes les notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  );
}
