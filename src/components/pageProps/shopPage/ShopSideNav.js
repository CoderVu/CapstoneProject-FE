import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Brand from "./Brand";
import Category from "./Category";
import Color from "./Color";
import Price from "./Price";

const ShopSideNav = ({ onFilterChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    categoryProduct: "",
    brandProduct: "",
    priceMin: "",
    priceMax: "",
    colorProduct: "",
    sizeProduct: "",
    ...initialFilters
  });

  const [selectedBrand, setSelectedBrand] = useState(initialFilters.brandProduct || null);
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.categoryProduct || null);
  const [selectedColor, setSelectedColor] = useState(initialFilters.colorProduct || null);
  const [selectedPrice, setSelectedPrice] = useState(
    initialFilters.priceMin || initialFilters.priceMax
      ? { priceMin: initialFilters.priceMin, priceMax: initialFilters.priceMax }
      : null
  );
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    color: true,
    brand: true,
    price: true,
  });

  // Update local state when initialFilters changes
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      setFilters(prev => ({
        ...prev,
        ...initialFilters
      }));

      if (initialFilters.categoryProduct) {
        setSelectedCategory(initialFilters.categoryProduct);
      }
      if (initialFilters.brandProduct) {
        setSelectedBrand(initialFilters.brandProduct);
      }
      if (initialFilters.colorProduct) {
        setSelectedColor(initialFilters.colorProduct);
      }
      if (initialFilters.priceMin || initialFilters.priceMax) {
        setSelectedPrice({
          priceMin: initialFilters.priceMin || "",
          priceMax: initialFilters.priceMax || ""
        });
      }
    }
  }, [initialFilters]);

  const handleChange = (e) => {
    if (e.target.name === "price") {
      const { priceMin, priceMax } = e.target.value;
      const newFilters = { ...filters, priceMin, priceMax };
      setFilters(newFilters);
      onFilterChange(newFilters);
    } else {
      const newFilters = { ...filters, [e.target.name]: e.target.value };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }
  };

  // const handleClearFilters = () => {
  //   const resetFilters = {
  //     categoryProduct: "",
  //     brandProduct: "",
  //     priceMin: "",
  //     priceMax: "",
  //     colorProduct: "",
  //     sizeProduct: "",
  //   };
  //   setFilters(resetFilters);
  //   setSelectedBrand(null);
  //   setSelectedCategory(null);
  //   setSelectedColor(null);
  //   setSelectedPrice(null);
  //   onFilterChange(resetFilters);
  // };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Check if any filter is applied
  const hasActiveFilters = Object.values(filters).some(value => value);

  const FilterSection = ({ title, section, icon, children }) => {
    return (
      <div className="border-b border-gray-200 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
        <button
          onClick={() => toggleSection(section)}
          className="flex justify-between items-center w-full text-left mb-3 group focus:outline-none"
        >
          <div className="flex items-center gap-2 font-medium text-gray-800">
            {icon}
            <span>{title}</span>
          </div>
          <div
            className={`transform transition-transform duration-200 ${
              expandedSections[section] ? 'rotate-180' : 'rotate-0'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-500 group-hover:text-blue-500 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        <motion.div
          initial={false}
          animate={{
            height: expandedSections[section] ? 'auto' : 0,
            opacity: expandedSections[section] ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col">
      <form className="space-y-1">
        <FilterSection
          title="Danh mục sản phẩm"
          section="category"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        >
          <Category
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onChange={handleChange}
          />
        </FilterSection>

        <FilterSection
          title="Màu sắc"
          section="color"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          }
        >
          <Color
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            onChange={handleChange}
          />
        </FilterSection>

        <FilterSection
          title="Thương hiệu"
          section="brand"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        >
          <Brand
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            onChange={handleChange}
          />
        </FilterSection>

        <FilterSection
          title="Giá"
          section="price"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        >
          <Price
            selectedPrice={selectedPrice}
            setSelectedPrice={setSelectedPrice}
            onChange={handleChange}
          />
        </FilterSection>
      </form>

      {hasActiveFilters ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mt-6"
        >
          {/* <button
            onClick={handleClearFilters}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all shadow-sm hover:shadow focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Xóa tất cả</span>
          </button> */}
        </motion.div>
      ) : (
        <div className="mt-6 py-3 px-4 bg-blue-50 border border-blue-100 rounded-lg text-center">
          <p className="text-sm text-blue-700">
            Chọn các bộ lọc để tìm sản phẩm
          </p>
        </div>
      )}
    </div>
  );
};

export default ShopSideNav;
