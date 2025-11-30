import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaRocket, FaUsers, FaShieldAlt, FaChartLine, FaTruck, 
  FaGlobe, FaHeart, FaLightbulb, FaArrowRight 
} from 'react-icons/fa';

const About = () => {
  const features = [
    {
      icon: <FaRocket className="text-3xl" />,
      title: 'Innovation',
      description: 'Technologie de pointe pour une gestion logistique optimale',
      color: 'emerald'
    },
    {
      icon: <FaUsers className="text-3xl" />,
      title: 'Collaboration',
      description: 'Connectez vos équipes et partenaires sur une seule plateforme',
      color: 'blue'
    },
    {
      icon: <FaShieldAlt className="text-3xl" />,
      title: 'Sécurité',
      description: 'Vos données sont protégées avec les meilleurs standards',
      color: 'purple'
    },
    {
      icon: <FaChartLine className="text-3xl" />,
      title: 'Performance',
      description: 'Optimisez vos opérations avec des analyses en temps réel',
      color: 'amber'
    }
  ];

  const team = [
    { name: 'Mohamed Ali', role: 'CEO & Fondateur', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
    { name: 'Sarah Ben Salem', role: 'Directrice Technique', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
    { name: 'Karim Trabelsi', role: 'Responsable Logistique', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-900 text-white overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-emerald-200 text-sm font-medium border border-white/20 mb-6"
          >
            <FaTruck /> Notre Histoire
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-6"
          >
            À propos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">LIVRINI</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto"
          >
            Une plateforme tunisienne innovante dédiée à révolutionner la gestion logistique et le e-commerce
          </motion.p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Notre Mission</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-6">
                Simplifier la logistique pour tous
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                LIVRINI est née d'une vision simple : rendre la gestion logistique accessible et efficace 
                pour toutes les entreprises tunisiennes, des petits commerçants aux grandes entreprises.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Notre plateforme connecte les fournisseurs aux clients, optimise les processus de livraison 
                et offre une visibilité totale sur toute la chaîne d'approvisionnement.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <FaGlobe className="text-emerald-600 text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Couverture</h4>
                    <p className="text-sm text-gray-500">Toute la Tunisie</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FaLightbulb className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Innovation</h4>
                    <p className="text-sm text-gray-500">Tech de pointe</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-1">
                <div className="w-full h-full bg-white rounded-[22px] p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
                    <FaTruck className="text-white text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Notre Vision</h3>
                  <p className="text-gray-600">
                    Devenir la référence de la logistique digitale en Tunisie, en offrant une expérience 
                    utilisateur exceptionnelle et des solutions adaptées aux besoins locaux.
                  </p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-emerald-100 rounded-2xl -z-10"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-teal-100 rounded-full -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Ce qui nous définit</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">Nos Valeurs</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center hover:shadow-xl transition-all"
              >
                <div className={`w-16 h-16 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-${feature.color}-600`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10K+', label: 'Livraisons effectuées' },
              { value: '500+', label: 'Fournisseurs partenaires' },
              { value: '5K+', label: 'Clients satisfaits' },
              { value: '99%', label: 'Taux de satisfaction' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-black mb-2">{stat.value}</div>
                <div className="text-emerald-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Les visages derrière LIVRINI</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">Notre Équipe</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="h-48 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-emerald-600 font-medium">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <FaHeart className="text-5xl text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Rejoignez l'aventure LIVRINI
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Que vous soyez fournisseur ou client, faites partie de notre communauté grandissante
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/register" 
                className="btn-primary py-4 px-8 text-lg inline-flex items-center justify-center gap-2"
              >
                Commencer maintenant <FaArrowRight />
              </Link>
              <Link 
                to="/services" 
                className="bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 font-semibold py-4 px-8 rounded-xl transition duration-300"
              >
                Découvrir nos services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;