import React, { useState, useEffect } from "react";
import { BsGridFill } from "react-icons/bs";
import { ImList } from "react-icons/im";
import { GoTriangleDown } from "react-icons/go";
import Product from "../../home/Products/Product";

const ProductBanner = ({ products = [], itemsPerPage, page, itemsPerPageFromBanner, onViewChange, loading }) => {
  const [gridViewActive, setGridViewActive] = useState(true);

  const handleGridViewClick = () => {
    console.log("Grid view clicked");
    setGridViewActive(true);
    onViewChange(true); // Notify parent about Grid view    
  };

  const handleListViewClick = () => {
    console.log("List view clicked");
    setGridViewActive(false);
    onViewChange(false); // Notify parent about List view
  };

  return (
    <div className="w-full">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span
            onClick={handleGridViewClick}
            className={`${gridViewActive
                ? "bg-primeColor text-white"
                : "border-[1px] border-gray-300 text-[#737373]"
              } w-8 h-8 text-lg flex items-center justify-center cursor-pointer`}
          >
            <BsGridFill />
          </span>
          <span
            onClick={handleListViewClick}
            className={`${!gridViewActive
                ? "bg-primeColor text-white"
                : "border-[1px] border-gray-300 text-[#737373]"
              } w-8 h-8 text-base flex items-center justify-center cursor-pointer`}
          >
            <ImList />
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-6 mt-4 md:mt-0">
          {/* Sorting dropdown */}
          <div className="flex items-center gap-2 text-base text-[#767676] relative">
            <label className="block">Sort by:</label>
            <select
              id="sort-options"
              className="w-32 md:w-52 border-[1px] border-gray-200 py-1 px-4 cursor-pointer text-primeColor text-base block dark:placeholder-gray-400 appearance-none focus-within:outline-none focus-visible:border-primeColor"
            >
              <option value="Best Sellers">Best Sellers</option>
              <option value="New Arrival">New Arrival</option>
              <option value="Featured">Featured</option>
              <option value="Final Offer">Final Offer</option>
            </select>
            <span className="absolute text-sm right-2 md:right-4 top-2.5">
              <GoTriangleDown />
            </span>
          </div>
          {/* Items per page dropdown */}
          <div className="flex items-center gap-2 text-[#767676] relative">
            <label className="block">Show:</label>
            <select
              onChange={(e) => {
                const value = parseInt(e.target.value, 10); // Chuyển đổi giá trị thành số
                itemsPerPageFromBanner(value); // Gọi hàm cập nhật giá trị
              }}
              id="items-per-page"
              className="w-16 md:w-20 border-[1px] border-gray-200 py-1 px-4 cursor-pointer text-primeColor text-base block dark:placeholder-gray-400 appearance-none focus-within:outline-none focus-visible:border-primeColor"
            >
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="36">36</option>
              <option value="48">48</option>
              <option value="60">60</option>
            </select>

            <span className="absolute text-sm right-3 top-2.5">
              <GoTriangleDown />
            </span>
          </div>
        </div>
      </div>

      {/* Product list */}
      {!loading && (
        <div
          className={`grid ${gridViewActive ? "grid-cols-3 gap-6" : "grid-cols-1 gap-4"
            }`}
        >
          {products.map((product) => (
            <Product
              key={product.id}
              id={product.id}
              img={product.mainImage?.path}
              productName={product.productName}
              price={product.price}
              discountPrice= "80"
              colors={product.variants.map((variant) => variant.color)}
              badge={product.newProduct ? "New" : ""}
              rating={product.rate?.rating} 
              totalRate={product.rate?.totalRate} 
              totalSold= "100"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductBanner;