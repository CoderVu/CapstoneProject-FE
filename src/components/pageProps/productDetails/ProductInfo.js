import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart, FaBolt } from "react-icons/fa";
import { addToCartItems } from "../../../redux/actions/cartActions";

const ProductInfo = ({ productInfo, onImageClick, getColorCode, getColorName, colors }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  const handleBuyNow = () => {
    if (!selectedColor || !selectedSize) {
      alert('Vui lòng chọn kích cỡ và màu sắc trước khi mua ngay!');
      return;
    }

    if (stockQuantity <= 0) {
      alert("Sản phẩm đã hết hàng");
      return;
    }

    // Create product order info object
    const productInfoForOrder = {
      productId: productInfo?.id,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity || 1,
      amount: productInfo?.discountPrice * (quantity || 1),
      productName: productInfo?.productName,
      productImage: productInfo?.images?.[0]?.path,
    };
    
    // Debug output
   // console.log('Buy Now Product Info:', productInfoForOrder);

    // Navigate to buy now page with product info
    navigate('/buy-now', { state: { product: productInfoForOrder } });
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
    <div className="flex flex-col gap-3">
      {/* Product Title */}
      <div className="space-y-2">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
          {productInfo?.productName}
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {renderStars(productInfo?.rate?.rating || 0)}
            <span className="ml-1 text-xs font-medium text-gray-700">
              {productInfo?.rate?.rating || 0}/5
            </span>
          </div>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-600">
            {productInfo?.rate?.totalRate || 0} đánh giá
          </span>
        </div>
      </div>

      {/* Price Section */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-3 border border-red-100">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold text-red-600">
            {productInfo?.discountPrice?.toLocaleString()}đ
          </span>
          {productInfo?.price && productInfo?.discountPrice && productInfo.price !== productInfo.discountPrice && (
            <>
              <span className="text-sm text-gray-500 line-through">
                {productInfo?.price?.toLocaleString()}đ
              </span>
              <span className="bg-red-600 text-white px-2 py-0.5 text-xs font-bold rounded-full shadow-lg">
                -{Math.round(((productInfo.price - productInfo.discountPrice) / productInfo.price) * 100)}%
              </span>
            </>
          )}
        </div>
        {productInfo?.price && productInfo?.discountPrice && productInfo.price !== productInfo.discountPrice && (
          <p className="text-xs text-gray-600 font-medium">
            Tiết kiệm {((productInfo.price - productInfo.discountPrice) / 1000).toFixed(0)}k
          </p>
        )}
      </div>

      {/* Description - Compact */}
      {productInfo?.description && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-900 mb-1 flex items-center gap-1">
            <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Mô tả
          </h3>
          <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{productInfo?.description}</p>
        </div>
      )}

      {/* Color Selection - Compact */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1">
            <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M5 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
            </svg>
            Màu sắc
          </h3>
          {selectedColor && (
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
              {selectedColor}
            </span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {availableColors.map((colorName, index) => {
            const hasStock = productInfo?.variants?.some(
              variant => variant.color === colorName && variant.quantity > 0
            );
            const colorCode = getColorCode ? getColorCode(colorName) : colorName;

            return (
              <button
                key={index}
                className={`
                  relative group transition-all duration-300
                  ${hasStock ? "" : "opacity-40 cursor-not-allowed"}
                  ${selectedColor === colorName
                    ? "ring-1 ring-offset-1 ring-blue-500 scale-110 shadow-lg"
                    : hasStock ? "hover:scale-105 hover:ring-1 hover:ring-offset-1 hover:ring-gray-300 hover:shadow-md" : ""}
                `}
                onClick={() => hasStock && handleColorClick(colorName)}
                disabled={!hasStock}
                title={hasStock ? colorName : `${colorName} - Hết hàng`}
              >
                <div
                  className="w-8 h-8 rounded-full border border-gray-200 shadow-sm transition-all duration-300"
                  style={{ backgroundColor: colorCode }}
                ></div>
                {selectedColor === colorName && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Selection - Compact */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1">
            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Kích thước
          </h3>
          {selectedSize && (
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
              {selectedSize}
            </span>
          )}
        </div>
        <div className="flex gap-1 flex-wrap">
          {availableSizes.map((sizeName, index) => {
            const isAvailable = isSizeAvailable(sizeName);
            return (
              <button
                key={index}
                className={`
                  px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300
                  ${selectedSize === sizeName
                    ? "bg-blue-600 text-white shadow-lg transform scale-105"
                    : isAvailable
                      ? "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200 hover:shadow-md"
                      : "bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed"}
                `}
                onClick={() => isAvailable && setSelectedSize(sizeName)}
                disabled={!isAvailable}
                title={isAvailable ? sizeName : `${sizeName} - Hết hàng`}
              >
                {sizeName}
                {!isAvailable && <span className="ml-0.5 text-xs">(Hết)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity Selection - Compact */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1">
            <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Số lượng
          </h3>
          <div className="text-xs text-gray-600">
            {stockQuantity > 0 ? (
              <span className="font-medium">Còn {stockQuantity}</span>
            ) : (
              <span className="text-red-600 font-medium">Hết hàng</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden shadow-sm">
            <button
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
              className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
              </svg>
            </button>
            <span className="px-3 py-1.5 text-sm font-bold min-w-[30px] text-center bg-white">
              {quantity}
            </span>
            <button
              onClick={increaseQuantity}
              disabled={quantity >= stockQuantity}
              className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
        {stockQuantity <= 5 && stockQuantity > 0 && (
          <div className="mt-1 p-1.5 bg-orange-50 border border-orange-200 rounded-md flex items-center gap-1">
            <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-orange-700 text-xs font-medium">Sắp hết hàng!</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleAddToCart}
          disabled={isAdding || !selectedColor || !selectedSize || stockQuantity === 0}
          className={`
            w-full py-3 px-4 rounded-lg font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group
            ${isAdding 
              ? 'bg-green-600 text-white shadow-lg' 
              : 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
            }
            ${(!selectedColor || !selectedSize || stockQuantity === 0) ? 'opacity-60 cursor-not-allowed hover:scale-100' : ''}
          `}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          {isAdding ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Đã thêm vào giỏ hàng</span>
            </>
          ) : (
            <>
              <div className="relative">
                <FaShoppingCart className="text-lg group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <span>Thêm vào giỏ hàng</span>
            </>
          )}
        </button>

        <button
          onClick={handleBuyNow}
          className={`
            w-full py-3 px-4 rounded-lg font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group
            bg-gradient-to-r from-gray-900 via-black to-gray-800 hover:from-black hover:via-gray-900 hover:to-black text-white shadow-lg hover:shadow-xl hover:scale-[1.02]
            ${(!selectedColor || !selectedSize || stockQuantity === 0) ? 'opacity-60 cursor-not-allowed hover:scale-100' : ''}
          `}
          disabled={!selectedColor || !selectedSize || stockQuantity === 0}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <div className="relative">
            <FaBolt className="text-lg group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
          <span>Mua Ngay</span>
        </button>

        {/* Quick info */}
        <div className="flex items-center justify-center gap-3 text-xs text-gray-500 mt-1">
          <div className="flex items-center gap-1">
            <svg className="w-2.5 h-2.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Giao nhanh</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-2.5 h-2.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>An toàn</span>
          </div>
        </div>
      </div>

      {/* Additional Info - Compact */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200">
        <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1">
          <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Thông tin bổ sung
        </h3>
        <div className="space-y-1 text-xs text-gray-700">
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-md shadow-sm">
            <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium">Đổi trả 30 ngày</span>
          </div>
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-md shadow-sm">
            <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium">Giao hàng từ 500k</span>
          </div>
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-md shadow-sm">
            <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium">Bảo hành 12 tháng</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;