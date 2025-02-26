import React, { useState, useEffect } from "react";
import { getAllColors } from "../../../redux/actions/colorAction";
import { getAllSizes } from "../../../redux/actions/sizeAction";
import { addVariantProduct } from "../../../redux/service/productService";
import { useDispatch, useSelector } from "react-redux";

const ModalAddVariant = ({ isOpen, onRequestClose, onSubmit, productId }) => {
    const dispatch = useDispatch();
    const { colors } = useSelector((state) => state.color);
    const { sizes } = useSelector((state) => state.size);

    useEffect(() => {
        dispatch(getAllColors());
        dispatch(getAllSizes());
    }, [dispatch]);

    const [variantList, setVariantList] = useState([
        { sizeName: "", colorName: "", quantity: 0, price: 0 },
    ]);

    // Thay đổi giá trị của một variant trong danh sách
    const handleChange = (index, e) => {
        const { name, value } = e.target;
        const newVariants = [...variantList];
        newVariants[index][name] = value;
        setVariantList(newVariants);
    };

    // Thêm một dòng variant mới
    const addVariantRow = () => {
        setVariantList([...variantList, { sizeName: "", colorName: "", quantity: 0, price: 0 }]);
    };

    // Xóa một dòng variant
    const removeVariantRow = (index) => {
        if (variantList.length > 1) {
            const newVariants = variantList.filter((_, i) => i !== index);
            setVariantList(newVariants);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addVariantProduct(productId, variantList); // Gửi tất cả variants
            onSubmit(variantList); // Cập nhật UI
            onRequestClose(); // Đóng modal
        } catch (error) {
            console.error("Failed to add variants:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg w-96 p-6 max-h-[80vh] overflow-y-auto">
    
                <h2 className="text-lg font-bold mb-4">Add Variants</h2>
                <form onSubmit={handleSubmit}>
                    {variantList.map((variant, index) => (
                        <div key={index} className="border p-4 mb-4 rounded-lg">
                            {/* Size Dropdown */}
                            <div className="mb-2">
                                <label className="block text-sm font-medium text-gray-700">Size</label>
                                <select
                                    name="sizeName"
                                    value={variant.sizeName}
                                    onChange={(e) => handleChange(index, e)}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="">Select Size</option>
                                    {sizes.map((size) => (
                                        <option key={size.id} value={size.name}>{size.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Color Dropdown */}
                            <div className="mb-2">
                                <label className="block text-sm font-medium text-gray-700">Color</label>
                                <select
                                    name="colorName"
                                    value={variant.colorName}
                                    onChange={(e) => handleChange(index, e)}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="">Select Color</option>
                                    {colors.map((color) => (
                                        <option key={color.id} value={color.color}>{color.color}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Quantity Input */}
                            <div className="mb-2">
                                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={variant.quantity}
                                    onChange={(e) => handleChange(index, e)}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>

                            {/* Price Input */}
                            <div className="mb-2">
                                <label className="block text-sm font-medium text-gray-700">Price</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={variant.price}
                                    onChange={(e) => handleChange(index, e)}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>

                            {/* Xóa Variant */}
                            {variantList.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeVariantRow(index)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                >
                                    Remove Variant
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Thêm Variant */}
                    <button
                        type="button"
                        onClick={addVariantRow}
                        className="w-full px-3 py-2 mb-4 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                    >
                        + Add Another Variant
                    </button>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onRequestClose}
                            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Add Variants
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalAddVariant;
