import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../../../redux/actions/productActions";
import { useNavigate } from "react-router-dom";
import ModalAddProduct from "./ModalAddProduct";
import {
  Plus, Search, ChevronLeft, ChevronRight, Eye, Trash2,
  ArrowUp, ArrowDown, Filter, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ProductTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, totalPages, totalElements, loading, error } = useSelector((state) => state.product);

  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(getProducts(page, itemsPerPage));
  }, [dispatch, page, itemsPerPage]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    const sortableProducts = [...products];
    if (sortConfig.key) {
      sortableProducts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableProducts;
  }, [products, sortConfig]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return sortedProducts;

    return sortedProducts.filter(product =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brandName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedProducts, searchTerm]);

  const columns = useMemo(
    () => [
      {
        Header: "Tên sản phẩm",
        accessor: "productName",
        sortable: true,
      },
      {
        Header: "Ảnh",
        accessor: "mainImage",
        Cell: ({ row }) => (
          <div className="w-16 h-16 relative group">
            <img
              src={row.original.mainImage.path}
              alt="productImage"
              className="w-full h-full object-cover rounded-lg shadow-sm border border-gray-200 group-hover:border-blue-400 transition-all"
            />
            <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
            </div>
          </div>
        ),
        sortable: false,
      },
      {
        Header: "Giá",
        accessor: "price",
        Cell: ({ value }) => (
          <span className="font-medium text-gray-800">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
          </span>
        ),
        sortable: true,
      },
      {
        Header: "Giá khuyến mãi",
        accessor: "discountPrice",
        Cell: ({ value, row }) => (
          value ? (
            <div className="flex flex-col">
              <span className="font-medium text-blue-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
              </span>
              {value && row.original.price && (
                <span className="text-xs text-green-600">
                  {Math.round((1 - value / row.original.price) * 100)}% giảm
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400">—</span>
          )
        ),
        sortable: true,
      },
      {
        Header: "Danh mục",
        accessor: "categoryName",
        Cell: ({ value }) => (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            {value}
          </span>
        ),
        sortable: true,
      },
      {
        Header: "Thương hiệu",
        accessor: "brandName",
        Cell: ({ value }) => (
          <span className="inline-block">
            {value}
          </span>
        ),
        sortable: true,
      },
      {
        Header: "Hành động",
        accessor: "id",
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/admin/products/${row.original.id}`)}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              aria-label="View product details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDeleteConfirmation(row.original)}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              aria-label="Delete product"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
        sortable: false,
      },
    ],
    [navigate]
  );

  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setPage(0);
  };

  const handleAddProductClick = () => {
    setIsAddProductModalOpen(true);
  };

  const handleAddProductModalClose = () => {
    setIsAddProductModalOpen(false);
    refreshProducts();
  };

  const openDeleteConfirmation = (product) => {
    setProductToDelete(product);
    setIsConfirmDeleteOpen(true);
  };

  const handleDeleteProduct = async () => {
    try {
      // await dispatch(); // Add your delete action here
      setIsConfirmDeleteOpen(false);
      refreshProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const refreshProducts = () => {
    setIsRefreshing(true);
    dispatch(getProducts(page, itemsPerPage))
      .finally(() => {
        setTimeout(() => setIsRefreshing(false), 500);
      });
  };

  // Calculate visible page numbers
  const getVisiblePageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 0; i < totalPages; i++) {
      if (
        i === 0 ||
        i === totalPages - 1 ||
        (i >= page - delta && i <= page + delta)
      ) {
        range.push(i);
      } else if (i === page - delta - 1 || i === page + delta + 1) {
        range.push("...");
      }
    }

    for (const i of range) {
      if (l) {
        if (i === "...") {
          rangeWithDots.push(i);
        } else if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-3 sm:mb-0">Danh sách sản phẩm</h2>

        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 sm:items-center">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={refreshProducts}
              className={`p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center ${isRefreshing ? 'animate-spin' : ''}`}
              aria-label="Refresh products"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>

            <button
              onClick={handleAddProductClick}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm sản phẩm</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table container with horizontal scroll for small screens */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                  onClick={() => col.sortable && handleSort(col.accessor)}
                >
                  <div className="flex items-center">
                    <span>{col.Header}</span>
                    {col.sortable && (
                      <div className="ml-1 flex flex-col">
                        <ArrowUp
                          className={`w-3 h-3 ${sortConfig.key === col.accessor && sortConfig.direction === 'asc' ? 'text-blue-500' : 'text-gray-300'}`}
                        />
                        <ArrowDown
                          className={`w-3 h-3 mt-[-5px] ${sortConfig.key === col.accessor && sortConfig.direction === 'desc' ? 'text-blue-500' : 'text-gray-300'}`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4">
                  <div className="flex justify-center items-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-500">Đang tải...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4">
                  <div className="flex justify-center items-center text-red-500">
                    <span className="mr-2">⚠️</span> {error}
                  </div>
                </td>
              </tr>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <motion.tr
                  key={product.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.accessor} className="px-6 py-4 whitespace-nowrap">
                      {col.Cell ? col.Cell({ row: { original: product }, value: product[col.accessor] }) : product[col.accessor]}
                    </td>
                  ))}
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4">
                  <div className="flex flex-col justify-center items-center h-32 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-center">Không tìm thấy sản phẩm nào</p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="mt-2 text-blue-500 hover:text-blue-700 underline focus:outline-none"
                      >
                        Xóa tìm kiếm
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalElements > 0 && !loading && (
        <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="text-sm text-gray-600 mb-4 md:mb-0">
            <p>
              Hiển thị <span className="font-medium">{(page * itemsPerPage) + 1} - {Math.min((page + 1) * itemsPerPage, totalElements)}</span> trong tổng số <span className="font-medium">{totalElements}</span> sản phẩm
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
                className={`flex items-center justify-center w-9 h-9 rounded-full border transition-colors ${
                  page === 0
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300'
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="hidden md:flex space-x-1">
                {getVisiblePageNumbers().map((pageNum, index) => (
                  pageNum === "..." ? (
                    <span key={`ellipsis-${index}`} className="w-9 flex items-center justify-center">...</span>
                  ) : (
                    <button
                      key={`page-${pageNum}`}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-full transition-colors ${
                        pageNum === page
                          ? 'bg-blue-500 text-white font-medium'
                          : 'text-gray-600 hover:bg-blue-50'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  )
                ))}
              </div>

              <span className="md:hidden text-gray-600">
                Trang {page + 1} / {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages - 1}
                className={`flex items-center justify-center w-9 h-9 rounded-full border transition-colors ${
                  page === totalPages - 1
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300'
                }`}
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Items per page"
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={30}>30 / trang</option>
            </select>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductModalOpen && (
        <ModalAddProduct
          isOpen={isAddProductModalOpen}
          onRequestClose={handleAddProductModalClose}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isConfirmDeleteOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Xác nhận xóa sản phẩm</h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa sản phẩm "{productToDelete?.productName}"? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsConfirmDeleteOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                >
                  Xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductTable;
