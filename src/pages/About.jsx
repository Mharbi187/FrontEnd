import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaUsers, FaShieldAlt, FaChartLine } from 'react-icons/fa';

const About = () => {
  const features = [
    {
      icon: <FaRocket className="text-4xl" />,
      title: 'Innovation',
      description: 'Technologie de pointe pour une gestion logistique optimale'
    },
    {
      icon: <FaUsers className="text-4xl" />,
      title: 'Collaboration',
      description: 'Connectez vos équipes et partenaires sur une seule plateforme'
    },
    {
      icon: <FaShieldAlt className="text-4xl" />,
      title: 'Sécurité',
      description: 'Vos données sont protégées avec les meilleurs standards de sécurité'
    },
    {
      icon: <FaChartLine className="text-4xl" />,
      title: 'Performance',
      description: 'Optimisez vos opérations avec des analyses en temps réel'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            À propos de Livrini
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto"
          >
            Une plateforme innovante dédiée à la gestion logistique moderne
          </motion.p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 md:p-12"
          >
            <h2 className="text-3xl font-bold gradient-text mb-6">Notre Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Livrini révolutionne la gestion logistique en offrant une solution complète et intuitive 
              qui simplifie les opérations de supply chain pour les entreprises de toutes tailles.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Notre objectif est de permettre à nos clients de gagner en efficacité, réduire leurs coûts 
              et améliorer leur satisfaction client grâce à une plateforme moderne et performante.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center gradient-text mb-12"
          >
            Nos Valeurs
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-6 text-center hover:shadow-xl transition-all"
              >
                <div className="text-blue-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-xl text-white/90">Clients satisfaits</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-5xl font-bold mb-2">99.9%</div>
              <div className="text-xl text-white/90">Disponibilité</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-xl text-white/90">Support client</div>
            </motion.div>
          </div>
      </div>
      </section>
    </div>
  );
};

export default About;