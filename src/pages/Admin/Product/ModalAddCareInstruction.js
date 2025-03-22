import React, { useState } from "react";
import { addProductCareInstructions } from "../../../redux/service/productService";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, X, Plus, Trash2, Heart, Info, Shirt,
  Sparkles, CheckCircle, Scissors
} from "lucide-react";

const ModalAddCareInstruction = ({ isOpen, onRequestClose, onSubmit, product }) => {
    const [careInstructionData, setCareInstructionData] = useState({
        attributes: [{ key: "", value: "" }],
        description: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [charCount, setCharCount] = useState(0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCareInstructionData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (name === "description") {
            setCharCount(value.length);
        }
    };

    const handleAttributeChange = (index, field, value) => {
        const newAttributes = careInstructionData.attributes.map((attribute, i) => {
            if (i === index) {
                return { ...attribute, [field]: value };
            }
            return attribute;
        });
        setCareInstructionData((prev) => ({
            ...prev,
            attributes: newAttributes,
        }));
    };

    const handleAddAttribute = () => {
        setCareInstructionData((prev) => ({
            ...prev,
            attributes: [...prev.attributes, { key: "", value: "" }],
        }));
    };

    const handleRemoveAttribute = (index) => {
        if (careInstructionData.attributes.length > 1) {
            const newAttributes = careInstructionData.attributes.filter((_, i) => i !== index);
            setCareInstructionData((prev) => ({
                ...prev,
                attributes: newAttributes,
            }));
        }
    };

    const handleModalClick = (e) => {
        if (e.target === e.currentTarget) {
            onRequestClose();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);

            const formattedAttributes = careInstructionData.attributes.reduce((acc, attribute) => {
                if (attribute.key && attribute.value) {
                    acc[attribute.key] = attribute.value;
                }
                return acc;
            }, {});

            if (product?.id) {
                await addProductCareInstructions(product.id, {
                    ...careInstructionData,
                    attributes: formattedAttributes
                });

                // Show success state
                setSuccess(true);

                // Close after delay
                setTimeout(() => {
                    if (onSubmit) onSubmit(careInstructionData);
                    onRequestClose();
                }, 1500);

            } else {
                console.error("Product ID is not defined");
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Failed to add care instructions:", error);
            setIsLoading(false);
        }
    };

    const suggestedAttributes = [
        { key: "Nhiệt độ giặt", value: "30°C" },
        { key: "Chất vải", value: "100% Cotton" },
        { key: "Tẩy trắng", value: "Không sử dụng chất tẩy" },
        { key: "Sấy khô", value: "Sấy ở nhiệt độ thấp" },
        { key: "Ủi", value: "Ủi ở nhiệt độ trung bình" }
    ];

    const handleUseSuggestion = (suggestion) => {
        const exists = careInstructionData.attributes.some(
            attr => attr.key === suggestion.key && attr.value === suggestion.value
        );

        if (!exists) {
            setCareInstructionData(prev => ({
                ...prev,
                attributes: [...prev.attributes, { ...suggestion }]
            }));
        }
    };

    if (!isOpen || !product) return null;

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
                <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <Shirt className="mr-2 h-5 w-5" />
                        Thêm hướng dẫn chăm sóc sản phẩm
                    </h2>
                    <button
                        onClick={onRequestClose}
                        className="text-white rounded-full p-1 hover:bg-rose-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Description Section */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="flex items-center text-gray-700 text-sm font-medium">
                                    <Info className="mr-2 h-4 w-4 text-rose-500" />
                                    Mô tả chung
                                </label>
                                <span className={`text-xs ${charCount > 200 ? 'text-rose-500' : 'text-gray-500'}`}>
                                    {charCount}/500 ký tự
                                </span>
                            </div>
                            <textarea
                                name="description"
                                value={careInstructionData.description}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-50 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none min-h-[100px]"
                                placeholder="Nhập hướng dẫn chăm sóc tổng quan cho sản phẩm..."
                                maxLength={500}
                            />
                        </div>

                        {/* Suggested Attributes Section */}
                        <div className="bg-rose-50 border border-rose-100 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-rose-800 mb-3 flex items-center">
                                <Sparkles className="w-4 h-4 mr-1 text-rose-500" />
                                Gợi ý hướng dẫn chăm sóc
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {suggestedAttributes.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleUseSuggestion(suggestion)}
                                        className="bg-white border border-rose-200 hover:border-rose-400 px-3 py-1.5 rounded-lg text-sm text-gray-700 flex items-center gap-1 transition-colors"
                                    >
                                        <Plus className="w-3 h-3 text-rose-500" />
                                        {suggestion.key}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Attributes Section */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="flex items-center text-gray-700 text-sm font-medium">
                                    <Scissors className="mr-2 h-4 w-4 text-rose-500" />
                                    Hướng dẫn chi tiết
                                </label>
                            </div>

                            <div className="space-y-3 mb-4">
                                <AnimatePresence>
                                    {careInstructionData.attributes.map((attribute, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                                        >
                                            <div className="flex-1 grid grid-cols-5 gap-2">
                                                <div className="col-span-2">
                                                    <input
                                                        type="text"
                                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                                        value={attribute.key}
                                                        onChange={(e) => handleAttributeChange(index, "key", e.target.value)}
                                                        placeholder="Tên (VD: Nhiệt độ giặt)"
                                                    />
                                                </div>
                                                <div className="col-span-3">
                                                    <input
                                                        type="text"
                                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                                        value={attribute.value}
                                                        onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                                                        placeholder="Giá trị (VD: 30°C)"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAttribute(index)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="button"
                                onClick={handleAddAttribute}
                                className="w-full flex items-center justify-center gap-1 px-4 py-3 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors border border-rose-200"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm hướng dẫn khác
                            </motion.button>
                        </div>

                        {/* Preview Section */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <Heart className="w-4 h-4 mr-1 text-rose-500" />
                                Xem trước hướng dẫn chăm sóc
                            </h3>
                            <div className="text-sm text-gray-600">
                                <p className="mb-2 whitespace-pre-wrap">{careInstructionData.description || "Chưa có mô tả"}</p>

                                {careInstructionData.attributes.some(attr => attr.key && attr.value) && (
                                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {careInstructionData.attributes.map((attr, idx) => (
                                            attr.key && attr.value ? (
                                                <div key={idx} className="flex gap-2">
                                                    <span className="font-medium">{attr.key}:</span>
                                                    <span>{attr.value}</span>
                                                </div>
                                            ) : null
                                        ))}
                                    </div>
                                )}

                                {!careInstructionData.attributes.some(attr => attr.key && attr.value) && (
                                    <p className="text-gray-400 italic text-sm">Chưa có thông tin chi tiết</p>
                                )}
                            </div>
                        </div>

                        {/* Form Actions */}
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
                                type="submit"
                                disabled={isLoading || success}
                                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 disabled:opacity-70 flex items-center"
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
                                        Thêm hướng dẫn
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

export default ModalAddCareInstruction;
