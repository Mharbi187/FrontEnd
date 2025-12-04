import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCreditCard, FaLock, FaShoppingCart, FaTruck, 
  FaCheckCircle, FaArrowLeft, FaSpinner, FaMapMarkerAlt,
  FaShieldAlt, FaMoneyBillWave
} from 'react-icons/fa';
import api from '../api/axios';
import toast from 'react-hot-toast';

// Helper function to format address (handles both string and object)
const formatAddress = (address) => {
  if (!address) return '';
  if (typeof address === 'string') return address;
  if (typeof address === 'object') {
    const parts = [];
    if (address.rue) parts.push(address.rue);
    if (address.ville) parts.push(address.ville);
    if (address.codePostal) parts.push(address.codePostal);
    if (address.pays) parts.push(address.pays);
    return parts.join(', ') || JSON.stringify(address);
  }
  return String(address);
};

// Stripe components - loaded dynamically
let Elements, CardElement, useStripe, useElements;
let stripePromise = null;

// Initialize Stripe lazily
const initStripe = async () => {
  if (!stripePromise) {
    try {
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      if (stripeKey && stripeKey !== 'pk_test_your_key') {
        const { loadStripe } = await import('@stripe/stripe-js');
        const stripeReact = await import('@stripe/react-stripe-js');
        Elements = stripeReact.Elements;
        CardElement = stripeReact.CardElement;
        useStripe = stripeReact.useStripe;
        useElements = stripeReact.useElements;
        stripePromise = loadStripe(stripeKey);
      }
    } catch (err) {
      console.error('Failed to load Stripe:', err);
    }
  }
  return stripePromise;
};

// Card Element Styles
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      fontFamily: 'Inter, system-ui, sans-serif',
      '::placeholder': { color: '#9ca3af' },
      iconColor: '#10b981',
    },
    invalid: { color: '#ef4444', iconColor: '#ef4444' },
  },
};

// Stripe Card Payment Form
function StripeCardForm({ onPaymentMethod }) {
  const stripe = useStripe?.();
  const elements = useElements?.();
  const [error, setError] = useState(null);

  const handleCardChange = (event) => {
    setError(event.error ? event.error.message : null);
  };

  // Pass stripe and elements up to parent
  useEffect(() => {
    if (stripe && elements) {
      onPaymentMethod({ stripe, elements, CardElement });
    }
  }, [stripe, elements]);

  if (!CardElement) return null;

  return (
    <div>
      <div className="p-4 border-2 border-gray-200 rounded-xl focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100 transition-all bg-white">
        <CardElement options={cardElementOptions} onChange={handleCardChange} />
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Mode Test:</strong> Utilisez <code className="bg-blue-100 px-1 rounded">4242 4242 4242 4242</code> avec n'importe quelle date future et CVC.
        </p>
      </div>
    </div>
  );
}

