import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';

const PRODUCTS_PER_PAGE = 12;

const ProductPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ _id: 'all', nom: 'Tous les Produits' }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [sortOption, setSortOption] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  
  // Infinite scroll state
  const [displayedCount, setDisplayedCount] = useState(PRODUCTS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef(null);

  // Category icons mapping
  const categoryIcons = {
    'all': '🛍️',
    'Electronique': '💻',
    'Vêtement': '👕',
    'Alimentation': '🍎',
    'Meuble': '🪑',
    'Fitness': '💪'
  };

  // Unified data fetcher with proper validation
  const fetchData = async (url, validator) => {
    try {
      const response = await api.get(url);
      console.log('API Response:', response.data);
      
      if (!response.data?.success) {
        throw new Error('API request failed');
      }
      
      if (!validator(response.data.data)) {
        throw new Error('Invalid data format');
      }
      
      return response.data.data;
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
      throw err;
    }
  };

  // Fetch categories with validation
  const fetchCategories = async () => {
    try {
      const data = await fetchData(
        `/categories?t=${Date.now()}`,
        (data) => Array.isArray(data)
      );
      
      setCategories([{ _id: 'all', nom: 'Tous les Produits' }, ...data]);
    } catch (err) {
      setError('Failed to load categories. Please refresh the page.');
    }
  };

  // Fetch products with validation
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Always fetch all products, filter on frontend for better UX
      const data = await fetchData(
        `/produits?t=${Date.now()}`,
        (data) => Array.isArray(data)
      );
      console.log('Fetched Products:', data);
      
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(PRODUCTS_PER_PAGE);
  }, [selectedCategory, searchQuery, sortOption, priceRange]);

  // Memoized filtered and sorted products
  const processedProducts = React.useMemo(() => {
    let filtered = selectedCategory === 'all'
      ? products
      : products.filter(p => {
          // Handle both populated and non-populated category
          const catId = typeof p.categorie === 'object' ? p.categorie?._id : p.categorie;
          return catId === selectedCategory;
        });

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply price filter
    filtered = filtered.filter(p => 
      (p.prix || 0) >= priceRange[0] && (p.prix || 0) <= priceRange[1]
    );

    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'price-low': return (a.prix || 0) - (b.prix || 0);
        case 'price-high': return (b.prix || 0) - (a.prix || 0);
        case 'newest': 
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'name-az':
          return (a.nom || '').localeCompare(b.nom || '');
        case 'name-za':
          return (b.nom || '').localeCompare(a.nom || '');
        default: return 0;
      }
    });
  }, [products, selectedCategory, sortOption, searchQuery, priceRange]);

  // Get displayed products (for infinite scroll)
  const displayedProducts = React.useMemo(() => {
    return processedProducts.slice(0, displayedCount);
  }, [processedProducts, displayedCount]);

  const hasMoreProducts = displayedCount < processedProducts.length;

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMoreProducts && !loadingMore) {
      setLoadingMore(true);
      // Simulate loading delay for smooth UX
      setTimeout(() => {
        setDisplayedCount(prev => Math.min(prev + PRODUCTS_PER_PAGE, processedProducts.length));
        setLoadingMore(false);
      }, 300);
    }
  }, [hasMoreProducts, loadingMore, processedProducts.length]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loaderRef.current) observer.observe(loaderRef.current);
    
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [handleObserver]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.08, 
        when: "beforeChildren" 
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-emerald-200 rounded-full animate-spin border-t-emerald-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">📦</span>
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Chargement des produits...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col items-center justify-center gap-4 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md"
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Erreur de Chargement</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={fetchProducts}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
        >
          🔄 Réessayer
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#grid)"/>
          </svg>
        </div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
              🛒 Catalogue LIVRINI
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Notre Collection
            </h1>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Découvrez nos produits de qualité premium livrés directement chez vous
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mt-8"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-14 rounded-2xl bg-white/95 text-gray-900 placeholder-gray-500 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
              />
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 fill-emerald-50">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Category Pills */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-3 justify-center mb-8"
        >
          {categories.map(cat => (
            <motion.button
              key={cat._id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                selectedCategory === cat._id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-white text-gray-700 hover:bg-emerald-50 shadow-md border border-gray-100'
              }`}
            >
              <span>{categoryIcons[cat.nom] || '📦'}</span>
              {cat.nom}
            </motion.button>
          ))}
        </motion.div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-gray-600 font-medium">
              {displayedProducts.length} sur {processedProducts.length} produit{processedProducts.length !== 1 ? 's' : ''}
            </span>
            
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Trier par:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="featured">Recommandés</option>
                <option value="price-low">Prix: Croissant</option>
                <option value="price-high">Prix: Décroissant</option>
                <option value="newest">Plus Récents</option>
                <option value="name-az">Nom: A-Z</option>
                <option value="name-za">Nom: Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          {displayedProducts.length > 0 ? (
            <motion.div
              key="products"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-4"
              }
            >
              {displayedProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  variants={itemVariants}
                  layout
                >
                  <ProductCard 
                    product={{
                      ...product,
                      prix: product.prix || 0,
                      quantiteStock: product.quantiteStock || 0,
                      statutProduit: product.statutProduit || 'Disponible',
                      imageURL: product.imageURL || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&h=300&fit=crop'
                    }}
                    viewMode={viewMode}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucun produit trouvé</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? `Aucun résultat pour "${searchQuery}". Essayez d'autres termes de recherche.`
                  : 'Aucun produit disponible dans cette catégorie pour le moment.'
                }
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
                  >
                    Effacer la recherche
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                >
                  Voir tous les produits
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Infinite Scroll Loader */}
        {hasMoreProducts && (
          <div ref={loaderRef} className="flex justify-center items-center py-8">
            {loadingMore ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-3 border-emerald-200 rounded-full animate-spin border-t-emerald-600"></div>
                <span className="text-gray-600">Chargement...</span>
              </div>
            ) : (
              <div className="w-8 h-8 opacity-0"></div>
            )}
          </div>
        )}

        {/* Load More Button (fallback) */}
        {hasMoreProducts && !loadingMore && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setDisplayedCount(prev => Math.min(prev + PRODUCTS_PER_PAGE, processedProducts.length))}
              className="px-6 py-3 bg-white border-2 border-emerald-500 text-emerald-600 rounded-xl font-medium hover:bg-emerald-50 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Charger plus ({processedProducts.length - displayedCount} restants)
            </button>
          </div>
        )}

        {/* Scroll to Top Button */}
        {displayedCount > PRODUCTS_PER_PAGE && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </motion.button>
        )}

        {/* Quick Stats */}
        {processedProducts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { icon: '📦', label: 'Produits Disponibles', value: processedProducts.filter(p => p.quantiteStock > 0).length },
              { icon: '🏷️', label: 'Catégories', value: categories.length - 1 },
              { icon: '💰', label: 'Prix Min', value: `${Math.min(...processedProducts.map(p => p.prix || 0))} TND` },
              { icon: '⭐', label: 'Prix Max', value: `${Math.max(...processedProducts.map(p => p.prix || 0))} TND` },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl p-4 text-center shadow-md border border-gray-100">
                <span className="text-2xl mb-2 block">{stat.icon}</span>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;