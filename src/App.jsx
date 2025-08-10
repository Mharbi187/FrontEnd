import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Accueil from './pages/Accueil';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import ProductPage from './pages/Produits';
import jwtDecode from 'jwt-decode';

// Placeholder dashboard components (create these in your pages/ folder)
const AdminDashboard = () => <div>Admin Dashboard</div>;
const ClientDashboard = () => <div>Client Dashboard</div>;
const FournisseurDashboard = () => <div>Fournisseur Dashboard</div>;

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
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
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/services" element={<Services />} />
            <Route path="/products/:category?" element={<ProductPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client-dashboard"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fournisseur-dashboard"
              element={
                <ProtectedRoute allowedRoles={['fournisseur']}>
                  <FournisseurDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;