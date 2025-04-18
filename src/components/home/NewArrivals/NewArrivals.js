import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import Product from "../Products/Product";
import { fetchProductByCollection } from "../../../redux/service/productService";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const NewArrivals = ({ collectionId = "078bde4d-daff-4d85-83f0-90461d036e22" }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "slider"
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await fetchProductByCollection(collectionId, 0, 20);
        setProducts(data.response);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [collectionId]);

  if (loading) return (
    <div className="w-full h-60 flex justify-center items-center">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-t-primeColor border-b-gray-200 border-l-gray-200 border-r-gray-200 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Đang tải sản phẩm mới...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="w-full py-10 flex justify-center items-center">
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Lỗi: {error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-white bg-red-500 px-3 py-1 rounded hover:bg-red-600"
        >
          Tải lại
        </button>
      </div>
    </div>
  );

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  return (
    <div className="w-full pb-16">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h2 className="text-2xl font-bold uppercase mb-4 md:mb-0 relative">
          SẢN PHẨM MỚI
          {/* <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-primeColor"></span> */}
        </h2>

        <div className="flex items-center space-x-4">
          <div className="flex border border-gray-300 rounded overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 flex items-center ${viewMode === "grid" ? "bg-primeColor text-white" : "bg-white text-gray-700"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
             
            </button>
            <button
              onClick={() => setViewMode("slider")}
              className={`px-3 py-1 flex items-center ${viewMode === "slider" ? "bg-primeColor text-white" : "bg-white text-gray-700"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
             
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <div key={product.id} className="transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
              <Product
                id={product.id}
                img={product.mainImage?.path}
                secondaryImg={product.images[0]?.path}
                productName={product.productName}
                price={product.price}
                discountPrice= {product.discountPrice}
                colors={product.variants?.map((variant) => variant.color) || []}
                badge={product.newProduct ? "New" : ""}
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
        <Slider {...sliderSettings}>
          {products.map((product) => (
            <div key={product.id} className="px-2">
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
        </Slider>
      )}

      {/* View All Button with improved styling */}
      <div className="flex justify-center mt-10">
        <button
          onClick={() => navigate("/shop")}
          className="group relative bg-primeColor text-white py-3 px-8 rounded-md overflow-hidden"
        >
          <span className="absolute w-0 h-full bg-black top-0 left-0 transition-all duration-300 group-hover:w-full"></span>
          <span className="relative z-10 flex items-center">
            Xem tất cả
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

export default NewArrivals;