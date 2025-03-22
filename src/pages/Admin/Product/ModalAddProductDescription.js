import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addProductDescription } from "../../../redux/service/productService";
import { getProductDetail } from "../../../redux/actions/productActions";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, X, Plus, Trash2, AlignLeft, Info, FileText, CheckCircle
} from "lucide-react";

const ModalAddProductDescription = ({ isOpen, onRequestClose, product, onUpdateSuccess }) => {
    const dispatch = useDispatch();
    const [description, setDescription] = useState("");
    const [attributes, setAttributes] = useState({});
    const [newAttributeKey, setNewAttributeKey] = useState("");
    const [newAttributeValue, setNewAttributeValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [charCount, setCharCount] = useState(0);

    // Handle description change with character count
    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        setDescription(value);
        setCharCount(value.length);
    };

    // Handle attribute change
    const handleAttributeChange = (key, value) => {
        setAttributes((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // Handle add new attribute
    const handleAddAttribute = () => {
        if (newAttributeKey && newAttributeValue) {
            setAttributes((prev) => ({
                ...prev,
                [newAttributeKey]: newAttributeValue,
            }));
            setNewAttributeKey("");
            setNewAttributeValue("");
        }
    };

    // Handle remove attribute
    const handleRemoveAttribute = (keyToRemove) => {
        setAttributes((prev) => {
            const newAttributes = { ...prev };
            delete newAttributes[keyToRemove];
            return newAttributes;
        });
    };

    // Handle modal click outside
    const handleModalClick = (e) => {
        if (e.target === e.currentTarget) {
            onRequestClose();
        }
    };

    // Handle submission
    const handleAdd = async () => {
        try {
            setIsLoading(true);
            const newData = { description, attributes };
            await addProductDescription(product.id, newData);

            dispatch(getProductDetail(product.id)); // Update Redux store

            // Show success state
            setSuccess(true);

            // Close modal after delay
            setTimeout(() => {
                if (onUpdateSuccess) onUpdateSuccess(newData);
                onRequestClose();
            }, 1500);

        } catch (error) {
            console.error("Failed to add product description:", error);
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleModalClick}
        >
            <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 overflow-hidden"
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Thêm mô tả sản phẩm
                    </h2>
                    <button
                        onClick={onRequestClose}
                        className="text-white rounded-full p-1 hover:bg-emerald-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="space-y-6">
                        {/* Description Section */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="flex items-center text-gray-700 text-sm font-medium">
                                    <AlignLeft className="mr-2 h-4 w-4 text-green-500" />
                                    Mô tả chi tiết sản phẩm
                                </label>
                                <span className={`text-xs ${charCount > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                                    {charCount}/1000 ký tự
                                </span>
                            </div>
                            <textarea
                                className="w-full bg-gray-50 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none min-h-[150px]"
                                rows="6"
                                value={description}
                                onChange={handleDescriptionChange}
                                placeholder="Nhập mô tả chi tiết về sản phẩm..."
                                maxLength={1000}
                            />
                        </div>

                        {/* Attributes Section */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="flex items-center text-gray-700 text-sm font-medium">
                                    <Info className="mr-2 h-4 w-4 text-green-500" />
                                    Thông số kỹ thuật
                                </label>
                            </div>

                            {/* Current attributes */}
                            <div className="space-y-3 mb-4">
                                <AnimatePresence>
                                    {Object.keys(attributes).map((key) => (
                                        <motion.div
                                            key={key}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                                        >
                                            <div className="flex-1 grid grid-cols-3 gap-2">
                                                <div className="col-span-1">
                                                    <p className="text-sm font-medium text-gray-700">{key}:</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <input
                                                        type="text"
                                                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                        value={attributes[key]}
                                                        onChange={(e) => handleAttributeChange(key, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAttribute(key)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Add new attribute */}
                            <div className="flex flex-col sm:flex-row gap-2 p-4 bg-green-50 border border-green-100 rounded-lg">
                                <input
                                    type="text"
                                    className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Tên thuộc tính (VD: Chất liệu)"
                                    value={newAttributeKey}
                                    onChange={(e) => setNewAttributeKey(e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Giá trị thuộc tính (VD: Cotton 100%)"
                                    value={newAttributeValue}
                                    onChange={(e) => setNewAttributeValue(e.target.value)}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    type="button"
                                    onClick={handleAddAttribute}
                                    disabled={!newAttributeKey || !newAttributeValue}
                                    className={`px-4 py-2.5 rounded-lg flex items-center justify-center ${
                                        newAttributeKey && newAttributeValue
                                            ? "bg-green-600 text-white hover:bg-green-700"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    } transition-colors`}
                                >
                                    <Plus className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Preview Section */}
                        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-green-800 mb-3">Xem trước mô tả sản phẩm</h3>
                            <div className="text-sm text-gray-700">
                                <p className="mb-2 whitespace-pre-wrap">{description || "Chưa có mô tả"}</p>

                                {Object.keys(attributes).length > 0 && (
                                    <>
                                        <h4 className="font-medium text-gray-800 mt-4 mb-2">Thông số kỹ thuật:</h4>
                                        <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {Object.entries(attributes).map(([key, value]) => (
                                                <div key={key} className="flex gap-2">
                                                    <span className="font-medium">{key}:</span>
                                                    <span>{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onRequestClose}
                                disabled={isLoading || success}
                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 disabled:opacity-70"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleAdd}
                                disabled={isLoading || success}
                                className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-70 flex items-center"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Đang thêm...
                                    </>
                                ) : success ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Hoàn tất
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Thêm mô tả
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ModalAddProductDescription;
