import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProductDetail } from "../../redux/actions/productActions";
import { updateCartItem } from "../../redux/actions/cartActions";
import { motion } from "framer-motion";

const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];

const ModalUpdateCart = ({ productId, item, onClose }) => {
    const dispatch = useDispatch();
    const productDetail = useSelector((state) => state.productDetail.productDetail);

    const [selectedColor, setSelectedColor] = useState(item.color);
    const [selectedSize, setSelectedSize] = useState(item.size);
    const [quantity, setQuantity] = useState(item.quantity);

    useEffect(() => {
        dispatch(getProductDetail(productId));
    }, [dispatch, productId]);

    const availableColors = [
        ...new Set(
            productDetail?.variants?.map((variant) => variant.color) || []
        ),
    ];

    const handleColorChange = (e) => {
        setSelectedColor(e.target.value);
    };

    const handleSizeChange = (e) => {
        setSelectedSize(e.target.value);
    };

    const handleQuantityChange = (change) => {
        setQuantity((prevQuantity) => Math.max(1, prevQuantity + change));
    };

    const handleUpdateCart = () => {
        dispatch(updateCartItem(item.id, quantity, selectedColor, selectedSize));
        onClose();
    };

    // Handler for clicking outside to close modal
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!productDetail) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50" onClick={handleBackdropClick}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-4 text-center"
                >
                    <div className="flex justify-center mb-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="text-lg font-medium text-gray-700">Đang tải thông tin sản phẩm...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50" onClick={handleBackdropClick}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800">Chỉnh sửa sản phẩm</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Product info */}
                    <div className="flex items-start gap-4 mb-6 pb-4 border-b border-gray-100">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                                src={productDetail.mainImage.path}
                                alt={productDetail.productName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">{productDetail.productName}</h3>
                            <p className="text-blue-600 font-semibold">{productDetail.price.toLocaleString()} VNĐ</p>
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Màu sắc</label>
                        <div className="relative">
                            <select
                                className="w-full appearance-none bg-gray-50 border border-gray-200 py-3 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={selectedColor}
                                onChange={handleColorChange}
                            >
                                {availableColors.map((color) => (
                                    <option key={color} value={color}>
                                        {color}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Size Selection */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kích cỡ</label>
                        <div className="grid grid-cols-5 gap-2">
                            {ALL_SIZES.map((size) => {
                                const isAvailable = productDetail.variants.some(v => v.sizeName === size);
                                const isSelected = selectedSize === size;

                                return (
                                    <button
                                        key={size}
                                        type="button"
                                        disabled={!isAvailable}
                                        onClick={() => isAvailable && setSelectedSize(size)}
                                        className={`py-2 rounded-md text-center transition-all ${
                                            isSelected
                                                ? "bg-blue-500 text-white font-medium border-2 border-blue-500"
                                                : isAvailable
                                                    ? "bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-300"
                                                    : "bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed"
                                        }`}
                                    >
                                        {size}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quantity Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng</label>
                        <div className="flex items-center">
                            <button
                                className="w-10 h-10 rounded-l-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors border border-gray-300"
                                onClick={() => handleQuantityChange(-1)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                            </button>
                            <div className="h-10 w-16 border-t border-b border-gray-300 flex items-center justify-center text-gray-700 font-medium">
                                {quantity}
                            </div>
                            <button
                                className="w-10 h-10 rounded-r-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors border border-gray-300"
                                onClick={() => handleQuantityChange(1)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Đơn giá:</span>
                            <span className="font-medium">{productDetail.price.toLocaleString()} VNĐ</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Số lượng:</span>
                            <span className="font-medium">x {quantity}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                            <span className="font-medium text-gray-700">Tổng tiền:</span>
                            <span className="font-bold text-blue-600">{(productDetail.price * quantity).toLocaleString()} VNĐ</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleUpdateCart}
                            className="flex-1 py-3 px-4 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        >
                            Cập nhật
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ModalUpdateCart;
