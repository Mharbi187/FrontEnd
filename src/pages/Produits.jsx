import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const ProductPage = () => {
  const { category } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [sortOption, setSortOption] = useState('featured');

  // Sample product data with image URLs
  const products = [
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      price: 199.99,
      category: 'electronics',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      rating: 4.5,
      description: 'Noise-cancelling wireless headphones with 30-hour battery life.'
    },
    {
      id: 2,
      name: 'Organic Cotton T-Shirt',
      price: 29.99,
      category: 'clothing',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      rating: 4.2,
      description: '100% organic cotton, available in multiple colors.'
    },
    {
      id: 3,
      name: 'Stainless Steel Cookware Set',
      price: 249.99,
      category: 'home',
      image: 'https://images.unsplash.com/photo-1583778176476-4a8b02b64e00?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      rating: 4.8,
      description: '10-piece professional cookware set with copper core.'
    },
    {
      id: 4,
      name: 'Smart Fitness Watch',
      price: 159.99,
      category: 'electronics',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      rating: 4.3,
      description: 'Track your heart rate, sleep, and daily activities.'
    },
    {
      id: 5,
      name: 'Leather Wallet',
      price: 49.99,
      category: 'accessories',
      image: 'https://images.unsplash.com/photo-1591561954555-607968c989ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      rating: 4.0,
      description: 'Genuine leather wallet with RFID protection.'
    },
    {
      id: 6,
      name: 'Ceramic Plant Pots',
      price: 39.99,
      category: 'home',
      image: 'https://images.unsplash.com/photo-1519336056110-31a3964addf8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      rating: 4.6,
      description: 'Set of 3 ceramic pots with drainage system.'
    }
  ];

  // Filter and sort products
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch(sortOption) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      default: return 0; // 'featured' keeps original order
    }
  });

  // Available categories
  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'home', name: 'Home & Kitchen' },
    { id: 'accessories', name: 'Accessories' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Products</h1>
        <p className="text-gray-600">Discover our premium collection</p>
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex items-center">
          <label htmlFor="sort" className="mr-2 text-sm text-gray-600">Sort by:</label>
          <select
            id="sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedProducts.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <span className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{product.description}</p>
              <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedProducts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};

export default ProductPage;