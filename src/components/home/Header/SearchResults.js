import React from "react";
import { motion } from "framer-motion";
import { FaSearch, FaTimes, FaShoppingCart, FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SearchResults = ({
  showSearch,
  searchQuery,
  setSearchQuery,
  filteredProducts,
  setShowSearch,
  isLoading = false
}) => {
  const navigate = useNavigate();

  // Animation variants
  const searchContainerVariants = {
    hidden: { opacity: 0, y: -10, width: "0%" },
    visible: {
      opacity: 1,
      y: 0,
      width: "100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        width: { duration: 0.2 }
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      width: "0%",
      transition: { duration: 0.2 }
    }
  };

  const resultsVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 0.1
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    })
  };

  // Handle click on product
  const handleProductClick = (item) => {
    navigate(`/product/${item.id}`, { state: { item } });
    setSearchQuery("");
    setShowSearch(false);
  };

  // Handle add to cart
  const handleAddToCart = (e, item) => {
    e.stopPropagation();
    // Add to cart logic here
    console.log("Added to cart:", item);
  };

  // Handle add to wishlist
  const handleAddToWishlist = (e, item) => {
    e.stopPropagation();
    // Add to wishlist logic here
    console.log("Added to wishlist:", item);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setShowSearch(false);
  };

  // Format price with comma separators
  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <motion.div
      initial="hidden"
      animate={showSearch ? "visible" : "hidden"}
      exit="exit"
      variants={searchContainerVariants}
      className="absolute right-0 top-12 bg-white rounded-lg shadow-xl z-50 overflow-hidden w-full max-w-lg border border-gray-200"
    >
      {/* Search Input */}
      <div className="relative flex items-center border-b border-gray-200">
        <div className="flex items-center pl-4 text-gray-400">
          <FaSearch className="w-5 h-5" />
        </div>
        <input
          className="w-full py-4 px-4 outline-none text-gray-700 text-base placeholder-gray-400 bg-transparent"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          autoFocus
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="flex items-center justify-center mr-2 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Status */}
      {searchQuery && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {isLoading ? (
              "Đang tìm kiếm..."
            ) : (
              `Kết quả cho "${searchQuery}" (${filteredProducts.length})`
            )}
          </span>
          <a
            href={`/shop?search=${searchQuery}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/shop?search=${searchQuery}`);
              setShowSearch(false);
            }}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Xem tất cả
          </a>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Search Results */}
      {searchQuery && !isLoading && (
        <motion.div
          variants={resultsVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`max-h-[70vh] overflow-y-auto ${filteredProducts.length > 0 ? 'py-2' : 'py-0'}`}
        >
          {filteredProducts.length > 0 ? (
            <>
              {/* Grid Layout for Multiple Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 px-2">
                {filteredProducts.map((item, i) => (
                  <motion.div
                    key={item.id}
                    custom={i}
                    variants={itemVariants}
                    onClick={() => handleProductClick(item)}
                    className="bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-all duration-200 hover:shadow-md overflow-hidden cursor-pointer flex"
                  >
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-50 flex-shrink-0 overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        src={item.mainImage?.path || "https://via.placeholder.com/96"}
                        alt={item.productName}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 p-3 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800 text-sm line-clamp-1">
                          {item.productName}
                        </h3>
                        <p className="text-gray-500 text-xs line-clamp-1 mt-1">
                          {item.description || item.category?.name || "Sản phẩm"}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <p className="text-blue-600 font-semibold text-sm">
                          {formatPrice(item.price)} ₫
                        </p>

                        {/* Action Buttons */}
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => handleAddToWishlist(e, item)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            aria-label="Add to wishlist"
                          >
                            <FaHeart className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleAddToCart(e, item)}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                            aria-label="Add to cart"
                          >
                            <FaShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* View All Results Link */}
              <div className="mt-2 px-4 py-3 border-t border-gray-100 text-center">
                <button
                  onClick={() => {
                    navigate(`/shop?search=${searchQuery}`);
                    setShowSearch(false);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Xem tất cả {filteredProducts.length} sản phẩm
                </button>
              </div>
            </>
          ) : (
            <div className="py-12 px-4 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                <FaSearch className="w-6 h-6" />
              </div>
              <h3 className="text-gray-800 font-medium mb-1">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-500 text-sm mb-4">
                Không có kết quả nào cho "{searchQuery}". Vui lòng thử lại với từ khóa khác.
              </p>
              <div className="mt-2 space-y-2 max-w-xs mx-auto">
                <p className="text-xs text-gray-500 font-medium">GỢI Ý TÌM KIẾM</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => setSearchQuery("áo")}
                    className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-colors"
                  >
                    áo
                  </button>
                  <button
                    onClick={() => setSearchQuery("quần")}
                    className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-colors"
                  >
                    quần
                  </button>
                  <button
                    onClick={() => setSearchQuery("giày")}
                    className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-colors"
                  >
                    giày
                  </button>
                  <button
                    onClick={() => setSearchQuery("mũ")}
                    className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-colors"
                  >
                    mũ
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Recent Searches - When no query */}
      {!searchQuery && (
        <div className="py-3 px-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Tìm kiếm gần đây</h3>
            <button className="text-xs text-blue-600 hover:text-blue-800">Xóa</button>
          </div>
          <div className="mt-2 space-y-1">
            <button
              onClick={() => setSearchQuery("áo thun")}
              className="w-full flex items-center py-2 px-3 rounded-md hover:bg-gray-50 text-left transition-colors"
            >
              <FaSearch className="w-3 h-3 text-gray-400 mr-3" />
              <span className="text-gray-700 text-sm">áo thun</span>
            </button>
            <button
              onClick={() => setSearchQuery("quần jean nam")}
              className="w-full flex items-center py-2 px-3 rounded-md hover:bg-gray-50 text-left transition-colors"
            >
              <FaSearch className="w-3 h-3 text-gray-400 mr-3" />
              <span className="text-gray-700 text-sm">quần jean nam</span>
            </button>
            <button
              onClick={() => setSearchQuery("váy dạ hội")}
              className="w-full flex items-center py-2 px-3 rounded-md hover:bg-gray-50 text-left transition-colors"
            >
              <FaSearch className="w-3 h-3 text-gray-400 mr-3" />
              <span className="text-gray-700 text-sm">váy dạ hội</span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Danh mục phổ biến</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  navigate("/shop?category=ao-thun");
                  setShowSearch(false);
                }}
                className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-colors"
              >
                Áo thun
              </button>
              <button
                onClick={() => {
                  navigate("/shop?category=quan-jean");
                  setShowSearch(false);
                }}
                className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-colors"
              >
                Quần jean
              </button>
              <button
                onClick={() => {
                  navigate("/shop?category=giay-dep");
                  setShowSearch(false);
                }}
                className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-colors"
              >
                Giày dép
              </button>
              <button
                onClick={() => {
                  navigate("/shop?category=vay-dam");
                  setShowSearch(false);
                }}
                className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-colors"
              >
                Váy đầm
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SearchResults;
