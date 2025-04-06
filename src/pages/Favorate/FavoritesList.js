import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaSearch, FaShoppingBag, FaTrash } from "react-icons/fa";
import Product from "../../components/home/Products/Product";
import { Link } from "react-router-dom";

const FavoritesList = ({ favoriteProducts, onRemoveFavorite }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [removingId, setRemovingId] = useState(null);

  // Filter products based on search term
  const filteredProducts = favoriteProducts?.filter(product =>
    product.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Handle remove with animation
  const handleRemoveWithAnimation = (productId) => {
    setRemovingId(productId);
    // Small delay for the animation to start before actually removing
    setTimeout(() => {
      onRemoveFavorite(productId);
      setRemovingId(null);
    }, 300);
  };

  // Empty state component
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm mt-4"
    >
      <div className="w-20 h-20 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 mb-6">
        <FaHeart className="text-red-500 text-4xl opacity-70" />
      </div>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
        Chưa có sản phẩm yêu thích nào
      </h3>

      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
        Hãy thêm sản phẩm vào danh sách yêu thích của bạn để dễ dàng theo dõi và mua sau này.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <FaSearch className="text-sm" />
          <span>Khám phá sản phẩm</span>
        </Link>

        <Link
          to="/cart"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <FaShoppingBag className="text-sm" />
          <span>Xem giỏ hàng</span>
        </Link>
      </div>
    </motion.div>
  );

  // Compact Search Bar
  const SearchBar = () => (
    <div className="flex justify-end mb-4">
      <div className="relative flex items-center max-w-xs bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="pl-3 pr-1 text-gray-500 dark:text-gray-400">
          <FaSearch className="text-xs" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm sản phẩm..."
          className="w-full py-1.5 px-1 text-sm bg-transparent focus:outline-none text-gray-700 dark:text-gray-200"
        />
      </div>
    </div>
  );

  if (!favoriteProducts || favoriteProducts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-2"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FaHeart className="text-red-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Sản phẩm yêu thích ({favoriteProducts.length})
            </h2>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Danh sách sản phẩm bạn đã đánh dấu là yêu thích
          </p>
        </div>

        <SearchBar />
      </motion.div>

      {filteredProducts.length === 0 && searchTerm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-6 text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm"
        >
          <p className="text-gray-600 dark:text-gray-400">
            Không tìm thấy sản phẩm nào phù hợp với "{searchTerm}"
          </p>
        </motion.div>
      )}

      <AnimatePresence>
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
        >
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: removingId === product.id ? 0 : 1,
                scale: removingId === product.id ? 0.8 : 1,
                y: removingId === product.id ? -20 : 0,
              }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full relative group"
            >
              <Product
                id={product.id}
                img={product.mainImage?.path}
                secondaryImg={product.images[0]?.path}
                productName={product.productName}
                price={product.price}
                discountPrice={product.discountPrice || null}
                colors={product.variants?.map((variant) => variant.color) || []}
                badge={product.newProduct ? "New" : ""}
                rating={product.rate?.rating || 0}
                totalRate={product.rate?.totalRate || 0}
                totalSold={product.totalSold || 0}
                isFavorite={true}
                onRemoveFavorite={handleRemoveWithAnimation}
              />

              {/* Quick remove button that appears on hover */}
              <motion.button
                initial={{ opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md z-30 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveWithAnimation(product.id);
                }}
                aria-label="Remove from favorites"
              >
                <FaTrash className="text-xs" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FavoritesList;