import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';

// Create axios instance with cache-busting
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
});

const ProductPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ _id: 'all', nom: 'All Products' }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [sortOption, setSortOption] = useState('featured');

  // Fetch categories with cache-busting timestamp
  const fetchCategories = async () => {
    try {
      const response = await api.get(`/categories?t=${Date.now()}`);
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setCategories([{ _id: 'all', nom: 'All Products' }, ...response.data.data]);
      } else {
        throw new Error('Invalid categories data format');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
    }
  };

  // Fetch products with cache-busting timestamp
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = selectedCategory !== 'all' 
        ? `/produits?category=${selectedCategory}&t=${Date.now()}`
        : `/produits?t=${Date.now()}`;
      
      const response = await api.get(url);
      
      if (response.data && response.data.success) {
        setProducts(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        throw new Error('Invalid products data format');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
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

  // Filter and sort products
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.categorie?._id === selectedCategory);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'price-low': return (a.prix || 0) - (b.prix || 0);
      case 'price-high': return (b.prix || 0) - (a.prix || 0);
      case 'newest': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      default: return 0;
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-red-500 text-center p-6 bg-red-50 rounded-lg max-w-md">
        <h3 className="text-xl font-bold mb-2">Error Loading Products</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Our Collection</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover premium products with exceptional quality and design
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6"
      >
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <motion.button
              key={cat._id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat._id
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
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
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </motion.div>

      {sortedProducts.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {sortedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <h3 className="text-2xl font-medium text-gray-900 mb-3">No products found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your filters or check back later</p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Show All Products
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ProductPage;