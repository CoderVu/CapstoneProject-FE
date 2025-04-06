import React, { useState } from "react";
import { ImCross } from "react-icons/im";
import { useDispatch } from "react-redux";
import { removeCartItem } from "../../redux/actions/cartActions";
import ModalUpdateCart from "./ModalUpdateCart";
import { motion } from "framer-motion";
import { FaRegCheckSquare, FaRegSquare, FaPen, FaExclamationCircle, FaHeart } from "react-icons/fa";

const ItemCard = ({ item, isFirstItem, onSelectItem, isSelected }) => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Check if the item is unavailable
  const isUnavailable = item.statusColor === "UNAVAILABLE" || item.statusSize === "UNAVAILABLE" || item.statusQuantity === "UNAVAILABLE";

  const handleDelete = () => {
    dispatch(removeCartItem(item.id || item.productId));
  };

  // Format price with commas
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg shadow-sm overflow-hidden border transition-all duration-200 ${
        isHovered ? "border-blue-200" : isSelected ? "border-blue-500 ring-1 ring-blue-200" : "border-gray-100"
      } ${isUnavailable ? "opacity-70" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-3">
        {/* Desktop View */}
        <div className="hidden md:flex items-center">
          {/* Checkbox */}
          <div className="flex-shrink-0 mr-3">
            <button
              onClick={() => !isUnavailable && onSelectItem(item.id || item.productId)}
              className={`flex items-center justify-center ${isUnavailable ? "cursor-not-allowed" : "cursor-pointer"}`}
              disabled={isUnavailable}
            >
              {isSelected ? (
                <FaRegCheckSquare className="text-xl text-blue-500" />
              ) : (
                <FaRegSquare className="text-xl text-gray-300" />
              )}
            </button>
          </div>

          {/* Product Image */}
          <div className="relative flex-shrink-0 mr-4">
            <div className="w-20 h-20 bg-gray-50 rounded-md overflow-hidden border border-gray-100">
              <img
                className="w-full h-full object-contain p-1"
                src={item.image}
                alt={item.productName}
              />
            </div>

            {/* Sale Tag */}
            {item.discount && !isUnavailable && (
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-bl-md">
                -{item.discount}%
              </div>
            )}

            {/* Unavailable Tag */}
            {isUnavailable && (
              <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center">
                <span className="text-white text-xs font-medium px-2 py-1 bg-red-500 rounded-sm inline-flex items-center">
                  <FaExclamationCircle className="mr-1" size={10} />
                  Hết hàng
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 line-clamp-1">{item.productName}</h3>

            <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500">
              {item.color && (
                <div className="flex items-center gap-1">
                  <span className="text-xs">Màu:</span>
                  <div className="flex items-center gap-1">
                    <span
                      className="inline-block w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className="text-xs">{item.color}</span>
                  </div>
                </div>
              )}

              {item.size && (
                <div className="flex items-center gap-1">
                  <span className="text-xs">Size:</span>
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 leading-none">
                    {item.size}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-medium">₫{formatPrice(item.totalPrice)}</span>
                {item.originalPrice && item.originalPrice > item.totalPrice && (
                  <span className="text-gray-400 text-xs line-through">₫{formatPrice(item.originalPrice)}</span>
                )}
              </div>

              <div className="flex items-center text-sm">
                <span className="text-gray-500 mr-2">SL: {item.quantity}</span>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-blue-500 hover:text-blue-600 p-1 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <FaPen size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 ml-4">
            {/* <button
              onClick={() => setIsModalOpen(true)}
              className="text-gray-500 hover:text-blue-500 transition-colors"
              title="Chỉnh sửa"
            >
              <FaPen size={14} />
            </button> */}
            <button
              onClick={handleDelete}
              className="text-gray-500 hover:text-red-500 transition-colors"
              title="Xóa"
            >
              <ImCross size={14} />
            </button>
            {/* <button className="text-gray-500 hover:text-red-500 transition-colors" title="Yêu thích">
              <FaHeart size={14} />
            </button> */}
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          {/* Header with checkbox and product name */}
          <div className="flex items-center mb-3">
            <button
              onClick={() => !isUnavailable && onSelectItem(item.id || item.productId)}
              className={`flex-shrink-0 mr-2 ${isUnavailable ? "cursor-not-allowed" : "cursor-pointer"}`}
              disabled={isUnavailable}
            >
              {isSelected ? (
                <FaRegCheckSquare className="text-lg text-blue-500" />
              ) : (
                <FaRegSquare className="text-lg text-gray-300" />
              )}
            </button>
            <h3 className="font-medium text-gray-800 text-sm line-clamp-1 flex-1">{item.productName}</h3>
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ImCross size={12} />
            </button>
          </div>

          {/* Content with image and info */}
          <div className="flex items-start">
            {/* Product Image */}
            <div className="relative flex-shrink-0 mr-3">
              <div className="w-20 h-20 bg-gray-50 rounded-md overflow-hidden border border-gray-100">
                <img
                  className="w-full h-full object-contain p-1"
                  src={item.image}
                  alt={item.productName}
                />
              </div>

              {/* Sale Tag */}
              {item.discount && !isUnavailable && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-2xs font-medium px-1 py-0.5 rounded-bl-md">
                  -{item.discount}%
                </div>
              )}

              {/* Unavailable Tag */}
              {isUnavailable && (
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center">
                  <span className="text-white text-2xs font-medium px-1.5 py-0.5 bg-red-500 rounded-sm inline-flex items-center">
                    Hết hàng
                  </span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2 mb-1.5 mt-1">
                {item.color && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>Màu:</span>
                    <div className="inline-flex items-center gap-1">
                      <span
                        className="inline-block w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: item.color }}
                      ></span>
                    </div>
                  </div>
                )}

                {item.size && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>Size:</span>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 leading-none">
                      {item.size}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <div className="text-red-500 font-medium">₫{formatPrice(item.totalPrice)}</div>
                  {item.originalPrice && item.originalPrice > item.totalPrice && (
                    <div className="text-gray-400 text-xs line-through">₫{formatPrice(item.originalPrice)}</div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs">SL: {item.quantity}</span>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-blue-500 p-1 bg-blue-50 rounded-full"
                  >
                    <FaPen size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promotion Info (Optional) */}
      {!isUnavailable && item.promotion && (
        <div className="bg-orange-50 py-2 px-3 text-xs text-orange-600 border-t border-orange-100">
          <div className="flex items-start">
            <span className="inline-block bg-orange-100 text-orange-600 p-0.5 rounded text-xs mr-1.5">Ưu đãi</span>
            <span>{item.promotion}</span>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {isModalOpen && (
        <ModalUpdateCart
          productId={item.productId}
          item={item}
          productDetail={item.productDetail}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </motion.div>
  );
};

export default ItemCard;
