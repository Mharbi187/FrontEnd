import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaTruck, FaChartLine, FaShieldAlt, FaBoxOpen, FaUsers, 
  FaClock, FaHeadset, FaMobileAlt, FaGlobe, FaArrowRight,
  FaCheckCircle, FaWarehouse, FaCreditCard, FaBell
} from 'react-icons/fa';

const Services = () => {
  // Valid Unsplash images for services
  const images = {
    dashboard: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
    tracking: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=500&fit=crop',
    warehouse: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=500&fit=crop',
    delivery: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&h=500&fit=crop',
    analytics: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
    support: 'https://images.unsplash.com/photo-1553775927-a071d5a6a39a?w=800&h=500&fit=crop'
  };

  const mainServices = [
    {
      icon: <FaChartLine className="text-3xl" />,
      title: 'Dashboard Intelligent',
      description: 'Tableau de bord interactif avec visualisation en temps réel de vos KPIs, stocks et performances.',
      image: images.dashboard,
      features: ['Visualisation des stocks', 'Analyses prédictives', 'Rapports personnalisés', 'Alertes intelligentes'],
      color: 'emerald'
    },
    {
      icon: <FaTruck className="text-3xl" />,
      title: 'Suivi de Livraison GPS',
      description: 'Suivez chaque colis en temps réel avec géolocalisation précise et estimations d\'arrivée.',
      image: images.tracking,
      features: ['Tracking GPS temps réel', 'Notifications push', 'Preuves de livraison', 'Historique complet'],
      color: 'blue'
    },
    {
      icon: <FaWarehouse className="text-3xl" />,
      title: 'Gestion de Stock',
      description: 'Optimisez votre inventaire avec notre système de gestion de stock intelligent.',
      image: images.warehouse,
      features: ['Inventaire automatisé', 'Alertes rupture', 'Multi-entrepôts', 'Codes-barres/QR'],
      color: 'purple'
    },
    {
      icon: <FaUsers className="text-3xl" />,
      title: 'Portail Fournisseurs',
      description: 'Connectez et gérez tous vos fournisseurs sur une plateforme unifiée.',
      image: images.delivery,
      features: ['Catalogue produits', 'Gestion commandes', 'Facturation', 'Communication directe'],
      color: 'amber'
    }
  ];

  const additionalServices = [
    { icon: <FaMobileAlt />, title: 'Application Mobile', desc: 'Gérez tout depuis votre smartphone' },
    { icon: <FaBell />, title: 'Notifications', desc: 'Alertes en temps réel sur tous vos appareils' },
    { icon: <FaCreditCard />, title: 'Paiement Sécurisé', desc: 'Transactions cryptées et sécurisées' },
    { icon: <FaGlobe />, title: 'Couverture Nationale', desc: 'Livraison partout en Tunisie' },
    { icon: <FaClock />, title: 'Disponibilité 24/7', desc: 'Service accessible à tout moment' },
    { icon: <FaHeadset />, title: 'Support Dédié', desc: 'Équipe d\'experts à votre service' }
  ];

  const stats = [
    { value: '99.9%', label: 'Disponibilité' },
    { value: '<2h', label: 'Temps de réponse' },
    { value: '10K+', label: 'Livraisons/mois' },
    { value: '500+', label: 'Partenaires' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-900 text-white overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-emerald-200 text-sm font-medium border border-white/20 mb-6"
          >
            <FaTruck /> Solutions Logistiques
          </motion.span>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black mb-6"
          >
            Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">Services</span> Premium
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto mb-10"
          >
            Des solutions innovantes pour simplifier votre logistique et accélérer votre croissance
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link to="/register" className="btn-primary py-4 px-8 text-lg inline-flex items-center gap-2">
              Essai Gratuit <FaArrowRight />
            </Link>
            <Link to="/about" className="bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 font-semibold py-4 px-8 rounded-xl transition duration-300">
              En savoir plus
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white py-8 shadow-lg relative z-10 -mt-8 mx-4 lg:mx-auto max-w-6xl rounded-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-black text-emerald-600">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main Services */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Ce que nous offrons</span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">Services Principaux</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Une suite complète d'outils pour optimiser votre chaîne logistique
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {mainServices.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-8">
                  <div className={`w-14 h-14 bg-${service.color}-100 rounded-2xl flex items-center justify-center text-${service.color}-600 mb-6`}>
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700">
                        <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link 
                    to="/register" 
                    className="text-emerald-600 font-semibold inline-flex items-center gap-2 hover:text-emerald-700 transition-colors"
                  >
                    Commencer <FaArrowRight />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Et bien plus</span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">Services Additionnels</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalServices.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 text-xl mb-4">
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Sécurité garantie</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-6">
                Vos données sont entre de bonnes mains
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Nous utilisons les dernières technologies de sécurité pour protéger vos informations et garantir la confidentialité de vos transactions.
              </p>

              <div className="space-y-4">
                {[
                  { title: 'Chiffrement SSL/TLS', desc: 'Toutes les communications sont cryptées' },
                  { title: 'Authentification 2FA', desc: 'Double vérification pour vos comptes' },
                  { title: 'Sauvegarde automatique', desc: 'Vos données sont sauvegardées quotidiennement' },
                  { title: 'Conformité RGPD', desc: 'Respect total de la vie privée' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaShieldAlt className="text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=500&fit=crop"
                alt="Sécurité des données"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-emerald-600 text-white p-6 rounded-2xl shadow-xl">
                <div className="text-3xl font-bold">256-bit</div>
                <div className="text-emerald-200">Encryption</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Prêt à transformer votre logistique?
            </h2>
            <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
              Rejoignez des centaines d'entreprises qui ont déjà optimisé leurs opérations avec LIVRINI
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/register" 
                className="bg-white text-emerald-700 hover:bg-gray-100 font-bold py-4 px-10 rounded-xl transition duration-300 shadow-xl hover:shadow-2xl inline-flex items-center justify-center gap-2"
              >
                Démarrer maintenant <FaArrowRight />
              </Link>
              <Link 
                to="/products" 
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold py-4 px-10 rounded-xl transition duration-300 inline-flex items-center justify-center gap-2"
              >
                <FaBoxOpen /> Voir les produits
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Services;