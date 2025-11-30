import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import { jwtDecode } from 'jwt-decode';

// Lazy load pages for better code splitting
const Accueil = lazy(() => import('./pages/Accueil'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Services = lazy(() => import('./pages/Services'));
const ClientDashboard = lazy(() => import('./pages/ClientDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const FournisseurDashboard = lazy(() => import('./pages/FournisseurDashboard'));
const ProductPage = lazy(() => import('./pages/Produits'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminCreateUserPage = lazy(() => import('./pages/AdminCreateUserPage'));
const Orders = lazy(() => import('./pages/Orders'));
const Deliveries = lazy(() => import('./pages/Deliveries'));
const Cart = lazy(() => import('./pages/Cart'));
const About = lazy(() => import('./pages/About'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-emerald-200 rounded-full animate-spin border-t-emerald-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 font-medium">Chargement...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    if (!allowedRoles.includes(decoded.role)) {
      return <Navigate to="/" replace />;
    }
    return children;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    localStorage.removeItem('token');
    return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<Accueil />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/products/:category?" element={<ProductPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin-create-user" element={<AdminCreateUserPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/deliveries" element={<Deliveries />} />
          <Route path="/cart" element={<Cart />} />

          {/* Dashboard routes */}
          <Route
            path="/admin-dashboard/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-dashboard/*"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientDashboard />
              </ProtectedRoute>
              
            }
          />
          <Route
            path="/fournisseur-dashboard/*"
            element={
              <ProtectedRoute allowedRoles={['fournisseur']}>
                <FournisseurDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;