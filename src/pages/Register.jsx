import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motdepasse: '',
    adresse: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.nom.trim()) newErrors.nom = 'Nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Prénom est requis';
    if (!formData.email.trim()) {
      newErrors.email = 'Email est requis';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email est invalide';
    }
    if (!formData.adresse.trim()) newErrors.adresse = 'Adresse est requise';
    if (!formData.motdepasse) {
      newErrors.motdepasse = 'Mot de passe est requis';
    } else if (formData.motdepasse.length < 6) {
      newErrors.motdepasse = 'Minimum 6 caractères';
    }
    if (formData.motdepasse !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setIsLoading(true);
  try {
    const { confirmPassword, ...userData } = formData;
    
    // Map to backend field names
    const payload = {
      ...userData,
      mdp: userData.motdepasse
    };

    const response = await api.post('/users/register', payload);
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      navigate('/login', { 
        state: { 
          registrationSuccess: true,
          email: formData.email
        } 
      });
    }
  } catch (err) {
    // Enhanced error handling
    const backendErrors = err.response?.data?.errors || [];
    const fieldErrors = {};
    
    backendErrors.forEach(error => {
      fieldErrors[error.path] = error.message;
    });

    setErrors({
      ...fieldErrors,
      general: err.response?.data?.message || 'Erreur lors de l\'inscription'
    });
  } finally {
    setIsLoading(false);
  }
};

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-100">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">Inscription réussie!</h2>
            <p className="mt-2 text-gray-600">
              Votre compte a été créé avec succès. Redirection en cours...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">LIVRINI</h1>
          <h2 className="text-2xl font-semibold text-white/90">
            Créer un compte
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Déjà membre?{' '}
            <Link 
              to="/login" 
              className="font-medium text-white hover:text-blue-200 transition-colors underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="glass bg-white/95 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/20">
          {errors.general && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                  Prénom *
                </label>
                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  required
                  value={formData.prenom}
                  onChange={handleChange}
                  className={`mt-1 block w-full border-2 ${
                    errors.prenom ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                  } rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-4 transition-all bg-white/50 backdrop-blur-sm`}
                  placeholder="Votre prénom"
                />
                {errors.prenom && (
                  <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>
                )}
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                  Nom *
                </label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  value={formData.nom}
                  onChange={handleChange}
                  className={`mt-1 block w-full border-2 ${
                    errors.nom ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                  } rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-4 transition-all bg-white/50 backdrop-blur-sm`}
                  placeholder="Votre nom"
                />
                {errors.nom && (
                  <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                  className={`mt-1 block w-full border-2 ${
                    errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                  } rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-4 transition-all bg-white/50 backdrop-blur-sm`}
                placeholder="exemple@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">
                Adresse *
              </label>
              <input
                id="adresse"
                name="adresse"
                type="text"
                required
                value={formData.adresse}
                onChange={handleChange}
                  className={`mt-1 block w-full border-2 ${
                    errors.adresse ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                  } rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-4 transition-all bg-white/50 backdrop-blur-sm`}
                placeholder="Votre adresse complète"
              />
              {errors.adresse && (
                <p className="mt-1 text-sm text-red-600">{errors.adresse}</p>
              )}
            </div>
            <div>
              <label htmlFor="motdepasse" className="block text-sm font-medium text-gray-700">
                Mot de passe *
              </label>
              <input
                id="motdepasse"
                name="motdepasse"
                type="password"
                autoComplete="new-password"
                required
                minLength="6"
                value={formData.motdepasse}
                onChange={handleChange}
                  className={`mt-1 block w-full border-2 ${
                    errors.motdepasse ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                  } rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-4 transition-all bg-white/50 backdrop-blur-sm`}
                placeholder="••••••••"
              />
              {errors.motdepasse ? (
                <p className="mt-1 text-sm text-red-600">{errors.motdepasse}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">Minimum 6 caractères</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                  className={`mt-1 block w-full border-2 ${
                    errors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                  } rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-4 transition-all bg-white/50 backdrop-blur-sm`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Inscription en cours...
                  </>
                ) : 'S\'inscrire'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}