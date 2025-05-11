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
      className="w-full py-8 flex justify-center items-center"
    >
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm max-w-md text-center">
        <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 mb-4">
          <FaHeart className="text-red-500 text-3xl opacity-70" />
        </div>

        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Chưa có sản phẩm yêu thích nào
        </h3>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Hãy thêm sản phẩm vào danh sách yêu thích của bạn để dễ dàng theo dõi và mua sau này.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primeColor hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            <FaSearch className="text-sm" />
            <span>Khám phá sản phẩm</span>
          </Link>

          <Link
            to="/cart"
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-primeColor font-medium rounded-md border border-primeColor hover:bg-primeColor hover:text-white transition-colors"
          >
            <FaShoppingBag className="text-sm" />
            <span>Xem giỏ hàng</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );

  // Compact Search Bar
  const SearchBar = () => (
    <div className="flex justify-end mb-4">
      <div className="relative flex items-center max-w-xs bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="pl-3 pr-1 text-gray-500 dark:text-gray-400">
          <FaSearch className="text-sm" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm sản phẩm..."
          className="w-full py-2 px-2 text-sm bg-transparent focus:outline-none text-gray-700 dark:text-gray-200"
        />
      </div>
    </div>
  );

  if (!favoriteProducts || favoriteProducts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="w-full pb-16">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <FaHeart className="text-red-500 text-xl" />
            <h2 className="text-2xl font-bold text-gray-800">
              Sản phẩm yêu thích ({favoriteProducts.length})
            </h2>
          </div>
          <SearchBar />
        </div>
      </div>

      {filteredProducts.length === 0 && searchTerm && (
        <div className="w-full py-8 flex justify-center items-center">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md max-w-md">
            <p className="text-gray-600 text-center">
              Không tìm thấy sản phẩm nào phù hợp với "{searchTerm}"
            </p>
          </div>
        </div>
      )}

      <AnimatePresence>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
              className="transform transition duration-300 hover:-translate-y-1 hover:shadow-lg relative group h-full"
            >
              <div className="h-full">
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
                  totalSold={product.sold || 0}
                  isFavorite={true}
                  onRemoveFavorite={handleRemoveWithAnimation}

                />
              </div>

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
        </div>
      </AnimatePresence>

      {/* Empty space filler */}
      {filteredProducts.length % 4 !== 0 && filteredProducts.length < 8 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Khám phá thêm sản phẩm để thêm vào danh sách yêu thích
          </p>
          <Link
            to="/"
            className="mt-4 inline-block bg-white border border-primeColor text-primeColor hover:bg-primeColor hover:text-white transition-colors duration-300 rounded-md px-6 py-2 text-sm"
          >
            Khám phá thêm
          </Link>
        </div>
      )}
    </div>
  );
};

export default FavoritesList;