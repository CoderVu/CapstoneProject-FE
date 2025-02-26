import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addProductDescription } from "../../../redux/service/productService";
import { getProductDetail } from "../../../redux/actions/productActions";

const ModalAddProductDescription = ({ isOpen, onRequestClose, product, onUpdateSuccess }) => {
    const dispatch = useDispatch();
    const [description, setDescription] = useState("");
    const [attributes, setAttributes] = useState({});
    const [newAttributeKey, setNewAttributeKey] = useState("");
    const [newAttributeValue, setNewAttributeValue] = useState("");

    // Xử lý thay đổi thuộc tính sản phẩm
    const handleAttributeChange = (key, value) => {
        setAttributes((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // Xử lý thêm thuộc tính mới
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

    // Xử lý thêm mô tả mới
    const handleAdd = async () => {
        try {
            const newData = { description, attributes };
            await addProductDescription(product.id, newData);
            
            dispatch(getProductDetail(product.id)); // Cập nhật Redux store
            onUpdateSuccess(newData); // Cập nhật UI
            onRequestClose(); // Đóng modal
        } catch (error) {
            console.error("Failed to add product description:", error);
        }
    };

    return isOpen ? (
        <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-h-[80vh] overflow-y-auto">
                <h2 className="text-lg font-bold mb-4">Thêm mô tả sản phẩm</h2>

                <label className="block mb-2 font-semibold">Mô tả:</label>
                <textarea
                    className="w-full p-2 border rounded"
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <label className="block mt-4 mb-2 font-semibold">Thuộc tính:</label>
                {Object.keys(attributes).map((key, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <span className="w-1/3 font-medium">{key}:</span>
                        <input
                            type="text"
                            className="w-2/3 p-1 border rounded"
                            value={attributes[key]}
                            onChange={(e) => handleAttributeChange(key, e.target.value)}
                        />
                    </div>
                ))}

                <div className="flex items-center mb-4">
                    <input
                        type="text"
                        className="w-1/3 p-1 border rounded mr-2"
                        placeholder="Key"
                        value={newAttributeKey}
                        onChange={(e) => setNewAttributeKey(e.target.value)}
                    />
                    <input
                        type="text"
                        className="w-2/3 p-1 border rounded"
                        placeholder="Value"
                        value={newAttributeValue}
                        onChange={(e) => setNewAttributeValue(e.target.value)}
                    />
                    <button
                        type="button"
                        className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={handleAddAttribute}
                    >
                        Add
                    </button>
                </div>

                <div className="mt-4 flex justify-end">
                    <button className="bg-green-500 text-white px-4 py-2 mr-2" onClick={handleAdd}>
                        Thêm
                    </button>
                    <button className="bg-gray-500 text-white px-4 py-2" onClick={onRequestClose}>
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    ) : null;
};

export default ModalAddProductDescription;