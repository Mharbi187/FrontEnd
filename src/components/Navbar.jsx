import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="w-full bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand name on the left */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <span className="ml-1 text-xl  font-bold text-white">Livrini</span>
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
                Login
              </Link>
              <Link 
                to="/register" 
                className="text-white bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}