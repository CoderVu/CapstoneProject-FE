import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import Product from "../Products/Product";
import SampleNextArrow from "../ButtonSlide/SampleNextArrow";
import SamplePrevArrow from "../ButtonSlide/SamplePrevArrow";
import { fetchProductByCollection } from "../../../redux/service/productService";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const BestSellers = ({ collectionId = "7760643a-f67b-4f99-bd52-01239864858b" }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await fetchProductByCollection(collectionId, 0, 20);
        // Process products to ensure we have proper image handling
        const processedProducts = data.response.map(product => ({
          ...product,
          // Ensure we have a valid mainImage
          mainImage: product.mainImage || { path: "https://via.placeholder.com/300x400?text=No+Image" },
          // Make sure images array exists and has at least one item
          images: product.images && product.images.length > 0
            ? product.images
            : [{ path: product.mainImage?.path || "https://via.placeholder.com/300x400?text=No+Image" }]
        }));
        setProducts(processedProducts);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [collectionId]);

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1025, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 769, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  // Enhanced loading state with responsive grid
  if (loading) {
    return (
      <div className="w-full pb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold uppercase inline-block relative">
            SẢN PHẨM NỔI BẬT
            <div className="w-full h-1 bg-gray-200 mt-2"></div>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-64 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <div className="w-full pb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold uppercase inline-block relative">
            SẢN PHẨM NỔI BẬT
            <div className="w-full h-1 bg-gray-200 mt-2"></div>
          </h2>
        </div>
        <div className="flex justify-center items-center py-10">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md text-center">
            <p className="text-yellow-700 font-medium mb-1">Không thể tải sản phẩm nổi bật</p>
            <p className="text-yellow-600 text-sm mb-3">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Tải lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No products found
  if (!products || products.length === 0) {
    return (
      <div className="w-full pb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold uppercase inline-block relative">
            SẢN PHẨM NỔI BẬT
            <div className="w-full h-1 bg-gray-200 mt-2"></div>
          </h2>
        </div>
        <div className="text-center text-gray-500 py-10">
          <p>Hiện chưa có sản phẩm nổi bật nào.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-16">
      {/* Enhanced header with badge and underline */}
      <div className="relative text-center mb-10">
        <div className="inline-block">
          <h2 className="text-2xl font-bold uppercase relative">
            SẢN PHẨM NỔI BẬT
            <span className="absolute -top-5 -right-12 bg-yellow-400 text-yellow-800 text-xs font-bold py-1 px-2 rounded-md transform rotate-12 shadow-sm">
              TOP
            </span>
          </h2>
          <div className="w-32 h-1 bg-yellow-400 mt-2 mx-auto"></div>
        </div>
      </div>

      {/* Product slider with enhanced styling */}
      <div className="px-1 relative">
        {/* Gold corner decoration */}
        <div className="absolute top-0 left-0 w-20 h-20 overflow-hidden">
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-yellow-400 transform rotate-45"></div>
        </div>

        <Slider {...settings}>
          {products.map((product) => (
            <div key={product.id} className="px-2 py-2">
              <div className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rounded-lg">
                <Product
                  id={product.id}
                  img={product.mainImage?.path || "https://via.placeholder.com/300x400?text=No+Image"}
                  // Use the same image for both primary and secondary if only one image exists
                  secondaryImg={
                    product.images && product.images.length > 0
                      ? product.images[0]?.path
                      : product.mainImage?.path || "https://via.placeholder.com/300x400?text=No+Image"
                  }
                  productName={product.productName || "Sản phẩm nổi bật"}
                  price={product.price || 0}
                  discountPrice={product.discountPrice || "0"}
                  colors={product.variants?.map((variant) => variant.color) || []}
                  badge={product.bestSeller ? "Best Seller" : "Top"}
                  rating={product.rate?.rating || 5}
                  totalRate={product.rate?.totalRate || 0}
                  totalSold={product.totalSold || "0"}
                />
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* View all button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => navigate("/shop", { state: { collection: collectionId } })}
          className="group relative bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-medium py-2 px-6 rounded-md overflow-hidden transition-colors duration-300"
        >
          <span className="relative flex items-center">
            Xem tất cả sản phẩm nổi bật
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

export default BestSellers;
