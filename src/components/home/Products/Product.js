import React, { useState } from "react";
import { FaStar, FaRegStar, FaShoppingCart, FaEye, FaHeart, FaRegHeart } from "react-icons/fa";
import Image from "../../designLayouts/Image";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";

// Reusable rating stars component
const RatingStars = ({ rating, size = "sm", showCount = true, totalRate }) => {
  return (
    <div className="flex items-center">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, index) =>
          index < Math.floor(rating) ? (
            <FaStar
              key={index}
              className={`text-yellow-400 ${size === "sm" ? "text-xs" : "text-sm"}`}
            />
          ) : (
            <FaRegStar
              key={index}
              className={`text-gray-300 ${size === "sm" ? "text-xs" : "text-sm"}`}
            />
          )
        )}
      </div>
      {showCount && totalRate > 0 && (
        <span className="ml-1.5 text-xs text-gray-500">({totalRate})</span>
      )}
    </div>
  );
};

// Format price with thousands separator
const formatPrice = (price) => {
  if (!price) return "0";
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const Product = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleProductDetails = () => {
    navigate(`/product/${props.id}`, {
      state: {
        item: props,
      },
    });
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // Add logic to handle favorites in Redux if needed
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    // Add your cart logic here
    // dispatch(addToCart({...}));
  };

  // Calculate discount percentage
  const discountPercentage =
    props.price && props.discountPrice
      ? Math.round(((props.price - props.discountPrice) / props.price) * 100)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
      onClick={handleProductDetails}
    >
      {/* Product Image Container */}
      <div
        className="relative overflow-hidden aspect-[3/4]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          animate={{
            scale: isHovered ? 1.05 : 1
          }}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
        >
          <Image
            className="w-full h-full object-cover"
            imgSrc={isHovered && props.secondaryImg ? props.secondaryImg : props.img}
            alt={props.productName}
          />
        </motion.div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {props.badge && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              New
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10">
          {discountPercentage > 0 && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 z-20 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? (
            <FaHeart className="text-red-500 text-sm" />
          ) : (
            <FaRegHeart className="text-gray-600 dark:text-gray-300 text-sm hover:text-red-500 transition-colors" />
          )}
        </button>

        {/* Overlay Actions */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-4 transform transition-all duration-300 ${
            isHovered ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 text-xs font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center justify-center gap-1"
            >
              <FaShoppingCart className="text-xs" />
              <span>Thêm vào giỏ</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleProductDetails}
              className="flex-1 bg-blue-600 text-white py-2 text-xs font-medium rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-1"
            >
              <FaEye className="text-xs" />
              <span>Xem chi tiết</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col gap-2">
        {/* Product Name */}
        <h2
          className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          title={props.productName}
        >
          {props.productName}
        </h2>

        {/* Colors */}
        {props.colors && props.colors.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            {[...new Set(props.colors)].slice(0, 4).map((color, index) => (
              <span
                key={index}
                className="inline-block w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: color }}
                title={color}
              ></span>
            ))}
            {new Set(props.colors).size > 4 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{new Set(props.colors).size - 4}
              </span>
            )}
          </div>
        )}

        {/* Rating Stars */}
        <div className="mt-1">
          <RatingStars rating={props.rating} totalRate={props.totalRate} />
        </div>

        {/* Price & Sale */}
        <div className="mt-1 flex items-baseline gap-2">
          {props.discountPrice ? (
            <>
              <span className="text-xs text-gray-400 line-through font-normal">
                {formatPrice(props.price)}đ
              </span>
              <span className="text-sm font-bold text-red-600 dark:text-red-500">
                {formatPrice(props.discountPrice)}đ
              </span>
            </>
          ) : (
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {formatPrice(props.price)}đ
            </span>
          )}
        </div>

        {/* Sales Info */}
        {props.totalSold > 0 && (
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Đã bán: {props.totalSold}
            </span>

            {/* Progress bar if item is hot selling (optional) */}
            {props.totalSold > 50 && (
              <div className="w-1/2 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-yellow-400 h-1.5 rounded-full"
                  style={{ width: `${Math.min(props.totalSold / 2, 100)}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Product;