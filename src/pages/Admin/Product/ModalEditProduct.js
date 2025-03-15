import React, { useState, useEffect } from "react";
import axios from "../../../redux/setup/axios";
import { useDispatch ,useSelector} from "react-redux";
import { getProductDetail } from "../../../redux/actions/productActions";
import { getCategories } from "../../../redux/actions/categoryAction";
import { getAllBrands } from "../../../redux/actions/brandAction";

import { showSuccessToast, showErrorToast } from "../../../components/Toast/ToastNotification";

const ModalUpdateProduct = ({ isOpen, onRequestClose, product }) => {
    const categories = useSelector((state) => state.category.categories);
    const brands = useSelector((state) => state.brand.brands);
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
        imageIds: [],
        colorImages: {},
        mainImageId: "",
    });
    const [existingImages, setExistingImages] = useState([]);
    const [imageInputs, setImageInputs] = useState([{ file: null, color: "" }]);

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
                imageIds: product.images.map((image) => image.id),
                colorImages: product.colorImages || {},
                mainImageId: product.mainImage?.id || "",
            });
            setExistingImages(product.images.map((image) => ({
                ...image,
                color: image.color || ""
            })));
        }
    }, [product]);

    useEffect(() => {
       if (isOpen) {
           dispatch(getCategories());
           dispatch(getAllBrands());
       }
    }, [isOpen, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddImageInput = () => {
        setImageInputs([...imageInputs, { file: null, color: "" }]);
    };

    const handleRemoveImageInput = (index) => {
        setImageInputs(imageInputs.filter((_, i) => i !== index));
    };

    const handleImageInputChange = (index, e) => {
        const newImageInputs = [...imageInputs];
        newImageInputs[index].file = e.target.files[0];
        setImageInputs(newImageInputs);
    };

    const handleColorChange = (index, e) => {
        const newImageInputs = [...imageInputs];
        newImageInputs[index].color = e.target.value;
        setImageInputs(newImageInputs);
    };

    const handleExistingImageColorChange = (index, e) => {
        const newExistingImages = [...existingImages];
        newExistingImages[index].color = e.target.value;
        setExistingImages(newExistingImages);
    };

    const handleRemoveImage = (imageId) => {
        setProductData((prev) => ({
            ...prev,
            imageIds: prev.imageIds.filter((id) => id !== imageId),
            mainImageId: prev.mainImageId === imageId ? "" : prev.mainImageId,
        }));
        setExistingImages((prev) => prev.filter((image) => image.id !== imageId));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();

            // Add other product information
            for (const key in productData) {
                formData.append(key, productData[key]);
            }

            // Add images and their colors to formData
            const colorMap = {};
            imageInputs.forEach((input) => {
                if (input.file) {
                    formData.append("colorImages", input.file);
                    colorMap[input.file.name] = input.color;
                }
            });

            // Add existing images' colors to formData
            existingImages.forEach((image) => {
                if (image.color) {
                    colorMap[image.id] = image.color;
                }
            });
            formData.append("colorMap", JSON.stringify(colorMap));

            const response = await axios.put(
                `/api/v1/admin/products/update/${product.id}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            showSuccessToast(response.data.message);
            dispatch(getProductDetail(product.id));
            onRequestClose();
        } catch (error) {
            console.error("Lỗi cập nhật sản phẩm:", error);
            showErrorToast(error.response?.data?.message || "Lỗi hệ thống");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg w-1/3 max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-xl font-semibold mb-4">Cập nhật sản phẩm</h2>
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
                    <select
                        name="categoryName"
                        value={productData.categoryName}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        name="gender"
                        value={productData.gender}
                        onChange={handleChange}
                        placeholder="Gender"
                        className="w-full p-2 border rounded"
                    />
                   <select
                        name="brandName"
                        value={productData.brandName}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Select Brand</option>
                        {brands.map((brand) => (
                            <option key={brand.id} value={brand.brandName}>
                                {brand.brandName}
                            </option>
                        ))}
                    </select>
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
                    <div className="flex flex-wrap gap-2">
                        {existingImages.map((image, index) => (
                            <div key={image.id} className="flex flex-col items-center">
                                <img src={image.path} alt="Product" className="w-20 h-20 object-cover rounded" />
                                <div className="flex items-center mt-1">
                                    <input
                                        type="radio"
                                        name="mainImageId"
                                        value={image.id}
                                        checked={productData.mainImageId === image.id}
                                        onChange={(e) => setProductData((prev) => ({ ...prev, mainImageId: e.target.value }))}
                                    />
                                    <label className="ml-2">Ảnh chính</label>
                                </div>
                                <input
                                    type="text"
                                    value={image.color}
                                    onChange={(e) => handleExistingImageColorChange(index, e)}
                                    placeholder="Color"
                                    className="mt-2 w-full p-2 border rounded"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(image.id)}
                                    className="mt-1 px-2 py-1 bg-red-500 text-white rounded"
                                >
                                    Xóa
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2">
                        {imageInputs.map((input, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input
                                    type="file"
                                    onChange={(e) => handleImageInputChange(index, e)}
                                    className="w-full p-2 border rounded"
                                />
                                <input
                                    type="text"
                                    value={input.color}
                                    onChange={(e) => handleColorChange(index, e)}
                                    placeholder="Color"
                                    className="w-full p-2 border rounded"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImageInput(index)}
                                    className="px-2 py-1 bg-red-500 text-white rounded"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddImageInput}
                            className="w-full px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                        >
                            + Thêm ảnh khác
                        </button>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onRequestClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            Cập nhật
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalUpdateProduct;