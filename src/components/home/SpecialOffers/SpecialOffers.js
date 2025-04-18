import React, { useEffect, useState } from "react";
import Product from "../Products/Product";
import { useNavigate } from "react-router-dom";
import { fetchAllProductsOnSale } from "../../../redux/service/productService";
import Slider from "react-slick";
import SampleNextArrow from "../ButtonSlide/SampleNextArrow";
import SamplePrevArrow from "../ButtonSlide/SamplePrevArrow";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const SpecialOffers = () => {
  const [productsOnSale, setProductsOnSale] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "slider"
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Add a slight delay for smoother loading state
        const data = await fetchAllProductsOnSale();
        setProductsOnSale(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Slider settings
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1025,
        settings: { slidesToShow: 3, slidesToScroll: 1, infinite: true },
      },
      {
        breakpoint: 769,
        settings: { slidesToShow: 2, slidesToScroll: 1, infinite: true },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1, slidesToScroll: 1, infinite: true },
      },
    ],
  };

  // Enhanced loading state
  if (loading) {
    return (
      <div className="w-full pb-20">
        <h2 className="text-2xl font-bold text-center uppercase mb-8">
          Sản phẩm đang giảm giá
        </h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full h-12 w-12 bg-primeColor opacity-70 mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <div className="w-full pb-20">
        <h2 className="text-2xl font-bold text-center uppercase mb-8">
          Sản phẩm đang giảm giá
        </h2>
        <div className="flex justify-center">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md max-w-md text-center">
            <p className="font-medium">Không thể tải sản phẩm</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-600 font-medium py-1 px-3 rounded transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No products on sale
  if (productsOnSale.length === 0) {
    return (
      <div className="w-full pb-20">
        <h2 className="text-2xl font-bold text-center uppercase mb-8">
          Sản phẩm đang giảm giá
        </h2>
        <div className="text-gray-500 text-center py-10">
          <p>Hiện không có sản phẩm nào đang giảm giá.</p>
          <p>Vui lòng quay lại sau!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-20">
      <div className="mb-10 relative">
        <h2 className="text-2xl font-bold text-center uppercase relative inline-block">
          Sản phẩm đang giảm giá
          {/* <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-red-500"></span> */}
        </h2>
        <div className="absolute top-1/2 left-0 w-full border-t border-gray-200 -z-10"></div>
      </div>

      {/* View mode toggle buttons */}
      <div className="flex justify-center mb-8">
        <div className="flex border border-gray-300 rounded overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1 flex items-center ${viewMode === "grid" ? "bg-red-500 text-white" : "bg-white text-gray-700"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
     
          </button>
          <button
            onClick={() => setViewMode("slider")}
            className={`px-3 py-1 flex items-center ${viewMode === "slider" ? "bg-red-500 text-white" : "bg-white text-gray-700"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>

          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {productsOnSale.map((product) => (
            <div key={product.id} className="transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
              <Product
                id={product.id}
                img={product.mainImage?.path}
                secondaryImg={product.images[0]?.path}
                productName={product.productName}
                price={product.price}
                discountPrice= {product.discountPrice}
                colors={product.variants?.map((variant) => variant.color) || []}
                badge={product.newProduct ? "New" : "Sale"}
                rating={product.rate?.rating}
                totalRate={product.rate?.totalRate}
                totalSold="100"
              />
            </div>
          ))}
        </div>
      )}

      {/* Slider View */}
      {viewMode === "slider" && (
        <Slider {...settings}>
          {productsOnSale.map((product) => (
            <div key={product.id} className="px-2 pb-4">
              <div className="transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg rounded-lg">
                <Product
                  id={product.id}
                  img={product.mainImage?.path}
                  secondaryImg={product.images[0]?.path}
                  productName={product.productName}
                  price={product.price}
                  discountPrice= {product.discountPrice}
                  colors={product.variants?.map((variant) => variant.color) || []}
                  badge={product.newProduct ? "New" : "Sale"}
                  rating={product.rate?.rating}
                  totalRate={product.rate?.totalRate}
                  totalSold="100"
                />
              </div>
            </div>
          ))}
        </Slider>
      )}

      {/* View all button with enhanced styling */}
      <div className="flex justify-center mt-10">
        <button
          onClick={() => navigate("/shop", { state: { filter: "sale" } })}
          className="group relative overflow-hidden bg-primeColor text-white py-3 px-6 rounded-md font-medium"
        >
          <span className="absolute inset-0 w-0 bg-red-600 transition-all duration-300 ease-out group-hover:w-full"></span>
          <span className="relative flex items-center justify-center">
            Xem tất cả sản phẩm giảm giá
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

export default SpecialOffers;