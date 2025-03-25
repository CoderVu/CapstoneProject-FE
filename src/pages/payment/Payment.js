import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { FaQrcode, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { createOrderFromCart } from "../../redux/service/orderService";
import AddressSelector from "./AddressSelector";

const PaymentGateway = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const cartState = location.state || {};

  const [paymentStep, setPaymentStep] = useState(1); // 1: Select method, 2: Enter details, 3: QR Code, 4: Success
  const [countdown, setCountdown] = useState(300); // 5 minutes countdown
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    deliveryAddress: "",
    deliveryPhone: "",
    orderInfo: "Payment for order",
    paymentMethod: "ZALOPAY"
  });

  // Calculate total amount
  const totalAmount = cartState.totalAmount || 0;

  // Add shipping charge
  let shippingCharge = 0;
  if (totalAmount <= 200000) {
    shippingCharge = 30000;
  } else if (totalAmount <= 400000) {
    shippingCharge = 25000;
  } else if (totalAmount > 400000) {
    shippingCharge = 20000;
  }

  const finalAmount = totalAmount + shippingCharge;

  // Countdown timer for QR code
  useEffect(() => {
    let timer;
    if (paymentStep === 3 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      // Payment timeout
      setError("Hết thời gian thanh toán. Vui lòng thử lại.");
      setPaymentStep(2);
    }
    return () => clearInterval(timer);
  }, [paymentStep, countdown]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle address change from Address Selector
  const handleAddressChange = (fullAddress) => {
    setFormData({
      ...formData,
      deliveryAddress: fullAddress
    });
  };

  // Create ZaloPay order
  const handleCreateOrder = async () => {
    if (!formData.deliveryAddress || !formData.deliveryPhone) {
      setError("Vui lòng nhập đầy đủ thông tin giao hàng");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get cart IDs from the cart items
      const cartIds = cartState.selectedItems || [];

      // Prepare order request
      const orderRequest = {
        amount: finalAmount,
        deliveryAddress: formData.deliveryAddress,
        deliveryPhone: formData.deliveryPhone,
        paymentMethod: formData.paymentMethod,
        cartIds: cartIds,
        orderInfo: formData.orderInfo,
        lang: "vi",
        extraData: "additional data"
      };

      // Call the API to create order
      const orderResponse = await createOrderFromCart(orderRequest);

      if (orderResponse && orderResponse.orderurl) {
        window.location.href = orderResponse.orderurl;
      } else {
        // Demo: move to next step instead of redirecting
        setOrderDetails({
          orderId: "DEMO" + Math.floor(100000 + Math.random() * 900000),
          apptransid: "T" + Date.now(),
          amount: finalAmount
        });
        setPaymentStep(3);
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi tạo đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // Simulate payment confirmation (for demo purposes)
  const handleConfirmPayment = () => {
    setPaymentStep(4);
  };

  // Format currency in VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + " VNĐ";
  };

  console.log("Cart State: ", cartState);

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="Thanh toán" />

      <div className="pb-10">
        {/* Step 1: Select Payment Method */}
        {paymentStep === 1 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Chọn phương thức thanh toán</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ZaloPay Option */}
              <div
                onClick={() => setPaymentStep(2)}
                className="border border-gray-200 rounded-lg p-4 flex items-center cursor-pointer hover:bg-blue-50 transition duration-200"
              >
                <div className="flex-shrink-0 mr-4">
                  <img
                    src="https://brandlogos.net/wp-content/uploads/2022/05/zalopay-logo_brandlogos.net_fjcup.png"
                    alt="ZaloPay"
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-lg">ZaloPay</h3>
                  <p className="text-gray-600 text-sm">Thanh toán nhanh chóng và an toàn qua ứng dụng ZaloPay</p>
                </div>
              </div>

              {/* Other payment options (can be expanded later) */}
              <div className="border border-gray-200 rounded-lg p-4 flex items-center opacity-50 cursor-not-allowed">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Thẻ tín dụng</h3>
                  <p className="text-gray-600 text-sm">Chỉ khả dụng trong phiên bản Production</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-500">
                * Lưu ý: Trong môi trường phát triển, chỉ có tùy chọn ZaloPay được kích hoạt để kiểm thử.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Enter Delivery Details */}
        {paymentStep === 2 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-center mb-6">
              <img
                src="https://brandlogos.net/wp-content/uploads/2022/05/zalopay-logo_brandlogos.net_fjcup.png"
                alt="ZaloPay"
                className="w-16 h-16 object-contain mx-auto"
              />
              <h2 className="text-2xl font-semibold mt-2 text-gray-800">Thông tin giao hàng & thanh toán</h2>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium text-lg mb-4">Thông tin giao hàng</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Địa chỉ giao hàng *</label>
                    {/* Replaced input with AddressSelector component */}
                    <AddressSelector onAddressChange={handleAddressChange} />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Số điện thoại *</label>
                    <input
                      type="tel"
                      name="deliveryPhone"
                      value={formData.deliveryPhone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Ghi chú đơn hàng (tuỳ chọn)</label>
                    <textarea
                      name="orderInfo"
                      value={formData.orderInfo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Ghi chú cho đơn hàng của bạn"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-4">Tóm tắt đơn hàng</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Số lượng sản phẩm:</span>
                      <span className="font-medium">{cartState.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tổng phụ:</span>
                      <span className="font-medium">{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí vận chuyển:</span>
                      <span className="font-medium">{formatCurrency(shippingCharge)}</span>
                    </div>
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                      <span className="font-semibold">Tổng cộng:</span>
                      <span className="font-bold text-blue-600">{formatCurrency(finalAmount)}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Phương thức thanh toán</h4>
                    <div className="bg-blue-50 border border-blue-100 rounded-md p-3 flex items-center">
                      <img
                        src="https://brandlogos.net/wp-content/uploads/2022/05/zalopay-logo_brandlogos.net_fjcup.png"
                        alt="ZaloPay"
                        className="w-10 h-10 object-contain mr-3"
                      />
                      <span>ZaloPay</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setPaymentStep(1)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 flex items-center"
              >
                <FaArrowLeft className="mr-2" /> Quay lại
              </button>

              <button
                onClick={handleCreateOrder}
                disabled={loading}
                className={`px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? "Đang xử lý..." : "Tiếp tục thanh toán"}
                {!loading && <FaQrcode className="ml-2" />}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: QR Code Payment */}
        {paymentStep === 3 && orderDetails && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-center mb-4">
              <img
                src="https://brandlogos.net/wp-content/uploads/2022/05/zalopay-logo_brandlogos.net_fjcup.png"
                alt="ZaloPay"
                className="w-24 h-24 object-contain mx-auto"
              />
              <h2 className="text-2xl font-semibold mt-2 text-blue-600">Thanh toán với ZaloPay</h2>
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-8">
              <div className="md:w-1/2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Chi tiết đơn hàng</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã đơn hàng:</span>
                      <span className="font-medium">{orderDetails.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã giao dịch:</span>
                      <span className="font-medium">{orderDetails.apptransid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng tiền:</span>
                      <span className="font-medium text-blue-600">{formatCurrency(finalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium text-gray-800 mb-3">Hướng dẫn thanh toán:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    <li>Mở ứng dụng ZaloPay hoặc Zalo trên điện thoại của bạn</li>
                    <li>Chọn "Thanh Toán" và quét mã QR</li>
                    <li>Xác nhận thanh toán trên ứng dụng</li>
                    <li>Đợi hệ thống xác nhận giao dịch</li>
                  </ol>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => {
                      setPaymentStep(2);
                      setCountdown(300);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                  >
                    Quay lại
                  </button>

                  {/* For demo purposes, allow confirming directly */}
                  <button
                    onClick={handleConfirmPayment}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Xác nhận đã thanh toán
                  </button>
                </div>
              </div>

              <div className="md:w-1/2 flex flex-col items-center">
                {/* QR Code placeholder */}
                <div className="w-64 h-64 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DEMO:${orderDetails.orderId}:${finalAmount}`}
                    alt="QR Code for payment"
                    className="w-48 h-48"
                  />
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    Thời gian quét mã QR để thanh toán còn
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Payment Success */}
        {paymentStep === 4 && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 mb-2">Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.</p>
            <p className="text-gray-600 mb-6">
              Mã đơn hàng: <span className="font-medium">{orderDetails ? orderDetails.orderId : "N/A"}</span>
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/orders">
                <button className="w-full sm:w-52 h-12 bg-blue-600 text-white text-lg hover:bg-blue-700 duration-300 rounded">
                  Xem đơn hàng
                </button>
              </Link>

              <Link to="/">
                <button className="w-full sm:w-52 h-12 bg-gray-200 text-gray-800 text-lg hover:bg-gray-300 duration-300 rounded">
                  Tiếp tục mua sắm
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentGateway;
