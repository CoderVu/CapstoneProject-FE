import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { addToCartItems } from "../../../redux/actions/cartActions";

const ProductInfo = ({ productInfo, onImageClick }) => {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(
    productInfo?.variants?.[0]?.color || ""
  );
  const [selectedSize, setSelectedSize] = useState(
    productInfo?.variants?.[0]?.sizeName || ""
  );

  useEffect(() => {
    if (selectedColor) {
      const image = productInfo?.images?.find((img) => img.color === selectedColor);
      if (image) {
        onImageClick(image.path);
      }
    }
  }, [selectedColor, productInfo, onImageClick]);


  const selectedVariant = productInfo?.variants?.find(
    (variant) => variant.color === selectedColor && variant.sizeName === selectedSize
  );


  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-500" />);
      } else if (i - 0.5 === rating) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-500" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-400" />);
      }
    }
    return stars;
  };

  const handleAddToCart = async () => {
    try {
      dispatch(addToCartItems(productInfo?.id, quantity, selectedSize, selectedColor));
    } catch (error) {
      console.error("Failed to add product to cart:", error);
    }
  };

  const increaseQuantity = () => {
    if (quantity < (selectedVariant?.quantity || 0)) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="flex flex-col gap-y-4 border-b pb-4 border-radius-[10px]">
      <h2 className="text-3xl font-semibold">{productInfo?.productName}</h2>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex">{renderStars(productInfo?.rate?.rating || 0)}</div>
        <p className="text-gray-500 text-sm">({productInfo?.rate?.totalRate} đánh giá)</p>
      </div>

      {/* Giá sản phẩm */}
      <div className="flex items-center gap-2">
        <p className="text-red-600 text-2xl font-bold">{productInfo?.discountPrice}đ</p>
        <p className="text-gray-500 line-through">{productInfo?.price}đ</p>
        <span className="bg-red-600 text-white px-2 py-1 text-sm font-bold rounded">
          -{Math.round(((productInfo?.price - productInfo?.discountPrice) / productInfo?.price) * 100)}%
        </span>
      </div>

      <p className="text-base text-gray-600">{productInfo?.description}</p>
      <p className="text-sm text-gray-500">Be the first to leave a review.</p>

      {/* Colors */}
      <div className="font-medium text-base">
        <span className="font-normal">Màu Sắc :</span>
        <div className="flex gap-x-2 gap-y-2 mt-1 flex-wrap">
          {productInfo?.variants &&
            [...new Set(productInfo?.variants.map((variant) => variant.color))].map((color, index) => (
              <span
                key={index}
                className={`w-6 h-6 cursor-pointer ${selectedColor === color ? "border-2 border-black" : "border border-gray-300"
                  }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(selectedColor === color ? null : color)} // Nếu bấm lần nữa thì bỏ chọn
              ></span>
            ))}
        </div>
      </div>


      {/* Size */}
      <div className="font-medium text-base">
        <span className="font-normal">Kích Thước :</span>
        <div className="flex gap-x-2 gap-y-2 mt-1 flex-wrap">
          {Array.isArray(productInfo?.variants) &&
            [...new Set(productInfo?.variants.map((variant) => variant.sizeName))].map((sizeName, index) => (
              <span
                key={index}
                className={`px-3 py-1 border border-gray-300 rounded-md cursor-pointer ${selectedSize === sizeName ? "bg-gray-200" : ""
                  }`}
                onClick={() => setSelectedSize(sizeName)}
              >
                {sizeName}
              </span>
            ))}
        </div>
      </div>

      {/* Số lượng */}
      <div className="font-medium text-base">
        <span className="font-normal">Số Lượng :</span>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={decreaseQuantity}
            className="px-3 py-1 border border-gray-300 rounded-md"
          >
            -
          </button>
          <span className="px-3 py-1 border border-gray-300 rounded-md">
            {quantity}
          </span>
          <button
            onClick={increaseQuantity}
            className="px-3 py-1 border border-gray-300 rounded-md"
          >
            +
          </button>
          <span className="text-sm text-gray-500 ml-2">
            (Còn lại: {selectedVariant?.quantity || 0})
          </span>
        </div>
      </div>

      {/* Add to Cart and Buy Now Buttons */}
      <div className="flex gap-4 mt-2">
        <button
          onClick={handleAddToCart}
          className="flex-1 py-3 bg-primeColor hover:bg-black duration-300 text-white text-base font-titleFont"
        >
          Add to Cart
        </button>
        <button className="flex-1 py-3 bg-black hover:bg-primeColor duration-300 text-white text-base font-titleFont">
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductInfo;