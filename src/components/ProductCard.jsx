import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaEye, FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    },
    hover: { y: -8 }
  };

  // Status badge styling
  const getStatusStyle = (status) => {
    const base = "text-xs font-medium px-2.5 py-1 rounded-full";
    switch (status) {
      case 'Disponible': return `${base} bg-emerald-100 text-emerald-700`;
      case 'En Rupture': return `${base} bg-rose-100 text-rose-700`;
      case 'Archivé': return `${base} bg-gray-100 text-gray-700`;
      default: return `${base} bg-blue-100 text-blue-700`;
    }
  };

  // Add to cart functionality
  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item._id === product._id);
    
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success(`${product.nom} ajouté au panier!`);
    
    // Dispatch event for cart update
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Toggle wishlist - save to localStorage
  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (isWishlisted) {
      // Remove from wishlist
      const updatedWishlist = wishlist.filter(item => item._id !== product._id);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      toast.success('Retiré des favoris');
    } else {
      // Add to wishlist
      if (!wishlist.find(item => item._id === product._id)) {
        wishlist.push(product);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
      }
      toast.success('Ajouté aux favoris');
    }
    
    setIsWishlisted(!isWishlisted);
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  // Check if product is in wishlist on mount
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsWishlisted(wishlist.some(item => item._id === product._id));
  }, [product._id]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col h-full group"
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <motion.img
          src={product.imageURL || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&h=300&fit=crop'}
          alt={product.nom}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&h=300&fit=crop';
          }}
        />
        
        {/* Overlay Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={addToCart}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors"
          >
            <FaShoppingCart className="text-lg" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleWishlist}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              isWishlisted 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-red-500 hover:bg-red-500 hover:text-white'
            }`}
          >
            <FaHeart className="text-lg" />
          </motion.button>
          <Link to={`/products/${product._id}`}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
            >
              <FaEye className="text-lg" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Stock Badge */}
        {product.quantiteStock <= 5 && product.quantiteStock > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            Plus que {product.quantiteStock}!
          </div>
        )}
        
        {/* Out of Stock Badge */}
        {product.quantiteStock === 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            Rupture de stock
          </div>
        )}

        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            -{product.discount}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Category */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border border-blue-100">
            {product.categorie?.nom || 'Général'}
          </span>
          <span className={getStatusStyle(product.statutProduit)}>
            {product.statutProduit || 'Disponible'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {product.nom}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className={`text-sm ${i < (product.rating || 4) ? 'text-amber-400' : 'text-gray-200'}`} />
          ))}
          <span className="text-xs text-gray-500 ml-1">({product.reviews || 12})</span>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
          {product.description || 'Description du produit non disponible.'}
        </p>

        {/* Price and Cart Button */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div>
            {product.oldPrice && (
              <span className="text-sm text-gray-400 line-through">{product.oldPrice} TND</span>
            )}
            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {(product.prix || 0).toFixed(2)} <span className="text-sm">TND</span>
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addToCart}
            disabled={product.quantiteStock === 0}
            className={`px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg ${
              product.quantiteStock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-emerald-500/30'
            }`}
          >
            <FaShoppingCart />
            <span className="hidden sm:inline">Ajouter</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;