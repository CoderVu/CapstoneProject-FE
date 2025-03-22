import React, { useState } from "react";
import { ImCross } from "react-icons/im";
import { useDispatch } from "react-redux";
import { removeCartItem } from "../../redux/actions/cartActions";
import ModalUpdateCart from "./ModalUpdateCart";
import { motion } from "framer-motion";

const ItemCard = ({ item, isFirstItem }) => {
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
      {/* Header row - only shown for first item */}
      {isFirstItem && (
        <div className="w-full h-14 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hidden lg:grid grid-cols-5 px-6 text-sm font-medium items-center rounded-t-lg border-b border-gray-200 dark:border-gray-700">
          <h2 className="col-span-2 pl-4">SẢN PHẨM</h2>
          <h2 className="text-center">GIÁ</h2>
          <h2 className="text-center">SỐ LƯỢNG</h2>
          <h2 className="text-center">TỔNG PHỤ</h2>
        </div>
      )}

      {/* Product Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={`w-full grid grid-cols-1 md:grid-cols-5 mb-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 ${
          isHovered ? "border-blue-200 dark:border-blue-700" : ""
        } transition-all duration-300`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Info - Mobile View */}
        <div className="p-4 flex md:hidden items-center justify-between border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img className="w-16 h-16 object-cover rounded-md border border-gray-200 dark:border-gray-600" src={item.image} alt={item.productName} />
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
        <div className="hidden md:flex col-span-2 items-center gap-4 p-4">
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-300"
            aria-label="Remove item"
          >
            <ImCross size={12} />
          </button>
          <div className="relative group">
            <img
              className="w-20 h-20 object-cover rounded-md border border-gray-200 dark:border-gray-600 transition-all duration-300 group-hover:shadow-md"
              src={item.image}
              alt={item.productName}
            />
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

        {/* Price Column */}
        <div className="hidden md:flex items-center justify-center p-4">
          <span className="font-medium text-gray-800 dark:text-gray-200">{formatPrice(item.totalPrice)} VNĐ</span>
        </div>

        {/* Quantity Column */}
        <div className="hidden md:flex items-center justify-center p-4">
          <span className="flex items-center justify-center w-10 h-8 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 font-medium text-gray-800 dark:text-gray-200">
            {item.quantity}
          </span>
        </div>

        {/* Subtotal Column */}
        <div className="hidden md:flex items-center justify-center p-4">
          <span className="font-bold text-gray-900 dark:text-gray-100">{formatPrice(item.totalPrice * item.quantity)} VNĐ</span>
        </div>

        {/* Mobile View Details */}
        <div className="p-4 md:hidden">
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

        {/* Edit button - Desktop */}
        <div className="hidden md:flex items-center justify-center p-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="py-2 px-4 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-300 shadow-sm"
          >
            Chỉnh sửa
          </button>
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
