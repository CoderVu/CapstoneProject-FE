import React, { useState } from "react";
import Brand from "./shopBy/Brand";
import Category from "./shopBy/Category";
import Color from "./shopBy/Color";
import Price from "./shopBy/Price";
import { useDispatch } from "react-redux";
import { filterProduct } from "../../../redux/actions/productActions";

const ShopSideNav = ({ page, size, onFilterChange }) => {
  const [filters, setFilters] = useState({
    categoryProduct: "",
    brandProduct: "",
    priceMin: "",
    priceMax: "",
    colorProduct: "",
    sizeProduct: "",
  });

  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);

  const dispatch = useDispatch();

  // Handle change for filters
  const handleChange = (e) => {
    const newFilters = {
      ...filters,
      [e.target.name]: e.target.value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    dispatch(filterProduct({ ...newFilters, page, size }));
  };

  const handleClearFilters = () => {
    const resetFilters = {
      categoryProduct: "",
      brandProduct: "",
      priceMin: "",
      priceMax: "",
      colorProduct: "",
      sizeProduct: "",
    };
    setFilters(resetFilters);
    setSelectedBrand(null);
    setSelectedCategory(null);
    setSelectedColor(null);
    setSelectedPrice(null);
    onFilterChange(resetFilters);
    dispatch(filterProduct({ ...resetFilters, page, size }));
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <form>
        <Category
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onChange={handleChange}
        />
        <Color
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          onChange={handleChange}
        />
        <Brand
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          onChange={handleChange}
        />
        <Price
          selectedPrice={selectedPrice}
          setSelectedPrice={setSelectedPrice}
          onChange={handleChange}
        />
      </form>
      
      <button
        onClick={handleClearFilters}
        className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
      >
        Clear Filters
      </button>
    </div>
  );
};


export default ShopSideNav;
