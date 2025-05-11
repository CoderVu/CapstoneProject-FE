import React, { useState, useEffect } from "react";
import { getAllColors } from "../../../redux/actions/colorAction";
import { getAllSizes } from "../../../redux/actions/sizeAction";
import { updateVariantProduct } from "../../../redux/service/productService";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Save, X, Tag, Palette, Package, DollarSign } from "lucide-react";

const ModalEditVariant = ({ isOpen, onRequestClose, onSubmit, productId, variant }) => {
    const dispatch = useDispatch();
    const { colors } = useSelector((state) => state.color);
    const { sizes } = useSelector((state) => state.size);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        dispatch(getAllColors());
        dispatch(getAllSizes());
    }, [dispatch]);

    const [variantData, setVariantData] = useState({
        id: variant?.id,
        sizeName: "",
        colorName: "",
        quantity: 0
    });

    useEffect(() => {
        if (variant) {
            setVariantData({
                id: variant?.id,
                sizeName: variant.sizeName || "",
                colorName: variant.color || "",
                quantity: variant.quantity || 0
             
            });
        }
    }, [variant]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVariantData({ ...variantData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await updateVariantProduct(productId, variantData);
            onSubmit(variantData); // Update UI
            onRequestClose(); // Close modal
        } catch (error) {
            console.error("Failed to update variant:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleModalClick = (e) => {
        if (e.target === e.currentTarget) {
            onRequestClose();
        }
    };

    if (!isOpen || !variant) return null;

    return (
        <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleModalClick}
        >
            <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Chỉnh sửa biến thể sản phẩm</h2>
                    <button
                        onClick={onRequestClose}
                        className="text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Size Dropdown */}
                        <div>
                            <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                                <Tag className="mr-2 h-4 w-4 text-blue-500" />
                                Kích cỡ
                            </label>
                            <div className="relative">
                                <select
                                    name="sizeName"
                                    value={variantData.sizeName}
                                    onChange={handleChange}
                                    required
                                    className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Chọn kích cỡ</option>
                                    {sizes.map((size) => (
                                        <option key={size.id} value={size.name}>{size.name}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Color Dropdown */}
                        <div>
                            <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                                <Palette className="mr-2 h-4 w-4 text-blue-500" />
                                Màu sắc
                            </label>
                            <div className="relative">
                                <select
                                    name="colorName"
                                    value={variantData.colorName}
                                    onChange={handleChange}
                                    required
                                    className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Chọn màu sắc</option>
                                    {colors.map((color) => (
                                        <option key={color.id} value={color.color}>{color.color}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Quantity Input */}
                        <div>
                            <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                                <Package className="mr-2 h-4 w-4 text-blue-500" />
                                Số lượng
                            </label>
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    className="bg-gray-200 text-gray-700 px-3 py-2 rounded-l-lg hover:bg-gray-300"
                                    onClick={() => setVariantData(prev => ({ ...prev, quantity: Math.max(0, parseInt(prev.quantity) - 1) }))}
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={variantData.quantity}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="flex-grow text-center py-2 border-t border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500"
                                />
                                <button
                                    type="button"
                                    className="bg-gray-200 text-gray-700 px-3 py-2 rounded-r-lg hover:bg-gray-300"
                                    onClick={() => setVariantData(prev => ({ ...prev, quantity: parseInt(prev.quantity) + 1 }))}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Summary Section */}
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-5">
                            <h3 className="text-sm font-medium text-blue-800 mb-2">Thông tin biến thể</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Kích cỡ:</p>
                                    <p className="font-medium">{variantData.sizeName || "Chưa chọn"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Màu sắc:</p>
                                    <p className="font-medium">{variantData.colorName || "Chưa chọn"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Số lượng:</p>
                                    <p className="font-medium">{variantData.quantity}</p>
                                </div>
                            
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onRequestClose}
                                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex justify-center items-center"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                Lưu thay đổi
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ModalEditVariant;
