import React from 'react';
import { Link } from 'react-router-dom';

const Services = () => {
  // Placeholder images for services
  const dashboardImage = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80';
  const trackingImage = 'https://images.unsplash.com/photo-1586528116311-ad8dd3a8dd22?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80';

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-128px)]">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Nos Services Premium
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto mb-8 leading-relaxed">
            Des solutions innovantes pour simplifier votre logistique et booster votre productivité
          </p>
          <Link 
            to="/register" 
            className="inline-block bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition duration-300 shadow-lg hover:shadow-xl"
            aria-label="Commencer un essai gratuit"
          >
            Essai Gratuit
          </Link>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          {/* Live Dashboard */}
          <div className="group bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 overflow-hidden rounded-lg mb-6">
              <img 
                src={dashboardImage} 
                alt="Tableau de bord en temps réel" 
                className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                loading="lazy"
              />
            </div>
            <div className="flex justify-center mb-6">
              <div className="text-blue-600 text-5xl w-16 h-16 flex items-center justify-center bg-blue-50 rounded-full">
                📊
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Dashboard en Temps Réel</h2>
            <p className="text-gray-600 mb-6 text-center text-base sm:text-lg">
              Un tableau de bord interactif permettant aux fournisseurs et clients de suivre l'ensemble des activités en direct.
            </p>
            <ul className="space-y-3 mb-6">
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
            <Link 
              to="/features/dashboard" 
              className="text-blue-600 font-medium inline-flex items-center hover:text-blue-800 transition justify-center w-full"
              aria-label="En savoir plus sur le tableau de bord en temps réel"
            >
              En savoir plus
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {/* Live Delivery Tracking */}
          <div className="group bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 overflow-hidden rounded-lg mb-6">
              <img 
                src={trackingImage} 
                alt="Suivi de livraison en direct" 
                className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                loading="lazy"
              />
            </div>
            <div className="flex justify-center mb-6">
              <div className="text-blue-600 text-5xl w-16 h-16 flex items-center justify-center bg-blue-50 rounded-full">
                🚚
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Suivi de Livraison en Direct</h2>
            <p className="text-gray-600 mb-6 text-center text-base sm:text-lg">
              Suivez chaque colis en temps réel avec une précision géolocalisée et des estimations d'arrivée intelligentes.
            </p>
            <ul className="space-y-3 mb-6">
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
            <Link 
              to="/features/tracking" 
              className="text-blue-600 font-medium inline-flex items-center hover:text-blue-800 transition justify-center w-full"
              aria-label="En savoir plus sur le suivi de livraison en direct"
            >
              En savoir plus
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Confidence Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="text-blue-600 text-5xl w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-sm">
              🔒
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">Confiance et Sécurité</h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
            Notre engagement envers la transparence et la sécurité vous garantit une expérience sans souci.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300">
              <h3 className="font-bold text-lg mb-2 text-gray-800">Chiffrement SSL</h3>
              <p className="text-gray-600 text-base">Toutes vos données sont cryptées de bout en bout</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300">
              <h3 className="font-bold text-lg mb-2 text-gray-800">Sauvegardes</h3>
              <p className="text-gray-600 text-base">Sauvegarde quotidienne de vos informations</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300">
              <h3 className="font-bold text-lg mb-2 text-gray-800">Support Expert</h3>
              <p className="text-gray-600 text-base">Assistance technique disponible 24h/24</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Prêt à révolutionner votre logistique ?</h2>
          <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Rejoignez des centaines d'entreprises qui nous font déjà confiance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/register" 
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl"
              aria-label="Commencer un essai gratuit"
            >
              Commencer Maintenant
            </Link>
            <Link 
              to="/contact" 
              className="border-2 border-white text-white hover:bg-blue-700 font-semibold py-3 px-8 rounded-lg transition duration-300"
              aria-label="Contacter notre équipe"
            >
              Nous Contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;