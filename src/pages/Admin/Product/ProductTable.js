import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../../../redux/actions/productActions";
import { useNavigate } from "react-router-dom";
import ModalAddProduct from "./ModalAddProduct";

const ProductTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, totalPages, totalElements, loading, error } = useSelector((state) => state.product);

  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false); // State for modal

  useEffect(() => {
    dispatch(getProducts(page, itemsPerPage));
  }, [dispatch, page, itemsPerPage]);


  const columns = useMemo(
    () => [
      {
        Header: "Tên sản phẩm",
        accessor: "productName",
      },
      {
        Header: "Ảnh",
        accessor: "mainImage",
        Cell: ({ row }) => (
          <div className="w-20 h-20">
            <img
              src={row.original.mainImage.path}
              alt="productImage"
              className="w-full h-full object-contain rounded"
            />
          </div>
        ),
      },
      {
        Header: "Giá",
        accessor: "price",
      },
      {
        Header: "Giá khuyến mãi",
        accessor: "discountPrice",
      },
      {
        Header: "Danh mục",
        accessor: "categoryName",
      },
      {
        Header: "Thương hiệu",
        accessor: "brandName",
      },
      {
        Header: "Hành động",
        accessor: "id",
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/admin/products/${row.original.id}`)}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
            >
              View
            </button>
            <button
              onClick={() => handleDeleteProduct(row.original.id)}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 transition duration-200"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  );

  const handlePageChange = (newPage) => {
    setPage(newPage);
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
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      try {
        await dispatch(); // Add your action here
        dispatch(getProducts(page, itemsPerPage)); // Refresh the product list
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Danh sách sản phẩm</h2>

      {/* Button to open Add Product modal */}
      <button
        onClick={handleAddProductClick}
        className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Thêm sản phẩm
      </button>

      {/* Bảng sản phẩm */}
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((col) => (
              <th key={col.accessor} className="px-4 py-2 border">{col.Header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">Đang tải...</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-red-500">{error}</td>
            </tr>
          ) : products.length > 0 ? (
            products.map((product, index) => (
              <tr key={index} className="border-b">
                {columns.map((col) => (
                  <td key={col.accessor} className="px-4 py-2 border">
                    {col.Cell ? col.Cell({ row: { original: product } }) : product[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">Không có sản phẩm nào.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-gray-600">
          Hiển thị {(page * itemsPerPage) + 1} - {Math.min((page + 1) * itemsPerPage, totalElements)} trên tổng số {totalElements} sản phẩm
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            className="px-3 py-2 rounded border bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Trước
          </button>

          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index)}
              className={`px-3 py-2 rounded border ${index === page ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages - 1}
            className="px-3 py-2 rounded border bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Sau
          </button>
        </div>

        {/* Số sản phẩm trên mỗi trang */}
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="border px-3 py-2 rounded"
        >
          <option value={10}>10 sản phẩm/trang</option>
          <option value={20}>20 sản phẩm/trang</option>
          <option value={30}>30 sản phẩm/trang</option>
        </select>
      </div>

      {/* Add Product Modal */}
      {isAddProductModalOpen && (
        <ModalAddProduct
          isOpen={isAddProductModalOpen}
          onRequestClose={handleAddProductModalClose}
        />
      )}
    </div>
  );
};

export default ProductTable;