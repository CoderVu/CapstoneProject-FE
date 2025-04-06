import React from "react";
import { useSelector } from "react-redux";
import Slider from "react-slick";
import Product from "../../home/Products/Product";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SampleNextArrow from "../../home/ButtonSlide/SampleNextArrow";
import SamplePrevArrow from "../../home/ButtonSlide/SamplePrevArrow";
import { Link } from "react-router-dom";

const ProductRelated = ({ limit, compact = false, showTitle = true }) => {
  const productRelated = useSelector((state) => state.productRelated.productRelated);
  const data = productRelated?.response;

  if (!data || data.length === 0) {
    return null;
  }

  // Lọc dữ liệu dựa vào limit nếu được cung cấp
  const limitedData = limit ? data.slice(0, limit) : data;

  // Thiết lập Slider khác nhau cho chế độ compact và đầy đủ
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: compact ? 2 : 4,
    slidesToScroll: 1,
    arrows: !compact, // Ẩn mũi tên trong chế độ compact
    // dots: compact, // Hiển thị dots trong chế độ compact
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: compact ? 2 : 3,
          slidesToScroll: 1
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: compact ? 1 : 2,
          slidesToScroll: 1,
          dots: true
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
          arrows: false
        },
      },
    ],
  };

  // Component Product nhỏ gọn hơn cho hiển thị trong Cart
  const CompactProduct = ({ product }) => (
    <Link to={`/product/${product.id}`} className="block group">
      <div className="relative bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-blue-200 transition-all duration-300 h-full">
        <div className="relative pt-[100%] overflow-hidden">
          <img
            src={product.mainImage?.path}
            alt={product.productName}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.newProduct && (
            <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded">
              Mới
            </span>
          )}
        </div>
        <div className="p-2">
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-10 mb-1">
            {product.productName}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-red-500 text-sm font-medium">
              {product.price.toLocaleString()} ₫
            </span>
            {product.rate?.rating > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-3 h-3 text-yellow-400 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                {product.rate?.rating}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="w-full">
      {showTitle && (
        <h2 className={`font-${compact ? 'medium' : 'bold'} ${compact ? 'text-lg' : 'text-2xl'} ${compact ? '' : 'text-center'} ${compact ? 'mb-4' : 'uppercase mb-8'}`}>
          Sản phẩm liên quan
        </h2>
      )}

      {compact ? (
        // Hiển thị trong chế độ compact (dành cho sidebar)
        <div>
          {limitedData.length <= 2 ? (
            // Nếu chỉ có 1-2 sản phẩm, hiển thị grid
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {limitedData.map((product) => (
                <div key={product.id}>
                  <CompactProduct product={product} />
                </div>
              ))}
            </div>
          ) : (
            // Nếu có nhiều hơn 2 sản phẩm, hiển thị slider
            <Slider {...settings}>
              {limitedData.map((product) => (
                <div key={product.id} className="px-1.5 pb-1">
                  <CompactProduct product={product} />
                </div>
              ))}
            </Slider>
          )}
        </div>
      ) : (
        // Hiển thị đầy đủ (dành cho trang sản phẩm)
        <Slider {...settings}>
          {limitedData.map((product) => (
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

      {compact && limitedData.length > 0 && (
        <div className="mt-3 text-center">
          <Link to="/shop" className="text-blue-500 hover:text-blue-600 text-sm">
            Xem tất cả
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductRelated;
