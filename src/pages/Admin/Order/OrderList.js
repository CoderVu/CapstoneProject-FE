import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../../redux/actions/orderAction";
import { updateOrderStatus } from "../../../redux/service/orderService";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  Package,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react";
import Pagination from "./Pagination";

// Updated to match backend status values
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
  const dispatch = useDispatch();
  const { orders = [], totalPages = 0, totalElements = 0, loading, error } = useSelector((state) => state.order);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Order status management
  const [statusDialog, setStatusDialog] = useState({
    isOpen: false,
    orderId: null,
    currentStatus: null,
    newStatus: null,
    isUpdating: false,
    error: null,
    success: false
  });

  // Tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isServerSideFilter, setIsServerSideFilter] = useState(false);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(0); // Backend sử dụng page bắt đầu từ 0
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Loading states
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch orders khi component mount và khi các giá trị phân trang thay đổi
  useEffect(() => {
    // Lấy dữ liệu đơn hàng từ server khi component mount và khi phân trang thay đổi
    loadOrders();

    // In ra console để kiểm tra cập nhật
    console.log("Fetching orders with:", {
      page: currentPage,
      size: itemsPerPage,
      totalPages: totalPages,
      total: totalElements
    });
  }, [dispatch, currentPage, itemsPerPage]);

  // Open dialog to update order status
  const openStatusDialog = (order) => {
    setStatusDialog({
      isOpen: true,
      orderId: order.orderCode,
      currentStatus: order.status,
      newStatus: order.status,
      isUpdating: false,
      error: null,
      success: false
    });
  };

  // Close status update dialog
  const closeStatusDialog = () => {
    setStatusDialog({
      isOpen: false,
      orderId: null,
      currentStatus: null,
      newStatus: null,
      isUpdating: false,
      error: null,
      success: false
    });
  };

  // Handle status selection in dialog
  const handleStatusChange = (status) => {
    setStatusDialog(prev => ({
      ...prev,
      newStatus: status,
      error: null
    }));
  };

  // Handle updating the order status
  const handleUpdateStatus = async () => {
    try {
      // Kiểm tra nếu trạng thái hiện tại là "CANCLED"
      if (statusDialog.currentStatus === "CANCELED") {
        setStatusDialog(prev => ({
          ...prev,
          error: "Không thể cập nhật trạng thái cho đơn hàng đã bị hủy."
        }));
        return;
      }

      // Kiểm tra nếu trạng thái mới giống trạng thái hiện tại
      if (statusDialog.currentStatus === statusDialog.newStatus) {
        setStatusDialog(prev => ({
          ...prev,
          error: "Vui lòng chọn trạng thái khác với trạng thái hiện tại."
        }));
        return;
      }

      setStatusDialog(prev => ({ ...prev, isUpdating: true, error: null }));

      // Gửi yêu cầu cập nhật trạng thái
      await updateOrderStatus(statusDialog.orderId, statusDialog.newStatus);

      setStatusDialog(prev => ({
        ...prev,
        isUpdating: false,
        success: true,
        error: null
      }));

      // Làm mới danh sách đơn hàng sau khi cập nhật thành công
      setTimeout(() => {
        loadOrders();
        closeStatusDialog();
      }, 1500);

    } catch (error) {
      console.error("Failed to update order status:", error);
      setStatusDialog(prev => ({
        ...prev,
        isUpdating: false,
        error: "Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng. Vui lòng thử lại sau."
      }));
    }
  };
  // Load orders từ API chỉ sử dụng phân trang
  const loadOrders = async () => {
    try {
      setIsRefreshing(true);
      const filters = isServerSideFilter ? {
        keyword: searchTerm,
        status: statusFilter,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      } : {};

    dispatch(fetchOrders(currentPage, itemsPerPage, filters));
    
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Refresh orders
  const handleRefresh = () => {
    loadOrders();
  };


  // Xử lý khi mở/đóng chi tiết đơn hàng
  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId((prevId) => (prevId === orderId ? null : orderId));
  };

  // Trả về văn bản và màu tương ứng với trạng thái
  const getStatusDisplay = (status) => {
    const statusKey = status || "DEFAULT";
    return ORDER_STATUS[statusKey] || ORDER_STATUS.DEFAULT;
  };

  // Lọc đơn hàng trên giao diện
  const filteredOrders = orders.filter(order => {
    // Nếu đang sử dụng server-side filtering, trả về tất cả đơn hàng
    if (isServerSideFilter) return true;

    // Lọc theo từ khóa tìm kiếm
    const matchesSearch = searchTerm.trim() === "" ||
      (order.orderCode && order.orderCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.userName && order.userName.toLowerCase().includes(searchTerm.toLowerCase()));

    // Lọc theo trạng thái
    const matchesStatus = statusFilter === "all" ||
      (order.status && order.status === statusFilter);

    // Lọc theo ngày
    let matchesDate = true;
    if (dateRange.startDate) {
      const orderDate = new Date(order.orderDate);
      const startDate = new Date(dateRange.startDate);
      startDate.setHours(0, 0, 0, 0);
      matchesDate = orderDate >= startDate;
    }

    if (dateRange.endDate && matchesDate) {
      const orderDate = new Date(order.orderDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      matchesDate = orderDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Tính toán số trang và dữ liệu cần hiển thị cho local filtering
  const totalFilteredItems = filteredOrders.length;
  const totalFilteredPages = Math.ceil(totalFilteredItems / itemsPerPage);

  // Đảm bảo trang hiện tại không vượt quá tổng số trang
  useEffect(() => {
    if (!isServerSideFilter && currentPage >= totalFilteredPages && totalFilteredPages > 0) {
      setCurrentPage(totalFilteredPages - 1);
    }
  }, [totalFilteredPages, currentPage, isServerSideFilter]);

  // Lấy dữ liệu cho trang hiện tại (client-side pagination)
  const startIndex = currentPage * itemsPerPage;
  // Hiển thị dữ liệu dựa trên phương thức lọc (client-side hoặc server-side)
  const currentPageOrders = isServerSideFilter ? orders : filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // Xử lý khi thay đổi giá trị tìm kiếm
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reset về trang đầu tiên khi tìm kiếm thay đổi
  };

  // Xử lý khi thay đổi trạng thái lọc
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(0); // Reset về trang đầu tiên khi trạng thái thay đổi
  };

  // Xử lý khi thay đổi khoảng thời gian
  const handleDateChange = (e, field) => {
    setDateRange(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    setCurrentPage(0); // Reset về trang đầu tiên khi khoảng thời gian thay đổi
  };

  // Xử lý khi áp dụng bộ lọc
  const handleApplyFilters = () => {
    setCurrentPage(0); // Reset về trang đầu tiên

    // Nếu đang sử dụng server-side filtering, gọi lại API với bộ lọc mới
    if (isServerSideFilter) {
      loadOrders();
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateRange({ startDate: "", endDate: "" });
    setCurrentPage(0);

    // Nếu đang sử dụng server-side filtering, gọi lại API với bộ lọc đã reset
    if (isServerSideFilter) {
      loadOrders();
    }
  };

  // Phân trang - Xử lý khi thay đổi trang
  const handlePageChange = (page) => {
    if (isServerSideFilter) {
      // Nếu đang sử dụng server-side filtering/pagination
      if (page >= 0 && page < totalPages) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      // Nếu đang sử dụng client-side filtering/pagination
      if (page >= 0 && page < totalFilteredPages) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // Khi thay đổi số lượng item trên mỗi trang
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(0); // Reset về trang đầu tiên
  };

  // Chuyển đổi giữa lọc phía client và server
  const toggleFilterMode = () => {
    setIsServerSideFilter(!isServerSideFilter);
    setCurrentPage(0);
    // Nếu chuyển sang server-side filter, gọi lại API với bộ lọc hiện tại
    if (!isServerSideFilter) {
      loadOrders();
    }
  };

  // Sử dụng giá trị phù hợp cho hiển thị pagination
  const displayTotalPages = isServerSideFilter ? totalPages : totalFilteredPages;
  const displayTotalItems = isServerSideFilter ? totalElements : totalFilteredItems;

  // Log ra để debug
  console.log("Pagination info:", {
    currentPage,
    displayTotalPages,
    displayTotalItems,
    itemsPerPage
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

      <div className="p-5 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Package className="h-6 w-6 mr-2 text-blue-500" />
            Quản lý đơn hàng
          </h2>
          <p className="text-gray-500 mt-1">Xem và quản lý tất cả đơn hàng trong cửa hàng của bạn</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors px-3 py-1 rounded-md hover:bg-blue-50"
            disabled={loading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${loading || isRefreshing ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
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

          <div className="flex flex-col sm:flex-row gap-2">
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

            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1"
            >
              <Filter className="h-5 w-5 text-gray-500" />
              <span>Bộ lọc</span>
              {isFilterOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>

            <button
              onClick={handleApplyFilters}
              className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              Áp dụng
            </button>

            <button
              onClick={resetFilters}
              className="p-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Đặt lại
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateChange(e, "startDate")}
                    className="p-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateChange(e, "endDate")}
                    className="p-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Order List */}
      <div className="p-5">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <p className="font-medium">Lỗi khi tải dữ liệu: {error}</p>
          </div>
        )}

        {loading && !isRefreshing ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-500">Đang tải...</span>
          </div>
        ) : currentPageOrders.length > 0 ? (
          <div className="space-y-4">
            {currentPageOrders.map((order) => {
              const { color, text } = getStatusDisplay(order.status);

              return (
                <div
                  key={order.orderCode}
                  className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-4 bg-white">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium text-gray-800">
                            Đơn hàng #{order.orderCode}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                            {text}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">
                          Ngày đặt: {new Date(order.orderDate).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col sm:items-end">
                        <p className="text-gray-700">
                          Khách hàng: <span className="font-medium">{order.userName}</span>
                        </p>
                        <p className="text-gray-700">
                          Tổng tiền: <span className="font-semibold text-blue-600">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND"
                            }).format(order.totalAmount)}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => toggleOrderDetails(order.orderCode)}
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {expandedOrderId === order.orderCode ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            <span>Ẩn chi tiết</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            <span>Xem chi tiết</span>
                          </>
                        )}
                      </button>

                      <span className="text-gray-300 mx-1">|</span>

                      <button
                        onClick={() => openStatusDialog(order)}
                        className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <span>Cập nhật trạng thái</span>
                      </button>
                    </div>
                  </div>

                  {/* Order Details */}
                  <AnimatePresence>
                    {expandedOrderId === order.orderCode && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-200 bg-gray-50 overflow-hidden"
                      >
                        <div className="p-4">
                          <h4 className="font-medium text-gray-700 mb-3">Thông tin đơn hàng</h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Thông tin giao hàng</h5>
                              <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-700 text-sm">
                                  <span className="font-medium">Người nhận:</span> {order.receiverName || order.userName}
                                </p>
                                <p className="text-gray-700 text-sm mt-1">
                                  <span className="font-medium">Số điện thoại:</span> {order.deliveryPhone}
                                </p>
                                <p className="text-gray-700 text-sm mt-1">
                                  <span className="font-medium">Địa chỉ:</span> {order.deliveryAddress}
                                </p>
                                <p className="text-gray-700 text-sm mt-1">
                                  <span className="font-medium">Ghi chú:</span> {order.note || "Không có"}
                                </p>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Thanh toán</h5>
                              <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-700 text-sm">
                                  <span className="font-medium">Phương thức thanh toán:</span> {order.paymentMethod}
                                </p>
                                <p className="text-gray-700 text-sm mt-1">
                                  <span className="font-medium">Trạng thái thanh toán:</span>{" "}
                                  <span className={order.status === 'PAID' ? "text-green-600" : "text-yellow-600"}>
                                    {order.status === 'PAID' ? "Đã thanh toán" : "Chưa thanh toán"}
                                  </span>
                                </p>
                                <p className="text-gray-700 text-sm mt-1">
                                  <span className="font-medium">Tổng tiền hàng:</span>{" "}
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND"
                                  }).format(order.subtotal || (order.totalAmount - (order.shippingFee || 0)))}
                                </p>
                                <p className="text-gray-700 text-sm mt-1">
                                  <span className="font-medium">Phí vận chuyển:</span>{" "}
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND"
                                  }).format(order.shippingFee || 0)}
                                </p>
                                <p className="text-gray-700 font-medium mt-1">
                                  <span className="font-medium">Tổng thanh toán:</span>{" "}
                                  <span className="text-blue-600">
                                    {new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND"
                                    }).format(order.totalAmount)}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>

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
                                        <p>Đơn giá: {new Intl.NumberFormat("vi-VN", {
                                          style: "currency",
                                          currency: "VND"
                                        }).format(detail.totalPrice)}</p>
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">Không tìm thấy đơn hàng nào</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all" || dateRange.startDate || dateRange.endDate
                ? "Không có đơn hàng nào phù hợp với bộ lọc. Hãy thử thay đổi các điều kiện lọc."
                : "Chưa có đơn hàng nào trong hệ thống."}
            </p>
            {(searchTerm || statusFilter !== "all" || dateRange.startDate || dateRange.endDate) && (
              <button
                onClick={resetFilters}
                className="mt-3 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>
        )}

        {/* Always show pagination regardless of page count */}
        <Pagination
          currentPage={currentPage}
          totalPages={displayTotalPages || 1} 
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={displayTotalItems}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
};

export default OrderList;
