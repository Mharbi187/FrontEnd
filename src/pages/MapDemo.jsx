import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaTruck, FaBoxOpen, FaMapMarkedAlt } from 'react-icons/fa';

// Page to choose between demo and real deliveries
export default function MapDemo() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaMapMarkedAlt className="text-4xl text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Suivi de Livraison</h1>
        <p className="text-gray-600 mb-8">Suivez vos livraisons en temps réel sur une carte interactive</p>
        
        <div className="space-y-4">
          <Link
            to="/deliveries"
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition shadow-lg"
          >
            <FaBoxOpen className="text-xl" />
            <span>Voir mes livraisons</span>
          </Link>
          
          <Link
            to="/track-delivery/demo"
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-emerald-600 border-2 border-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition"
          >
            <FaTruck className="text-xl" />
            <span>Voir la démo</span>
          </Link>
        </div>
        
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-8 text-gray-500 hover:text-emerald-600 transition"
        >
          <FaArrowLeft /> Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
