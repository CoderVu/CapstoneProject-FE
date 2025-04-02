import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../../redux/actions/orderAction";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Package,
  RefreshCw
} from "lucide-react";

const ORDER_STATUS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "processing", label: "Đang xử lý" },
  { value: "shipping", label: "Đang giao hàng" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" }
];

const OrderList = () => {
  const dispatch = useDispatch();
  const { orders = [], totalPages = 0, totalElements = 0, loading, error } = useSelector((state) => state.order);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  // Tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(0); // Backend sử dụng page bắt đầu từ 0
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Loading states
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch orders khi component mount và khi các giá trị phân trang thay đổi
  useEffect(() => {
    loadOrders();
  }, [dispatch, currentPage, itemsPerPage]);

  // Load orders từ API chỉ sử dụng phân trang
  const loadOrders = async () => {
    try {
      setIsRefreshing(true);
      await dispatch(fetchOrders(currentPage, itemsPerPage));
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

  // Lọc đơn hàng trên giao diện
  const filteredOrders = orders.filter(order => {
    // Lọc theo từ khóa tìm kiếm
    const matchesSearch = searchTerm.trim() === "" || 
      (order.orderCode && order.orderCode.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (order.userName && order.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Lọc theo trạng thái
    const matchesStatus = statusFilter === "all" || 
      (order.status && order.status.toLowerCase() === statusFilter.toLowerCase());
    
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

  // Tính toán số trang và dữ liệu cần hiển thị
  const totalFilteredItems = filteredOrders.length;
  const totalFilteredPages = Math.ceil(totalFilteredItems / itemsPerPage);
  
  // Đảm bảo trang hiện tại không vượt quá tổng số trang
  useEffect(() => {
    if (currentPage >= totalFilteredPages && totalFilteredPages > 0) {
      setCurrentPage(totalFilteredPages - 1);
    }
  }, [totalFilteredPages, currentPage]);
  
  // Lấy dữ liệu cho trang hiện tại
  const startIndex = currentPage * itemsPerPage;
  const currentPageOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // Xử lý khi thay đổi giá trị tìm kiếm
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reset về trang đầu tiên khi tìm kiếm thay đổi
  };

  // Xử lý khi thay đổi trạng thái lọc
  const handleStatusChange = (e) => {
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
    // Không cần làm gì vì lọc được xử lý tự động bởi filteredOrders
    // Chỉ cần reset về trang đầu tiên
    setCurrentPage(0);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateRange({ startDate: "", endDate: "" });
    setCurrentPage(0);
  };

  // Phân trang
  const handlePageChange = (page) => {
    if (page >= 0 && page < totalFilteredPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Khi thay đổi số lượng item trên mỗi trang
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(0); // Reset về trang đầu tiên
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
              onChange={handleSearch}
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
              className="pl-10 p-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ORDER_STATUS.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
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
        {loading && !isRefreshing ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-500">Đang tải...</span>
          </div>
        ) : currentPageOrders.length > 0 ? (
          <div className="space-y-4">
            {currentPageOrders.map((order) => (
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
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-600"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-600"
                              : order.status === "shipping"
                              ? "bg-blue-100 text-blue-600"
                              : order.status === "processing"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {order.status === "delivered"
                            ? "Đã giao"
                            : order.status === "cancelled"
                            ? "Đã hủy"
                            : order.status === "shipping"
                            ? "Đang giao"
                            : order.status === "processing"
                            ? "Đang xử lý"
                            : "Chờ xác nhận"}
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
                  
                  {/* Toggle Details Button */}
                  <button
                    onClick={() => toggleOrderDetails(order.orderCode)}
                    className="mt-3 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
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
                                <span className={order.isPaid ? "text-green-600" : "text-yellow-600"}>
                                  {order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
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
                                      }).format(detail.price)}</p>
                                      <p>Kích thước: {detail.size || "N/A"}</p>
                                      <p>Màu sắc: {detail.color || "N/A"}</p>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="font-medium text-blue-600">
                                      {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND"
                                      }).format(detail.totalPrice)}
                                    </p>
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
            ))}
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
        
        {/* Pagination Controls */}
        {totalFilteredPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-600 mr-2">Hiển thị:</label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border border-gray-300 rounded-md text-sm p-1"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            
            <p className="text-sm text-gray-600">
              Hiển thị {totalFilteredItems > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, totalFilteredItems)} trong số {totalFilteredItems} đơn hàng
            </p>
            
            <div className="flex items-center">
              <button
                onClick={() => handlePageChange(0)}
                disabled={currentPage === 0}
                className="p-2 border border-gray-300 rounded-l-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Trang đầu</span>
                <ChevronsLeft className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="p-2 border-t border-b border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Trang trước</span>
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex">
                {Array.from({ length: Math.min(5, totalFilteredPages) }, (_, i) => {
                  let pageNumber;
                  if (totalFilteredPages <= 5) {
                    pageNumber = i;
                  } else if (currentPage <= 2) {
                    pageNumber = i;
                  } else if (currentPage >= totalFilteredPages - 3) {
                    pageNumber = totalFilteredPages - 5 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`p-2 w-10 border-t border-b border-gray-300 ${
                        currentPage === pageNumber
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {pageNumber + 1}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalFilteredPages - 1}
                className="p-2 border-t border-b border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Trang sau</span>
                <ChevronRight className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => handlePageChange(totalFilteredPages - 1)}
                disabled={currentPage === totalFilteredPages - 1}
                className="p-2 border border-gray-300 rounded-r-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Trang cuối</span>
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;