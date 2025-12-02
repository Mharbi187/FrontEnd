import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTruck, FaEnvelope, FaRedo } from 'react-icons/fa';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    
    // Handle paste
    if (value.length > 1) {
      const pastedValues = value.slice(0, 6).split('');
      pastedValues.forEach((val, i) => {
        if (index + i < 6) {
          newOtp[index + i] = val;
        }
      });
      setOtp(newOtp);
      // Focus last filled input or next empty one
      const nextIndex = Math.min(index + pastedValues.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Move to next input on arrow right
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Move to previous input on arrow left
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Veuillez entrer le code complet à 6 chiffres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/users/verify-otp', {
        email,
        otp: otpCode
      });

      if (response.data.success) {
        toast.success('Compte vérifié avec succès!');
        
        // If token is returned, save it and redirect to dashboard
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
          
          // Redirect based on role
          const role = response.data.user?.role || 'client';
          switch (role) {
            case 'admin':
              navigate('/admin-dashboard');
              break;
            case 'fournisseur':
              navigate('/fournisseur-dashboard');
              break;
            default:
              navigate('/client-dashboard');
          }
        } else {
          // Redirect to login if no token
          navigate('/login', { 
            state: { 
              message: 'Compte vérifié! Vous pouvez maintenant vous connecter.',
              email 
            } 
          });
        }
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Code invalide ou expiré';
      setError(message);
      toast.error(message);
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    setError('');

    try {
      const response = await api.post('/users/resend-otp', { email });
      
      if (response.data.success) {
        toast.success('Nouveau code envoyé!');
        setCountdown(60); // 60 second cooldown
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de l\'envoi du code';
      setError(message);
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center border border-white/20"
          >
            <FaTruck className="text-4xl text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-2">LIVRINI</h1>
          <h2 className="text-xl font-medium text-emerald-200">
            Vérification du compte
          </h2>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4"
      >
        <div className="bg-white/95 backdrop-blur-xl py-10 px-8 shadow-2xl rounded-3xl border border-white/20">
          {/* Email indicator */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaEnvelope className="text-2xl text-emerald-600" />
            </div>
            <p className="text-gray-600">
              Un code de vérification a été envoyé à
            </p>
            <p className="font-semibold text-gray-900 mt-1">{email}</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            {/* OTP Input Fields */}
            <div className="flex justify-center gap-2 sm:gap-3 mb-8">
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 rounded-xl transition-all focus:outline-none focus:ring-4 ${
                    error
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : digit
                      ? 'border-emerald-500 bg-emerald-50 focus:border-emerald-500 focus:ring-emerald-100'
                      : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
                  }`}
                />
              ))}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex justify-center items-center gap-2 py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 transition-all ${
                isLoading || otp.join('').length !== 6 ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Vérification...
                </>
              ) : (
                'Vérifier mon compte'
              )}
            </motion.button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-2">
              Vous n'avez pas reçu le code?
            </p>
            <button
              onClick={handleResendOTP}
              disabled={isResending || countdown > 0}
              className={`inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors ${
                isResending || countdown > 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FaRedo className={isResending ? 'animate-spin' : ''} />
              {countdown > 0 ? (
                `Renvoyer dans ${countdown}s`
              ) : isResending ? (
                'Envoi en cours...'
              ) : (
                'Renvoyer le code'
              )}
            </button>
          </div>

          {/* Help text */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 text-center">
              Le code expire dans <strong>10 minutes</strong>. Vérifiez votre dossier spam si vous ne trouvez pas l'email.
            </p>
          </div>

          {/* Back to register */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link
              to="/register"
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              ← Retour à l'inscription
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
