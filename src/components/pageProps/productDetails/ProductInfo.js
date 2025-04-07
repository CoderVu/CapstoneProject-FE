import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart, FaBolt } from "react-icons/fa";
import { addToCartItems } from "../../../redux/actions/cartActions";
import BuyNowButton from "./BuyNowButton";

const ProductInfo = ({ productInfo, onImageClick }) => {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(
    productInfo?.variants?.[0]?.color || ""
  );
  const [selectedSize, setSelectedSize] = useState(
    productInfo?.variants?.[0]?.sizeName || ""
  );
  const [availableVariants, setAvailableVariants] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  // Khi productInfo thay đổi, cập nhật lại các biến state
  useEffect(() => {
    if (productInfo?.variants?.length > 0) {
      setSelectedColor(productInfo.variants[0].color || "");
      setSelectedSize(productInfo.variants[0].sizeName || "");
      setAvailableVariants(productInfo.variants);
      setQuantity(1);
    }
  }, [productInfo]);

  // Khi màu sắc thay đổi, cập nhật hình ảnh và đặt lại kích thước
  useEffect(() => {
    if (selectedColor) {
      const image = productInfo?.images?.find((img) => img.color === selectedColor);
      if (image) {
        onImageClick(image.path);
      }

      // Tìm các size có sẵn cho màu đã chọn
      const sizesForSelectedColor = productInfo?.variants
        ?.filter(variant => variant.color === selectedColor)
        ?.map(variant => variant.sizeName);

      if (sizesForSelectedColor?.length > 0) {
        // Nếu size hiện tại không có sẵn cho màu vừa chọn, chọn size đầu tiên có sẵn
        if (!sizesForSelectedColor.includes(selectedSize)) {
          setSelectedSize(sizesForSelectedColor[0]);
        }
      } else {
        setSelectedSize("");
      }
    }
  }, [selectedColor, productInfo, onImageClick]);

  // Khi kích thước thay đổi, đặt lại số lượng
  useEffect(() => {
    setQuantity(1);
  }, [selectedSize]);

  // Tìm variant phù hợp với màu sắc và kích thước đã chọn
  const selectedVariant = productInfo?.variants?.find(
    (variant) => variant.color === selectedColor && variant.sizeName === selectedSize
  );

  // Tính số lượng còn lại của variant đã chọn
  const stockQuantity = selectedVariant?.quantity || 0;

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
    if (!selectedColor || !selectedSize) {
      alert("Vui lòng chọn màu sắc và kích thước");
      return;
    }

    if (stockQuantity <= 0) {
      alert("Sản phẩm đã hết hàng");
      return;
    }

    try {
      setIsAdding(true);
      dispatch(addToCartItems(productInfo?.id, quantity, selectedSize, selectedColor));
      setTimeout(() => {
        setIsAdding(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to add product to cart:", error);
      setIsAdding(false);
    }
  };

  const increaseQuantity = () => {
    if (quantity < stockQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Lấy danh sách màu sắc có sẵn từ variants
  const availableColors = [...new Set(productInfo?.variants?.map((variant) => variant.color) || [])];

  // Lấy danh sách các kích thước có sẵn cho màu đã chọn
  const availableSizes = [...new Set(
    productInfo?.variants
      ?.filter(variant => variant.color === selectedColor)
      ?.map(variant => variant.sizeName) || []
  )];

  // Kiểm tra xem size có sẵn hàng không
  const isSizeAvailable = (sizeName) => {
    const variant = productInfo?.variants?.find(
      v => v.color === selectedColor && v.sizeName === sizeName
    );
    return variant && variant.quantity > 0;
  };

  // Handle color click to toggle selection
  const handleColorClick = (color) => {
    if (selectedColor === color) {
      setSelectedColor("");
      setSelectedSize("");
    } else {
      setSelectedColor(color);
    }
  };

  return (
    <div className="flex flex-col gap-y-4 border-b pb-4 rounded-lg">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">{productInfo?.productName}</h2>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex">{renderStars(productInfo?.rate?.rating || 0)}</div>
        <p className="text-gray-500 text-sm">
          ({productInfo?.rate?.totalRate || 0} đánh giá)
        </p>
      </div>

      {/* Giá sản phẩm */}
      <div className="flex items-center flex-wrap gap-2">
        <p className="text-red-600 text-2xl font-bold">
          {productInfo?.discountPrice?.toLocaleString()}đ
        </p>
        {productInfo?.price && productInfo?.discountPrice && productInfo.price !== productInfo.discountPrice && (
          <>
            <p className="text-gray-500 line-through">
              {productInfo?.price?.toLocaleString()}đ
            </p>
            <span className="bg-red-600 text-white px-2 py-1 text-sm font-bold rounded">
              -{Math.round(((productInfo.price - productInfo.discountPrice) / productInfo.price) * 100)}%
            </span>
          </>
        )}
      </div>

      <p className="text-base text-gray-600">{productInfo?.description}</p>

      {/* Màu sắc */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Màu sắc:</span>
        </div>
        <div className="flex gap-x-3 gap-y-2 mt-1 flex-wrap">
          {availableColors.map((color, index) => {
            // Kiểm tra xem màu này có còn hàng không
            const hasStock = productInfo?.variants?.some(
              variant => variant.color === color && variant.quantity > 0
            );

            return (
              <div
                key={index}
                className={`
                  cursor-pointer overflow-hidden rounded-full transition-all
                  ${hasStock ? "" : "opacity-40 cursor-not-allowed"}
                  ${selectedColor === color
                    ? "ring-2 ring-offset-1 ring-black scale-110"
                    : hasStock ? "hover:scale-105" : ""}
                `}
                onClick={() => hasStock && handleColorClick(color)}
                title={hasStock ? color : `${color} - Hết hàng`}
              >
                <div
                  className={`w-8 h-8 rounded-full ${selectedColor === color ? "border-2 border-black" : "border border-gray-300"}`}
                  style={{ backgroundColor: color }}
                ></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kích thước */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Kích thước:</span>
        </div>
        <div className="flex gap-x-2 gap-y-2 mt-1 flex-wrap">
          {availableSizes.map((sizeName, index) => {
            const isAvailable = isSizeAvailable(sizeName);
            return (
              <button
                key={index}
                className={`
                  px-3 py-1.5 border rounded-md text-sm transition-all
                  ${selectedSize === sizeName
                    ? "bg-gray-900 text-white border-gray-900"
                    : isAvailable
                      ? "border-gray-300 text-gray-800 hover:border-gray-500"
                      : "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"}
                `}
                onClick={() => isAvailable && setSelectedSize(sizeName)}
                disabled={!isAvailable}
                title={isAvailable ? sizeName : `${sizeName} - Hết hàng`}
              >
                {sizeName}
                {!isAvailable && <span className="ml-1">(Hết)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Số lượng */}
      <div className="space-y-2">
        <span className="font-medium text-gray-700">Số Lượng:</span>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
              className={`
                px-3 py-1.5 bg-gray-100 hover:bg-gray-200 transition-colors
                ${quantity <= 1 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              -
            </button>
            <span className="px-4 py-1.5 flex items-center justify-center min-w-[40px]">
              {quantity}
            </span>
            <button
              onClick={increaseQuantity}
              disabled={quantity >= stockQuantity}
              className={`
                px-3 py-1.5 bg-gray-100 hover:bg-gray-200 transition-colors
                ${quantity >= stockQuantity ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              +
            </button>
          </div>
        </div>

        {stockQuantity <= 5 && stockQuantity > 0 && (
          <p className="text-red-500 text-sm">Sắp hết hàng, nhanh tay đặt mua!</p>
        )}

        {stockQuantity === 0 && (
          <p className="text-red-500 text-sm">Đã hết hàng. Vui lòng chọn màu sắc hoặc kích thước khác.</p>
        )}
      </div>

      {/* Add to Cart and Buy Now Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-3">
        <button
          onClick={handleAddToCart}
          disabled={isAdding || !selectedColor || !selectedSize || stockQuantity === 0}
          className={`
            flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium
            ${isAdding ? 'bg-green-600 text-white' : 'bg-primeColor hover:bg-black duration-300 text-white'}
            ${(!selectedColor || !selectedSize || stockQuantity === 0) ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        >
          {isAdding ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đã thêm vào giỏ
            </>
          ) : (
            <>
              <FaShoppingCart />
              Thêm vào giỏ hàng
            </>
          )}
        </button>
        <button
          className={`
            flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium
            bg-black hover:bg-primeColor duration-300 text-white
            ${(!selectedColor || !selectedSize || stockQuantity === 0) ? 'opacity-60 cursor-not-allowed' : ''}
          `}
          disabled={!selectedColor || !selectedSize || stockQuantity === 0}
        >
          <FaBolt />

          <BuyNowButton
            productId={productInfo?.id}
            selectedSize={availableVariants.find(variant => variant.sizeName === selectedSize)}
            selectedColor={availableVariants.find(variant => variant.color === selectedColor)}
            quantity={quantity}
            productPrice={productInfo?.discountPrice}
            productName={productInfo?.productName}
            productImage={productInfo?.images?.[0]?.path}
            disabled={!selectedColor || !selectedSize || stockQuantity === 0}
          />

        </button>
      </div>

      {/* Thông tin thêm */}
      <div className="mt-4 text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
        <p>• Đổi trả miễn phí trong 30 ngày</p>
        <p>• Giao hàng miễn phí cho đơn hàng từ 500.000đ</p>
        <p>• Bảo hành chính hãng 12 tháng</p>
      </div>
    </div>
  );
};

export default ProductInfo;