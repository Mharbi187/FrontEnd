import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default function AdminCreateUserPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [user, setUser] = useState({
    nom: '',
    prenom: '',
    email: '',
    role: 'client',
    adresse: {
      rue: '',
      ville: '',
      codePostal: '',
      pays: ''
    }
  });

  const [password, setPassword] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!user.nom || !user.prenom || !user.email || !password) {
      setError('All required fields must be filled');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...user,
        mdp: password
      };

      await api.post('/users', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('User created successfully');
      setTimeout(() => navigate('/admin/users'), 1500);
    } catch (err) {
      console.error('Create user error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Create New User</h1>
              <p className="text-gray-600">Ajouter un nouvel utilisateur au système</p>
            </div>
        <button
          onClick={() => navigate('/admin-dashboard')}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg transform hover:scale-105"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Last Name (Nom)*</label>
            <input
              type="text"
              name="nom"
              value={user.nom}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">First Name (Prénom)*</label>
            <input
              type="text"
              name="prenom"
              value={user.prenom}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Email*</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Password*</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Role*</label>
            <select
              name="role"
              value={user.role}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
              required
            >
              <option value="client">Client</option>
              <option value="admin">Admin</option>
              <option value="fournisseur">Fournisseur</option>
            </select>
          </div>
        </div>

        <h3 className="text-lg font-medium mt-6 mb-3">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Street (Rue)</label>
            <input
              type="text"
              name="adresse.rue"
              value={user.adresse.rue}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City (Ville)</label>
            <input
              type="text"
              name="adresse.ville"
              value={user.adresse.ville}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Postal Code (Code Postal)</label>
            <input
              type="text"
              name="adresse.codePostal"
              value={user.adresse.codePostal}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country (Pays)</label>
            <input
              type="text"
              name="adresse.pays"
              value={user.adresse.pays}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <FaSave /> {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
}