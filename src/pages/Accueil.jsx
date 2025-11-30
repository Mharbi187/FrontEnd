import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaTruck, FaShieldAlt, FaHeadset, FaChartLine, 
  FaBoxOpen, FaUsers, FaStar, FaArrowRight,
  FaShippingFast, FaCreditCard, FaGlobe
} from 'react-icons/fa';

const Accueil = () => {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  // Online placeholder images
  const client1 = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80';
  const client2 = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80';
  const client3 = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80';
  const feature1 = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80';
  const feature2 = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80';
  const feature3 = 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80';

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/30 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-40 -left-40 w-80 h-80 bg-teal-500/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-cyan-500/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10 py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-emerald-200 text-sm font-medium border border-white/20">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Plateforme N°1 en Tunisie
              </span>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 leading-tight"
            >
              Livraison <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">Simplifiée</span>
              <br />
              Business <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-300">Optimisé</span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto mb-10"
            >
              Connectez fournisseurs et clients. Gérez vos commandes, stocks et livraisons sur une seule plateforme intelligente.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
            >
              <Link 
                to="/register" 
                className="group btn-primary py-4 px-8 text-lg inline-flex items-center gap-2"
              >
                Commencer gratuitement
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/products" 
                className="bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 font-semibold py-4 px-8 rounded-xl transition duration-300 inline-flex items-center gap-2"
              >
                <FaBoxOpen />
                Voir les produits
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {[
                { value: '10K+', label: 'Livraisons' },
                { value: '500+', label: 'Fournisseurs' },
                { value: '5K+', label: 'Clients' },
                { value: '99%', label: 'Satisfaction' }
              ].map((stat, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-emerald-200 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Nos avantages</span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
              Pourquoi choisir LIVRINI?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Une solution complète pour tous vos besoins de gestion logistique et e-commerce
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <FaShippingFast />, title: 'Livraison Rapide', desc: 'Livraison en 24-48h partout en Tunisie avec suivi en temps réel', color: 'emerald' },
              { icon: <FaShieldAlt />, title: 'Paiement Sécurisé', desc: 'Transactions sécurisées avec paiement à la livraison disponible', color: 'blue' },
              { icon: <FaHeadset />, title: 'Support 24/7', desc: 'Une équipe dédiée pour répondre à toutes vos questions', color: 'purple' },
              { icon: <FaChartLine />, title: 'Analytics Avancés', desc: 'Tableaux de bord intelligents pour suivre vos performances', color: 'amber' },
              { icon: <FaUsers />, title: 'Multi-Utilisateurs', desc: 'Gestion des rôles: Admin, Fournisseur, Client', color: 'rose' },
              { icon: <FaGlobe />, title: 'Couverture Nationale', desc: 'Réseau de livraison couvrant toutes les régions', color: 'cyan' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className={`bg-gradient-to-br from-${feature.color}-50 to-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div className={`w-14 h-14 bg-${feature.color}-100 rounded-2xl flex items-center justify-center text-${feature.color}-600 text-2xl mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Simple & Efficace</span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
              Comment ça marche?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Inscription', desc: 'Créez votre compte en quelques secondes', icon: <FaUsers /> },
              { step: '02', title: 'Parcourez', desc: 'Explorez notre catalogue de produits', icon: <FaBoxOpen /> },
              { step: '03', title: 'Commandez', desc: 'Ajoutez au panier et validez', icon: <FaCreditCard /> },
              { step: '04', title: 'Recevez', desc: 'Livraison rapide à votre porte', icon: <FaTruck /> },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                {/* Connector Line */}
                {i < 3 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-emerald-300 to-transparent"></div>
                )}
                
                <div className="relative z-10 w-24 h-24 bg-white rounded-2xl shadow-lg mx-auto mb-6 flex items-center justify-center">
                  <span className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                    {item.step}
                  </span>
                  <span className="text-3xl text-emerald-600">{item.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Notre plateforme</span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
              Découvrez nos fonctionnalités
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FaTruck className="text-3xl" />,
                title: 'Suivi en temps réel',
                description: 'Visualisez vos opérations logistiques en temps réel sur un tableau de bord unifié.',
                image: feature1
              },
              {
                icon: <FaChartLine className="text-3xl" />,
                title: 'Analytique avancée',
                description: 'Découvrez des insights puissants pour optimiser vos coûts et performances.',
                image: feature2
              },
              {
                icon: <FaBoxOpen className="text-3xl" />,
                title: 'Gestion de stock',
                description: 'Automatisez vos processus et recevez des alertes de stock en temps réel.',
                image: feature3
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-300 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-900 to-teal-900 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-emerald-300 font-semibold text-sm uppercase tracking-wider">Témoignages</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-4">
              Ce que disent nos clients
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Marie Dupont',
                position: 'Directrice Logistique',
                quote: 'Livrini a transformé notre gestion logistique. Nous avons réduit nos coûts de 30% en 3 mois !',
                photo: client1
              },
              {
                name: 'Jean Martin',
                position: 'Responsable Supply Chain',
                quote: "L'interface intuitive et les fonctionnalités puissantes nous font gagner plusieurs heures par jour.",
                photo: client2
              },
              {
                name: 'Sophie Leroy',
                position: 'CEO Transport Express',
                quote: 'La solution la plus complète que nous ayons testée. Le support technique est exceptionnel !',
                photo: client3
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
                <p className="text-emerald-100 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.photo} 
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400"
                    loading="lazy"
                  />
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-emerald-300 text-sm">{testimonial.position}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-12 md:p-16 text-center overflow-hidden"
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Prêt à commencer?
              </h2>
              <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
                Rejoignez des milliers d'entreprises qui optimisent leurs opérations avec LIVRINI.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  to="/register" 
                  className="bg-white text-emerald-700 hover:bg-gray-100 font-bold py-4 px-10 rounded-xl transition duration-300 shadow-xl hover:shadow-2xl inline-flex items-center justify-center gap-2"
                >
                  Créer un compte gratuit
                  <FaArrowRight />
                </Link>
                <Link 
                  to="/about" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold py-4 px-10 rounded-xl transition duration-300"
                >
                  En savoir plus
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Accueil;