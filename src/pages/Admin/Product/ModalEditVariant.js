import React, { useState, useEffect } from "react";
import { getAllColors } from "../../../redux/actions/colorAction";
import { getAllSizes } from "../../../redux/actions/sizeAction";
import { updateVariantProduct } from "../../../redux/service/productService";
import { useDispatch, useSelector } from "react-redux";

const ModalEditVariant = ({ isOpen, onRequestClose, onSubmit, productId, variant }) => {
    const dispatch = useDispatch();
    const { colors } = useSelector((state) => state.color);
    const { sizes } = useSelector((state) => state.size);

    useEffect(() => {
        dispatch(getAllColors());
        dispatch(getAllSizes());
    }, [dispatch]);
   
    const [variantData, setVariantData] = useState({
        id : variant?.id,
        sizeName: "",
        colorName: "",
        quantity: 0,
        price: 0,
    });

    useEffect(() => {
        if (variant) {
            setVariantData({
                id : variant?.id,
                sizeName: variant.sizeName || "",
                colorName: variant.color || "",
                quantity: variant.quantity || 0,
                price: variant.price || 0,
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
            await updateVariantProduct(productId, variantData); 
            onSubmit(variantData); // Update UI
            onRequestClose(); // Close modal
        } catch (error) {
            console.error("Failed to update variant:", error);
        }
    };

    if (!isOpen || !variant) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-96 p-6 max-h-[80vh] overflow-y-auto">
                <h2 className="text-lg font-bold mb-4">Edit Variant</h2>
                <form onSubmit={handleSubmit}>
                    {/* Size Dropdown */}
                    <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700">Size</label>
                        <select
                            name="sizeName"
                            value={variantData.sizeName}
                            onChange={handleChange}
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
                            value={variantData.colorName}
                            onChange={handleChange}
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
                            value={variantData.quantity}
                            onChange={handleChange}
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
                            value={variantData.price}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>

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
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalEditVariant;