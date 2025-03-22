import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCategories } from "../../../redux/actions/categoryAction";
import { updateCategory, addCategory, deleteCategory } from "../../../redux/service/categoryService";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag, Plus, Edit, Trash2, Save, X, Search,
  AlertCircle, Check, RefreshCw, FileText
} from "lucide-react";

const Categories = () => {
    const dispatch = useDispatch();
    const categories = useSelector((state) => state.category.categories);
    const [newCategory, setNewCategory] = useState("");
    const [editCategory, setEditCategory] = useState({ id: null, name: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [successMessage, setSuccessMessage] = useState({ show: false, message: "" });

    // Filtered categories based on search
    const filteredCategories = categories?.filter(
        category => category.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    useEffect(() => {
        loadCategories();
    }, [dispatch]);

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

    // Show success message with auto-dismiss
    const showSuccess = (message) => {
        setSuccessMessage({ show: true, message });
        setTimeout(() => {
            setSuccessMessage({ show: false, message: "" });
        }, 3000);
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        setIsLoading(true);
        try {
            await addCategory({ name: newCategory.trim() });
            setNewCategory("");
            await dispatch(getCategories());
            showSuccess("Danh mục đã được thêm thành công!");
        } catch (error) {
            console.error("Failed to add category:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        if (!editCategory.name.trim()) return;

        setIsLoading(true);
        try {
            await updateCategory(editCategory.id, { name: editCategory.name.trim() });
            setEditCategory({ id: null, name: "" });
            await dispatch(getCategories());
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
            await deleteCategory(categoryId);
            await dispatch(getCategories());
            setConfirmDelete(null);
            showSuccess("Đã xóa danh mục thành công!");
        } catch (error) {
            console.error("Failed to delete category:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Cancel edit mode
    const cancelEdit = () => {
        setEditCategory({ id: null, name: "" });
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Tag className="mr-2 h-6 w-6 text-blue-500" />
                        Quản lý danh mục
                    </h1>
                    <p className="text-gray-500 mt-1">Quản lý danh mục sản phẩm trong cửa hàng của bạn</p>
                </div>

                <button
                    onClick={loadCategories}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors px-3 py-1 rounded-md hover:bg-blue-50"
                    disabled={isLoading}
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Làm mới</span>
                </button>
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Add new category form */}
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Thêm danh mục mới</h2>
                    <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-grow relative">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Nhập tên danh mục mới..."
                                className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isLoading}
                            />
                            {newCategory && (
                                <button
                                    type="button"
                                    onClick={() => setNewCategory("")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={!newCategory.trim() || isLoading}
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

                    {isLoading && categories.length === 0 ? (
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
                                        <th scope="col" className="px-4 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                                            Hành động
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <AnimatePresence>
                                        {filteredCategories.map((category) => (
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
                                                                    disabled={!editCategory.name.trim() || isLoading}
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
                                                        <span className="text-gray-700 font-medium">{category.name}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {editCategory.id !== category.id && (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => setEditCategory({ id: category.id, name: category.name })}
                                                                className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setConfirmDelete(category.id)}
                                                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                                title="Xóa"
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
                                        Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => handleDeleteCategory(confirmDelete)}
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
