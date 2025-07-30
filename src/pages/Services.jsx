import React from 'react';
import { Link } from 'react-router-dom';

const Services = () => {
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-128px)]">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8  text-black">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Nos Services Premium</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
            Des solutions innovantes pour simplifier votre logistique et booster votre productivité
          </p>
          <Link 
            to="/register" 
            className="inline-block bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition duration-300 shadow-lg"
          >
            Essai Gratuit
          </Link>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Live Dashboard */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300">
            <div className="flex justify-center mb-6">
              <div className="text-blue-600 text-5xl w-20 h-20 flex items-center justify-center bg-blue-50 rounded-full">
                📊
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">Dashboard en Temps Réel</h2>
            <p className="text-gray-600 mb-6 text-center">
              Un tableau de bord interactif permettant aux fournisseurs et clients de suivre l'ensemble des activités en direct.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Visualisation des stocks en temps réel</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Analyse des performances et indicateurs clés</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Interface personnalisable par utilisateur</span>
              </li>
            </ul>
          </div>

          {/* Live Delivery Tracking */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300">
            <div className="flex justify-center mb-6">
              <div className="text-blue-600 text-5xl w-20 h-20 flex items-center justify-center bg-blue-50 rounded-full">
                🚚
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">Suivi de Livraison en Direct</h2>
            <p className="text-gray-600 mb-6 text-center">
              Suivez chaque colis en temps réel avec une précision géolocalisée et des estimations d'arrivée intelligentes.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Visualisation GPS des livreurs</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Alertes et notifications en temps réel</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Preuves de livraison numériques</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Confidence Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="text-blue-600 text-5xl w-20 h-20 flex items-center justify-center bg-white rounded-full">
              🔒
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-6">Confiance et Sécurité</h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            Notre engagement envers la transparence et la sécurité vous garantit une expérience sans souci.
          </p>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Chiffrement SSL</h3>
              <p className="text-gray-600">Toutes vos données sont cryptées de bout en bout</p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Sauvegardes</h3>
              <p className="text-gray-600">Sauvegarde quotidienne de vos informations</p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Support Expert</h3>
              <p className="text-gray-600">Assistance technique disponible 24h/24</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-6">Prêt à révolutionner votre logistique ?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Rejoignez des centaines d'entreprises qui nous font déjà confiance.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/register" 
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition duration-300"
          >
            Commencer Maintenant
          </Link>
          <Link 
            to="/contact" 
            className="border border-white text-white hover:bg-blue-700 font-semibold py-3 px-8 rounded-lg transition duration-300"
          >
            Nous Contacter
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Services;