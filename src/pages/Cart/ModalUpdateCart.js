import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProductDetail } from "../../redux/actions/productActions";
import { updateCartItem } from "../../redux/actions/cartActions";

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

    if (!productDetail) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
                    <p className="text-lg font-semibold">Loading product details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Chỉnh sửa sản phẩm</h2>
                <div className="mb-4 flex items-center gap-4">
                    <img
                        src={productDetail.mainImage.path}
                        alt="productImage"
                        className="w-20 h-20 object-cover rounded-md"
                    />
                    <h3 className="text-lg font-semibold text-gray-800">{productDetail.productName}</h3>
                </div>

                {/* Color Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
                    <select
                        className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={selectedColor}
                        onChange={handleColorChange}
                    >
                        {availableColors.map((color) => (
                            <option key={color} value={color}>
                                {color}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Size Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kích cỡ</label>
                    <select
                        className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={selectedSize}
                        onChange={handleSizeChange}
                    >
                        {ALL_SIZES.map((size) => (
                            <option
                                key={size}
                                value={size}
                                disabled={!productDetail.variants.some(v => v.sizeName === size)}
                            >
                                {size} {!productDetail.variants.some(v => v.sizeName === size) ? "(Hết hàng)" : ""}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Quantity Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                    <div className="flex items-center gap-2">
                        <button
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                            onClick={() => handleQuantityChange(-1)}
                        >
                            −
                        </button>
                        <span className="px-4 py-1 border border-gray-300 rounded-md">{quantity}</span>
                        <button
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                            onClick={() => handleQuantityChange(1)}
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Price Display */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-800">{productDetail.price} VNĐ</span>
                        <span className="text-lg font-semibold text-gray-800">x {quantity}</span>
                        <span className="text-lg font-semibold text-gray-800">= {productDetail.price * quantity} VNĐ</span>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleUpdateCart}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                    >
                        Chỉnh sửa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalUpdateCart;
