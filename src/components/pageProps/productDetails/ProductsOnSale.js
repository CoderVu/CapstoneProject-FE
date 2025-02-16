import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { getProductsOnSale } from "../../../redux/actions/productActions";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ProductsOnSale = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sliderRef = useRef(null); // Ref để truy cập slider
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    dispatch(getProductsOnSale());
  }, [dispatch]);

  const productsOnSale = useSelector((state) => state.product.productsOnSale);

  const handleProductClick = (productId) => {
    if (!isDragging) {
      navigate(`/product/${productId}`);
    }
  };

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  // Xử lý cuộn chuột
  const handleWheel = (event) => {
    if (!sliderRef.current) return;
    if (event.deltaY > 0) {
      sliderRef.current.slickNext(); 
    } else {
      sliderRef.current.slickPrev(); 
    }
  };

  // Xử lý sự kiện chuột
  const handleMouseDown = () => {
    setIsDragging(false);
  };

  const handleMouseMove = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="bg-white p-4 rounded-lg shadow-md"
      onWheel={handleWheel} 
    >
      <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
        🔥 Sản phẩm giảm giá
      </h3>
      <Slider
        ref={sliderRef}
        {...settings}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {productsOnSale.map((item) => {
          const discountPercentage = Math.round(((item.price - item.discountPrice) / item.price) * 100);

          return (
            <div
              key={item.id}
              className="relative bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
              onClick={() => handleProductClick(item.id)}
            >
              <img
                className="w-full h-40 object-cover"
                src={item.mainImage?.path || "https://via.placeholder.com/150"}
                alt={item.productName}
              />
              <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                -{discountPercentage}%
              </span>
              <div className="p-3">
                <h4 className="text-sm font-medium text-gray-900">{item.productName}</h4>
                <p className="text-xs text-gray-500">{item.brandName} - {item.categoryName}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-semibold text-red-500">{item.discountPrice}đ</span>
                  <span className="text-sm text-gray-500 line-through">{item.price}đ</span>
                </div>
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
};

export default ProductsOnSale;