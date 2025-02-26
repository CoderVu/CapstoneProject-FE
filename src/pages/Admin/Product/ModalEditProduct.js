import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateProduct } from "../../../redux/service/productService";
import { getProductDetail } from "../../../redux/actions/productActions";

const ModalUpdateProduct = ({ isOpen, onRequestClose, product }) => {
    const dispatch = useDispatch();
    const [productData, setProductData] = useState({
        productName: "",
        description: "",
        price: 0,
        discountPrice: 0,
        onSale: false,
        bestSeller: false,
        categoryName: "",
        gender: "",
        brandName: "",
        newProduct: false,
        imageFiles: [],
    });

    useEffect(() => {
        if (product) {
            setProductData({
                productName: product.productName,
                description: product.description,
                price: product.price,
                discountPrice: product.discountPrice,
                onSale: product.onSale,
                bestSeller: product.bestSeller,
                categoryName: product.categoryName,
                gender: product.gender,
                brandName: product.brandName,
                newProduct: product.newProduct,
                imageFiles: [],
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        setProductData((prev) => ({
            ...prev,
            imageFiles: Array.from(e.target.files),
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateProduct(product.id, productData);
            dispatch(getProductDetail(product.id)); // Cập nhật Redux store
            onRequestClose(); // Đóng modal
        } catch (error) {
            console.error("Failed to update product:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg w-1/3 p-6">
                <h2 className="text-xl font-semibold mb-4">Update Product</h2>
                <form onSubmit={handleUpdate} className="space-y-3">
                    <input
                        type="text"
                        name="productName"
                        value={productData.productName}
                        onChange={handleChange}
                        placeholder="Product Name"
                        className="w-full p-2 border rounded"
                    />
                    <textarea
                        name="description"
                        value={productData.description}
                        onChange={handleChange}
                        placeholder="Description"
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="number"
                        name="price"
                        value={productData.price}
                        onChange={handleChange}
                        placeholder="Price"
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="number"
                        name="discountPrice"
                        value={productData.discountPrice}
                        onChange={handleChange}
                        placeholder="Discount Price"
                        className="w-full p-2 border rounded"
                    />
                    <div className="flex items-center space-x-3">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="onSale"
                                checked={productData.onSale}
                                onChange={(e) => setProductData((prev) => ({ ...prev, onSale: e.target.checked }))}
                                className="mr-2"
                            />
                            On Sale
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="bestSeller"
                                checked={productData.bestSeller}
                                onChange={(e) => setProductData((prev) => ({ ...prev, bestSeller: e.target.checked }))}
                                className="mr-2"
                            />
                            Best Seller
                        </label>
                    </div>
                    <input
                        type="text"
                        name="categoryName"
                        value={productData.categoryName}
                        onChange={handleChange}
                        placeholder="Category Name"
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="text"
                        name="gender"
                        value={productData.gender}
                        onChange={handleChange}
                        placeholder="Gender"
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="text"
                        name="brandName"
                        value={productData.brandName}
                        onChange={handleChange}
                        placeholder="Brand Name"
                        className="w-full p-2 border rounded"
                    />
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="newProduct"
                            checked={productData.newProduct}
                            onChange={(e) => setProductData((prev) => ({ ...prev, newProduct: e.target.checked }))}
                            className="mr-2"
                        />
                        New Product
                    </label>
                    <input
                        type="file"
                        name="imageFiles"
                        multiple
                        onChange={handleFileChange}
                        className="w-full p-2 border rounded"
                    />
                    <div className="flex items-center space-x-3">
                        <input
                            type="file"
                            name="imageFiles"
                            multiple
                            onChange={handleFileChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="flex items-center space-x-3">
                        <input
                            type="file"
                            name="imageFiles"
                            multiple
                            onChange={handleFileChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onRequestClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalUpdateProduct;
