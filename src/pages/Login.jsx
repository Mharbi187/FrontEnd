import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    mdp: '' // Changed from 'motdepasse' to 'mdp' to match backend
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for registration success message
  const registrationSuccess = location.state?.registrationSuccess;
  const registeredEmail = location.state?.email;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'Email est requis';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email est invalide';
    }

    if (!formData.mdp) { // Changed from 'motdepasse' to 'mdp'
      newErrors.mdp = 'Mot de passe est requis'; // Changed error key
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
      const response = await api.post('/users/login', formData);
      
      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect to home or previous location
        navigate(location.state?.from || '/', { replace: true });
      } else {
        setErrors({
          general: response.data.message || 'Email ou mot de passe incorrect'
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrors({
        general: err.response?.data?.message || 
                'Une erreur est survenue. Veuillez réessayer.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Se connecter
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Nouveau membre?{' '}
          <Link 
            to="/register" 
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Créer un compte
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-100">
          {/* Show registration success message if redirected from register */}
          {registrationSuccess && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="text-sm text-green-600">
                Inscription réussie! Vous pouvez maintenant vous connecter{registeredEmail && ` avec ${registeredEmail}`}.
              </p>
            </div>
          )}

          {/* Show general errors */}
          {errors.general && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
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
                className={`mt-1 block w-full border ${
                  errors.email ? 'border-red-300 focus:border-red-300' : 'border-gray-300 focus:border-blue-500'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 transition-colors`}
                placeholder="votre@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="mdp" className="block text-sm font-medium text-gray-700">
                Mot de passe *
              </label>
              <input
                id="mdp"
                name="mdp" // Changed from 'motdepasse' to 'mdp'
                type="password"
                autoComplete="current-password"
                required
                value={formData.mdp}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.mdp ? 'border-red-300 focus:border-red-300' : 'border-gray-300 focus:border-blue-500'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 transition-colors`}
                placeholder="••••••••"
              />
              {errors.mdp && (
                <p className="mt-1 text-sm text-red-600">{errors.mdp}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <Link 
                  to="/forgot-password" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Mot de passe oublié?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion en cours...
                  </>
                ) : 'Se connecter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}