import React from "react";
import Product from "../../home/Products/Product";

const ProductBanner = ({ products = [], loading }) => {
  // Đã chuyển phần chọn "Show:" ra ngoài component này (ở Shop.js)
  // Không cần state itemsPerPage ở đây nữa

  return (
    <div className="w-full relative">
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
                totalSold={product.sold || "0"}
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