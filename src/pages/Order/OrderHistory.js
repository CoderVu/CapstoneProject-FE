import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { fetchOrder } from "../../redux/service/orderService";
import { FaShoppingBag, FaCalendarAlt, FaTruck, FaMapMarkerAlt, FaPhoneAlt, FaRegClock, FaFileInvoice } from "react-icons/fa";
import PrintInvoice from "./PrintInvoice";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("latest"); // "latest" or "oldest"
  const [filterStatus, setFilterStatus] = useState("ALL"); // "ALL", "PENDING", "PROCESSING", etc.
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch the order history when component mounts
  useEffect(() => {
    const getOrderHistory = async () => {
      try {
        setLoading(true);
        const orderData = await fetchOrder();
        setOrders(orderData);
        setError(null);
      } catch (err) {
        setError("Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getOrderHistory();
  }, []);

  // Function to toggle expanded order view
  const toggleOrderExpand = (orderCode) => {
    if (expandedOrder === orderCode) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderCode);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Format price with commas
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + " VNĐ";
  };

  // Get status color and text
  const getStatusInfo = (status) => {
    switch (status) {
      case "PENDING":
        return { color: "bg-yellow-100 text-yellow-800", text: "Chờ xác nhận" };
      case "PROCESSING":
        return { color: "bg-blue-100 text-blue-800", text: "Đang xử lý" };
      case "SHIPPED":
        return { color: "bg-indigo-100 text-indigo-800", text: "Đang giao hàng" };
      case "DELIVERED":
        return { color: "bg-green-100 text-green-800", text: "Đã giao hàng" };
      case "CANCELLED":
        return { color: "bg-red-100 text-red-800", text: "Đã hủy" };
      default:
        return { color: "bg-gray-100 text-gray-800", text: status };
    }
  };

  // Filter and sort orders
  const filteredAndSortedOrders = orders
    .filter(order => {
      // Filter by status if needed
      if (filterStatus !== "ALL") {
        return order.status === filterStatus;
      }
      return true;
    })
    .filter(order => {
      // Search functionality
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        order.orderCode.toLowerCase().includes(searchLower) ||
        order.deliveryAddress.toLowerCase().includes(searchLower) ||
        (order.orderDetails.some(item =>
          item.productName && item.productName.toLowerCase().includes(searchLower)
        ))
      );
    })
    .sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.orderDate);
      const dateB = new Date(b.orderDate);

      if (sortBy === "latest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

  // Get unique statuses for the filter
  const uniqueStatuses = ["ALL", ...new Set(orders.map(order => order.status))];

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="Lịch sử đơn hàng" />

      <div className="pb-20">
        <div className="w-full">
          <h1 className="text-2xl font-bold mb-4">Lịch sử đơn hàng của bạn</h1>

          {/* Error message */}
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
              {error}
            </div>
          )}

          {/* Filters and controls */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm mã đơn hàng hoặc sản phẩm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex-shrink-0">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {uniqueStatuses.map(status => (
                      <option key={status} value={status}>
                        {status === "ALL" ? "Tất cả trạng thái" : getStatusInfo(status).text}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <label className="mr-2 text-gray-600">Sắp xếp:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="latest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading indicator */}
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Đang tải lịch sử đơn hàng...</p>
            </div>
          ) : filteredAndSortedOrders.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              <FaShoppingBag className="mx-auto text-gray-300 text-5xl mb-4" />
              <h2 className="text-xl font-medium text-gray-600 mb-2">Không tìm thấy đơn hàng nào</h2>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? "Không có đơn hàng phù hợp với tìm kiếm của bạn."
                  : "Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!"}
              </p>
              <Link to="/shop">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Tiếp tục mua sắm
                </button>
              </Link>
            </div>
          ) : (
            // Order list
            <div className="space-y-4">
              {filteredAndSortedOrders.map((order) => (
                <motion.div
                  key={order.orderCode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  {/* Order header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800">
                            Đơn hàng #{order.orderCode}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusInfo(order.status).color}`}>
                            {getStatusInfo(order.status).text}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <FaCalendarAlt className="h-3 w-3" />
                          <span>{formatDate(order.orderDate)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-medium text-blue-700">{formatPrice(order.totalAmount)}</span>
                        <button
                          onClick={() => toggleOrderExpand(order.orderCode)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {expandedOrder === order.orderCode ? "Ẩn chi tiết" : "Xem chi tiết"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order details (expanded) */}
                  {expandedOrder === order.orderCode && (
                    <div className="p-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Customer info */}
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3">Thông tin giao hàng</h4>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <FaMapMarkerAlt className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{order.deliveryAddress}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaPhoneAlt className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">{order.deliveryPhone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaRegClock className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">Đặt hàng lúc: {formatDate(order.orderDate)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Order status */}
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3">Trạng thái đơn hàng</h4>
                          <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                              <span className={order.status === "PENDING" || order.status === "PROCESSING" || order.status === "SHIPPED" || order.status === "DELIVERED" ? "text-blue-600 font-medium" : "text-gray-500"}>Đặt hàng</span>
                              <span className={order.status === "PROCESSING" || order.status === "SHIPPED" || order.status === "DELIVERED" ? "text-blue-600 font-medium" : "text-gray-500"}>Xác nhận</span>
                              <span className={order.status === "SHIPPED" || order.status === "DELIVERED" ? "text-blue-600 font-medium" : "text-gray-500"}>Vận chuyển</span>
                              <span className={order.status === "DELIVERED" ? "text-blue-600 font-medium" : "text-gray-500"}>Giao hàng</span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 relative">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{
                                  width: order.status === "PENDING" ? "25%" :
                                         order.status === "PROCESSING" ? "50%" :
                                         order.status === "SHIPPED" ? "75%" :
                                         order.status === "DELIVERED" ? "100%" : "0%"
                                }}
                              ></div>

                              {/* Status dots */}
                              <div className="absolute -top-1 left-0 w-4 h-4 rounded-full bg-blue-600"></div>
                              <div className={`absolute -top-1 left-1/3 transform -translate-x-1/2 w-4 h-4 rounded-full ${order.status === "PROCESSING" || order.status === "SHIPPED" || order.status === "DELIVERED" ? "bg-blue-600" : "bg-gray-300"}`}></div>
                              <div className={`absolute -top-1 left-2/3 transform -translate-x-1/2 w-4 h-4 rounded-full ${order.status === "SHIPPED" || order.status === "DELIVERED" ? "bg-blue-600" : "bg-gray-300"}`}></div>
                              <div className={`absolute -top-1 right-0 w-4 h-4 rounded-full ${order.status === "DELIVERED" ? "bg-blue-600" : "bg-gray-300"}`}></div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <FaTruck className={`inline-block mr-2 ${order.status === "SHIPPED" ? "text-blue-600" : "text-gray-400"}`} />
                            {order.status === "SHIPPED" ? (
                              <span className="text-blue-600">Đơn hàng đang được giao đến bạn</span>
                            ) : order.status === "DELIVERED" ? (
                              <span className="text-green-600">Đơn hàng đã được giao thành công</span>
                            ) : (
                              <span className="text-gray-500">Đơn hàng chưa được vận chuyển</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Products list */}
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-700 mb-3">Sản phẩm đã đặt</h4>

                        {order.orderDetails.length === 0 ? (
                          <p className="text-gray-500 italic">Không có thông tin chi tiết sản phẩm</p>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {order.orderDetails.map((product, index) => (
                              <div key={index} className="py-3 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                {/* Product image */}
                                <div className="w-16 h-16 flex-shrink-0">
                                  <img
                                    src={product.imgUrl}
                                    alt={product.productName}
                                    className="w-full h-full object-cover rounded"
                                  />
                                </div>

                                {/* Product info */}
                                <div className="flex-grow">
                                  <h5 className="font-medium text-gray-800">{product.productName}</h5>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                    <span className="text-sm text-gray-600">Size: {product.size}</span>
                                    <span className="text-sm text-gray-600">Màu: {product.color}</span>
                                    <span className="text-sm text-gray-600">Số lượng: {product.quantity}</span>
                                  </div>
                                </div>

                                {/* Product price */}
                                <div className="font-medium text-blue-700">
                                  {formatPrice(product.totalPrice)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Total amount */}
                      <div className="mt-6 border-t border-gray-100 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Tổng tiền:</span>
                          <span className="text-xl font-bold text-blue-700">{formatPrice(order.totalAmount)}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-6 flex flex-wrap justify-end gap-3">
                        {order.status === "PENDING" && (
                          <button className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50 transition-colors">
                            Hủy đơn hàng
                          </button>
                        )}

                        {/* Using PrintInvoice component for printing and PDF download */}
                        <PrintInvoice
                          order={order}
                          formatDate={formatDate}
                          formatPrice={formatPrice}
                          getStatusInfo={getStatusInfo}
                        />

                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                          <FaFileInvoice className="text-sm" />
                          Liên hệ hỗ trợ
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
