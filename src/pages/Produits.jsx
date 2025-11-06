import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';

const ProductPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ _id: 'all', nom: 'All Products' }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [sortOption, setSortOption] = useState('featured');

  // Enhanced API client with error handling
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  });

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
      
      setCategories([{ _id: 'all', nom: 'All Products' }, ...data]);
    } catch (err) {
      setError('Failed to load categories. Please refresh the page.');
    }
  };

  // Fetch products with validation
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = selectedCategory !== 'all' 
        ? `/produits?category=${selectedCategory}`
        : '/produits';
      
      const data = await fetchData(
        `${url}?t=${Date.now()}`,
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
  }, [selectedCategory]);

  // Memoized filtered and sorted products
  const processedProducts = React.useMemo(() => {
    const filtered = selectedCategory === 'all'
      ? products
      : products.filter(p => p.categorie?._id === selectedCategory);

    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'price-low': return (a.prix || 0) - (b.prix || 0);
        case 'price-high': return (b.prix || 0) - (a.prix || 0);
        case 'newest': 
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default: return 0;
      }
    });
  }, [products, selectedCategory, sortOption]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1, 
        when: "beforeChildren" 
      } 
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="text-red-500 text-center p-6 bg-red-50 rounded-lg max-w-md">
        <h3 className="text-xl font-bold mb-2">Error Loading Content</h3>
        <p>{error}</p>
      </div>
      <button
        onClick={fetchProducts}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Our Collection</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover premium products with exceptional quality
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map(cat => (
            <motion.button
              key={cat._id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                selectedCategory === cat._id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {cat.nom}
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {processedProducts.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {processedProducts.map((product) => (
            <ProductCard 
              key={product._id} 
              product={{
                ...product,
                // Ensure all required fields have defaults
                prix: product.prix || 0,
                quantiteStock: product.quantiteStock || 0,
                statutProduit: product.statutProduit || 'Disponible',
                imageURL: product.imageURL || '/placeholder-product.jpg'
              }} 
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <h3 className="text-xl font-medium text-gray-900 mb-3">No products found</h3>
          <button
            onClick={() => setSelectedCategory('all')}
            className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Show All Products
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ProductPage;