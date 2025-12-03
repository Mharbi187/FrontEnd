import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  FaTruck, FaMapMarkerAlt, FaPhone, FaBox, FaArrowLeft,
  FaClock, FaCheckCircle, FaSpinner, FaRoute, FaUser,
  FaHome, FaWarehouse, FaShippingFast
} from 'react-icons/fa';
import { FiPackage, FiNavigation } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

// Helper function to format address (handles both string and object)
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

// Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWhhcmJpMTIzIiwiYSI6ImNtaXA0cmM4NzA4MTQzaHF2amZjc3o1OTMifQ.1hZhsyjSLuVaUzP10sZcpg';

// Delivery status steps
const deliverySteps = [
  { id: 'confirmed', label: 'Confirmée', icon: FaCheckCircle },
  { id: 'preparing', label: 'En préparation', icon: FaBox },
  { id: 'shipped', label: 'Expédiée', icon: FaWarehouse },
  { id: 'in_transit', label: 'En transit', icon: FaTruck },
  { id: 'delivered', label: 'Livrée', icon: FaHome },
];

// Simulate route coordinates (Tunis area for demo)
const generateRoute = (start, end, numPoints = 50) => {
  const route = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Add some curve to make it look like a real route
    const curve = Math.sin(t * Math.PI) * 0.01;
    route.push([
      start[0] + (end[0] - start[0]) * t + curve,
      start[1] + (end[1] - start[1]) * t + curve * 0.5
    ]);
  }
  return route;
};

