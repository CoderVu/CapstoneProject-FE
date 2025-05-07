import React, { useState, useEffect, use } from "react";
import axios from "../../../redux/setup/axios";
import { useDispatch, useSelector } from "react-redux";
import { getProductDetail } from "../../../redux/actions/productActions";
import { getCategories } from "../../../redux/actions/categoryAction";
import { getAllBrands } from "../../../redux/actions/brandAction";
import { motion, AnimatePresence } from "framer-motion";
import {
    Save, X, Plus, Trash2, Tag, Package, DollarSign,
    Image, Box, Check, Truck, Star, ShoppingBag, Upload
} from "lucide-react";

import { showSuccessToast, showErrorToast } from "../../../components/Toast/ToastNotification";
import { getAllColors } from "../../../redux/actions/colorAction";

const ModalUpdateProduct = ({ isOpen, onRequestClose, product }) => {
    const categories = useSelector((state) => state.category.categories);
    const brands = useSelector((state) => state.brand.brands);
    const { colors } = useSelector((state) => state.color);
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");

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
    const [imagePreview, setImagePreview] = useState([]);

    useEffect(() => {
        if (product) {
            setProductData({
                productName: product.productName || "",
                description: product.description || "",
                price: product.price || 0,
                discountPrice: product.discountPrice || 0,
                onSale: product.onSale || false,
                bestSeller: product.bestSeller || false,
                categoryName: product.categoryName || "",
                gender: product.gender || "",
                brandName: product.brandName || "",
                newProduct: product.newProduct || false,
                imageIds: product.images?.map((image) => image.id) || [],
                colorImages: product.colorImages || {},
                mainImageId: product.mainImage?.id || "",
            });
            setExistingImages(product.images?.map((image) => ({
                ...image,
                color: image.color || ""
            })) || []);
        }
    }, [product]);

    useEffect(() => {
        if (isOpen) {
            dispatch(getCategories());
            dispatch(getAllBrands());
            dispatch(getAllColors());
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        // Log danh sách màu sắc sau khi được lấy từ Redux store
        console.log("Danh sách màu sắc:", colors);
    }, [colors]);

    useEffect(() => {
        // Create preview URLs for new image uploads
        const previews = imageInputs.map(input =>
            input.file ? { url: URL.createObjectURL(input.file), color: input.color } : null
        ).filter(Boolean);

        setImagePreview(previews);

        // Cleanup URLs on unmount
        return () => {
            previews.forEach(preview => URL.revokeObjectURL(preview.url));
        };
    }, [imageInputs]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProductData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
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

    const handleSetMainImage = (imageId) => {
        setProductData(prev => ({
            ...prev,
            mainImageId: imageId
        }));
    };

    const handleModalClick = (e) => {
        if (e.target === e.currentTarget) {
            onRequestClose();
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const formData = new FormData();

            // Add other product information
            Object.entries(productData).forEach(([key, value]) => {
                // Don't append objects directly
                if (typeof value !== 'object' || value === null) {
                    formData.append(key, value);
                }
            });

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

            // Add image IDs
            productData.imageIds.forEach(id => {
                formData.append("imageIds", id);
            });

            formData.append("colorMap", JSON.stringify(colorMap));

            const response = await axios.put(
                `/api/v1/admin/products/update/${product.id}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            showSuccessToast(response.data.message || "Cập nhật sản phẩm thành công!");
            dispatch(getProductDetail(product.id));
            onRequestClose();
        } catch (error) {
            console.error("Lỗi cập nhật sản phẩm:", error);
            showErrorToast(error.response?.data?.message || "Lỗi hệ thống");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const TabButton = ({ id, label, icon: Icon, isActive }) => (
        <button
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${isActive
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-100"
                }`}
        >
            <Icon className={`mr-2 h-4 w-4 ${isActive ? "text-blue-500" : "text-gray-500"}`} />
            {label}
        </button>
    );

    return (
        <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleModalClick}
        >
            <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 overflow-hidden"
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <Package className="mr-2 h-5 w-5" />
                        Cập nhật sản phẩm: {productData.productName}
                    </h2>
                    <button
                        onClick={onRequestClose}
                        className="text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleUpdate} className="space-y-6">
                        {/* Navigation Tabs */}
                        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
                            <TabButton id="basic" label="Thông tin cơ bản" icon={Package} isActive={activeTab === "basic"} />
                            <TabButton id="pricing" label="Giá & Trạng thái" icon={DollarSign} isActive={activeTab === "pricing"} />
                            <TabButton id="images" label="Hình ảnh" icon={Image} isActive={activeTab === "images"} />
                        </div>

                        {/* Basic Info Tab */}
                        <AnimatePresence mode="wait">
                            {activeTab === "basic" && (
                                <motion.div
                                    key="basic"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                                        <input
                                            type="text"
                                            name="productName"
                                            value={productData.productName}
                                            onChange={handleChange}
                                            placeholder="Nhập tên sản phẩm"
                                            className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                                        <textarea
                                            name="description"
                                            value={productData.description}
                                            onChange={handleChange}
                                            placeholder="Nhập mô tả ngắn về sản phẩm"
                                            rows="3"
                                            className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                                            <select
                                                name="categoryName"
                                                value={productData.categoryName}
                                                onChange={handleChange}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                <option value="">-- Chọn danh mục --</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.name}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
                                            <select
                                                name="brandName"
                                                value={productData.brandName}
                                                onChange={handleChange}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                <option value="">-- Chọn thương hiệu --</option>
                                                {brands.map((brand) => (
                                                    <option key={brand.id} value={brand.brandName}>
                                                        {brand.brandName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {["male", "female", "kids"].map((gender) => (
                                                <label
                                                    key={gender}
                                                    className={`flex items-center justify-center p-2.5 border rounded-lg cursor-pointer transition-colors ${productData.gender === gender
                                                        ? "bg-blue-50 border-blue-500 text-blue-700"
                                                        : "bg-white border-gray-300 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value={gender}
                                                        checked={productData.gender === gender}
                                                        onChange={handleChange}
                                                        className="sr-only"
                                                    />
                                                    <span className="capitalize">{gender === "male" ? "Nam" : gender === "female" ? "Nữ" : "Trẻ em"}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Pricing and Status Tab */}
                            {activeTab === "pricing" && (
                                <motion.div
                                    key="pricing"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <DollarSign className="w-4 h-4 text-gray-500" />
                                                </div>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={productData.price}
                                                    onChange={handleChange}
                                                    placeholder="Nhập giá gốc"
                                                    className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                    min="0"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá khuyến mãi</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <DollarSign className="w-4 h-4 text-gray-500" />
                                                </div>
                                                <input
                                                    type="number"
                                                    name="discountPrice"
                                                    value={productData.discountPrice}
                                                    onChange={handleChange}
                                                    placeholder="Nhập giá khuyến mãi (nếu có)"
                                                    className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                    min="0"
                                                />
                                            </div>
                                            {productData.price > 0 && productData.discountPrice > 0 && (
                                                <p className="text-sm text-green-600 mt-1">
                                                    Giảm {Math.round((1 - productData.discountPrice / productData.price) * 100)}%
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-700 mb-3">Trạng thái sản phẩm</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    name="onSale"
                                                    checked={productData.onSale}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="flex items-center">
                                                    <Tag className="w-4 h-4 mr-1 text-red-500" />
                                                    Đang giảm giá
                                                </span>
                                            </label>
                                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    name="bestSeller"
                                                    checked={productData.bestSeller}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="flex items-center">
                                                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                                                    Bán chạy nhất
                                                </span>
                                            </label>
                                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    name="newProduct"
                                                    checked={productData.newProduct}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="flex items-center">
                                                    <Truck className="w-4 h-4 mr-1 text-green-500" />
                                                    Sản phẩm mới
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Images Tab */}
                            {activeTab === "images" && (
                                <motion.div
                                    key="images"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    {/* Existing Images */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Ảnh hiện tại</h3>
                                        {existingImages.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                {existingImages.map((image, index) => (
                                                    <div key={image.id} className="bg-white p-2 border border-gray-200 rounded-lg">
                                                        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                                                            <img
                                                                src={image.path}
                                                                alt="Product"
                                                                className="w-full h-full object-contain"
                                                            />
                                                            {productData.mainImageId === image.id && (
                                                                <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                                                                    Ảnh chính
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <select
                                                                value={image.color}
                                                                onChange={(e) => handleExistingImageColorChange(index, e)}
                                                                className="p-2 border border-gray-300 rounded-lg w-full bg-white"
                                                            >
                                                                <option value="">-- Chọn màu sắc --</option>
                                                                {colors.map((color) => (
                                                                    <option key={color.id} value={color.color}>
                                                                        {color.color}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            <div className="flex space-x-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSetMainImage(image.id)}
                                                                    disabled={productData.mainImageId === image.id}
                                                                    className={`flex-1 p-1 text-xs rounded ${productData.mainImageId === image.id
                                                                        ? "bg-blue-100 text-blue-600 cursor-default"
                                                                        : "bg-blue-500 text-white hover:bg-blue-600"
                                                                        }`}
                                                                >
                                                                    <Check className="w-3 h-3 mx-auto" />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveImage(image.id)}
                                                                    className="flex-1 p-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                                                >
                                                                    <Trash2 className="w-3 h-3 mx-auto" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500 py-4 text-center bg-gray-50 rounded-lg">
                                                Chưa có ảnh nào. Thêm ảnh mới bên dưới.
                                            </div>
                                        )}
                                    </div>

                                    {/* New Image Inputs */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Thêm ảnh mới</h3>

                                        {/* Preview of new images */}
                                        {imagePreview.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                                                {imagePreview.map((preview, idx) => (
                                                    <div key={idx} className="bg-white p-2 border border-gray-200 rounded-lg">
                                                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                                                            <img
                                                                src={preview.url}
                                                                alt="Preview"
                                                                className="w-full h-full object-contain"
                                                            />
                                                        </div>
                                                        <p className="text-xs text-gray-500 truncate text-center">
                                                            {preview.color ? `Màu: ${preview.color}` : 'Chưa có màu'}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            {imageInputs.map((input, index) => (
                                                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 border border-gray-200 bg-gray-50 rounded-lg">
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="file"
                                                            onChange={(e) => handleImageInputChange(index, e)}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                            accept="image/*"
                                                        />
                                                        <div className="p-3 bg-white border border-gray-300 border-dashed rounded-lg flex items-center">
                                                            <Upload className="w-5 h-5 text-gray-400 mr-2" />
                                                            <span className="text-sm text-gray-500">
                                                                {input.file ? input.file.name : 'Chọn ảnh...'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                        <select
                                                            value={input.color}
                                                            onChange={(e) => handleColorChange(index, e)}
                                                            className="p-2 border border-gray-300 rounded-lg sm:w-1/3 bg-white"
                                                        >
                                                            <option value="">-- Chọn màu sắc --</option>
                                                            {colors.map((color) => (
                                                                <option key={color.id} value={color.color}>
                                                                    {color.color}
                                                                </option>
                                                            ))}
                                                        </select>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImageInput(index)}
                                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 sm:w-auto"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}

                                            <button
                                                type="button"
                                                onClick={handleAddImageInput}
                                                className="w-full flex items-center justify-center gap-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Thêm ảnh khác
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onRequestClose}
                                disabled={isLoading}
                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors focus:ring-2 focus:ring-gray-300 disabled:opacity-70"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-300 disabled:opacity-70 flex items-center"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Đang cập nhật...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Cập nhật sản phẩm
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ModalUpdateProduct;
