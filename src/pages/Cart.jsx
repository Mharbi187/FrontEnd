// Shopping Cart Page
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShoppingCart, FaTrash, FaPlus, FaMinus, FaArrowLeft,
  FaLock, FaCreditCard, FaShippingFast, FaTag
} from 'react-icons/fa';
import { FiPackage, FiCheck } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
      } catch (e) {
        setCartItems([]);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage only after initialization
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [cartItems, isInitialized]);

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
        } catch (e) {
          // ignore parse errors
        }
      }
    };

    window.addEventListener('storage', handleCartUpdate);
    return () => window.removeEventListener('storage', handleCartUpdate);
  }, []);

  // Update quantity
  const updateQuantity = (id, delta) => {
    setCartItems(items =>
      items.map(item => {
        if (item._id === id) {
          const newQty = Math.max(1, (item.quantity || 1) + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Remove item
  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item._id !== id));
    toast.success('Article supprimé du panier');
  };

  // Clear cart
  const clearCart = () => {
    if (window.confirm('Vider tout le panier?')) {
      setCartItems([]);
      toast.success('Panier vidé');
    }
  };

  // Apply promo code
  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'LIVRINI10') {
      setDiscount(10);
      toast.success('Code promo appliqué: -10%');
    } else if (promoCode.toUpperCase() === 'LIVRINI20') {
      setDiscount(20);
      toast.success('Code promo appliqué: -20%');
    } else {
      toast.error('Code promo invalide');
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.prix * (item.quantity || 1)), 0);
  const discountAmount = subtotal * (discount / 100);
  const shipping = subtotal > 100 ? 0 : 7;
  const total = subtotal - discountAmount + shipping;

  // Checkout
  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Veuillez vous connecter pour commander');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderData = {
        lignesCommande: cartItems.map(item => ({
          produit: item._id,
          quantite: item.quantity || 1,
          prixUnitaire: item.prix
        })),
        total: total,
        statutCommande: 'en_attente'
      };

      await api.post('/commandes', orderData);
      
      // Clear cart
      setCartItems([]);
      localStorage.removeItem('cart');
      
      toast.success('Commande passée avec succès!');
      navigate('/client-dashboard');
    } catch (error) {
      toast.error('Erreur lors de la commande: ' + (error.response?.data?.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/products" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2 mb-2">
              <FaArrowLeft /> Continuer mes achats
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Mon Panier</h1>
            <p className="text-gray-500">{cartItems.length} article(s)</p>
          </div>
          {cartItems.length > 0 && (
            <button onClick={clearCart} className="btn-secondary text-sm">
              Vider le panier
            </button>
          )}
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map((item, idx) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Product Image */}
                      <div className="w-full sm:w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.imageURL ? (
                          <img src={item.imageURL} alt={item.nom} className="w-full h-full object-cover" />
                        ) : (
                          <FiPackage className="text-emerald-600 text-4xl" />
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{item.nom || item.name}</h3>
                            <p className="text-sm text-gray-500">{item.categorie?.nom || 'Catégorie'}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item._id, -1)}
                              className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                              <FaMinus className="text-gray-600" />
                            </button>
                            <span className="w-12 text-center font-bold text-gray-900">
                              {item.quantity || 1}
                            </span>
                            <button
                              onClick={() => updateQuantity(item._id, 1)}
                              className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                              <FaPlus className="text-gray-600" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Prix unitaire: {item.prix} TND</p>
                            <p className="text-xl font-bold text-emerald-600">
                              {(item.prix * (item.quantity || 1)).toFixed(2)} TND
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Récapitulatif</h3>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code promo</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Entrez votre code"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <button onClick={applyPromoCode} className="btn-secondary px-4">
                      Appliquer
                    </button>
                  </div>
                  {discount > 0 && (
                    <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
                      <FiCheck /> Réduction de {discount}% appliquée
                    </p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)} TND</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Réduction ({discount}%)</span>
                      <span>-{discountAmount.toFixed(2)} TND</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Livraison</span>
                    <span>{shipping === 0 ? 'Gratuit' : `${shipping} TND`}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-gray-500">
                      Livraison gratuite à partir de 100 TND
                    </p>
                  )}
                  <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-200 pt-3">
                    <span>Total</span>
                    <span>{total.toFixed(2)} TND</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={loading || cartItems.length === 0}
                  className="w-full btn-primary py-4 mt-6 flex items-center justify-center gap-2 text-lg"
                >
                  {loading ? (
                    <span>Traitement...</span>
                  ) : (
                    <>
                      <FaLock /> Passer la commande
                    </>
                  )}
                </button>

                {/* Trust Badges */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaCreditCard className="text-emerald-500" />
                    <span>Paiement sécurisé</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaShippingFast className="text-emerald-500" />
                    <span>Livraison rapide</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-2xl shadow-lg"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShoppingCart className="text-4xl text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Votre panier est vide</h2>
            <p className="text-gray-500 mb-8">Découvrez nos produits et commencez vos achats</p>
            <Link to="/products" className="btn-primary inline-flex items-center gap-2">
              <FiPackage /> Parcourir les produits
            </Link>
          </motion.div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FaShippingFast className="text-blue-600 text-2xl" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Livraison Rapide</h4>
            <p className="text-sm text-gray-500">Livraison en 24-48h partout en Tunisie</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FaCreditCard className="text-emerald-600 text-2xl" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Paiement Sécurisé</h4>
            <p className="text-sm text-gray-500">Paiement à la livraison ou en ligne</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FaTag className="text-purple-600 text-2xl" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Meilleurs Prix</h4>
            <p className="text-sm text-gray-500">Prix compétitifs et offres exclusives</p>
          </div>
        </div>
      </div>
    </div>
  );
}