export default function DeliveryTracker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRef = useRef(null);
  const animationRef = useRef(null);
  
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(3); // Default to "in_transit" for demo
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(25);
  const [driverLocation, setDriverLocation] = useState(null);
  const [is3DEnabled, setIs3DEnabled] = useState(true);

  // Demo coordinates (Tunis)
  const warehouseLocation = [10.1815, 36.8065]; // Tunis center
  const destinationLocation = [10.2200, 36.8400]; // Destination
  const routeCoordinates = generateRoute(warehouseLocation, destinationLocation);

  // Fetch delivery data
  useEffect(() => {
    const fetchDelivery = async () => {
      setLoading(true);
      try {
        if (id) {
          const response = await api.get(`/livraisons/${id}`);
          setDelivery(response.data?.data || response.data);
        } else {
          // Demo delivery
          setDelivery({
            _id: 'demo-123',
            numeroLivraison: 'LIV-2024-001',
            statut: 'en_cours',
            adresseLivraison: '123 Avenue Habib Bourguiba, Tunis',
            dateEstimee: new Date(Date.now() + 25 * 60000).toISOString(),
            livreur: {
              nom: 'Ahmed Ben Ali',
              telephone: '+216 98 765 432'
            },
            commande: {
              numeroCommande: 'CMD-2024-045',
              montantTotal: 156.50
            }
          });
        }
      } catch (error) {
        console.error('Error fetching delivery:', error);
        // Use demo data on error
        setDelivery({
          _id: 'demo-123',
          numeroLivraison: 'LIV-2024-001',
          statut: 'en_cours',
          adresseLivraison: '123 Avenue Habib Bourguiba, Tunis',
          dateEstimee: new Date(Date.now() + 25 * 60000).toISOString(),
          livreur: {
            nom: 'Ahmed Ben Ali',
            telephone: '+216 98 765 432'
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDelivery();
  }, [id]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: warehouseLocation,
        zoom: 13,
        pitch: is3DEnabled ? 60 : 0,
        bearing: -20,
        antialias: true
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
      });

      map.current.on('load', () => {
      // Add 3D buildings layer
      if (is3DEnabled) {
        const layers = map.current.getStyle().layers;
        const labelLayerId = layers.find(
          (layer) => layer.type === 'symbol' && layer.layout['text-field']
        )?.id;

        map.current.addLayer(
          {
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 12,
            paint: {
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.6
            }
          },
          labelLayerId
        );
      }

      // Add route line
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates
          }
        }
      });

      // Route outline (shadow)
      map.current.addLayer({
        id: 'route-outline',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#000',
          'line-width': 8,
          'line-opacity': 0.2
        }
      });

      // Main route line
      map.current.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#10b981',
          'line-width': 5
        }
      });

      // Animated route progress
      map.current.addSource('route-progress', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });

      map.current.addLayer({
        id: 'route-progress-line',
        type: 'line',
        source: 'route-progress',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#059669',
          'line-width': 6
        }
      });

      // Add warehouse marker
      new mapboxgl.Marker({ color: '#f59e0b' })
        .setLngLat(warehouseLocation)
        .setPopup(new mapboxgl.Popup().setHTML('<strong>🏭 Entrepôt LIVRINI</strong>'))
        .addTo(map.current);

      // Add destination marker
      new mapboxgl.Marker({ color: '#10b981' })
        .setLngLat(destinationLocation)
        .setPopup(new mapboxgl.Popup().setHTML('<strong>📍 Destination</strong>'))
        .addTo(map.current);

      // Create custom truck marker
      const truckEl = document.createElement('div');
      truckEl.className = 'truck-marker';
      truckEl.innerHTML = `
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
          animation: pulse 2s infinite;
        ">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
        </div>
      `;

      markerRef.current = new mapboxgl.Marker({ element: truckEl })
        .setLngLat(routeCoordinates[0])
        .addTo(map.current);

      // Fit map to show entire route
      const bounds = new mapboxgl.LngLatBounds();
      routeCoordinates.forEach(coord => bounds.extend(coord));
      map.current.fitBounds(bounds, { padding: 80 });

      // Start animation
      animateDelivery();
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    } catch (error) {
      console.error('Map initialization error:', error);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [is3DEnabled]);

  // Animate delivery truck along route
  const animateDelivery = useCallback(() => {
    let startTime = null;
    const duration = 60000; // 60 seconds for full animation

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setProgress(Math.round(progress * 100));

      // Update truck position
      const pointIndex = Math.floor(progress * (routeCoordinates.length - 1));
      const currentPoint = routeCoordinates[pointIndex];
      
      if (markerRef.current && currentPoint) {
        markerRef.current.setLngLat(currentPoint);
        setDriverLocation(currentPoint);
      }

      // Update route progress line
      if (map.current && map.current.getSource('route-progress')) {
        const progressCoords = routeCoordinates.slice(0, pointIndex + 1);
        map.current.getSource('route-progress').setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: progressCoords
          }
        });
      }

      // Update estimated time
      setEstimatedTime(Math.max(0, Math.round((1 - progress) * 25)));

      // Update step based on progress
      if (progress < 0.1) setCurrentStep(2);
      else if (progress < 0.9) setCurrentStep(3);
      else setCurrentStep(4);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [routeCoordinates]);

  // Toggle 3D view
  const toggle3D = () => {
    if (map.current) {
      const newPitch = is3DEnabled ? 0 : 60;
      map.current.easeTo({ pitch: newPitch, duration: 1000 });
      setIs3DEnabled(!is3DEnabled);
    }
  };

  // Center on truck
  const centerOnTruck = () => {
    if (map.current && driverLocation) {
      map.current.flyTo({
        center: driverLocation,
        zoom: 16,
        pitch: is3DEnabled ? 60 : 0,
        bearing: map.current.getBearing() + 30,
        duration: 1500
      });
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
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <FaTruck /> Suivi en temps réel
              </h1>
              <p className="text-emerald-100 text-sm">
                {delivery?.numeroLivraison || 'LIV-2024-001'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggle3D}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                is3DEnabled 
                  ? 'bg-white text-emerald-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              3D {is3DEnabled ? 'ON' : 'OFF'}
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
            ref={mapContainer} 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              width: '100%',
              height: '100%'
            }} 
          />
          
          {/* Progress overlay */}
          <div className="absolute bottom-4 left-4 right-4 lg:right-auto lg:w-80">
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
                    {estimatedTime > 0 ? `~${estimatedTime} min restantes` : 'Arrivée imminente!'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-emerald-600 font-medium">En direct</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Map style for truck animation */}
          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
            .truck-marker {
              cursor: pointer;
            }
            .mapboxgl-popup-content {
              padding: 12px 16px;
              border-radius: 12px;
              font-weight: 600;
            }
            .mapboxgl-map {
              width: 100% !important;
              height: 100% !important;
            }
            .mapboxgl-canvas {
              width: 100% !important;
              height: 100% !important;
            }
            .mapboxgl-canvas-container {
              width: 100% !important;
              height: 100% !important;
            }
          `}</style>
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
                        {isCompleted ? (
                          <FaCheckCircle />
                        ) : (
                          <StepIcon className={isCurrent ? 'animate-pulse' : ''} />
                        )}
                      </div>
                      {index < deliverySteps.length - 1 && (
                        <div className={`absolute left-5 top-10 w-0.5 h-6 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pt-2">
                      <p className={`font-medium ${
                        isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-emerald-600 mt-0.5">En cours...</p>
                      )}
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
                <p className="font-semibold text-gray-900">
                  {delivery?.livreur?.nom || 'Ahmed Ben Ali'}
                </p>
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
                <span className="font-mono font-medium">
                  {delivery?.commande?.numeroCommande || 'CMD-2024-045'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Montant</span>
                <span className="font-bold text-emerald-600">
                  {delivery?.commande?.montantTotal?.toFixed(2) || '156.50'} TND
                </span>
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
    </div>
  );
}
