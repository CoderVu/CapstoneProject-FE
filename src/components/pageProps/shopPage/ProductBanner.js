import React, { useState } from "react";
import Product from "../../home/Products/Product";

const ProductBanner = ({ products = [], itemsPerPageFromBanner, loading }) => {
  const [itemsPerPage, setItemsPerPage] = useState(12); // Default items per page

  const totalPages = Math.ceil(products.length / itemsPerPage); // Calculate total pages

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    itemsPerPageFromBanner(value);
  };

  return (
    <div className="w-full relative">
      {/* Items per page and total pages */}
      <div className="absolute -top-10 right-0 flex items-center gap-4 z-10 bg-white p-2 rounded-md shadow-md"> 
    
        <div className="flex items-center gap-2">
          <label className="text-gray-700">Show:</label>
          <select
            onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value, 10))}
            className="border py-1 px-4 cursor-pointer text-primeColor focus:border-primeColor"
          >
            {[12, 24, 36, 48, 60].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product list */}
      {!loading ? (
        products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-y-0 mt-10">
            {products.map((product) => (
              <Product
                key={product.id}
                id={product.id}
                type={product.type}
                img={product.mainImage?.path}
                secondaryImg={product.images[0]?.path}
                productName={product.productName}
                price={product.price}
                discountPrice={product.discountPrice}
                colors={product.variants.map((variant) => variant.color)}
                badge={product.newProduct ? "New" : ""}
                rating={product.rate?.rating}
                totalRate={product.rate?.totalRate}
                totalSold="100"
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-32 text-gray-500">
            No products found.
          </div>
        )
      ) : (
        <div className="flex justify-center items-center h-32">Loading...</div>
      )}
    </div>
  );
};

export default ProductBanner;