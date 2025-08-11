import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    },
    hover: { scale: 1.03 }
  };

  // Status badge styling
  const getStatusStyle = (status) => {
    const base = "text-xs font-medium px-2 py-1 rounded-full";
    switch (status) {
      case 'Disponible': return `${base} bg-emerald-100 text-emerald-800`;
      case 'En Rupture': return `${base} bg-rose-100 text-rose-800`;
      case 'Archivé': return `${base} bg-gray-100 text-gray-800`;
      default: return `${base} bg-blue-100 text-blue-800`;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      {/* Image with hover zoom effect */}
      <div className="relative h-56 overflow-hidden group">
        <motion.img
          src={product.imageURL || '/placeholder-product.jpg'}
          alt={product.nom}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
        {/* Stock indicator */}
        {product.quantiteStock <= 5 && (
          <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            {product.quantiteStock === 0 ? 'Out of Stock' : `Only ${product.quantiteStock} left`}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
            {product.nom}
          </h3>
          <motion.span 
            className="text-xl font-extrabold text-blue-600 whitespace-nowrap ml-2"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            ${product.prix.toFixed(2)}
          </motion.span>
        </div>

        {/* Category and status */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
            {product.categorie?.nom || 'General'}
          </span>
          <span className={getStatusStyle(product.statutProduit)}>
            {product.statutProduit}
          </span>
        </div>

        {/* Description with fade effect */}
        <motion.p 
          className="text-gray-600 text-sm mb-5 line-clamp-3 flex-grow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {product.description}
        </motion.p>

        {/* Action buttons */}
        <div className="mt-auto flex space-x-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
          >
            Add to Cart
          </motion.button>
          <Link to={`/products/${product._id}`}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
            >
              Details
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;