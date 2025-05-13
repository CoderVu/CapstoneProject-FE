import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { fetchOrders } from "../../../redux/actions/orderAction";
import { updateOrderStatus } from "../../../redux/service/orderService";
import {
  Search,
  Package,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Pagination from "./Pagination";

const ORDER_STATUS = {
  PENDING: { color: "bg-yellow-100 text-yellow-800", text: "Chờ xác nhận" },
  PAID: { color: "bg-green-100 text-green-800", text: "Đã thanh toán" },
  PROCESSING: { color: "bg-blue-100 text-blue-800", text: "Đang xử lý" },
  SHIPPED: { color: "bg-indigo-100 text-indigo-800", text: "Đang giao hàng" },
  DELIVERED: { color: "bg-green-100 text-green-800", text: "Đã giao hàng" },
  CANCELED: { color: "bg-red-100 text-red-800", text: "Đã hủy" },
  DEFAULT: { color: "bg-gray-100 text-gray-800", text: "Không xác định" },
};

const OrderList = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { orders = [], totalPages = 0, totalElements = 0, loading, error } = useSelector((state) => state.order);

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [statusDialog, setStatusDialog] = useState({
    isOpen: false,
    orderId: null,
    currentStatus: null,
    newStatus: null,
    isUpdating: false,
    error: null,
    success: false,
  });

  useEffect(() => {
    dispatch(fetchOrders(currentPage, itemsPerPage, searchTerm, statusFilter, dateRange));
  }, [dispatch, currentPage, itemsPerPage, searchTerm, statusFilter, dateRange]);

  useEffect(() => {
    // Check if we have searchOrderCode from navigation state
    if (location.state?.searchOrderCode) {
      setSearchTerm(location.state.searchOrderCode);
      // Clear the state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);

  const handleDateChange = (e, field) => {
    setDateRange((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setSearchTerm("");
    setDateRange({ startDate: "", endDate: "" });
    dispatch(fetchOrders(currentPage, itemsPerPage, searchTerm, statusFilter, { startDate: "", endDate: "" }))
      .finally(() => setIsRefreshing(false));
  };

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleItemsPerPageChange = (size) => {
    setItemsPerPage(size);
    setCurrentPage(0); // Reset to the first page
  };

  const openStatusDialog = (order) => {
    setStatusDialog({
      isOpen: true,
      orderId: order.orderCode,
      currentStatus: order.status,
      newStatus: order.status,
      isUpdating: false,
      error: null,
      success: false,
    });
  };

  const closeStatusDialog = () => {
    setStatusDialog({
      isOpen: false,
      orderId: null,
      currentStatus: null,
      newStatus: null,
      isUpdating: false,
      error: null,
      success: false,
    });
  };

  const handleStatusChange = (status) => {
    setStatusDialog((prev) => ({
      ...prev,
      newStatus: status,
      error: null,
    }));
  };

  const handleUpdateStatus = async () => {
    try {
      if (statusDialog.currentStatus === "CANCELED") {
        setStatusDialog((prev) => ({
          ...prev,
          error: "Không thể cập nhật trạng thái cho đơn hàng đã bị hủy.",
        }));
        return;
      }

      if (statusDialog.currentStatus === statusDialog.newStatus) {
        setStatusDialog((prev) => ({
          ...prev,
          error: "Vui lòng chọn trạng thái khác với trạng thái hiện tại.",
        }));
        return;
      }

      setStatusDialog((prev) => ({ ...prev, isUpdating: true, error: null }));

      await updateOrderStatus(statusDialog.orderId, statusDialog.newStatus);

      setStatusDialog((prev) => ({
        ...prev,
        isUpdating: false,
        success: true,
        error: null,
      }));

      setTimeout(() => {
        dispatch(fetchOrders(currentPage, itemsPerPage, searchTerm, statusFilter, dateRange));
        closeStatusDialog();
      }, 1500);
    } catch (error) {
      console.error("Failed to update order status:", error);
      setStatusDialog((prev) => ({
        ...prev,
        isUpdating: false,
        error: "Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.",
      }));
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId((prevId) => (prevId === orderId ? null : orderId));
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      (order.orderCode && order.orderCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.userName && order.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.orderDetails.some((detail) =>
        detail.productName && detail.productName.toLowerCase().includes(searchTerm.toLowerCase())
      ));



    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    let matchesDate = true; 
    if (dateRange.startDate) {
      const orderDate = new Date(order.orderDate);
      const startDate = new Date(dateRange.startDate);
      matchesDate = orderDate >= startDate;
    }
    if (dateRange.endDate && matchesDate) {
      const orderDate = new Date(order.orderDate);
      const endDate = new Date(dateRange.endDate);
      matchesDate = orderDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Status Update Dialog */}
      {statusDialog.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Cập nhật trạng thái đơn hàng
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Đơn hàng: <span className="font-medium">#{statusDialog.orderId}</span>
                      </p>

                      <p className="text-sm text-gray-500 mb-4">
                        Trạng thái hiện tại: <span className="font-medium">{ORDER_STATUS[statusDialog.currentStatus]?.text || 'Không xác định'}</span>
                      </p>

                      {statusDialog.error && (
                        <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded-md border border-red-200 flex items-start">
                          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                          <span>{statusDialog.error}</span>
                        </div>
                      )}
                      {statusDialog.success && (
                        <div className="mb-4 p-2 bg-green-50 text-green-700 text-sm rounded-md border border-green-200 flex items-start">
                          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                          <span>Cập nhật trạng thái thành công!</span>
                        </div>
                      )}

                      <div className="mt-4">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                          Chọn trạng thái mới
                        </label>
                        <select
                          id="status"
                          value={statusDialog.newStatus}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          disabled={statusDialog.isUpdating || statusDialog.success}
                        >
                          {Object.entries(ORDER_STATUS).map(([key, { text }]) => (
                            key !== "DEFAULT" && (
                              <option key={key} value={key}>
                                {text}
                              </option>
                            )
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={statusDialog.isUpdating || statusDialog.success}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2
                    ${statusDialog.isUpdating || statusDialog.success
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'}
                    text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  {statusDialog.isUpdating ? 'Đang xử lý...' : (statusDialog.success ? 'Đã cập nhật' : 'Cập nhật')}
                </button>
                <button
                  type="button"
                  onClick={closeStatusDialog}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {statusDialog.success ? 'Đóng' : 'Hủy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Search and Filters */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
              className="pl-10 p-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {/* Date Range Filters */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange(e, "startDate")}
              className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange(e, "endDate")}
              className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >

            <option value="all">Tất cả trạng thái</option>
            {Object.entries(ORDER_STATUS).map(([key, { text }]) => (
              key !== "DEFAULT" && (
                <option key={key} value={key}>
                  {text}
                </option>
              )
            ))}
          </select>

        </div>
      </div>

      {/* Header */}
      <div className="p-5 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Package className="h-6 w-6 mr-2 text-blue-500" />
            Quản lý đơn hàng
          </h2>
          <p className="text-gray-500 mt-1">Xem và quản lý tất cả đơn hàng trong cửa hàng của bạn</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors px-3 py-1 rounded-md hover:bg-blue-50"
          disabled={loading || isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${loading || isRefreshing ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
              className="pl-10 p-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(ORDER_STATUS).map(([key, { text }]) => (
              key !== "DEFAULT" && (
                <option key={key} value={key}>
                  {text}
                </option>
              )
            ))}
          </select>
        </div>
      </div>

      {/* Order List */}
      <div className="p-5">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-500">Đang tải...</span>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.orderCode} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800">Đơn hàng #{order.orderCode}</h3>
                <p className="text-gray-500">Khách hàng: {order.userName}</p>
                <p className="text-gray-500">Giờ đặt hàng: {new Date(order.orderDate).toLocaleString("vi-VN")}</p>
                <p className="text-gray-500">Tổng tiền: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalAmount)}</p>

                {order.orderDetails.map((detail, index) => (
                  <div key={index} className="p-3 flex items-start gap-3">
                    <div className="w-16 h-16 flex-shrink-0">
                      <img
                        src={detail.imgUrl}
                        alt={detail.productName}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-grow">
                      {/* <h6 className="font-medium text-gray-800">{detail.productName}</h6> */}
                      {/* <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                        <p>Số lượng: {detail.quantity}</p>
                        <p>Đơn giá: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(detail.totalPrice)}</p>
                        <p>Kích thước: {detail.size || "N/A"}</p>
                        <p>Màu sắc: {detail.color || "N/A"}</p>
                      </div> */}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => toggleOrderDetails(order.orderCode)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {expandedOrderId === order.orderCode ? "Ẩn chi tiết" : "Xem chi tiết"}
                </button>
                {expandedOrderId === order.orderCode && (
                  <div className="mt-4 bg-gray-50 border-t border-gray-200 p-4 rounded-b-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Thông tin giao hàng */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Thông tin giao hàng</h5>
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <p className="text-gray-700 text-sm"><span className="font-medium">Người nhận:</span> {order.receiverName || order.userName}</p>
                          <p className="text-gray-700 text-sm mt-1"><span className="font-medium">Số điện thoại:</span> {order.deliveryPhone}</p>
                          <p className="text-gray-700 text-sm mt-1"><span className="font-medium">Địa chỉ:</span> {order.deliveryAddress}</p>
                          <p className="text-gray-700 text-sm mt-1"><span className="font-medium">Ghi chú:</span> {order.note || "Không có"}</p>
                        </div>
                      </div>
                      {/* Thông tin thanh toán */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Thanh toán</h5>
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <p className="text-gray-700 text-sm"><span className="font-medium">Phương thức thanh toán:</span> {order.paymentMethod}</p>
                          <p className="text-gray-700 text-sm mt-1">
                            <span className="font-medium">Trạng thái thanh toán:</span>{' '}
                            <span className={order.status === 'PAID' ? "text-green-600" : "text-yellow-600"}>{order.status === 'PAID' ? "Đã thanh toán" : "Chưa thanh toán"}</span>
                          </p>
                          <p className="text-gray-700 text-sm mt-1"><span className="font-medium">Tổng tiền hàng:</span> {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.subtotal || (order.totalAmount - (order.shippingFee || 0)))}</p>
                          <p className="text-gray-700 text-sm mt-1"><span className="font-medium">Phí vận chuyển:</span> {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.shippingFee || 0)}</p>
                          <p className="text-gray-700 font-medium mt-1"><span className="font-medium">Tổng thanh toán:</span> <span className="text-blue-600">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalAmount)}</span></p>
                        </div>
                      </div>
                    </div>
                    {/* Chi tiết sản phẩm */}
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Chi tiết sản phẩm</h5>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      {order.orderDetails && order.orderDetails.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {order.orderDetails.map((detail, index) => (
                            <div key={index} className="p-3 flex items-start gap-3">
                              <div className="w-16 h-16 flex-shrink-0">
                                <img
                                  src={detail.imgUrl}
                                  alt={detail.productName}
                                  className="w-full h-full object-cover rounded"
                                />
                              </div>
                              <div className="flex-grow">
                                <h6 className="font-medium text-gray-800">{detail.productName}</h6>
                                <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                                  <p>Số lượng: {detail.quantity}</p>
                                  <p>Đơn giá: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(detail.totalPrice)}</p>
                                  <p>Kích thước: {detail.size || "N/A"}</p>
                                  <p>Màu sắc: {detail.color || "N/A"}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="p-4 text-gray-500 text-center">Không có chi tiết sản phẩm</p>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center mt-4">
                  <div className={`px-3 py-1 rounded-full ${ORDER_STATUS[order.status]?.color}`}>
                    <span className={`text-sm font-medium ${ORDER_STATUS[order.status]?.text}`}>{ORDER_STATUS[order.status]?.text}</span>
                  </div>
                  <button
                    onClick={() => openStatusDialog(order)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Cập nhật trạng thái
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Không tìm thấy đơn hàng nào.</p>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        totalItems={totalElements}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};

export default OrderList;