import React, { useState } from "react";
import { addProduct } from "../../redux/service/productService";

const AddProductForm = () => {
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

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === "checkbox") {
            setProductData({ ...productData, [name]: checked });
        } else if (type === "file") {
            setProductData({ ...productData, [name]: Array.from(files) });
        } else {
            setProductData({ ...productData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await addProduct(productData);
            console.log("Product added successfully:", response);
            // Handle success (e.g., show a success message, redirect, etc.)
        } catch (error) {
            console.error("Error adding product:", error);
            // Handle error (e.g., show an error message)
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white shadow-md rounded">
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="productName">
                    Product Name
                </label>
                <input
                    type="text"
                    name="productName"
                    value={productData.productName}
                    onChange={handleChange}
                    placeholder="Product Name"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Description
                </label>
                <textarea
                    name="description"
                    value={productData.description}
                    onChange={handleChange}
                    placeholder="Description"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                    Price
                </label>
                <input
                    type="number"
                    name="price"
                    value={productData.price}
                    onChange={handleChange}
                    placeholder="Price"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discountPrice">
                    Discount Price
                </label>
                <input
                    type="number"
                    name="discountPrice"
                    value={productData.discountPrice}
                    onChange={handleChange}
                    placeholder="Discount Price"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="onSale">
                    On Sale
                </label>
                <input
                    type="checkbox"
                    name="onSale"
                    checked={productData.onSale}
                    onChange={handleChange}
                    className="mr-2 leading-tight"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bestSeller">
                    Best Seller
                </label>
                <input
                    type="checkbox"
                    name="bestSeller"
                    checked={productData.bestSeller}
                    onChange={handleChange}
                    className="mr-2 leading-tight"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryName">
                    Category Name
                </label>
                <input
                    type="text"
                    name="categoryName"
                    value={productData.categoryName}
                    onChange={handleChange}
                    placeholder="Category Name"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
                    Gender
                </label>
                <input
                    type="text"
                    name="gender"
                    value={productData.gender}
                    onChange={handleChange}
                    placeholder="Gender"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="brandName">
                    Brand Name
                </label>
                <input
                    type="text"
                    name="brandName"
                    value={productData.brandName}
                    onChange={handleChange}
                    placeholder="Brand Name"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newProduct">
                    New Product
                </label>
                <input
                    type="checkbox"
                    name="newProduct"
                    checked={productData.newProduct}
                    onChange={handleChange}
                    className="mr-2 leading-tight"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageFiles">
                    Image Files
                </label>
                <input
                    type="file"
                    name="imageFiles"
                    multiple
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
                Add Product
            </button>
        </form>
    );
};

export default AddProductForm;