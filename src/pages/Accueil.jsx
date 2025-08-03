import React from 'react';
import { Link } from 'react-router-dom';

const Accueil = () => {
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
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Optimisez votre logistique avec Livrini
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
            La solution tout-en-un pour simplifier votre supply chain et booster votre productivité
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/register" 
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl"
            >
              Essai gratuit
            </Link>
            <Link 
              to="/services" 
              className="border-2 border-white text-white hover:bg-blue-700 font-semibold py-3 px-8 rounded-lg transition duration-300"
            >
              Voir la démo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Découvrez notre plateforme
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Conçue par des logisticiens pour des logisticiens
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              {
                icon: '🚀',
                title: 'Suivi en temps réel',
                description: 'Visualisez vos opérations logistiques en temps réel sur un tableau de bord unifié.',
                link: '/features/tracking',
                image: feature1
              },
              {
                icon: '📊',
                title: 'Analytique avancée',
                description: 'Découvrez des insights puissants pour optimiser vos coûts et performances.',
                link: '/features/analytics',
                image: feature2
              },
              {
                icon: '🤖',
                title: 'Automatisation intelligente',
                description: 'Automatisez vos processus répétitifs et concentrez-vous sur votre cœur de métier.',
                link: '/features/automation',
                image: feature3
              }
            ].map((feature, i) => (
              <div key={i} className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition duration-300">
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <div className="text-blue-600 text-3xl mb-3">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <Link 
                    to={feature.link} 
                    className="text-blue-600 font-medium inline-flex items-center hover:text-blue-800 transition"
                  >
                    En savoir plus
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Découvrez ce que nos clients disent de notre solution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Marie Dupont',
                position: 'Directrice Logistique',
                quote: 'Livrini a transformé notre gestion logistique. Nous avons réduit nos coûts de 30% en 3 mois !',
                date: '15 Mars 2023',
                photo: client1
              },
              {
                name: 'Jean Martin',
                position: 'Responsable Supply Chain',
                quote: "L'interface intuitive et les fonctionnalités puissantes nous font gagner plusieurs heures par jour.",
                date: '2 Avril 2023',
                photo: client2
              },
              {
                name: 'Sophie Leroy',
                position: 'CEO Transport Express',
                quote: 'La solution la plus complète que nous ayons testée. Le support technique est exceptionnel !',
                date: '10 Mai 2023',
                photo: client3
              }
            ].map((testimonial, i) => (
              <div 
                key={i} 
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.photo} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-blue-100"
                    loading="lazy"
                  />
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-gray-500 text-sm">{testimonial.position}</div>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <p className='text-gray-600 italic mb-4 relative pl-4 before:content-[""] before:text-4xl before:text-gray-200 before:absolute before:left-0 before:top-0'>
                  {testimonial.quote}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span>{testimonial.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à transformer votre logistique ?</h2>
          <p className="text-xl mb-8">
            Rejoignez les centaines d'entreprises qui optimisent déjà leurs opérations avec Livrini.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/register" 
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-lg"
            >
              Commencer l'essai gratuit
            </Link>
            <Link 
              to="/contact" 
              className="border-2 border-white text-white hover:bg-blue-700 font-semibold py-3 px-8 rounded-lg transition duration-300"
            >
              Parler à un expert
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Accueil;