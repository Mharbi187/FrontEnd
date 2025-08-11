import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

// Configure axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [activeTab, setActiveTab] = useState('profile');

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await api.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.success) {
        setUser({
          ...response.data.data,
          adresse: response.data.data.adresse || {
            rue: '',
            ville: '',
            codePostal: '',
            pays: ''
          }
        });
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setError(error.response?.data?.message || 'Failed to load profile');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('adresse.')) {
      const field = name.split('.')[1];
      setUser(prev => ({
        ...prev,
        adresse: {
          ...prev.adresse,
          [field]: value
        }
      }));
    } else {
      setUser(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // 1. Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ text: 'Veuillez vous reconnecter', type: 'error' });
      navigate('/login');
      return;
    }

    // 2. Verify token is valid and not expired
    let decoded;
    try {
      decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error('Token expired');
      }
    } catch (error) {
      localStorage.removeItem('token');
      setMessage({ text: 'Session expirée, veuillez vous reconnecter', type: 'error' });
      navigate('/login');
      return;
    }

    // 3. Make the API request with proper headers
    const response = await api.put(
      `/users/${decoded.userId}`,
      user,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 4. Handle successful response
    setMessage({ text: 'Profil mis à jour avec succès', type: 'success' });
    setIsEditing(false);
    fetchUserData(); // Refresh the user data
  } catch (error) {
    console.error('Update error:', error);
    
    // 5. Handle specific error cases
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      setMessage({ text: 'Session expirée', type: 'error' });
      navigate('/login');
    } else {
      setMessage({
        text: error.response?.data?.message || 'Erreur lors de la mise à jour du profil',
        type: 'error'
      });
    }
  }
};

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setMessage({ text: 'Les nouveaux mots de passe ne correspondent pas', type: 'error' });
        return;
      }

      if (passwordData.newPassword.length < 8) {
        setMessage({ 
          text: 'Le mot de passe doit contenir au moins 8 caractères', 
          type: 'error' 
        });
        return;
      }

      const token = localStorage.getItem('token');

      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setMessage({ text: 'Mot de passe changé avec succès', type: 'success' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Erreur lors du changement de mot de passe', 
        type: 'error' 
      });
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6 text-center">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-red-500">
        Erreur: {error}
        <button 
          onClick={fetchUserData}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!user) {
    return <div className="max-w-4xl mx-auto p-6 text-center">Aucune donnée utilisateur trouvée</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 ${activeTab === 'profile' ? 'border-b-2 border-green-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('profile')}
        >
          Informations personnelles
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'password' ? 'border-b-2 border-green-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('password')}
        >
          Mot de passe
        </button>
      </div>

      {activeTab === 'profile' ? (
        <>
          {isEditing ? (
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={user.nom || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    value={user.prenom || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={user.email || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                    disabled
                  />
                </div>
              </div>

              <h3 className="text-lg font-medium mt-6 mb-3">Adresse</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rue</label>
                  <input
                    type="text"
                    name="adresse.rue"
                    value={user.adresse?.rue || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input
                    type="text"
                    name="adresse.ville"
                    value={user.adresse?.ville || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code Postal</label>
                  <input
                    type="text"
                    name="adresse.codePostal"
                    value={user.adresse?.codePostal || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                  <input
                    type="text"
                    name="adresse.pays"
                    value={user.adresse?.pays || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nom</p>
                  <p className="text-gray-900">{user.nom || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Prénom</p>
                  <p className="text-gray-900">{user.prenom || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{user.email || '-'}</p>
                </div>
              </div>

              <h3 className="text-lg font-medium mt-6 mb-3">Adresse</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Rue</p>
                  <p className="text-gray-900">{user.adresse?.rue || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Ville</p>
                  <p className="text-gray-900">{user.adresse?.ville || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Code Postal</p>
                  <p className="text-gray-900">{user.adresse?.codePostal || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Pays</p>
                  <p className="text-gray-900">{user.adresse?.pays || '-'}</p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Modifier le profil
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handlePasswordSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full p-2 border rounded-md"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Changer le mot de passe
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;