import React, { useEffect, useMemo, useState } from "react";
import {
    addCollection,
    fetchAllCollections,
    updateCollection,
    deleteCollection,
    addProductToCollection,
    removeProductFromCollection,
} from "../../../redux/service/collectionService";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Trash2, Eye, X } from "lucide-react";
import { getProducts } from "../../../redux/actions/productActions";

const CollectionTable = () => {
    const { products, loading: loadingProducts, error: errorProducts } = useSelector((state) => state.product);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [refresh, setRefresh] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState("");
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editCollectionName, setEditCollectionName] = useState("");
    const [deleteId, setDeleteId] = useState(null);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [addToCollectionProductId, setAddToCollectionProductId] = useState(null);
    const [addToCollectionModalOpen, setAddToCollectionModalOpen] = useState(false);
    const [addToCollectionSelectedCollection, setAddToCollectionSelectedCollection] = useState(null);
    const [page, setPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // Validation states
    const [addValidationError, setAddValidationError] = useState("");
    const [editValidationError, setEditValidationError] = useState("");
    
    const dispatch = useDispatch();

    // Validation functions
    const validateCollectionName = (name, excludeId = null) => {
        if (!name || !name.trim()) {
            return "Tên bộ sưu tập không được để trống";
        }
        
        const trimmedName = name.trim();
        
        if (trimmedName.length < 2) {
            return "Tên bộ sưu tập phải có ít nhất 2 ký tự";
        }
        
        if (trimmedName.length > 100) {
            return "Tên bộ sưu tập không được vượt quá 100 ký tự";
        }
        
        // Check for duplicate names (case insensitive)
        const existingCollection = collections.find(col => 
            col.name.toLowerCase() === trimmedName.toLowerCase() && 
            col.id !== excludeId
        );
        
        if (existingCollection) {
            return "Tên bộ sưu tập đã tồn tại";
        }
        
        // Check for special characters that might cause issues
        const specialCharRegex = /[<>:"/\\|?*]/;
        if (specialCharRegex.test(trimmedName)) {
            return "Tên bộ sưu tập không được chứa ký tự đặc biệt: < > : \" / \\ | ? *";
        }
        
        return "";
    };

    useEffect(() => {
        const loadCollections = async () => {
            setLoading(true);
            try {
                const res = await fetchAllCollections();
                const data = Array.isArray(res) ? res : (res?.data ?? []);
                setCollections(data);
                setError("");
            } catch (err) {
                setError("Không thể tải danh sách bộ sưu tập");
                setCollections([]);
            }
            setLoading(false);
        };
        loadCollections();
    }, [refresh]);

    // Map productId -> collectionName (nếu có)
    const productIdToCollection = useMemo(() => {
        const map = {};
        collections.forEach((col) => {
            (col.products || []).forEach((prod) => {
                map[prod.id] = col.name;
            });
        });
        return map;
    }, [collections]);

    // Sắp xếp sản phẩm theo tên bộ sưu tập (có thể là undefined)
    const sortedProducts = useMemo(() => {
        return [...(products || [])].sort((a, b) => {
            const colA = productIdToCollection[a.id] || "";
            const colB = productIdToCollection[b.id] || "";
            return colA.localeCompare(colB);
        });
    }, [products, productIdToCollection]);

    // Thêm collection mới
    const handleAddCollection = async () => {
        const validationError = validateCollectionName(newCollectionName);
        if (validationError) {
            setAddValidationError(validationError);
            return;
        }
        
        setAddValidationError("");
        try {
            await addCollection({ collectionName: newCollectionName.trim() });
            setNewCollectionName("");
            setIsAddModalOpen(false);
            setRefresh((r) => !r);
        } catch (err) {
            alert("Thêm bộ sưu tập thất bại!");
        }
    };

    // Xóa collection
    const handleDeleteCollection = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bộ sưu tập này?")) return;
        try {
            await deleteCollection(id);
            setRefresh((r) => !r);
        } catch (err) {
            alert("Xóa thất bại!");
        }
    };

    // Mở modal chỉnh sửa
    const openEditModal = (collection) => {
        setSelectedCollection(collection);
        setEditCollectionName(collection.name);
        setEditValidationError("");
        setIsEditModalOpen(true);
    };

    // Cập nhật collection
    const handleUpdateCollection = async () => {
        const validationError = validateCollectionName(editCollectionName, selectedCollection?.id);
        if (validationError) {
            setEditValidationError(validationError);
            return;
        }
        
        setEditValidationError("");
        try {
            await updateCollection({ collectionId: selectedCollection.id, collectionName: editCollectionName.trim() });
            setIsEditModalOpen(false);
            setSelectedCollection(null);
            setRefresh((r) => !r);
        } catch (err) {
            alert("Cập nhật thất bại!");
        }
    };

    // Thêm sản phẩm vào collection
    const handleAddProductToCollection = async (collectionId, productIdOverride) => {
        const productId = productIdOverride || selectedProductId;
        if (!productId) return;
        try {
            await addProductToCollection({ collectionId, productId });
            setSelectedProductId("");
            setRefresh((r) => !r);
            dispatch(getProducts(page, itemsPerPage));
        } catch (err) {
            alert("Thêm sản phẩm thất bại!");
        }
    };

    // Xóa sản phẩm khỏi bộ sưu tập
    const handleRemoveProductFromCollection = async (productId, collectionIdOverride) => {
        let collectionId = collectionIdOverride;
        if (!collectionId) {
            const collectionName = productIdToCollection[productId];
            if (!collectionName) return;
            const collection = collections.find((col) => col.name === collectionName);
            if (!collection) return;
            collectionId = collection.id;
        }
        if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm khỏi bộ sưu tập này?")) return;
        try {
            await removeProductFromCollection(collectionId, productId);
            setRefresh((r) => !r);
        } catch (err) {
            alert("Xóa sản phẩm khỏi bộ sưu tập thất bại!");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Danh sách sản phẩm trong bộ sưu tập</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm bộ sưu tập
                    </button>
                </div>
            </div>
            {loading ? (
                <div>Đang tải...</div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : (
                <div className="w-full overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ảnh</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá khuyến mãi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thương hiệu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bộ sưu tập</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading || loadingProducts ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-4 text-center">Đang tải...</td>
                                </tr>
                            ) : error || errorProducts ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-4 text-center text-red-500">{error || errorProducts}</td>
                                </tr>
                            ) : sortedProducts.length > 0 ? (
                                sortedProducts.map((prod) => (
                                    <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="w-16 h-16 relative group">
                                                <img
                                                    src={prod.mainImage?.path || ''}
                                                    alt="productImage"
                                                    className="w-full h-full object-cover rounded-lg shadow-sm border border-gray-200 group-hover:border-blue-400 transition-all"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{prod.productName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-medium text-gray-800">
                                                {prod.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.price) : '--'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {prod.discountPrice ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-blue-600">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.discountPrice)}
                                                    </span>
                                                    {prod.price && (
                                                        <span className="text-xs text-green-600">
                                                            {Math.round((1 - prod.discountPrice / prod.price) * 100)}% giảm
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                                {prod.categoryName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{prod.brandName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`font-medium ${prod.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {prod.quantity > 0 ? `${prod.quantity} sản phẩm` : "Hết hàng"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {prod.collectionName ? prod.collectionName : <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                {productIdToCollection[prod.id] ? (
                                                    <button
                                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                                        onClick={() => {
                                                            const collection = collections.find(col => col.name === productIdToCollection[prod.id]);
                                                            if (collection) handleRemoveProductFromCollection(prod.id, collection.id);
                                                        }}
                                                        title="Xoá sản phẩm khỏi bộ sưu tập"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                                                        onClick={() => {
                                                            setAddToCollectionProductId(prod.id);
                                                            setAddToCollectionModalOpen(true);
                                                        }}
                                                        title="Thêm vào bộ sưu tập"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">Không có sản phẩm nào</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal thêm bộ sưu tập */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-4">Thêm bộ sưu tập</h3>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Tên bộ sưu tập"
                                value={newCollectionName}
                                onChange={(e) => {
                                    setNewCollectionName(e.target.value);
                                    if (addValidationError) {
                                        setAddValidationError("");
                                    }
                                }}
                                className={`w-full border rounded px-3 py-2 ${addValidationError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                maxLength={100}
                            />
                            {addValidationError && (
                                <p className="text-red-500 text-sm mt-1">{addValidationError}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">
                                {newCollectionName.length}/100 ký tự
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setNewCollectionName("");
                                    setAddValidationError("");
                                }}
                                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAddCollection}
                                disabled={!newCollectionName.trim()}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Thêm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal sửa bộ sưu tập */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-4">Sửa bộ sưu tập</h3>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Tên bộ sưu tập"
                                value={editCollectionName}
                                onChange={(e) => {
                                    setEditCollectionName(e.target.value);
                                    if (editValidationError) {
                                        setEditValidationError("");
                                    }
                                }}
                                className={`w-full border rounded px-3 py-2 ${editValidationError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                maxLength={100}
                            />
                            {editValidationError && (
                                <p className="text-red-500 text-sm mt-1">{editValidationError}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">
                                {editCollectionName.length}/100 ký tự
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setEditValidationError("");
                                }}
                                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleUpdateCollection}
                                disabled={!editCollectionName.trim()}
                                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal thêm sản phẩm vào bộ sưu tập cho từng sản phẩm */}
            {addToCollectionModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-4">Thêm sản phẩm vào bộ sưu tập</h3>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium">Chọn bộ sưu tập</label>
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={addToCollectionSelectedCollection ? addToCollectionSelectedCollection.id : ""}
                                onChange={e => {
                                    const col = collections.find(c => c.id === e.target.value);
                                    setAddToCollectionSelectedCollection(col || null);
                                }}
                            >
                                <option value="">-- Chọn bộ sưu tập --</option>
                                {collections && collections.map(col => (
                                    <option key={col.id} value={col.id}>{col.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setAddToCollectionModalOpen(false)}
                                className="px-4 py-2 border rounded text-gray-700"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={async () => {
                                    if (!addToCollectionProductId || !addToCollectionSelectedCollection) return alert("Vui lòng chọn bộ sưu tập");
                                    await handleAddProductToCollection(addToCollectionSelectedCollection.id, addToCollectionProductId);
                                    setAddToCollectionModalOpen(false);
                                    setAddToCollectionSelectedCollection(null);
                                    setAddToCollectionProductId(null);
                                }}
                                className="px-4 py-2 bg-green-500 text-white rounded"
                            >
                                Thêm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bảng danh sách bộ sưu tập */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Danh sách bộ sưu tập</h3>
                <div className="w-full overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên bộ sưu tập</th>

                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {collections.map((col) => (
                                <tr key={col.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{col.name}</td>

                                    <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                                        <button
                                            className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-xs"
                                            onClick={() => openEditModal(col)}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                            onClick={() => handleDeleteCollection(col.id)}
                                        >
                                            Xoá
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CollectionTable;