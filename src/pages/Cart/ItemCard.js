import React, { useState } from "react";
import { ImCross } from "react-icons/im";
import { useDispatch } from "react-redux";
import { removeCartItem } from "../../redux/actions/cartActions";
import ModalUpdateCart from "./ModalUpdateCart";
import { motion } from "framer-motion";

const ItemCard = ({ item, isFirstItem, onSelectItem, isSelected }) => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = () => {
    dispatch(removeCartItem(item.id));
  };

  // Format price with commas
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div>
      {/* Product Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={`w-full grid grid-cols-1 lg:grid-cols-5 mb-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 ${isHovered ? "border-blue-200 dark:border-blue-700" : ""
          } ${isSelected ? "border-blue-500 dark:border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800" : ""} transition-all duration-300`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Info - Mobile View */}
        <div className="p-4 flex lg:hidden items-center justify-between border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelectItem(item.id || item.productId)}
                className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out mr-3"
              />
              <div className="w-32 h-32 flex-shrink-0 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-700 shadow-md">
                <img
                  className="w-full h-full object-contain p-2"
                  src={item.image}
                  alt={item.productName}
                />
              </div>
            </div>
            <h1 className="font-medium text-gray-800 dark:text-gray-200">{item.productName}</h1>
          </div>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-300"
            aria-label="Remove item"
          >
            <ImCross size={12} />
          </button>
        </div>

        {/* Product Column */}
        <div className="hidden lg:flex col-span-1 items-center gap-4 p-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelectItem(item.id || item.productId)}
              className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
            />
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-300"
              aria-label="Remove item"
            >
              <ImCross size={12} />
            </button>
          </div>
          <div className="relative group">
            <div className="w-40 h-40 bg-white dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-all duration-300">
              <img
                className="w-full h-full object-contain p-2"
                src={item.image}
                alt={item.productName}
              />
            </div>
            {item.discount && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-bl-md rounded-tr-md">
                -{item.discount}%
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            <h1 className="font-medium text-gray-800 dark:text-gray-200">{item.productName}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {item.color && (
                <div className="flex items-center gap-1.5">
                  <span>Màu:</span>
                  <span
                    className="inline-block w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: item.color }}
                  ></span>
                </div>
              )}
              {item.size && (
                <div className="flex items-center gap-1.5">
                  <span>Size:</span>
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-600 font-medium">
                    {item.size}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden lg:flex col-span-1 items-center justify-center">
          {/* Empty column to match the header */}
        </div>

        {/* Price Column */}
        <div className="hidden lg:flex items-center justify-center p-4">
          <span className="font-medium text-gray-800 dark:text-gray-200">{formatPrice(item.totalPrice)} VNĐ</span>
        </div>

        {/* Quantity Column */}
        <div className="hidden lg:flex items-center justify-center p-4">
          <div className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-10 h-8 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 font-medium text-gray-800 dark:text-gray-200">
              {item.quantity}
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 text-sm bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium rounded-md transition-colors duration-300 shadow-sm"
            >
              Sửa
            </button>
          </div>
        </div>

        {/* Subtotal Column */}
        <div className="hidden lg:flex items-center justify-center p-4">
          <span className="font-bold text-gray-900 dark:text-gray-100">{formatPrice(item.totalPrice * item.quantity)} VNĐ</span>
        </div>

        {/* Mobile View Details */}
        <div className="p-4 lg:hidden">
          <div className="grid grid-cols-2 gap-3 text-sm border-t border-gray-100 dark:border-gray-700 pt-3">
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 dark:text-gray-400">Màu:</span>
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="text-gray-800 dark:text-gray-200 text-xs">{item.color}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 dark:text-gray-400">Size:</span>
              <span className="inline-flex bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-800 dark:text-gray-200">
                {item.size}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 dark:text-gray-400">Giá:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{formatPrice(item.totalPrice)} VNĐ</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 dark:text-gray-400">Số lượng:</span>
              <span className="inline-flex items-center justify-center w-8 h-6 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 font-medium text-xs text-gray-800 dark:text-gray-200">
                {item.quantity}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Tổng phụ:</span>
              <div className="font-bold text-gray-900 dark:text-gray-100">{formatPrice(item.totalPrice * item.quantity)} VNĐ</div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="py-2 px-4 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-300 shadow-sm"
            >
              Chỉnh sửa
            </button>
          </div>
        </div>
      </motion.div>

      {/* Update Modal */}
      {isModalOpen && (
        <ModalUpdateCart
          productId={item.productId}
          item={item}
          productDetail={item.productDetail}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ItemCard;
