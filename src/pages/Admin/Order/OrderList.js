import React, { useEffect, useState } from "react";
import { fetchAllOrder } from "../../../redux/service/orderService";
import { motion } from "framer-motion";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Quản lý tìm kiếm
  const [page, setPage] = useState(0); // Quản lý trang hiện tại
  const [itemsPerPage, setItemsPerPage] = useState(10); // Số lượng đơn hàng mỗi trang
  const [totalPages, setTotalPages] = useState(0); // Tổng số trang

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await fetchAllOrder(); // Gọi API trực tiếp từ service
        setOrders(data);
        setTotalPages(Math.ceil(data.length / itemsPerPage)); // Tính tổng số trang
      } catch (err) {
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [itemsPerPage]);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId((prevId) => (prevId === orderId ? null : orderId));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0); // Reset về trang đầu tiên khi tìm kiếm
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedOrders = filteredOrders.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Cuộn lên đầu trang
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-20">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-500">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        <p>Đã xảy ra lỗi: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Danh sách đơn hàng</h2>

      {/* Tìm kiếm */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm đơn hàng..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {paginatedOrders && paginatedOrders.length > 0 ? (
        <div className="space-y-4">
          {paginatedOrders.map((order) => (
            <div
              key={order.orderCode}
              className="border border-gray-300 rounded-lg p-4 shadow-sm"
            >
              {/* Thông tin cơ bản của đơn hàng */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-800 font-medium">
                    Mã đơn hàng: {order.orderCode}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Người đặt: {order.userName}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Ngày đặt: {new Date(order.orderDate).toLocaleString()}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Trạng thái:{" "}
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === "Đã giao"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </p>
                  <p className="text-gray-600 text-sm">
                    Tổng tiền:{" "}
                    <span className="font-medium text-blue-600">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(order.totalAmount)}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => toggleOrderDetails(order.orderCode)}
                  className="text-blue-500 hover:text-blue-700 underline"
                >
                  {expandedOrderId === order.orderCode
                    ? "Ẩn chi tiết"
                    : "Xem chi tiết"}
                </button>
              </div>

              {/* Chi tiết đơn hàng */}
              {expandedOrderId === order.orderCode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 border-t border-gray-200 pt-4"
                >
                  <h3 className="text-gray-800 font-medium mb-2">
                    Chi tiết sản phẩm
                  </h3>
                  <div className="space-y-2">
                    {order.orderDetails.map((detail, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 border border-gray-200 rounded-lg p-3"
                      >
                        <img
                          src={detail.imgUrl}
                          alt={detail.productName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <p className="text-gray-800 font-medium">
                            {detail.productName}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Số lượng: {detail.quantity}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Kích thước: {detail.size}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Màu sắc: {detail.color}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Tổng tiền:{" "}
                            <span className="font-medium text-blue-600">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(detail.totalPrice)}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">Không có đơn hàng nào.</p>
      )}

      {/* Phân trang */}
      {filteredOrders.length > itemsPerPage && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            className={`px-4 py-2 border rounded-lg ${
              page === 0
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-blue-500 border-blue-500 hover:bg-blue-50"
            }`}
          >
            Trang trước
          </button>
          <span>
            Trang {page + 1} / {Math.ceil(filteredOrders.length / itemsPerPage)}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages - 1}
            className={`px-4 py-2 border rounded-lg ${
              page === totalPages - 1
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-blue-500 border-blue-500 hover:bg-blue-50"
            }`}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderList;