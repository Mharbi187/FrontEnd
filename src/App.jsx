import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Accueil from './pages/Accueil';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import FournisseurDashboard from './pages/FournisseurDashboard';
import ProductPage from './pages/Produits';
import { jwtDecode } from 'jwt-decode';
import ProfilePage from './pages/ProfilePage';
import AdminCreateUserPage from './pages/AdminCreateUserPage';
import Orders from './pages/Orders';
import Deliveries from './pages/Deliveries';
import Cart from './pages/Cart';
import About from './pages/About';

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
      </Layout>
    </Router>
  );
}

export default App;
