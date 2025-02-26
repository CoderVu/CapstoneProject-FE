import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addProductDescription } from "../../../redux/service/productService";
import { getProductDetail } from "../../../redux/actions/productActions";

const ModalEditProductDescription = ({ isOpen, onRequestClose, product, onUpdateSuccess }) => {
    const dispatch = useDispatch();
    const productDescription = useSelector((state) => state.productDescription.productDescription);
    
    const [description, setDescription] = useState("");
    const [attributes, setAttributes] = useState({});

    // Gọi API lấy dữ liệu chi tiết khi mở modal
    useEffect(() => {
        if (isOpen && product) {
            dispatch(getProductDetail(product.id));
        }
    }, [isOpen, product, dispatch]);

    // Cập nhật state khi productDescription thay đổi
    useEffect(() => {
        if (productDescription) {
            setDescription(productDescription.description || "");
            setAttributes(productDescription.attributes || {});
        }
    }, [productDescription]);

    const handleAttributeChange = (key, value) => {
        setAttributes((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleUpdate = async () => {
        try {
            const updatedData = { description, attributes };
            await addProductDescription(product.id, updatedData);
            
            dispatch(getProductDetail(product.id)); // Cập nhật Redux store sau khi chỉnh sửa
            onUpdateSuccess(updatedData); 
            onRequestClose(); 
        } catch (error) {
            console.error("Failed to update product description:", error);
        }
    };

    return isOpen ? (
        <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-h-[80vh] overflow-y-auto">
                <h2 className="text-lg font-bold mb-4">Cập nhật mô tả sản phẩm</h2>

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

export default ModalEditProductDescription;
