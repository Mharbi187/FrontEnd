import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef(null);
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Category icons mapping
  const categoryIcons = {
    'all': '🛍️',
    'Electronique': '💻',
    'Vêtement': '👕',
    'Alimentation': '🍎',
    'Meuble': '🪑',
    'Fitness': '💪'
  };

  // Fetch categories with validation
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data?.success && Array.isArray(response.data.data)) {
        setCategories([{ _id: 'all', nom: 'Tous les Produits' }, ...response.data.data]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch products with pagination from backend
  const fetchProducts = async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    
    try {
      // Build query params
      const params = new URLSearchParams({
        page: pageNum,
        limit: PRODUCTS_PER_PAGE,
        sort: sortOption,
      });
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }
      
      if (priceRange[0] > 0) {
        params.append('minPrice', priceRange[0]);
      }
      
      if (priceRange[1] < 10000) {
        params.append('maxPrice', priceRange[1]);
      }

      const response = await api.get(`/produits?${params.toString()}`);
      
      if (response.data?.success) {
        if (append) {
          setProducts(prev => [...prev, ...response.data.data]);
        } else {
          setProducts(response.data.data);
        }
        setTotalProducts(response.data.total);
        setHasNextPage(response.data.hasNextPage);
        setPage(response.data.page);
      }
    } catch (err) {
      setError(err.message || 'Failed to load products');
      if (!append) setProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more products
  const loadMoreProducts = useCallback(() => {
    if (hasNextPage && !loadingMore) {
      fetchProducts(page + 1, true);
    }
  }, [hasNextPage, loadingMore, page, selectedCategory, debouncedSearch, sortOption, priceRange]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
  }, [selectedCategory, debouncedSearch, sortOption, priceRange]);

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasNextPage && !loadingMore && !loading) {
      loadMoreProducts();
    }
  }, [hasNextPage, loadingMore, loading, loadMoreProducts]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loaderRef.current) observer.observe(loaderRef.current);
    
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [handleObserver]);

  // Memoize category buttons to avoid re-renders
  const categoryButtons = useMemo(() => categories.map(cat => (
    <button
      key={cat._id}
      onClick={() => setSelectedCategory(cat._id)}
      className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
        selectedCategory === cat._id
          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
          : 'bg-white text-gray-700 hover:bg-emerald-50 shadow-md border border-gray-100'
      }`}
    >
      <span>{categoryIcons[cat.nom] || '📦'}</span>
      {cat.nom}
    </button>
  )), [categories, selectedCategory]);

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
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Erreur de Chargement</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={fetchProducts}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow duration-200"
        >
          🔄 Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white overflow-hidden">
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="text-center">
            <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
              🛒 Catalogue LIVRINI
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Notre Collection
            </h1>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Découvrez nos produits de qualité premium livrés directement chez vous
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8">
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
          </div>
        </div>

        {/* Wave decoration - simplified */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 fill-emerald-50">
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {categoryButtons}
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-gray-600 font-medium">
              {products.length} sur {totalProducts} produit{totalProducts !== 1 ? 's' : ''}
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
        {products.length > 0 ? (
          <div
            className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "flex flex-col gap-4"
            }
          >
            {products.map((product) => (
              <ProductCard 
                key={product._id}
                product={{
                  ...product,
                  prix: product.prix || 0,
                  quantiteStock: product.quantiteStock || 0,
                  statutProduit: product.statutProduit || 'Disponible',
                  imageURL: product.imageURL || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&h=300&fit=crop'
                }}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-20">
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
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                  >
                    Effacer la recherche
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow duration-200"
                >
                  Voir tous les produits
                </button>
              </div>
            </div>
          )
        )}

        {/* Infinite Scroll Loader */}
        <div ref={loaderRef} className="flex justify-center items-center py-8">
          {loadingMore && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-3 border-emerald-200 rounded-full animate-spin border-t-emerald-600"></div>
              <span className="text-gray-600">Chargement...</span>
            </div>
          )}
        </div>

        {/* Load More Button (fallback) */}
        {hasNextPage && !loadingMore && (
          <div className="flex justify-center mt-4">
            <button
              onClick={loadMoreProducts}
              className="px-6 py-3 bg-white border-2 border-emerald-500 text-emerald-600 rounded-xl font-medium hover:bg-emerald-50 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Charger plus ({totalProducts - products.length} restants)
            </button>
          </div>
        )}

        {/* Scroll to Top Button */}
        {products.length > PRODUCTS_PER_PAGE && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center justify-center z-50"
            aria-label="Scroll to top"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}

        {/* Quick Stats */}
        {products.length > 0 && (
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '📦', label: 'Produits Chargés', value: products.length },
              { icon: '🏷️', label: 'Total Disponible', value: totalProducts },
              { icon: '💰', label: 'Prix Min', value: products.length ? `${Math.min(...products.map(p => p.prix || 0))} TND` : '0 TND' },
              { icon: '⭐', label: 'Prix Max', value: products.length ? `${Math.max(...products.map(p => p.prix || 0))} TND` : '0 TND' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl p-4 text-center shadow-md border border-gray-100">
                <span className="text-2xl mb-2 block">{stat.icon}</span>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;