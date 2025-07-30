import React from 'react';
import { Link } from 'react-router-dom';

const Accueil = () => {
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-128px)]">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 md:mb-6">
            Bienvenue sur Notre Plateforme
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 md:mb-8">
            Découvrez nos services exceptionnels et commencez votre voyage avec nous dès aujourd'hui.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link 
              to="/register" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium sm:font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-lg transition duration-300 text-sm sm:text-base"
            >
              S'inscrire
            </Link>
            <Link 
              to="/login" 
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium sm:font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-lg transition duration-300 text-sm sm:text-base"
            >
              Se Connecter
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
  <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8 md:mb-12">
    Nos Avantages
  </h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
    {/* Feature 1 */}
    <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center">
      <div className="flex justify-center">
        <div className="text-blue-600 text-3xl sm:text-4xl mb-3 sm:mb-4 w-14 h-14 flex items-center justify-center bg-blue-50 rounded-full">
          🚀
        </div>
      </div>
      <h3 className="text-lg sm:text-xl font-semibold mb-2">Rapide et Efficace</h3>
      <p className="text-sm sm:text-base text-gray-600">
        Notre plateforme est conçue pour vous faire gagner du temps avec des processus optimisés.
      </p>
    </div>

    {/* Feature 2 */}
    <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center">
      <div className="flex justify-center">
        <div className="text-blue-600 text-3xl sm:text-4xl mb-3 sm:mb-4 w-14 h-14 flex items-center justify-center bg-blue-50 rounded-full">
          🔒
        </div>
      </div>
      <h3 className="text-lg sm:text-xl font-semibold mb-2">Sécurité</h3>
      <p className="text-sm sm:text-base text-gray-600">
        Vos données sont protégées avec les dernières technologies de sécurité.
      </p>
    </div>

    {/* Feature 3 */}
    <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center">
      <div className="flex justify-center">
        <div className="text-blue-600 text-3xl sm:text-4xl mb-3 sm:mb-4 w-14 h-14 flex items-center justify-center bg-blue-50 rounded-full">
          🤝
        </div>
      </div>
      <h3 className="text-lg sm:text-xl font-semibold mb-2">Support 24/7</h3>
      <p className="text-sm sm:text-base text-gray-600">
        Notre équipe est disponible à tout moment pour répondre à vos questions.
      </p>
    </div>
  </div>
</section>

      {/* Call to Action */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 md:mb-6">Prêt à commencer ?</h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 max-w-3xl mx-auto">
            Rejoignez des milliers d'utilisateurs satisfaits dès aujourd'hui.
          </p>
          <Link 
            to="/register" 
            className="inline-block bg-white text-blue-600 hover:bg-gray-100 font-medium sm:font-semibold py-2 px-6 sm:py-3 sm:px-8 rounded-lg transition duration-300 text-sm sm:text-base"
          >
            Créer un compte gratuit
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Accueil;