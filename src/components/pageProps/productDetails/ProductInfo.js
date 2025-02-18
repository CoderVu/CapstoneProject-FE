import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../redux/orebiSlice";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductInfo = ({ productInfo, reviews, onImageClick }) => {
  const dispatch = useDispatch();
  const [selectedColor, setSelectedColor] = useState(
    productInfo?.variants?.[0]?.color || ""
  );
  const [selectedSize, setSelectedSize] = useState(
    productInfo?.variants?.[0]?.sizeName || ""
  );
  const [selectedImage, setSelectedImage] = useState(null);

  const selectedVariant = productInfo?.variants?.find(
    (variant) => variant.color === selectedColor && variant.sizeName === selectedSize
  );

  const handleImageClick = (imagePath) => {
    setSelectedImage(imagePath);
    onImageClick(imagePath);
  };

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

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: productInfo?.id,
        name: productInfo?.productName,
        quantity: 1,
        availableQuantity: selectedVariant?.quantity || 0,
        image: productInfo?.mainImage?.path,
        price: productInfo?.price,
        color: selectedColor,
        size: selectedSize,
      })
    );
    toast.success("Thêm vào giỏ hàng thành công!", {
      position: "top-right",
    });
  };

  return (
    <div className="flex flex-col gap-y-4">
      <ToastContainer />
      <h2 className="text-3xl font-semibold">{productInfo?.productName}</h2>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex">{renderStars(productInfo?.rate.rating || 0)}</div>
        <p className="text-gray-500 text-sm">({productInfo?.rate.totalRate} đánh giá)</p>
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
        <span className="font-normal">Colors:</span>
        <div className="flex gap-x-2 gap-y-2 mt-1 flex-wrap">
          {productInfo?.variants &&
            [...new Set(productInfo?.variants.map((variant) => variant.color))].map((color, index) => (
              <span
                key={index}
                className={`w-6 h-6 cursor-pointer ${selectedColor === color ? "border-2 border-black" : "border border-gray-300"
                  }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              ></span>
            ))}
        </div>
      </div>

      {/* Size */}
      <div className="font-medium text-base">
        <span className="font-normal">Size:</span>
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

      {/* Quantity */}
      <div className="font-medium text-base">
        <span className="font-normal">Quantity:</span>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-3 py-1 border border-gray-300 rounded-md">
            {selectedVariant?.quantity || 0} {/* Safely access quantity */}
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