import React, { useEffect, useState } from "react";
import axios from "../../../redux/setup/axios"
import { useDispatch, useSelector } from "react-redux";
import { getCategories } from "../../../redux/actions/categoryAction";
import { addCategory, updateCategory } from "../../../redux/service/categoryService";
import { addSize, updateSize } from "../../../redux/service/sizeService";
import { getAllSizes } from "../../../redux/actions/sizeAction";
import { addColor, updateColor } from "../../../redux/service/colorService";
import { getAllColors } from "../../../redux/actions/colorAction";
import { fetchAllBrands, createBrand, updateBrand, deleteBrand } from "../../../redux/service/brandService";
import { motion, AnimatePresence } from "framer-motion";
import namer from "color-namer";
import {
    Tag, Plus, Edit, Trash2, Save, X, Search,
    AlertCircle, Check, RefreshCw, FileText,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    Palette, Building2
} from "lucide-react";

const Categories = () => {
    const categories = useSelector((state) => state.category.categories);
    const { sizes } = useSelector((state) => state.size);
    const { colors } = useSelector((state) => state.color);
    const dispatch = useDispatch();

    // Common states
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [deleteType, setDeleteType] = useState(null); // 'category', 'size', 'color', or 'brand'
    const [successMessage, setSuccessMessage] = useState({ show: false, message: "" });
    const [activeSection, setActiveSection] = useState("category"); // 'category', 'size', 'color', or 'brand'

    // Category states
    const [newCategory, setNewCategory] = useState({ name: "", description: "", image: null });
    const [editCategory, setEditCategory] = useState({ id: null, name: "", description: "", image: null });
    const [previewImage, setPreviewImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Size states
    const [newSize, setNewSize] = useState({ name: "" });
    const [editSize, setEditSize] = useState({ id: null, name: "" });
    const [currentSizePage, setCurrentSizePage] = useState(1);
    const [sizesPerPage, setSizesPerPage] = useState(5);

    // Color states
    const [newColor, setNewColor] = useState({ color: "", colorCode: "#000000" });
    const [editColor, setEditColor] = useState({ id: null, color: "", colorCode: "" });
    const [currentColorPage, setCurrentColorPage] = useState(1);
    const [colorsPerPage, setColorsPerPage] = useState(5);

    // Brand states
    const [brands, setBrands] = useState([]);
    const [newBrand, setNewBrand] = useState({ brandName: "" });
    const [editBrand, setEditBrand] = useState({ id: null, brandName: "" });
    const [currentBrandPage, setCurrentBrandPage] = useState(1);
    const [brandsPerPage, setBrandsPerPage] = useState(5);

    // Filtered categories based on search - Với đầy đủ kiểm tra null
    const filteredCategories = Array.isArray(categories)
        ? categories.filter(category =>
            category &&
            typeof category.name === 'string' &&
            category.name.toLowerCase().includes((searchTerm || "").toLowerCase())
        )
        : [];

    // Filtered sizes based on search - Với đầy đủ kiểm tra null
    const filteredSizes = Array.isArray(sizes)
        ? sizes.filter(size =>
            size &&
            typeof size.name === 'string' &&
            size.name.toLowerCase().includes((searchTerm || "").toLowerCase())
        )
        : [];

    // Filtered colors based on search and status
    const filteredColors = Array.isArray(colors)
        ? colors.filter(color =>
            color &&
            color.status !== "UNAVAILABLE" && // Exclude colors with status "UNAVAILABLE"
            typeof color.color === 'string' &&
            color.color.toLowerCase().includes((searchTerm || "").toLowerCase())
        )
        : [];

    // Filtered brands based on search
    const filteredBrands = Array.isArray(brands)
        ? brands.filter(brand =>
            brand &&
            typeof brand.brandName === 'string' &&
            brand.brandName.toLowerCase().includes((searchTerm || "").toLowerCase())
        )
        : [];

    // Load data on mount
    useEffect(() => {
        loadCategories();
        loadSizes();
        loadColors();
        loadBrands();
    }, [dispatch]);

    // Calculate pagination for categories
    useEffect(() => {
        setTotalPages(Math.ceil(filteredCategories.length / itemsPerPage));
        setCurrentPage(prev => (prev > Math.ceil(filteredCategories.length / itemsPerPage) ? 1 : prev));
    }, [filteredCategories, itemsPerPage]);

    // Calculate pagination for sizes
    useEffect(() => {
        setTotalSizePages(Math.ceil(filteredSizes.length / sizesPerPage));
        setCurrentSizePage(prev => (prev > Math.ceil(filteredSizes.length / sizesPerPage) ? 1 : prev));
    }, [filteredSizes, sizesPerPage]);

    // Calculate pagination for colors
    useEffect(() => {
        setTotalColorPages(Math.ceil(filteredColors.length / colorsPerPage));
        setCurrentColorPage(prev => (prev > Math.ceil(filteredColors.length / colorsPerPage) ? 1 : prev));
    }, [filteredColors, colorsPerPage]);

    // Calculate pagination for brands
    useEffect(() => {
        setTotalBrandPages(Math.ceil(filteredBrands.length / brandsPerPage));
        setCurrentBrandPage(prev => (prev > Math.ceil(filteredBrands.length / brandsPerPage) ? 1 : prev));
    }, [filteredBrands, brandsPerPage]);

    // Calculate current items for categories
    const [totalPages, setTotalPages] = useState(1);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

    // Calculate current items for sizes
    const [totalSizePages, setTotalSizePages] = useState(1);
    const indexOfLastSize = currentSizePage * sizesPerPage;
    const indexOfFirstSize = indexOfLastSize - sizesPerPage;
    const currentSizes = filteredSizes.slice(indexOfFirstSize, indexOfLastSize);

    // Calculate current items for colors
    const [totalColorPages, setTotalColorPages] = useState(1);
    const indexOfLastColor = currentColorPage * colorsPerPage;
    const indexOfFirstColor = indexOfLastColor - colorsPerPage;
    const currentColors = filteredColors.slice(indexOfFirstColor, indexOfLastColor);

    // Calculate current items for brands
    const [totalBrandPages, setTotalBrandPages] = useState(1);
    const indexOfLastBrand = currentBrandPage * brandsPerPage;
    const indexOfFirstBrand = indexOfLastBrand - brandsPerPage;
    const currentBrands = filteredBrands.slice(indexOfFirstBrand, indexOfLastBrand);

    // Show success message with auto-dismiss
    const showSuccess = (message) => {
        setSuccessMessage({ show: true, message });
        setTimeout(() => {
            setSuccessMessage({ show: false, message: "" });
        }, 3000);
    };

    // Load categories with loading state
    const loadCategories = async () => {
        setIsLoading(true);
        try {
            await dispatch(getCategories());
        } catch (error) {
            console.error("Failed to load categories:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load sizes with loading state
    const loadSizes = async () => {
        setIsLoading(true);
        try {
            await dispatch(getAllSizes());
        } catch (error) {
            console.error("Failed to load sizes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load colors with loading state
    const loadColors = async () => {
        setIsLoading(true);
        try {
            await dispatch(getAllColors());
        } catch (error) {
            console.error("Failed to load colors:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load brands with loading state
    const loadBrands = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAllBrands();
            setBrands(data);
        } catch (error) {
            console.error("Failed to load brands:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Category functions
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory?.name?.trim() || !newCategory?.description?.trim()) return;

        const formData = new FormData();
        formData.append("name", newCategory.name.trim());
        formData.append("description", newCategory.description.trim());

        if (newCategory.image) {
            formData.append("image", newCategory.image);
        } else {
            console.error("No image selected");
            return;
        }

        setIsLoading(true);
        try {
            await addCategory(formData);
            setNewCategory({ name: "", description: "", image: null });
            setPreviewImage(null);
            await loadCategories();
            showSuccess("Thêm danh mục thành công!");
        } catch (error) {
            console.error("Failed to add category:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        if (!editCategory?.name?.trim() || !editCategory?.description?.trim()) return;

        const formData = new FormData();
        formData.append("name", editCategory.name.trim());
        formData.append("description", editCategory.description.trim());

        if (editCategory.image) {
            formData.append("image", editCategory.image);
        }

        setIsLoading(true);
        try {
            await updateCategory(editCategory.id, formData);
            setEditCategory({ id: null, name: "", description: "", image: null });
            setPreviewImage(null);
            await loadCategories();
            showSuccess("Cập nhật danh mục thành công!");
        } catch (error) {
            console.error("Failed to update category:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        setIsLoading(true);
        try {
            await axios.delete(`/api/v1/admin/categories/delete/${categoryId}`);
            await loadCategories();
            setConfirmDelete(null);
            setDeleteType(null);
            showSuccess("Đã xóa danh mục thành công!");
        } catch (error) {
            console.error("Failed to delete category:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e, isEdit = false) => {
        const file = e.target.files[0];
        if (file) {
            if (isEdit) {
                setEditCategory({ ...editCategory, image: file });
            } else {
                setNewCategory({ ...newCategory, image: file });
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Cancel edit mode for categories
    const cancelEdit = () => {
        setEditCategory({ id: null, name: "", description: "", image: null });
        setPreviewImage(null);
    };

    // Size functions
    const handleAddSize = async (e) => {
        e.preventDefault();
        if (!newSize?.name?.trim()) return;

        setIsLoading(true);
        try {
            await addSize({ name: newSize.name.trim() });
            setNewSize({ name: "" });
            await loadSizes();
            showSuccess("Thêm kích thước thành công!");
        } catch (error) {
            console.error("Failed to add size:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateSize = async (e) => {
        e.preventDefault();
        if (!editSize?.name?.trim()) return;

        setIsLoading(true);
        try {
            await updateSize(editSize.id, { name: editSize.name.trim() });
            setEditSize({ id: null, name: "" });
            await loadSizes();
            showSuccess("Cập nhật kích thước thành công!");
        } catch (error) {
            console.error("Failed to update size:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSize = async (sizeId) => {
        setIsLoading(true);
        try {
            await axios.delete(`/api/v1/admin/sizes/delete/${sizeId}`);
            await loadSizes();
            setConfirmDelete(null);
            setDeleteType(null);
            showSuccess("Đã xóa kích thước thành công!");
        } catch (error) {
            console.error("Failed to delete size:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Cancel edit mode for sizes
    const cancelSizeEdit = () => {
        setEditSize({ id: null, name: "" });
    };

    // Color functions
    const handleAddColor = async (e) => {
        e.preventDefault();
        if (!newColor?.colorCode?.trim()) return;

        // Automatically set the color name using color-namer
        const colorName = namer(newColor.colorCode).ntc[0].name; // Use the 'ntc' palette for naming
        setNewColor({ ...newColor, color: colorName });

        setIsLoading(true);
        try {
            await addColor({
                color: colorName,
                colorCode: newColor.colorCode.trim()
            });
            setNewColor({ color: "", colorCode: "#000000" });
            await loadColors();
            showSuccess("Thêm màu sắc thành công!");
        } catch (error) {
            console.error("Failed to add color:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateColor = async (e) => {
        e.preventDefault();
        if (!editColor?.colorCode?.trim()) return;

        // Automatically set the color name using color-namer
        const colorName = namer(editColor.colorCode).ntc[0].name; // Use the 'ntc' palette for naming
        setEditColor({ ...editColor, color: colorName });

        setIsLoading(true);
        try {
            await updateColor(editColor.id, {
                color: colorName,
                colorCode: editColor.colorCode.trim()
            });
            setEditColor({ id: null, color: "", colorCode: "" });
            await loadColors();
            showSuccess("Cập nhật màu sắc thành công!");
        } catch (error) {
            console.error("Failed to update color:", error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleDeleteColor = async (colorId) => {
        setIsLoading(true);
        try {
            await axios.delete(`/api/v1/admin/colors/delete/${colorId}`);
            await loadColors();
            setConfirmDelete(null);
            setDeleteType(null);
            showSuccess("Đã xóa màu sắc thành công!");
        } catch (error) {
            console.error("Failed to delete color:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Cancel edit mode for colors
    const cancelColorEdit = () => {
        setEditColor({ id: null, color: "", colorCode: "" });
    };

    // Brand functions
    const handleAddBrand = async (e) => {
        e.preventDefault();
        if (!newBrand?.brandName?.trim()) return;

        setIsLoading(true);
        try {
            await createBrand({ brandName: newBrand.brandName.trim() });
            setNewBrand({ brandName: '' });
            await loadBrands();
            showSuccess('Thêm thương hiệu thành công!');
        } catch (error) {
            console.error("Failed to add brand:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateBrand = async (e) => {
        e.preventDefault();
        if (!editBrand?.brandName?.trim()) return;

        setIsLoading(true);
        try {
            await updateBrand(editBrand.id, { brandName: editBrand.brandName.trim() });
            setEditBrand({ id: null, brandName: '' });
            await loadBrands();
            showSuccess('Cập nhật thương hiệu thành công!');
        } catch (error) {
            console.error("Failed to update brand:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteBrand = async (brandId) => {
        setIsLoading(true);
        try {
            await deleteBrand(brandId);
            await loadBrands();
            setConfirmDelete(null);
            setDeleteType(null);
            showSuccess('Đã xóa thương hiệu thành công!');
        } catch (error) {
            console.error("Failed to delete brand:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Cancel edit mode for brands
    const cancelBrandEdit = () => {
        setEditBrand({ id: null, brandName: '' });
    };

    // Handle pagination for categories
    const handleItemsPerPageChange = (e) => {
        const value = parseInt(e.target.value);
        setItemsPerPage(value);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Handle pagination for sizes
    const handleSizesPerPageChange = (e) => {
        const value = parseInt(e.target.value);
        setSizesPerPage(value);
        setCurrentSizePage(1); // Reset to first page when changing items per page
    };

    // Handle pagination for colors
    const handleColorsPerPageChange = (e) => {
        const value = parseInt(e.target.value);
        setColorsPerPage(value);
        setCurrentColorPage(1); // Reset to first page when changing items per page
    };

    // Handle pagination for brands
    const handleBrandsPerPageChange = (e) => {
        const value = parseInt(e.target.value);
        setBrandsPerPage(value);
        setCurrentBrandPage(1); // Reset to first page when changing items per page
    };

    // Handle item delete confirmation
    const showDeleteConfirm = (id, type) => {
        setConfirmDelete(id);
        setDeleteType(type);
    };

    // Handle delete based on type
    const handleDelete = () => {
        if (deleteType === 'category') {
            handleDeleteCategory(confirmDelete);
        } else if (deleteType === 'size') {
            handleDeleteSize(confirmDelete);
        } else if (deleteType === 'color') {
            handleDeleteColor(confirmDelete);
        } else if (deleteType === 'brand') {
            handleDeleteBrand(confirmDelete);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Tag className="mr-2 h-6 w-6 text-blue-500" />
                        Quản lý danh mục, kích thước, màu sắc và thương hiệu
                    </h1>
                    <p className="text-gray-500 mt-1">Quản lý danh mục, kích thước, màu sắc và thương hiệu sản phẩm trong cửa hàng của bạn</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveSection("category")}
                        className={`px-4 py-2 rounded-md transition-colors ${activeSection === "category" ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                        Danh mục
                    </button>
                    <button
                        onClick={() => setActiveSection("size")}
                        className={`px-4 py-2 rounded-md transition-colors ${activeSection === "size" ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                        Kích thước
                    </button>
                    <button
                        onClick={() => setActiveSection("color")}
                        className={`px-4 py-2 rounded-md transition-colors ${activeSection === "color" ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                        Màu sắc
                    </button>
                    <button
                        onClick={() => setActiveSection("brand")}
                        className={`px-4 py-2 rounded-md transition-colors ${activeSection === "brand" ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                        Thương hiệu
                    </button>
                    <button
                        onClick={() => {
                            if (activeSection === "category") loadCategories();
                            else if (activeSection === "size") loadSizes();
                            else if (activeSection === "color") loadColors();
                            else if (activeSection === "brand") loadBrands();
                        }}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors px-3 py-1 rounded-md hover:bg-blue-50"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Làm mới</span>
                    </button>
                </div>
            </div>

            {/* Success Message */}
            <AnimatePresence>
                {successMessage.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 flex items-start rounded-md"
                    >
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-green-700">{successMessage.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category Management Section */}
            {activeSection === "category" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Add new category form */}
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-medium text-gray-800 mb-4">Thêm danh mục mới</h2>
                        <form onSubmit={handleAddCategory} className="flex flex-col lg:flex-row gap-3">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    placeholder="Nhập tên danh mục mới..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={newCategory.description}
                                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                    placeholder="Nhập mô tả danh mục..."
                                    className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isLoading}
                                />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange(e)}
                                className="hidden"
                                id="newCategoryImage"
                            />
                            <label
                                htmlFor="newCategoryImage"
                                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
                            >
                                Chọn ảnh
                            </label>
                            {previewImage && (
                                <img src={previewImage} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                            )}
                            <button
                                type="submit"
                                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={!newCategory?.name?.trim() || !newCategory?.description?.trim() || !newCategory?.image || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Đang thêm...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        <span>Thêm danh mục</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Search and category list */}
                    <div className="p-5">
                        <div className="mb-4 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm kiếm danh mục..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 p-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {isLoading && filteredCategories.length === 0 ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : filteredCategories.length > 0 ? (
                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tên danh mục
                                            </th>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Mô tả
                                            </th>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Hình ảnh
                                            </th>
                                            <th scope="col" className="px-4 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                                                Hành động
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <AnimatePresence>
                                            {currentCategories.map((category) => (
                                                <motion.tr
                                                    key={category.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-4 py-3">
                                                        {editCategory.id === category.id ? (
                                                            <form onSubmit={handleUpdateCategory} className="flex items-center gap-2">
                                                                <div className="relative flex-grow">
                                                                    <input
                                                                        type="text"
                                                                        value={editCategory.name}
                                                                        onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                                                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                        autoFocus
                                                                    />
                                                                    {editCategory.name && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setEditCategory({ ...editCategory, name: "" })}
                                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        type="submit"
                                                                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                                        disabled={!editCategory?.name?.trim() || !editCategory?.description?.trim() || isLoading}
                                                                        title="Lưu"
                                                                    >
                                                                        <Save className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={cancelEdit}
                                                                        className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                                                        title="Hủy"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        ) : (
                                                            <>
                                                                <span className="text-gray-700 font-medium">{category.name}</span>
                                                            </>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {editCategory.id === category.id ? (
                                                            <div className="relative flex-grow">
                                                                <input
                                                                    type="text"
                                                                    value={editCategory.description}
                                                                    onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                />
                                                                {editCategory.description && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setEditCategory({ ...editCategory, description: "" })}
                                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-700">{category.description}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {category.imageUrl && (
                                                            <img src={category.imageUrl} alt={category.name} className="w-16 h-16 object-cover rounded-lg" />
                                                        )}
                                                        {editCategory.id === category.id && (
                                                            <>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleImageChange(e, true)}
                                                                    className="hidden"
                                                                    id={`editCategoryImage-${category.id}`}
                                                                />
                                                                <label
                                                                    htmlFor={`editCategoryImage-${category.id}`}
                                                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer text-xs inline-block mt-2"
                                                                >
                                                                    Cập nhật ảnh
                                                                </label>
                                                                {previewImage && (
                                                                    <img src={previewImage} alt="Preview" className="w-16 h-16 object-cover rounded-lg mt-2" />
                                                                )}
                                                            </>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {editCategory.id !== category.id && (
                                                            <div className="flex justify-end space-x-2">
                                                                <button
                                                                    onClick={() => setEditCategory({ ...category, image: null })}
                                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => showDeleteConfirm(category.id, 'category')}
                                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>

                                {/* Pagination Controls */}
                                {filteredCategories.length > 0 && (
                                    <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                                        <div className="flex-1 flex justify-between sm:hidden">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Trước
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Sau
                                            </button>
                                        </div>
                                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div className="flex items-center">
                                                <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-600">Hiển thị:</label>
                                                <select
                                                    id="itemsPerPage"
                                                    className="border border-gray-300 rounded-md text-sm p-1"
                                                    value={itemsPerPage}
                                                    onChange={handleItemsPerPageChange}
                                                >
                                                    <option value="5">5</option>
                                                    <option value="10">10</option>
                                                    <option value="25">25</option>
                                                    <option value="50">50</option>
                                                </select>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    Hiển thị <span className="font-medium">{indexOfFirstItem + 1}</span> đến <span className="font-medium">{Math.min(indexOfLastItem, filteredCategories.length)}</span> trong số <span className="font-medium">{filteredCategories.length}</span> danh mục
                                                </p>
                                            </div>
                                            <div>
                                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                    <button
                                                        onClick={() => setCurrentPage(1)}
                                                        disabled={currentPage === 1}
                                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="sr-only">Trang đầu</span>
                                                        <ChevronsLeft className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                        disabled={currentPage === 1}
                                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="sr-only">Trang trước</span>
                                                        <ChevronLeft className="h-5 w-5" />
                                                    </button>

                                                    {/* Page numbers */}
                                                    {[...Array(totalPages)].map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setCurrentPage(index + 1)}
                                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === index + 1
                                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {index + 1}
                                                        </button>
                                                    ))}

                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                        disabled={currentPage === totalPages}
                                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="sr-only">Trang sau</span>
                                                        <ChevronRight className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setCurrentPage(totalPages)}
                                                        disabled={currentPage === totalPages}
                                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="sr-only">Trang cuối</span>
                                                        <ChevronsRight className="h-5 w-5" />
                                                    </button>
                                                </nav>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                                {searchTerm ? (
                                    <>
                                        <p className="text-lg font-medium mb-1">Không tìm thấy danh mục nào</p>
                                        <p className="text-gray-400">Không có danh mục nào phù hợp với "{searchTerm}"</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-lg font-medium mb-1">Chưa có danh mục nào</p>
                                        <p className="text-gray-400">Hãy thêm danh mục đầu tiên của bạn</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Size Management Section */}
            {activeSection === "size" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Add new size form */}
                    <div className="p-5 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-medium text-gray-800 mb-4">Thêm kích thước mới</h2>
                        <form onSubmit={handleAddSize} className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-grow relative">
                                <input
                                    type="text"
                                    value={newSize.name}
                                    onChange={(e) => setNewSize({ ...newSize, name: e.target.value })}
                                    placeholder="Nhập tên kích thước..."
                                    className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isLoading}
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={!newSize?.name?.trim() || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Đang thêm...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        <span>Thêm kích thước</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Search and size list */}
                    <div className="p-5">
                        <div className="mb-4 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm kiếm kích thước..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 p-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {isLoading && filteredSizes.length === 0 ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : filteredSizes.length > 0 ? (
                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tên kích thước
                                            </th>
                                            <th scope="col" className="px-4 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                                                Hành động
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <AnimatePresence>
                                            {currentSizes.map((size) => (
                                                <motion.tr
                                                    key={size.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-4 py-3">
                                                        {editSize.id === size.id ? (
                                                            <form onSubmit={handleUpdateSize} className="flex items-center gap-2">
                                                                <div className="relative flex-grow">
                                                                    <input
                                                                        type="text"
                                                                        value={editSize.name}
                                                                        onChange={(e) => setEditSize({ ...editSize, name: e.target.value })}
                                                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                        autoFocus
                                                                    />
                                                                    {editSize.name && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setEditSize({ ...editSize, name: "" })}
                                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        type="submit"
                                                                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                                        disabled={!editSize?.name?.trim() || isLoading}
                                                                        title="Lưu"
                                                                    >
                                                                        <Save className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={cancelSizeEdit}
                                                                        className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                                                        title="Hủy"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        ) : (
                                                            <span className="text-gray-700 font-medium">{size.name}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {editSize.id !== size.id && (
                                                            <div className="flex justify-end space-x-2">
                                                                <button
                                                                    onClick={() => setEditSize(size)}
                                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => showDeleteConfirm(size.id, 'size')}
                                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>

                                {/* Pagination Controls for Sizes */}
                                {filteredSizes.length > 0 && (
                                    <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                                        <div className="flex-1 flex justify-between sm:hidden">
                                            <button
                                                onClick={() => setCurrentSizePage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentSizePage === 1}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Trước
                                            </button>
                                            <button
                                                onClick={() => setCurrentSizePage(prev => Math.min(prev + 1, totalSizePages))}
                                                disabled={currentSizePage === totalSizePages}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Sau
                                            </button>
                                        </div>
                                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div className="flex items-center">
                                                <label htmlFor="sizesPerPage" className="mr-2 text-sm text-gray-600">Hiển thị:</label>
                                                <select
                                                    id="sizesPerPage"
                                                    className="border border-gray-300 rounded-md text-sm p-1"
                                                    value={sizesPerPage}
                                                    onChange={handleSizesPerPageChange}
                                                >
                                                    <option value="5">5</option>
                                                    <option value="10">10</option>
                                                    <option value="25">25</option>
                                                    <option value="50">50</option>
                                                </select>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    Hiển thị <span className="font-medium">{indexOfFirstSize + 1}</span> đến <span className="font-medium">{Math.min(indexOfLastSize, filteredSizes.length)}</span> trong số <span className="font-medium">{filteredSizes.length}</span> kích thước
                                                </p>
                                            </div>
                                            <div>
                                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                    <button
                                                        onClick={() => setCurrentSizePage(1)}
                                                        disabled={currentSizePage === 1}
                                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="sr-only">Trang đầu</span>
                                                        <ChevronsLeft className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setCurrentSizePage(prev => Math.max(prev - 1, 1))}
                                                        disabled={currentSizePage === 1}
                                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="sr-only">Trang trước</span>
                                                        <ChevronLeft className="h-5 w-5" />
                                                    </button>

                                                    {/* Page numbers */}
                                                    {[...Array(totalSizePages)].map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setCurrentSizePage(index + 1)}
                                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentSizePage === index + 1
                                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {index + 1}
                                                        </button>
                                                    ))}

                                                    <button
                                                        onClick={() => setCurrentSizePage(prev => Math.min(prev + 1, totalSizePages))}
                                                        disabled={currentSizePage === totalSizePages}
                                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="sr-only">Trang sau</span>
                                                        <ChevronRight className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setCurrentSizePage(totalSizePages)}
                                                        disabled={currentSizePage === totalSizePages}
                                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="sr-only">Trang cuối</span>
                                                        <ChevronsRight className="h-5 w-5" />
                                                    </button>
                                                </nav>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                                {searchTerm ? (
                                    <>
                                        <p className="text-lg font-medium mb-1">Không tìm thấy kích thước nào</p>
                                        <p className="text-gray-400">Không có kích thước nào phù hợp với "{searchTerm}"</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-lg font-medium mb-1">Chưa có kích thước nào</p>
                                        <p className="text-gray-400">Hãy thêm kích thước đầu tiên của bạn</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Color Management Section */}
            {activeSection === "color" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Add new color form */}
                    <div className="p-5 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-medium text-gray-800 mb-4">Thêm màu sắc mới</h2>
                        <form onSubmit={handleAddColor} className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-grow relative">
                                <input
                                    type="text"
                                    value={newColor.color}
                                    onChange={(e) => setNewColor({ ...newColor, color: e.target.value })}
                                    placeholder="Nhập tên màu sắc..."
                                    className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex-grow relative flex items-center gap-2">
                                <input
                                    type="color"
                                    value={newColor.colorCode}
                                    onChange={(e) => {
                                        const colorCode = e.target.value;
                                        const colorName = namer(colorCode).ntc[0].name; // Automatically name the color
                                        setNewColor({ color: colorName, colorCode });
                                    }}
                                    className="w-10 h-10 border-0 p-0 rounded cursor-pointer"
                                    disabled={isLoading}
                                />
                                <input
                                    type="text"
                                    value={newColor.colorCode}
                                    onChange={(e) => {
                                        const colorCode = e.target.value;
                                        const colorName = namer(colorCode).ntc[0].name; // Automatically name the color
                                        setNewColor({ color: colorName, colorCode });
                                    }}
                                    placeholder="#000000"
                                    className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isLoading}
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={!newColor?.color?.trim() || !newColor?.colorCode?.trim() || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Đang thêm...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        <span>Thêm màu sắc</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Search and color list */}
                    <div className="p-5">
                        <div className="mb-4 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm kiếm màu sắc..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 p-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {isLoading && filteredColors.length === 0 ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : filteredColors.length > 0 ? (
                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tên màu sắc
                                            </th>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Mã màu
                                            </th>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Hiển thị
                                            </th>
                                            <th scope="col" className="px-4 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                                                Hành động
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <AnimatePresence>
                                            {currentColors.map((color) => (
                                                <motion.tr
                                                    key={color.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-4 py-3">
                                                        {editColor.id === color.id ? (
                                                            <form onSubmit={handleUpdateColor} className="flex items-center gap-2">
                                                                <div className="relative flex-grow">
                                                                    <input
                                                                        type="text"
                                                                        value={editColor.color}
                                                                        onChange={(e) => setEditColor({ ...editColor, color: e.target.value })}
                                                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                        autoFocus
                                                                    />
                                                                    {editColor.color && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setEditColor({ ...editColor, color: "" })}
                                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        type="submit"
                                                                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                                        disabled={!editColor?.color?.trim() || !editColor?.colorCode?.trim() || isLoading}
                                                                        title="Lưu"
                                                                    >
                                                                        <Save className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={cancelColorEdit}
                                                                        className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                                                        title="Hủy"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        ) : (
                                                            <span className="text-gray-700 font-medium">{color.color}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {editColor.id === color.id ? (
                                                            <div className="relative flex items-center gap-2">
                                                                <input
                                                                    type="color"
                                                                    value={editColor.colorCode}
                                                                    onChange={(e) => setEditColor({ ...editColor, colorCode: e.target.value })}
                                                                    className="w-8 h-8 border-0 p-0 rounded cursor-pointer"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={editColor.colorCode}
                                                                    onChange={(e) => setEditColor({ ...editColor, colorCode: e.target.value })}
                                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-700">{color.colorCode}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className="inline-block w-8 h-8 rounded-full border border-gray-200"
                                                            style={{ backgroundColor: color.colorCode }}
                                                        ></span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {editColor.id !== color.id && (
                                                            <div className="flex justify-end space-x-2">
                                                                <button
                                                                    onClick={() => setEditColor(color)}
                                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => showDeleteConfirm(color.id, 'color')}
                                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>

                                {/* Pagination Controls for Colors */}
                                {filteredColors.length > 0 && (
                                    <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                                        <div className="flex-1 flex justify-between sm:hidden">
                                            <button
                                                onClick={() => setCurrentColorPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentColorPage === 1}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Trước
                                            </button>
                                            <button
                                                onClick={() => setCurrentColorPage(prev => Math.min(prev + 1, totalColorPages))}
                                                disabled={currentColorPage === totalColorPages}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Sau
                                            </button>
                                        </div>
                                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div className="flex items-center">
                                                <label htmlFor="colorsPerPage" className="mr-2 text-sm text-gray-600">Hiển thị:</label>
                                                <select
                                                    id="colorsPerPage"
                                                    className="border border-gray-300 rounded-md text-sm p-1"
                                                    value={colorsPerPage}
                                                    onChange={handleColorsPerPageChange}
                                                >
                                                    <option value="5">5</option>
                                                    <option value="10">10</option>
                                                    <option value="25">25</option>
                                                    <option value="50">50</option>
                                                </select>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    Hiển thị <span className="font-medium">{indexOfFirstColor + 1}</span> đến <span className="font-medium">{Math.min(indexOfLastColor, filteredColors.length)}</span> trong số <span className="font-medium">{filteredColors.length}</span> màu sắc
                                                </p>
                                            </div>
                                            <div>
                                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                    <button
                                                        onClick={() => setCurrentColorPage(1)}
                                                        disabled={currentColorPage === 1}
                                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="sr-only">Trang đầu</span>
                                                        <ChevronsLeft className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setCurrentColorPage(prev => Math.max(prev - 1, 1))}
                                                        disabled={currentColorPage === 1}
                                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="sr-only">Trang trước</span>
                                                        <ChevronLeft className="h-5 w-5" />
                                                    </button>

                                                    {/* Page numbers */}
                                                    {[...Array(totalColorPages)].map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setCurrentColorPage(index + 1)}
                                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentColorPage === index + 1
                                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {index + 1}
                                                        </button>
                                                    ))}

                                                    <button
                                                        onClick={() => setCurrentColorPage(prev => Math.min(prev + 1, totalColorPages))}
                                                        disabled={currentColorPage === totalColorPages}
                                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="sr-only">Trang sau</span>
                                                        <ChevronRight className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setCurrentColorPage(totalColorPages)}
                                                        disabled={currentColorPage === totalColorPages}
                                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="sr-only">Trang cuối</span>
                                                        <ChevronsRight className="h-5 w-5" />
                                                    </button>
                                                </nav>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <Palette className="h-16 w-16 text-gray-300 mb-4" />
                                {searchTerm ? (
                                    <>
                                        <p className="text-lg font-medium mb-1">Không tìm thấy màu sắc nào</p>
                                        <p className="text-gray-400">Không có màu sắc nào phù hợp với "{searchTerm}"</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-lg font-medium mb-1">Chưa có màu sắc nào</p>
                                        <p className="text-gray-400">Hãy thêm màu sắc đầu tiên của bạn</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Brand Management Section */}
            {activeSection === "brand" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Add new brand form */}
                    <div className="p-5 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-medium text-gray-800 mb-4">Thêm thương hiệu mới</h2>
                        <form onSubmit={handleAddBrand} className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-grow relative">
                                <input
                                    type="text"
                                    value={newBrand.brandName}
                                    onChange={(e) => setNewBrand({ ...newBrand, brandName: e.target.value })}
                                    placeholder="Nhập tên thương hiệu mới..."
                                    className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isLoading}
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={!newBrand?.brandName?.trim() || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Đang thêm...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        <span>Thêm thương hiệu</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Search and brand list */}
                    <div className="p-5">
                        <div className="mb-4 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm kiếm thương hiệu..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 p-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {isLoading && filteredBrands.length === 0 ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : filteredBrands.length > 0 ? (
                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tên thương hiệu
                                            </th>
                                            <th scope="col" className="px-4 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                                                Hành động
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <AnimatePresence>
                                            {currentBrands.map((brand) => (
                                                <motion.tr
                                                    key={brand.brandId}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-4 py-3">
                                                        {editBrand.id === brand.brandId ? (
                                                            <form onSubmit={handleUpdateBrand} className="flex items-center gap-2">
                                                                <div className="relative flex-grow">
                                                                    <input
                                                                        type="text"
                                                                        value={editBrand.brandName}
                                                                        onChange={(e) => setEditBrand({ ...editBrand, brandName: e.target.value })}
                                                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                        autoFocus
                                                                    />
                                                                    {editBrand.brandName && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setEditBrand({ ...editBrand, brandName: "" })}
                                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        type="submit"
                                                                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                                        disabled={!editBrand?.brandName?.trim() || isLoading}
                                                                        title="Lưu"
                                                                    >
                                                                        <Save className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={cancelBrandEdit}
                                                                        className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                                                        title="Hủy"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        ) : (
                                                            <span className="text-gray-700 font-medium">{brand.brandName}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {editBrand.id !== brand.brandId && (
                                                            <div className="flex justify-end space-x-2">
                                                                <button
                                                                    onClick={() => setEditBrand({ id: brand.brandId, brandName: brand.brandName })}
                                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => showDeleteConfirm(brand.brandId, 'brand')}
                                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>

                                {/* Pagination Controls for Brands */}
                                {filteredBrands.length > 0 && (
                                    <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                                        <div className="flex-1 flex justify-between sm:hidden">
                                            <button
                                                onClick={() => setCurrentBrandPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentBrandPage === 1}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Trước
                                            </button>
                                            <button
                                                onClick={() => setCurrentBrandPage(prev => Math.min(prev + 1, totalBrandPages))}
                                                disabled={currentBrandPage === totalBrandPages}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Sau
                                            </button>
                                        </div>
                                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div className="flex items-center">
                                                <label htmlFor="brandsPerPage" className="mr-2 text-sm text-gray-600">Hiển thị:</label>
                                                <select
                                                    id="brandsPerPage"
                                                    className="border border-gray-300 rounded-md text-sm p-1"
                                                    value={brandsPerPage}
                                                    onChange={handleBrandsPerPageChange}
                                                >
                                                    <option value="5">5</option>
                                                    <option value="10">10</option>
                                                    <option value="25">25</option>
                                                    <option value="50">50</option>
                                                </select>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    Hiển thị <span className="font-medium">{indexOfFirstBrand + 1}</span> đến <span className="font-medium">{Math.min(indexOfLastBrand, filteredBrands.length)}</span> trong số <span className="font-medium">{filteredBrands.length}</span> thương hiệu
                                                </p>
                                            </div>
                                            <div>
                                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                    <button
                                                        onClick={() => setCurrentBrandPage(1)}
                                                        disabled={currentBrandPage === 1}
                                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="sr-only">Trang đầu</span>
                                                        <ChevronsLeft className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setCurrentBrandPage(prev => Math.max(prev - 1, 1))}
                                                        disabled={currentBrandPage === 1}
                                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="sr-only">Trang trước</span>
                                                        <ChevronLeft className="h-5 w-5" />
                                                    </button>

                                                    {/* Page numbers */}
                                                    {[...Array(totalBrandPages)].map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setCurrentBrandPage(index + 1)}
                                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentBrandPage === index + 1
                                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {index + 1}
                                                        </button>
                                                    ))}

                                                    <button
                                                        onClick={() => setCurrentBrandPage(prev => Math.min(prev + 1, totalBrandPages))}
                                                        disabled={currentBrandPage === totalBrandPages}
                                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="sr-only">Trang sau</span>
                                                        <ChevronRight className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setCurrentBrandPage(totalBrandPages)}
                                                        disabled={currentBrandPage === totalBrandPages}
                                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="sr-only">Trang cuối</span>
                                                        <ChevronsRight className="h-5 w-5" />
                                                    </button>
                                                </nav>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <Building2 className="h-16 w-16 text-gray-300 mb-4" />
                                {searchTerm ? (
                                    <>
                                        <p className="text-lg font-medium mb-1">Không tìm thấy thương hiệu nào</p>
                                        <p className="text-gray-400">Không có thương hiệu nào phù hợp với "{searchTerm}"</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-lg font-medium mb-1">Chưa có thương hiệu nào</p>
                                        <p className="text-gray-400">Hãy thêm thương hiệu đầu tiên của bạn</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {confirmDelete && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-lg shadow-lg max-w-md w-full p-6"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            <div className="flex items-start mb-4">
                                <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">Xác nhận xóa</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Bạn có chắc chắn muốn xóa
                                        {deleteType === 'category' ? ' danh mục' : 
                                         deleteType === 'size' ? ' kích thước' : 
                                         deleteType === 'color' ? ' màu sắc' : ' thương hiệu'}
                                        này? Hành động này không thể hoàn tác.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setConfirmDelete(null);
                                        setDeleteType(null);
                                    }}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Đang xóa...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="h-4 w-4" />
                                            <span>Xóa</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Categories;