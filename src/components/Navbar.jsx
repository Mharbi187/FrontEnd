import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="w-full bg-blue-600 shadow-lg font-['Inter']">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo on the left */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-white text-2xl font-bold tracking-tighter">
                LIVRINI
              </span>
            </Link>
          </div>

          {/* Navigation links on the right */}
          <div className="hidden md:flex items-center space-x-4 sm:space-x-8">
            <Link 
              to="/" 
              className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Accueil
            </Link>
            <Link 
              to="/services" 
              className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Services
            </Link>
            <div className="flex space-x-2 sm:space-x-4 ml-4">
              <Link 
                to="/login" 
                className="text-blue-600 bg-white hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Se Connecter
              </Link>
              <Link 
                to="/register" 
                className="text-white bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
              >
                S'inscrire
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button className="text-white hover:text-blue-200 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}