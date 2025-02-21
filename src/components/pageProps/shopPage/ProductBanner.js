import React from "react";
import Product from "../../home/Products/Product";

const ProductBanner = ({ products = [], itemsPerPageFromBanner, loading }) => {
  return (
    <div className="w-full">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          {/* Sorting dropdown */}
          <div className="relative text-gray-700">
            <label className="mr-2">Sort by:</label>
            <select className="border py-1 px-4 cursor-pointer text-primeColor focus:border-primeColor">
              <option value="Best Sellers">Best Sellers</option>
              <option value="New Arrival">New Arrival</option>
              <option value="Featured">Featured</option>
              <option value="Final Offer">Final Offer</option>
            </select>
            <span className="absolute right-3 top-2.5 text-sm">
            
            </span>
          </div>
          {/* Items per page dropdown */}
          <div className="relative text-gray-700">
            <label className="mr-2">Show:</label>
            <select
              onChange={(e) => itemsPerPageFromBanner(parseInt(e.target.value, 10))}
              className="border py-1 px-4 cursor-pointer text-primeColor focus:border-primeColor"
            >
              {[12, 24, 36, 48, 60].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            <span className="absolute right-3 top-2.5 text-sm">
             
            </span>
          </div>
        </div>
      </div>

      {/* Product list */}
      {!loading && (
        <div className="grid grid-cols-4 gap-6">
          {products.map((product) => (
            <Product
              key={product.id}
              id={product.id}
              img={product.mainImage?.path}
              productName={product.productName}
              price={product.price}
              discountPrice="80"
              colors={product.variants.map((variant) => variant.color)}
              badge={product.newProduct ? "New" : ""}
              rating={product.rate?.rating}
              totalRate={product.rate?.totalRate}
              totalSold="100"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductBanner;