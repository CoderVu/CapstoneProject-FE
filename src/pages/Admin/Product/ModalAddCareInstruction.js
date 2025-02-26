import React, { useState } from "react";
import { addProductCareInstructions } from "../../../redux/service/productService";

const ModalAddCareInstruction = ({ isOpen, onRequestClose, onSubmit, product }) => {
    const [careInstructionData, setCareInstructionData] = useState({
        attributes: [{ key: "", value: "" }],
        description: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCareInstructionData((prev) => ({
            ...prev,
            [name]: value,
        }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formattedAttributes = careInstructionData.attributes.reduce((acc, attribute) => {
                if (attribute.key && attribute.value) {
                    acc[attribute.key] = attribute.value;
                }
                return acc;
            }, {});
            if (product?.id) {
                await addProductCareInstructions(product.id, { ...careInstructionData, attributes: formattedAttributes });
                onSubmit(careInstructionData); // Update UI
                onRequestClose(); // Close modal
            } else {
                console.error("Product ID is not defined");
            }
        } catch (error) {
            console.error("Failed to add care instructions:", error);
        }
    };

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-96 p-6 max-h-[80vh] overflow-y-auto">
                <h2 className="text-lg font-bold mb-4">Add Care Instructions</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={careInstructionData.description}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Attributes</label>
                        {careInstructionData.attributes.map((attribute, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <input
                                    type="text"
                                    className="w-1/3 p-1 border rounded-lg"
                                    value={attribute.key}
                                    onChange={(e) => handleAttributeChange(index, "key", e.target.value)}
                                    placeholder="Key"
                                />
                                <input
                                    type="text"
                                    className="w-2/3 p-1 border rounded-lg"
                                    value={attribute.value}
                                    onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                                    placeholder="Value"
                                />
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddAttribute}
                            className="w-full px-3 py-2 mb-4 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                        >
                            + Add Attribute
                        </button>
                    </div>
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
                            Add Care Instructions
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalAddCareInstruction;