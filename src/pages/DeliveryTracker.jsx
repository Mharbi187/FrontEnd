import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaTruck, FaMapMarkerAlt, FaPhone, FaBox, FaArrowLeft,
  FaClock, FaCheckCircle, FaSpinner, FaRoute, FaUser,
  FaHome, FaWarehouse, FaPlay, FaPause, FaRedo
} from 'react-icons/fa';
import { FiPackage, FiNavigation } from 'react-icons/fi';
import api from '../api/axios';

// Helper function to format address
const formatAddress = (address) => {
  if (!address) return '';
  if (typeof address === 'string') return address;
  if (typeof address === 'object') {
    const parts = [];
    if (address.rue) parts.push(address.rue);
    if (address.ville) parts.push(address.ville);
    if (address.codePostal) parts.push(address.codePostal);
    if (address.pays) parts.push(address.pays);
    return parts.join(', ') || '';
  }
  return String(address);
};

// Delivery status steps
const deliverySteps = [
  { id: 'confirmed', label: 'Confirmée', icon: FaCheckCircle },
  { id: 'preparing', label: 'En préparation', icon: FaBox },
  { id: 'shipped', label: 'Expédiée', icon: FaWarehouse },
  { id: 'in_transit', label: 'En transit', icon: FaTruck },
  { id: 'delivered', label: 'Livrée', icon: FaHome },
];

// Tunisia coordinates
const WAREHOUSE = [36.8065, 10.1815]; // [lat, lng] for Leaflet
const DESTINATION = [36.8400, 10.2200];

// Generate route
const generateRoute = (start, end, numPoints = 100) => {
  const route = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const curve = Math.sin(t * Math.PI) * 0.01;
    route.push([
      start[0] + (end[0] - start[0]) * t + curve * 0.5,
      start[1] + (end[1] - start[1]) * t + curve
    ]);
  }
  return route;
};

const routeCoordinates = generateRoute(WAREHOUSE, DESTINATION);

export default function DeliveryTracker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const progressLineRef = useRef(null);
  const animationRef = useRef(null);
  const leafletRef = useRef(null);
  
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(3);
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(25);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Fetch delivery data
  useEffect(() => {
    const fetchDelivery = async () => {
      setLoading(true);
      try {
        if (id && id !== 'demo') {
          // Fetch real delivery data
          const response = await api.get(`/livraisons/${id}`);
          const data = response.data?.data || response.data;
          setDelivery(data);
          
          // Set current step based on actual status
          const statusMap = {
            'en_attente': 0,
            'confirmee': 1,
            'en_preparation': 2,
            'expediee': 3,
            'en_cours': 3,
            'en_transit': 3,
            'livree': 4,
            'annulee': 0
          };
          setCurrentStep(statusMap[data?.statut] || 3);
        } else {
          // Demo mode - use sample data
          setDelivery({
            _id: 'demo-123',
            numeroLivraison: 'LIV-DEMO-001',
            statut: 'en_cours',
            adresseLivraison: '123 Avenue Habib Bourguiba, Tunis',
            dateEstimee: new Date(Date.now() + 25 * 60000).toISOString(),
            livreur: { nom: 'Ahmed Ben Ali', telephone: '+216 98 765 432' },
            commande: { numeroCommande: 'CMD-DEMO-001', montantTotal: 156.50 }
          });
        }
      } catch (error) {
        console.error('Error fetching delivery:', error);
        // On error, show demo data with error message
        setDelivery({
          _id: id || 'error',
          numeroLivraison: id ? `LIV-${id.slice(-6).toUpperCase()}` : 'LIV-DEMO',
          statut: 'en_cours',
          adresseLivraison: '123 Avenue Habib Bourguiba, Tunis',
          dateEstimee: new Date(Date.now() + 25 * 60000).toISOString(),
          livreur: { nom: 'Ahmed Ben Ali', telephone: '+216 98 765 432' },
          commande: { numeroCommande: 'CMD-2024-001', montantTotal: 156.50 }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDelivery();
  }, [id]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      try {
        // Dynamic import of Leaflet
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        leafletRef.current = L.default || L;
        
        // Fix default marker icon issue
        delete leafletRef.current.Icon.Default.prototype._getIconUrl;
        leafletRef.current.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Create map
        const map = leafletRef.current.map(mapRef.current, {
          center: [(WAREHOUSE[0] + DESTINATION[0]) / 2, (WAREHOUSE[1] + DESTINATION[1]) / 2],
          zoom: 13,
          zoomControl: true
        });

        mapInstanceRef.current = map;

        // Add tile layer (OpenStreetMap)
        leafletRef.current.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // Custom truck icon
        const truckIcon = leafletRef.current.divIcon({
          html: `
            <div style="
              width: 50px;
              height: 50px;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 15px rgba(16, 185, 129, 0.5);
              border: 3px solid white;
            ">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </div>
          `,
          className: 'truck-marker',
          iconSize: [50, 50],
          iconAnchor: [25, 25]
        });

        // Warehouse icon
        const warehouseIcon = leafletRef.current.divIcon({
          html: `
            <div style="
              width: 40px;
              height: 40px;
              background: #f59e0b;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid white;
              box-shadow: 0 2px 10px rgba(0,0,0,0.3);
              font-size: 20px;
            ">🏭</div>
          `,
          className: 'warehouse-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        // Destination icon
        const destinationIcon = leafletRef.current.divIcon({
          html: `
            <div style="
              width: 40px;
              height: 40px;
              background: #10b981;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid white;
              box-shadow: 0 2px 10px rgba(0,0,0,0.3);
              font-size: 20px;
            ">📍</div>
          `,
          className: 'destination-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        // Add route polyline
        polylineRef.current = leafletRef.current.polyline(routeCoordinates, {
          color: '#10b981',
          weight: 6,
          opacity: 0.7
        }).addTo(map);

        // Add progress polyline (empty initially)
        progressLineRef.current = leafletRef.current.polyline([], {
          color: '#059669',
          weight: 8,
          opacity: 1
        }).addTo(map);

        // Add markers
        leafletRef.current.marker(WAREHOUSE, { icon: warehouseIcon })
          .addTo(map)
          .bindPopup('<b>🏭 Entrepôt LIVRINI</b>');

        leafletRef.current.marker(DESTINATION, { icon: destinationIcon })
          .addTo(map)
          .bindPopup('<b>📍 Destination Client</b>');

        // Add truck marker
        markerRef.current = leafletRef.current.marker(routeCoordinates[0], { icon: truckIcon })
          .addTo(map);

        // Fit bounds to show entire route
        map.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] });

        setMapReady(true);
        
        // Auto-start animation after a short delay
        setTimeout(() => setIsPlaying(true), 1500);

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Animation
  useEffect(() => {
    if (!mapReady || !isPlaying) return;

    let startTime = null;
    const duration = 60000; // 60 seconds

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / duration, 1);

      setProgress(Math.round(t * 100));
      setEstimatedTime(Math.max(0, Math.round((1 - t) * 25)));

      // Update step
      if (t < 0.1) setCurrentStep(2);
      else if (t < 0.9) setCurrentStep(3);
      else setCurrentStep(4);

      const pointIndex = Math.floor(t * (routeCoordinates.length - 1));
      const currentPoint = routeCoordinates[pointIndex];

      if (markerRef.current && currentPoint) {
        markerRef.current.setLatLng(currentPoint);
      }

      // Update progress line
      if (progressLineRef.current) {
        progressLineRef.current.setLatLngs(routeCoordinates.slice(0, pointIndex + 1));
      }

      if (t < 1 && isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mapReady, isPlaying]);

  const resetAnimation = () => {
    setProgress(0);
    setIsPlaying(false);
    setCurrentStep(2);
    setEstimatedTime(25);
    if (markerRef.current) markerRef.current.setLatLng(routeCoordinates[0]);
    if (progressLineRef.current) progressLineRef.current.setLatLngs([]);
    setTimeout(() => setIsPlaying(true), 100);
  };

  const centerOnTruck = () => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView(markerRef.current.getLatLng(), 15, { animate: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du suivi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <FaTruck /> Suivi en temps réel
              </h1>
              <p className="text-emerald-100 text-sm">{delivery?.numeroLivraison || 'LIV-2024-001'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition"
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button onClick={resetAnimation} className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition">
              <FaRedo />
            </button>
            <button
              onClick={centerOnTruck}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-all flex items-center gap-2"
            >
              <FiNavigation /> Centrer
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Map Container */}
        <div className="flex-1 relative min-h-[400px] lg:min-h-0">
          <div 
            ref={mapRef} 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              width: '100%',
              height: '100%',
              zIndex: 1
            }} 
          />
          
          {/* Loading overlay */}
          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement de la carte...</p>
              </div>
            </div>
          )}

          {/* Progress overlay */}
          <div className="absolute bottom-4 left-4 right-4 lg:right-auto lg:w-80 z-20">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">Progression</span>
                <span className="text-lg font-bold text-emerald-600">{progress}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaClock />
                  <span className="text-sm">
                    {estimatedTime > 0 ? `~${estimatedTime} min restantes` : '✅ Arrivée imminente!'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-emerald-600 font-medium">En direct</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-96 bg-white shadow-xl overflow-y-auto">
          {/* Delivery Status */}
          <div className="p-6 border-b">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiPackage className="text-emerald-600" />
              Statut de la livraison
            </h2>
            
            <div className="space-y-4">
              {deliverySteps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                const StepIcon = step.icon;
                
                return (
                  <div key={step.id} className="flex items-start gap-3">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted 
                          ? 'bg-emerald-500 text-white' 
                          : isCurrent 
                            ? 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-100'
                            : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isCompleted ? <FaCheckCircle /> : <StepIcon className={isCurrent ? 'animate-pulse' : ''} />}
                      </div>
                      {index < deliverySteps.length - 1 && (
                        <div className={`absolute left-5 top-10 w-0.5 h-6 ${isCompleted ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <div className="flex-1 pt-2">
                      <p className={`font-medium ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      {isCurrent && <p className="text-sm text-emerald-600 mt-0.5">En cours...</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Driver Info */}
          <div className="p-6 border-b">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaUser className="text-emerald-600" />
              Votre livreur
            </h2>
            
            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl">
              <div className="w-14 h-14 bg-emerald-200 rounded-full flex items-center justify-center">
                <FaTruck className="text-2xl text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{delivery?.livreur?.nom || 'Ahmed Ben Ali'}</p>
                <p className="text-sm text-gray-600">Livreur vérifié ⭐ 4.8</p>
              </div>
              <a
                href={`tel:${delivery?.livreur?.telephone || '+21698765432'}`}
                className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors"
              >
                <FaPhone />
              </a>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="p-6 border-b">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-emerald-600" />
              Détails de livraison
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaWarehouse className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Point de départ</p>
                  <p className="font-medium text-gray-900">Entrepôt LIVRINI - Tunis</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaHome className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Destination</p>
                  <p className="font-medium text-gray-900">
                    {formatAddress(delivery?.adresseLivraison) || '123 Avenue Habib Bourguiba, Tunis'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaClock className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Heure estimée d'arrivée</p>
                  <p className="font-medium text-gray-900">
                    {new Date(Date.now() + estimatedTime * 60000).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaBox className="text-emerald-600" />
              Votre commande
            </h2>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">N° Commande</span>
                <span className="font-mono font-medium">{delivery?.commande?.numeroCommande || 'CMD-2024-045'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Montant</span>
                <span className="font-bold text-emerald-600">{delivery?.commande?.montantTotal?.toFixed(2) || '156.50'} TND</span>
              </div>
            </div>

            <Link
              to="/orders"
              className="mt-4 w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              <FaRoute /> Voir toutes mes commandes
            </Link>
          </div>
        </div>
      </div>

      {/* Custom styles */}
      <style>{`
        .leaflet-container {
          width: 100% !important;
          height: 100% !important;
          z-index: 1;
        }
        .truck-marker, .warehouse-marker, .destination-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
