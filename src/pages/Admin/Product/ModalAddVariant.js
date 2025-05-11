import React, { useState, useEffect } from "react";
import { getAllColors } from "../../../redux/actions/colorAction";
import { getAllSizes } from "../../../redux/actions/sizeAction";
import { addVariantProduct } from "../../../redux/service/productService";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
    Save, X, Plus, Trash2, Tag, Package, DollarSign, LayoutGrid
} from "lucide-react";

const ModalAddVariant = ({ isOpen, onRequestClose, onSubmit, productId }) => {
    const dispatch = useDispatch();
    const { colors } = useSelector((state) => state.color);
    const { sizes } = useSelector((state) => state.size);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        dispatch(getAllColors());
        dispatch(getAllSizes());
    }, [dispatch]);

    const [variantList, setVariantList] = useState([
        { sizeName: "", colorName: "", quantity: 0, price: 0 },
    ]);

    // Handle change in variant input fields
    const handleChange = (index, e) => {
        const { name, value } = e.target;
        const newVariants = [...variantList];
        newVariants[index][name] = value;
        setVariantList(newVariants);
    };

    // Add a new variant row
    const addVariantRow = () => {
        setVariantList([...variantList, { sizeName: "", colorName: "", quantity: 0 }]);
    };

    // Remove a variant row
    const removeVariantRow = (index) => {
        if (variantList.length > 1) {
            const newVariants = variantList.filter((_, i) => i !== index);
            setVariantList(newVariants);
        }
    };

    // Handle modal background click to close
    const handleModalClick = (e) => {
        if (e.target === e.currentTarget) {
            onRequestClose();
        }
    };

    // Update quantity with plus/minus controls
    const handleQuantityChange = (index, change) => {
        const newVariants = [...variantList];
        const newQuantity = Math.max(0, parseInt(newVariants[index].quantity) + change);
        newVariants[index].quantity = newQuantity;
        setVariantList(newVariants);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await addVariantProduct(productId, variantList);
            if (onSubmit) onSubmit(variantList);
            onRequestClose();
        } catch (error) {
            console.error("Failed to add variants:", error);
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleModalClick}
        >
            <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden"
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <LayoutGrid className="mr-2 h-5 w-5" />
                        Thêm biến thể sản phẩm
                    </h2>
                    <button
                        onClick={onRequestClose}
                        className="text-white rounded-full p-1 hover:bg-indigo-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Variants */}
                        <div className="space-y-4">
                            <AnimatePresence>
                                {variantList.map((variant, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="border border-gray-200 p-5 rounded-lg bg-white shadow-sm"
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-gray-700 font-medium flex items-center">
                                                <Tag className="h-4 w-4 mr-1 text-purple-500" />
                                                Biến thể {index + 1}
                                            </h3>
                                            {variantList.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariantRow(index)}
                                                    className="text-red-500 hover:text-red-700 rounded-full p-1 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Size Dropdown */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Kích cỡ</label>
                                                <div className="relative">
                                                    <select
                                                        name="sizeName"
                                                        value={variant.sizeName}
                                                        onChange={(e) => handleChange(index, e)}
                                                        required
                                                        className="appearance-none w-full bg-gray-50 border border-gray-300 text-gray-900 py-2.5 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    >
                                                        <option value="">Chọn kích cỡ</option>
                                                        {sizes.map((size) => (
                                                            <option key={size.id} value={size.name}>{size.name}</option>
                                                        ))}
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Color Dropdown */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
                                                <div className="relative">
                                                    <select
                                                        name="colorName"
                                                        value={variant.colorName}
                                                        onChange={(e) => handleChange(index, e)}
                                                        required
                                                        className="appearance-none w-full bg-gray-50 border border-gray-300 text-gray-900 py-2.5 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    >
                                                        <option value="">Chọn màu sắc</option>
                                                        {colors.map((color) => (
                                                            <option key={color.id} value={color.color}>{color.color}</option>
                                                        ))}
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quantity Input */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                                                <div className="flex items-center">
                                                    <button
                                                        type="button"
                                                        className="bg-gray-200 text-gray-700 px-3 py-2 rounded-l-lg hover:bg-gray-300"
                                                        onClick={() => handleQuantityChange(index, -1)}
                                                    >
                                                        −
                                                    </button>
                                                    <input
                                                        type="number"
                                                        name="quantity"
                                                        value={variant.quantity}
                                                        onChange={(e) => handleChange(index, e)}
                                                        required
                                                        min="0"
                                                        className="flex-grow text-center py-2 border-t border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-purple-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="bg-gray-200 text-gray-700 px-3 py-2 rounded-r-lg hover:bg-gray-300"
                                                        onClick={() => handleQuantityChange(index, 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Add Another Variant Button */}
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="button"
                                onClick={addVariantRow}
                                className="w-full flex items-center justify-center gap-1 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm biến thể khác
                            </motion.button>
                        </div>

                        {/* Variant Summary */}
                        {variantList.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Tóm tắt biến thể</h3>
                                <ul className="space-y-1 text-sm text-gray-600">
                                    {variantList.map((variant, idx) => (
                                        <li key={idx} className="flex items-center">
                                            <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                                            {variant.colorName || "Chưa chọn màu"} / {variant.sizeName || "Chưa chọn size"}:
                                            <span className="font-medium ml-1">{variant.quantity} sản phẩm</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Form Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onRequestClose}
                                disabled={isLoading}
                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 disabled:opacity-70"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 disabled:opacity-70 flex items-center"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Đang thêm...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Thêm biến thể
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ModalAddVariant;
