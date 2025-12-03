import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaTruck, FaMapMarkerAlt, FaPlay, FaPause, FaRedo } from 'react-icons/fa';

// Tunisia coordinates
const TUNIS_CENTER = [10.1815, 36.8065];
const WAREHOUSE = [10.1650, 36.8200];
const DESTINATION = [10.2100, 36.7900];

// Generate route
const generateRoute = (start, end, numPoints = 100) => {
  const route = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const curve = Math.sin(t * Math.PI) * 0.015;
    route.push([
      start[0] + (end[0] - start[0]) * t + curve,
      start[1] + (end[1] - start[1]) * t + curve * 0.5
    ]);
  }
  return route;
};

const routeCoordinates = generateRoute(WAREHOUSE, DESTINATION);

export default function MapDemo() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const animationRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [mapboxgl, setMapboxgl] = useState(null);

  // Load Mapbox dynamically
  useEffect(() => {
    const loadMapbox = async () => {
      try {
        const mapboxModule = await import('mapbox-gl');
        await import('mapbox-gl/dist/mapbox-gl.css');
        
        const mapbox = mapboxModule.default;
        mapbox.accessToken = 'pk.eyJ1IjoibWhhcmJpMTIzIiwiYSI6ImNtaXA0cmM4NzA4MTQzaHF2amZjc3o1OTMifQ.1hZhsyjSLuVaUzP10sZcpg';
        
        setMapboxgl(mapbox);
      } catch (err) {
        console.error('Failed to load Mapbox:', err);
        setError('Impossible de charger Mapbox. Veuillez désactiver votre bloqueur de publicités.');
      }
    };
    
    loadMapbox();
  }, []);

  // Initialize map when mapboxgl is loaded
  useEffect(() => {
    if (!mapboxgl || !mapContainer.current || mapRef.current) return;

    try {
      console.log('Initializing map...');
      
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: TUNIS_CENTER,
        zoom: 13,
        pitch: 50,
        bearing: -20
      });

      mapRef.current = map;

      map.on('error', (e) => {
        console.error('Map error:', e);
        setError(`Erreur carte: ${e.error?.message || 'Inconnue'}`);
      });

      map.on('load', () => {
        console.log('Map loaded successfully!');
        setMapLoaded(true);

        // Add 3D buildings
        try {
          const layers = map.getStyle().layers;
          const labelLayerId = layers?.find(
            (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
          )?.id;

          if (labelLayerId) {
            map.addLayer({
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
                'fill-extrusion-opacity': 0.7
              }
            }, labelLayerId);
          }
        } catch (e) {
          console.log('3D buildings not available:', e);
        }

        // Add route
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: routeCoordinates }
          }
        });

        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          paint: {
            'line-color': '#10b981',
            'line-width': 6,
            'line-opacity': 0.8
          }
        });

        // Progress line
        map.addSource('progress', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: [] }
          }
        });

        map.addLayer({
          id: 'progress-line',
          type: 'line',
          source: 'progress',
          paint: {
            'line-color': '#059669',
            'line-width': 8
          }
        });

        // Warehouse marker
        new mapboxgl.Marker({ color: '#f59e0b' })
          .setLngLat(WAREHOUSE)
          .setPopup(new mapboxgl.Popup().setHTML('<b>🏭 Entrepôt LIVRINI</b>'))
          .addTo(map);

        // Destination marker
        new mapboxgl.Marker({ color: '#10b981' })
          .setLngLat(DESTINATION)
          .setPopup(new mapboxgl.Popup().setHTML('<b>📍 Client</b>'))
          .addTo(map);

        // Truck marker
        const truckEl = document.createElement('div');
        truckEl.className = 'truck-marker';
        truckEl.innerHTML = `
          <div style="
            width: 50px; height: 50px;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 15px rgba(16,185,129,0.5);
            border: 3px solid white;
          ">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
          </div>
        `;

        markerRef.current = new mapboxgl.Marker({ element: truckEl })
          .setLngLat(routeCoordinates[0])
          .addTo(map);

        // Fit to route
        const bounds = new mapboxgl.LngLatBounds();
        routeCoordinates.forEach(coord => bounds.extend(coord));
        map.fitBounds(bounds, { padding: 80 });

        // Auto-start animation
        setTimeout(() => setIsPlaying(true), 1000);
      });

      // Navigation controls
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    } catch (err) {
      console.error('Map init error:', err);
      setError(`Erreur: ${err.message}`);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapboxgl]);

  // Animation
  useEffect(() => {
    if (!mapLoaded || !isPlaying || !mapRef.current) return;

    let startTime = null;
    const duration = 30000;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / duration, 1);

      setProgress(Math.round(t * 100));

      const pointIndex = Math.floor(t * (routeCoordinates.length - 1));
      const currentPoint = routeCoordinates[pointIndex];

      if (markerRef.current && currentPoint) {
        markerRef.current.setLngLat(currentPoint);
      }

      // Update progress line
      const progressSource = mapRef.current?.getSource('progress');
      if (progressSource) {
        progressSource.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates.slice(0, pointIndex + 1)
          }
        });
      }

      if (t < 1 && isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mapLoaded, isPlaying]);

  const resetAnimation = () => {
    setProgress(0);
    setIsPlaying(false);
    if (markerRef.current) markerRef.current.setLngLat(routeCoordinates[0]);
    const progressSource = mapRef.current?.getSource('progress');
    if (progressSource) {
      progressSource.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: [] }
      });
    }
    setTimeout(() => setIsPlaying(true), 100);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-white/20 rounded-lg transition">
              <FaArrowLeft />
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <FaTruck /> Démo Carte 3D
              </h1>
              <p className="text-sm text-emerald-100">Suivi de livraison en temps réel</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition"
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button
              onClick={resetAnimation}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition"
            >
              <FaRedo />
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative" style={{ height: 'calc(100vh - 140px)' }}>
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="text-center p-8">
              <FaMapMarkerAlt className="text-6xl text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">{error}</p>
              <p className="text-sm text-gray-500 mt-2">Vérifiez votre connexion internet</p>
            </div>
          </div>
        ) : (
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
        )}

        {/* Loading */}
        {!mapLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement de la carte...</p>
            </div>
          </div>
        )}

        {/* Progress overlay */}
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96">
          <div className="bg-white rounded-2xl shadow-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">Progression</span>
              <span className="text-2xl font-bold text-emerald-600">{progress}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-3 text-sm">
              <span className="text-gray-500">
                {progress < 100 ? `~${Math.round((100 - progress) * 0.3)} min restantes` : '✅ Livré!'}
              </span>
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                En direct
              </span>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="absolute top-4 left-4 space-y-2">
          <div className="bg-white rounded-xl shadow-lg p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              🏭
            </div>
            <div>
              <p className="text-xs text-gray-500">Départ</p>
              <p className="font-medium text-gray-900">Entrepôt LIVRINI</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              📍
            </div>
            <div>
              <p className="text-xs text-gray-500">Destination</p>
              <p className="font-medium text-gray-900">Client - Tunis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pulse animation style */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
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
  );
}
