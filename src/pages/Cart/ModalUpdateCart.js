import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProductDetail } from "../../redux/actions/productActions";
import { updateCartItem } from "../../redux/actions/cartActions";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaMinus, FaPlus, FaExclamationCircle } from "react-icons/fa";

const ModalUpdateCart = ({ productId, item, onClose }) => {
    const dispatch = useDispatch();
    const productDetail = useSelector((state) => state.productDetail.productDetail);

    const [selectedColor, setSelectedColor] = useState(item.color);
    const [selectedSize, setSelectedSize] = useState(item.size);
    const [quantity, setQuantity] = useState(item.quantity);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Theo dõi tất cả các kết hợp màu và kích cỡ có sẵn
    const [availableCombinations, setAvailableCombinations] = useState({});

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                setLoading(true);
                await dispatch(getProductDetail(productId));
                setLoading(false);
            } catch (err) {
                setError("Không thể tải thông tin sản phẩm");
                setLoading(false);
            }
        };

        fetchProductDetail();
    }, [dispatch, productId]);

    // Khi productDetail thay đổi, tạo bảng tra cứu các kết hợp có sẵn
    useEffect(() => {
        if (productDetail && productDetail.variants) {
            const combinations = {};

            productDetail.variants.forEach(variant => {
                if (!combinations[variant.color]) {
                    combinations[variant.color] = {};
                }
                combinations[variant.color][variant.sizeName] = variant.status === "AVAILABLE";
            });

            setAvailableCombinations(combinations);
        }
    }, [productDetail]);

    // Get available sizes and colors from product detail
    const availableSizes = productDetail
        ? [...new Set(
            productDetail.variants?.map((variant) => variant.sizeName)
          )]
        : [];

    const availableColors = productDetail
        ? [...new Set(
            productDetail.variants?.map((variant) => variant.color) || []
          )]
        : [];

    // Kiểm tra nếu size hiện tại có sẵn với màu đã chọn
    const isSizeAvailableWithCurrentColor = (size) => {
        if (!availableCombinations[selectedColor]) return false;
        return availableCombinations[selectedColor][size] === true;
    };

    // Kiểm tra nếu màu hiện tại có sẵn với kích cỡ đã chọn
    const isColorAvailableWithCurrentSize = (color) => {
        if (!availableCombinations[color]) return false;
        return availableCombinations[color][selectedSize] === true;
    };

    // Kiểm tra nếu kết hợp hiện tại có sẵn
    const isCurrentCombinationAvailable = () => {
        if (!availableCombinations[selectedColor]) return false;
        return availableCombinations[selectedColor][selectedSize] === true;
    };

    // Handle color selection
    const handleColorChange = (color) => {
        setSelectedColor(color);
        setError(null);

        // Tự động chọn kích cỡ mới nếu kích cỡ hiện tại không có sẵn với màu mới
        if (availableCombinations[color] && !availableCombinations[color][selectedSize]) {
            // Tìm kích cỡ đầu tiên có sẵn với màu này
            const availableSize = availableSizes.find(size => availableCombinations[color][size] === true);
            if (availableSize) {
                setSelectedSize(availableSize);
            }
        }
    };

    // Handle size selection
    const handleSizeChange = (size) => {
        setSelectedSize(size);
        setError(null);

        // Tự động chọn màu mới nếu màu hiện tại không có sẵn với kích cỡ mới
        if (!availableCombinations[selectedColor] || !availableCombinations[selectedColor][size]) {
            // Tìm màu đầu tiên có sẵn với kích cỡ này
            const availableColor = availableColors.find(color =>
                availableCombinations[color] && availableCombinations[color][size] === true
            );
            if (availableColor) {
                setSelectedColor(availableColor);
            }
        }
    };

    // Handle quantity changes
    const handleQuantityChange = (change) => {
        const newQuantity = Math.max(1, quantity + change);

        // Check if we have a maximum quantity constraint
        if (productDetail?.maxQuantity && newQuantity > productDetail.maxQuantity) {
            setError(`Số lượng tối đa cho phép là ${productDetail.maxQuantity}`);
            return;
        }

        setQuantity(newQuantity);
        setError(null);
    };

    // Handle update cart
    const handleUpdateCart = () => {
        if (!isCurrentCombinationAvailable()) {
            setError("Kết hợp màu sắc và kích cỡ này không có sẵn");
            return;
        }

        dispatch(updateCartItem(item.id || item.productId, quantity, selectedColor, selectedSize));
        onClose();
    };

    // Handler for clicking outside to close modal
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                onClick={handleBackdropClick}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-medium text-gray-800">Chỉnh sửa sản phẩm</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-8 flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
                        </div>
                    ) : error && !productDetail ? (
                        <div className="p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
                                <FaExclamationCircle size={28} />
                            </div>
                            <p className="text-gray-800 font-medium mb-2">Lỗi khi tải sản phẩm</p>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    ) : productDetail && (
                        <>
                            <div className="p-5">
                                {/* Product info */}
                                <div className="flex items-start gap-3 mb-5 pb-5 border-b border-gray-100">
                                    <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                                        <img
                                            src={productDetail.mainImage?.path || item.image}
                                            alt={productDetail.productName}
                                            className="w-full h-full object-contain p-1"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-medium text-gray-800 mb-1 line-clamp-2">
                                            {productDetail.productName}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-red-500 font-medium">
                                                {productDetail.price?.toLocaleString() || item.totalPrice?.toLocaleString()} VNĐ
                                            </span>
                                            {productDetail.originalPrice && productDetail.originalPrice > productDetail.price && (
                                                <span className="text-gray-400 text-sm line-through">
                                                    {productDetail.originalPrice.toLocaleString()} VNĐ
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Hiển thị trạng thái kết hợp */}
                                {!isCurrentCombinationAvailable() && (
                                    <div className="mb-4 px-4 py-3 bg-yellow-50 text-yellow-700 rounded-md text-sm flex items-start">
                                        <FaExclamationCircle className="mr-2 mt-0.5 flex-shrink-0" />
                                        <span>Kết hợp màu "{selectedColor}" và kích cỡ "{selectedSize}" hiện không có sẵn. Vui lòng chọn kết hợp khác.</span>
                                    </div>
                                )}

                                {error && (
                                    <div className="mb-4 px-3 py-2 bg-red-50 text-red-600 rounded-md text-sm flex items-start">
                                        <FaExclamationCircle className="mr-2 mt-0.5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Color Selection */}
                                {availableColors.length > 0 && (
                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Màu sắc
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {availableColors.map((color) => {
                                                const isAvailable = isColorAvailableWithCurrentSize(color);
                                                const isSelected = selectedColor === color;

                                                return (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onClick={() => handleColorChange(color)}
                                                        className={`group relative flex items-center gap-2 py-2 px-3 rounded-full transition-all ${
                                                            isSelected
                                                                ? isAvailable
                                                                    ? "bg-blue-50 text-blue-600 border-2 border-blue-500"
                                                                    : "bg-gray-50 text-gray-500 border-2 border-gray-300"
                                                                : isAvailable
                                                                    ? "border-2 border-gray-200 text-gray-700 hover:border-blue-300"
                                                                    : "border-2 border-gray-200 text-gray-400 opacity-50"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`w-4 h-4 rounded-full border ${!isAvailable && 'opacity-50'}`}
                                                            style={{ backgroundColor: color, borderColor: isAvailable ? '#d1d5db' : '#e5e7eb' }}
                                                        ></span>
                                                        <span className="text-sm">{color}</span>

                                                        {/* Hiển thị dấu "hết hàng" nếu không có sẵn */}
                                                        {!isAvailable && (
                                                            <span className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-1/4 bg-gray-500 text-white text-2xs px-1 py-0.5 rounded">Hết</span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Size Selection */}
                                {availableSizes.length > 0 && (
                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Kích cỡ
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {availableSizes.map((size) => {
                                                const isAvailable = isSizeAvailableWithCurrentColor(size);
                                                const isSelected = selectedSize === size;

                                                return (
                                                    <button
                                                        key={size}
                                                        type="button"
                                                        onClick={() => handleSizeChange(size)}
                                                        className={`relative min-w-[3rem] py-2 px-3 rounded-md text-center transition-all ${
                                                            isSelected
                                                                ? isAvailable
                                                                    ? "bg-blue-500 text-white font-medium border-2 border-blue-500"
                                                                    : "bg-gray-300 text-gray-600 font-medium border-2 border-gray-300"
                                                                : isAvailable
                                                                    ? "bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-300"
                                                                    : "bg-gray-100 border-2 border-gray-200 text-gray-400 opacity-50"
                                                        }`}
                                                    >
                                                        {size}

                                                        {/* Hiển thị dấu "hết hàng" nếu không có sẵn */}
                                                        {!isAvailable && (
                                                            <span className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-1/4 bg-gray-500 text-white text-2xs px-1 py-0.5 rounded">Hết</span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity Selector */}
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số lượng
                                    </label>
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                            className={`w-10 h-10 flex items-center justify-center rounded-l-md border border-r-0 border-gray-300 ${
                                                quantity <= 1
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-white text-gray-600 hover:bg-gray-50"
                                            }`}
                                        >
                                            <FaMinus size={12} />
                                        </button>
                                        <div className="w-14 h-10 border-t border-b border-gray-300 flex items-center justify-center bg-white">
                                            <input
                                                type="number"
                                                min="1"
                                                value={quantity}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value);
                                                    if (!isNaN(value) && value >= 1) {
                                                        setQuantity(value);
                                                    }
                                                }}
                                                className="w-full h-full text-center focus:outline-none text-gray-700"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            className="w-10 h-10 flex items-center justify-center rounded-r-md border border-l-0 border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                                        >
                                            <FaPlus size={12} />
                                        </button>
                                    </div>
                                </div>

                                {/* Price Summary */}
                                <div className="p-4 bg-gray-50 rounded-lg mb-5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Thành tiền:</span>
                                        <span className="text-lg font-medium text-red-500">
                                            {((productDetail.price || item.totalPrice) * quantity).toLocaleString()} VNĐ
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex border-t border-gray-100">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleUpdateCart}
                                    disabled={!isCurrentCombinationAvailable()}
                                    className={`flex-1 py-3 ${
                                        isCurrentCombinationAvailable()
                                            ? "bg-blue-500 text-white font-medium hover:bg-blue-600"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    } transition-colors`}
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ModalUpdateCart;
