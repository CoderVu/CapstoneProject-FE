import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {  updateProductCareInstructions} from "../../../redux/service/productService";
import { getProductDetail } from "../../../redux/actions/productActions";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, X, Plus, Trash2, Info, FileText, CheckCircle, AlertTriangle
} from "lucide-react";

const ModalEditProductCareInstruction = ({ isOpen, onRequestClose, productId, productCareInstructions, onUpdateSuccess }) => {
    const dispatch = useDispatch();
    const [description, setDescription] = useState("");
    const [attributes, setAttributes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: null, message: "" });

    // Fetch product details when modal opens
    useEffect(() => {
        if (isOpen) {
            dispatch(getProductDetail(productId));
        }
    }, [isOpen, productId, dispatch]);

    // Update state when productDescription changes
    useEffect(() => {
        if (productCareInstructions) {
            setDescription(productCareInstructions.description || "");
            setAttributes(Object.entries(productCareInstructions.attributes || {}).map(([key, value]) => ({ key, value })));
        }
    }, [productCareInstructions]);

    const handleAttributeChange = (index, field, value) => {
        const newAttributes = attributes.map((attribute, i) => {
            if (i === index) {
                return { ...attribute, [field]: value };
            }
            return attribute;
        });
        setAttributes(newAttributes);
    };

    const handleAddAttribute = () => {
        setAttributes([...attributes, { key: "", value: "" }]);
    };

    const handleRemoveAttribute = (index) => {
        setAttributes(attributes.filter((_, i) => i !== index));
    };

    const handleModalClick = (e) => {
        if (e.target === e.currentTarget) {
            onRequestClose();
        }
    };

    const handleUpdate = async () => {
        try {
            setIsLoading(true);
            setFeedback({ type: null, message: "" });

            // Format attributes for API
            const formattedAttributes = attributes.reduce((acc, attribute) => {
                if (attribute.key && attribute.value) {
                    acc[attribute.key] = attribute.value;
                }
                return acc;
            }, {});

            // Prepare data and update
            const updatedData = { description, attributes: formattedAttributes };
            await updateProductCareInstructions(productId, updatedData);

            // Update Redux store and provide feedback
            dispatch(getProductDetail(productId));

            // Show success feedback for 1.5 seconds
            setFeedback({
                type: "success",
                message: "Hướng dẫn chăm sóc đã được cập nhật thành công!"
            });

            setTimeout(() => {
                if (onUpdateSuccess) onUpdateSuccess(updatedData);
                onRequestClose();
            }, 1500);

        } catch (error) {
            console.error("Failed to update product care instructions:", error);
            setFeedback({
                type: "error",
                message: "Cập nhật thất bại. Vui lòng thử lại sau."
            });
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
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Cập nhật hướng dẫn chăm sóc sản phẩm
                    </h2>
                    <button
                        onClick={onRequestClose}
                        className="text-white rounded-full p-1 hover:bg-indigo-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Description Section */}
                    <div className="mb-5">
                        <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                            <Info className="mr-2 h-4 w-4 text-indigo-500" />
                            Mô tả chung
                        </label>
                        <textarea
                            className="w-full bg-gray-50 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none min-h-[120px]"
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Nhập hướng dẫn chăm sóc chung cho sản phẩm..."
                        />
                    </div>

                    {/* Attributes Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="flex items-center text-gray-700 text-sm font-medium">
                                <Info className="mr-2 h-4 w-4 text-indigo-500" />
                                Thông tin chi tiết
                            </label>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={handleAddAttribute}
                                className="flex items-center text-sm px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Thêm thuộc tính
                            </motion.button>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            <AnimatePresence>
                                {attributes.map((attribute, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200"
                                    >
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                className="w-full p-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                value={attribute.key}
                                                onChange={(e) => handleAttributeChange(index, "key", e.target.value)}
                                                placeholder="Tên thuộc tính (Ví dụ: Nhiệt độ giặt)"
                                            />
                                            <input
                                                type="text"
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                value={attribute.value}
                                                onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                                                placeholder="Giá trị thuộc tính (Ví dụ: Dưới 30°C)"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAttribute(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors mt-1"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {attributes.length === 0 && (
                                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200 text-gray-500">
                                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                    <p>Chưa có thuộc tính nào. Nhấn "Thêm thuộc tính" để bắt đầu.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-indigo-800 mb-3">Xem trước hướng dẫn chăm sóc</h3>
                        <div className="text-sm text-gray-700">
                            <p className="mb-2">{description || "Chưa có mô tả chung"}</p>

                            {attributes.length > 0 && (
                                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {attributes.map((attr, idx) => (
                                        (attr.key && attr.value) ? (
                                            <div key={idx} className="flex gap-2">
                                                <span className="font-medium">{attr.key}:</span>
                                                <span>{attr.value}</span>
                                            </div>
                                        ) : null
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Feedback Message */}
                    <AnimatePresence>
                        {feedback.type && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className={`mt-4 p-3 rounded-lg flex items-center ${
                                    feedback.type === "success"
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                            >
                                {feedback.type === "success" ? (
                                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                                ) : (
                                    <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                                )}
                                <p>{feedback.message}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onRequestClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 disabled:opacity-70"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleUpdate}
                            disabled={isLoading || feedback.type === "success"}
                            className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 flex justify-center items-center disabled:opacity-70"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            ) : feedback.type === "success" ? (
                                <CheckCircle className="w-4 h-4 mr-2" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            {feedback.type === "success" ? "Đã lưu" : "Cập nhật"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ModalEditProductCareInstruction;
