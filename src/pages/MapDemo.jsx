import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaTruck } from 'react-icons/fa';

// Simple redirect to DeliveryTracker demo
export default function MapDemo() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="text-center p-8">
        <FaTruck className="text-6xl text-emerald-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Démo Carte de Livraison</h1>
        <p className="text-gray-600 mb-6">Redirection vers le suivi de livraison...</p>
        <Link
          to="/track-delivery/demo"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
        >
          <FaTruck /> Voir la démo
        </Link>
        <br />
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-4 text-emerald-600 hover:text-emerald-700"
        >
          <FaArrowLeft /> Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
