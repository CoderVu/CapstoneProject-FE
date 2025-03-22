import React, { useEffect, useState } from "react";
import { fetchProductViewed } from "../../../redux/service/productService";
import Product from "../Products/Product";

const ViewedProducts = () => {
  const [viewedProducts, setViewedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchViewedProducts = async () => {
      try {
        const data = await fetchProductViewed();
        setViewedProducts(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchViewedProducts();
  }, []);

  // Enhanced loading state
  if (loading) return (
    <div className="w-full h-40 flex justify-center items-center">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-t-primeColor border-b-gray-200 border-l-gray-200 border-r-gray-200 rounded-full animate-spin"></div>
        <p className="mt-3 text-sm text-gray-500">Đang tải sản phẩm đã xem...</p>
      </div>
    </div>
  );

  // Enhanced error state
  if (error) return (
    <div className="w-full py-8 flex justify-center items-center">
      <div className="p-4 bg-red-50 border border-red-200 rounded-md max-w-md">
        <p className="text-red-600 text-center">Lỗi khi tải sản phẩm đã xem: {error.message}</p>
        <div className="flex justify-center mt-3">
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-white bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
          >
            Thử lại
          </button>
        </div>
      </div>
    </div>
  );

  // If no viewed products
  if (!viewedProducts || viewedProducts.length === 0) return null;

  return (
    <div className="w-full pb-16">
      <div className="mb-8 relative">
        <h2 className="text-2xl font-bold text-center uppercase relative inline-block">
          Sản phẩm đã xem
          <div className="absolute left-1/2 bottom-0 w-20 h-1 bg-primeColor transform -translate-x-1/2 mt-1"></div>
        </h2>
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 -z-10 transform -translate-y-1/2"></div>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {viewedProducts.map((product) => (
          <div key={product.id} className="transform transition duration-300 hover:-translate-y-1 hover:shadow-lg">
            <Product
              id={product.id}
              img={product.mainImage?.path}
              secondaryImg={product.images[0]?.path}
              productName={product.productName}
              price={product.price}
              discountPrice="80"
              colors={product.variants?.map((variant) => variant.color) || []}
              badge={product.newProduct ? "New" : ""}
              rating={product.rate?.rating}
              totalRate={product.rate?.totalRate}
              totalSold="100"
            />
          </div>
        ))}
      </div>

      {/* Empty space filler cards for incomplete rows to maintain grid aesthetics */}
      {viewedProducts.length % 4 !== 0 && viewedProducts.length < 8 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Khám phá thêm sản phẩm để lưu vào danh sách đã xem
          </p>
          <button className="mt-4 bg-white border border-primeColor text-primeColor hover:bg-primeColor hover:text-white transition-colors duration-300 rounded-md px-6 py-2 text-sm">
            Khám phá thêm
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewedProducts;