// Main Checkout Page
export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [step, setStep] = useState(1);
  const [orderResult, setOrderResult] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [stripeRefs, setStripeRefs] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart and initialize
  useEffect(() => {
    const init = async () => {
      // Check cart first
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (cart.length === 0) {
        navigate('/cart');
        return;
      }
      setCartItems(cart);

      // Get user address
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.adresse) {
        const formattedAddr = formatAddress(user.adresse);
        setUserAddress(formattedAddr);
        setShippingAddress(formattedAddr);
      }

      // Try to load Stripe
      try {
        await initStripe();
        if (stripePromise) {
          setStripeLoaded(true);
        }
      } catch (err) {
        console.error('Stripe init error:', err);
      }
      
      setIsLoading(false);
    };
    init();
  }, [navigate]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.prix * (item.quantity || 1)), 0);
  const shipping = 7;
  const total = subtotal + shipping;

  const handlePaymentSuccess = (result) => {
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));
    setOrderResult(result);
    setStep(3);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentError(null);

    // Validate before submitting
    if (!shippingAddress || shippingAddress.trim() === '') {
      setPaymentError('Veuillez entrer une adresse de livraison');
      toast.error('Adresse de livraison requise');
      setIsProcessing(false);
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setPaymentError('Votre panier est vide');
      toast.error('Panier vide');
      setIsProcessing(false);
      return;
    }

    const calculatedTotal = subtotal + shipping;
    if (!calculatedTotal || calculatedTotal <= 0) {
      setPaymentError('Montant invalide');
      toast.error('Erreur de calcul du montant');
      setIsProcessing(false);
      return;
    }

    try {
      if (paymentMethod === 'cash') {
        // Cash on delivery
        const orderData = {
          produits: cartItems.map(item => ({
            produit: item._id,
            quantite: item.quantity || 1,
            prixUnitaire: item.prix || 0
          })),
          montantTotal: calculatedTotal,
          adresseLivraison: shippingAddress.trim(),
          methodePaiement: 'especes',
          statutPaiement: 'en_attente'
        };
        
        console.log('Creating order with data:', orderData);
        const response = await api.post('/commandes', orderData);

        if (response.data.success || response.data._id) {
          toast.success('Commande créée avec succès!');
          handlePaymentSuccess(response.data);
        }
      } else {
        // Card payment with Stripe
        if (!stripeRefs?.stripe || !stripeRefs?.elements) {
          throw new Error('Stripe non initialisé');
        }

        const { data } = await api.post('/payments/create-payment-intent', {
          amount: total,
          currency: 'tnd',
          metadata: { itemCount: cartItems.length }
        });

        if (!data.success) {
          throw new Error(data.message || 'Erreur de paiement');
        }

        const { error, paymentIntent } = await stripeRefs.stripe.confirmCardPayment(
          data.clientSecret,
          {
            payment_method: {
              card: stripeRefs.elements.getElement(stripeRefs.CardElement),
            },
          }
        );

        if (error) {
          throw new Error(error.message);
        }

        if (paymentIntent.status === 'succeeded') {
          const confirmResponse = await api.post('/payments/confirm-payment', {
            paymentIntentId: paymentIntent.id,
            orderData: {
              items: cartItems.map(item => ({
                productId: item._id,
                quantity: item.quantity || 1,
                prix: item.prix
              })),
              shippingAddress
            }
          });

          if (confirmResponse.data.success) {
            toast.success('Paiement réussi!');
            handlePaymentSuccess(confirmResponse.data);
          }
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.response?.data?.message || error.message || 'Erreur de paiement');
      toast.error(error.message || 'Erreur lors du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Success State
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FaCheckCircle className="text-5xl text-emerald-600" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Commande confirmée!</h1>
          <p className="text-gray-600 mb-6">
            Merci pour votre commande. Vous recevrez un email de confirmation.
          </p>

          {(orderResult?.order || orderResult?._id) && (
            <div className="bg-emerald-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-emerald-700">
                Numéro de commande: <strong>#{(orderResult.order?.id || orderResult._id)?.slice(-8).toUpperCase()}</strong>
              </p>
              <p className="text-sm text-emerald-700">
                Montant: <strong>{(orderResult.order?.montant || orderResult.montantTotal || total).toFixed(2)} TND</strong>
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 py-3 px-6 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              Voir mes commandes
            </button>
            <button
              onClick={() => navigate('/products')}
              className="flex-1 py-3 px-6 border-2 border-emerald-600 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
            >
              Continuer mes achats
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-xl transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Finaliser la commande
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { num: 1, label: 'Adresse', icon: FaMapMarkerAlt },
            { num: 2, label: 'Paiement', icon: FaCreditCard },
            { num: 3, label: 'Confirmation', icon: FaCheckCircle },
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <div className={`flex items-center gap-2 ${step >= s.num ? 'text-emerald-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= s.num ? 'bg-emerald-600 text-white' : 'bg-gray-200'
                }`}>
                  <s.icon />
                </div>
                <span className="font-medium hidden sm:block">{s.label}</span>
              </div>
              {i < 2 && (
                <div className={`w-16 h-1 rounded ${step > s.num ? 'bg-emerald-600' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              {/* Step 1: Address */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-emerald-600" />
                    Adresse de livraison
                  </h2>

                  <div className="space-y-4">
                    {userAddress && (
                      <button
                        type="button"
                        onClick={() => setShippingAddress(userAddress)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          shippingAddress === userAddress
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900">Mon adresse</p>
                        <p className="text-gray-600 text-sm">{userAddress}</p>
                      </button>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {userAddress ? 'Ou entrez une autre adresse:' : 'Adresse de livraison:'}
                      </label>
                      <textarea
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Entrez votre adresse complète..."
                        rows={3}
                        required
                        className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all resize-none"
                      />
                      {!shippingAddress?.trim() && (
                        <p className="text-red-500 text-sm mt-1">* Adresse requise</p>
                      )}
                    </div>

                    <motion.button
                      type="button"
                      onClick={() => shippingAddress?.trim() && setStep(2)}
                      disabled={!shippingAddress?.trim()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-white flex items-center justify-center gap-2 ${
                        shippingAddress?.trim()
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30'
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      Continuer vers le paiement
                      <FaCreditCard />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <FaCreditCard className="text-emerald-600" />
                      Paiement
                    </h2>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                    >
                      ← Modifier l'adresse
                    </button>
                  </div>

                  {/* Shipping Address Preview */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-500 mb-1">Livraison à:</p>
                    <p className="font-medium text-gray-900">{shippingAddress}</p>
                  </div>

                  <form onSubmit={handleSubmitPayment} className="space-y-6">
                    {/* Payment Method Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Mode de paiement
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {stripeLoaded && (
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('card')}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                              paymentMethod === 'card'
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <FaCreditCard className="text-2xl" />
                            <span className="font-medium">Carte bancaire</span>
                            <span className="text-xs text-gray-500">Paiement sécurisé</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cash')}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            paymentMethod === 'cash'
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${!stripeLoaded ? 'col-span-2' : ''}`}
                        >
                          <FaMoneyBillWave className="text-2xl" />
                          <span className="font-medium">À la livraison</span>
                          <span className="text-xs text-gray-500">Payer en espèces</span>
                        </button>
                      </div>
                    </div>

                    {/* Card Input - Only show for card payment */}
                    <AnimatePresence>
                      {paymentMethod === 'card' && stripeLoaded && Elements && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Informations de la carte
                          </label>
                          <Elements stripe={stripePromise}>
                            <StripeCardForm onPaymentMethod={setStripeRefs} />
                          </Elements>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Error Message */}
                    {paymentError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
                      >
                        {paymentError}
                      </motion.div>
                    )}

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                      <FaShieldAlt className="text-emerald-500" />
                      <span>Paiement 100% sécurisé</span>
                      <FaLock className="text-emerald-500" />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isProcessing || (paymentMethod === 'card' && !stripeRefs)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-white flex items-center justify-center gap-3 shadow-lg transition-all ${
                        isProcessing
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/30'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Traitement en cours...
                        </>
                      ) : (
                        <>
                          <FaLock />
                          {paymentMethod === 'card' ? `Payer ${total.toFixed(2)} TND` : `Confirmer la commande`}
                        </>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaShoppingCart className="text-emerald-600" />
                Récapitulatif
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={item._id || index} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                      {item.image || item.imageURL ? (
                        <img src={item.image || item.imageURL} alt={item.nom} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FaShoppingCart />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.nom}</p>
                      <p className="text-sm text-gray-500">Qté: {item.quantity || 1}</p>
                      <p className="text-emerald-600 font-semibold">{(item.prix * (item.quantity || 1)).toFixed(2)} TND</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    <FaTruck className="text-sm" /> Livraison
                  </span>
                  <span>{shipping.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t">
                  <span>Total</span>
                  <span className="text-emerald-600">{total.toFixed(2)} TND</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-center gap-4 text-gray-400">
                  <FaLock title="Sécurisé" />
                  <FaShieldAlt title="Protection acheteur" />
                  <FaTruck title="Livraison rapide" />
                </div>
                <p className="text-center text-xs text-gray-500 mt-2">
                  Paiement sécurisé
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
