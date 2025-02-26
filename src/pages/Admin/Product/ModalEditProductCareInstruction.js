import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProductCareInstructions } from "../../../redux/service/productService";
import { getProductDetail } from "../../../redux/actions/productActions";

const ModalEditProductCareInstruction = ({ isOpen, onRequestClose, product, onUpdateSuccess }) => {
    const dispatch = useDispatch();
    const productCareInstructions = useSelector((state) => state.productCareInstructions.productCareInstructions);
    
    const [description, setDescription] = useState("");
    const [attributes, setAttributes] = useState([]);

    // Gọi API lấy dữ liệu chi tiết khi mở modal
    useEffect(() => {
        if (isOpen && product) {
            dispatch(getProductDetail(product.id));
        }
    }, [isOpen, product, dispatch]);

    // Cập nhật state khi productCareInstructions thay đổi
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

    const handleUpdate = async () => {
        try {
            const formattedAttributes = attributes.reduce((acc, attribute) => {
                if (attribute.key && attribute.value) {
                    acc[attribute.key] = attribute.value;
                }
                return acc;
            }, {});
            const updatedData = { description, attributes: formattedAttributes };
            await updateProductCareInstructions(product.id, updatedData);
            
            dispatch(getProductDetail(product.id)); // Cập nhật Redux store sau khi chỉnh sửa
            onUpdateSuccess(updatedData); 
            onRequestClose(); 
        } catch (error) {
            console.error("Failed to update product care instructions:", error);
        }
    };

    return isOpen && product ? (
        <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-h-[80vh] overflow-y-auto">
                <h2 className="text-lg font-bold mb-4">Cập nhật hướng dẫn chăm sóc sản phẩm</h2>

                <label className="block mb-2 font-semibold">Mô tả:</label>
                <textarea
                    className="w-full p-2 border rounded"
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <label className="block mt-4 mb-2 font-semibold">Thuộc tính:</label>
                {attributes.map((attribute, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <input
                            type="text"
                            className="w-1/3 p-1 border rounded mr-2"
                            value={attribute.key}
                            onChange={(e) => handleAttributeChange(index, "key", e.target.value)}
                            placeholder="Key"
                        />
                        <input
                            type="text"
                            className="w-2/3 p-1 border rounded"
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

                <div className="mt-4 flex justify-end">
                    <button className="bg-blue-500 text-white px-4 py-2 mr-2" onClick={handleUpdate}>
                        Cập nhật
                    </button>
                    <button className="bg-gray-500 text-white px-4 py-2" onClick={onRequestClose}>
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    ) : null;
};

export default ModalEditProductCareInstruction;