import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Modal = ({ onClose, categories = [] }) => {
  const navigate = useNavigate();

  const handleFilterClick = (gender, categoryName) => {
    navigate("/shop", { state: { gender, categoryProduct: categoryName } });
    onClose();
  };

  // Các danh mục cố định
  const groupedCategories = [
    { title: "NAM", gender: "male", items: categories.map(c => c.name) },
    { title: "NỮ", gender: "female", items: categories.map(c => c.name) },
    { title: "TRẺ EM", gender: "kids", items: categories.map(c => c.name) },
    { title: "CHẤT LIỆU", gender: "material", items: categories.map(c => c.name) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="absolute left-1/3 transform -translate-x-1/2 top-full bg-white shadow-lg p-6 w-1/2 border border-gray-200 rounded-md z-50"
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={onClose}
    >
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
        <div className="grid grid-cols-3 gap-6">
          {groupedCategories.map(({ title, gender, items }) => (
            <div key={title}>
              <h3 className="font-bold text-lg border-b-2 border-black pb-1 mb-3">{title}</h3>
              <ul className="space-y-2">
                {items.length > 0 ? (
                  items.map((item) => (
                    <li
                      key={item}
                      className="text-gray-700 hover:text-black hover:underline cursor-pointer"
                      onClick={() => handleFilterClick(gender, item)}
                    >
                      {item}
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500">Không có sản phẩm</p>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Modal;