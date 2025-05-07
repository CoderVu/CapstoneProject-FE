import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { FaQrcode, FaArrowLeft, FaCheckCircle, FaPlus, FaCreditCard, FaMapMarkerAlt, FaPhone, FaShoppingCart, FaMoneyBill } from "react-icons/fa";
import { createOrderFromCart, createOrderNow } from "../../redux/service/orderService";
import AddressSelector from "./AddressSelector";
import { fetchAddress } from "../../redux/service/authService";

const PaymentGateway = () => {
  const location = useLocation();
  const cartState = location.state || {};

  const [paymentStep, setPaymentStep] = useState(1); // 1: Select method, 2: Enter details, 3: QR Code, 4: Success
  const [countdown, setCountdown] = useState(300); // 5 minutes countdown
  const [addresses, setAddresses] = useState([]); // Store fetched addresses
  const [selectedAddress, setSelectedAddress] = useState(null); // Store selected address
  const [isCreatingNewAddress, setIsCreatingNewAddress] = useState(false); // Toggle between selecting and creating
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    deliveryAddress: "",
    deliveryPhone: "",
    orderInfo: "Payment for order",
    paymentMethod: "",
  });

  // Calculate total amount
  const totalAmount = cartState.finalAmount || 0;

  // Get cart items
  const cartItems = cartState.selectedItems || [];

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

  // Load addresses from API
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetchAddress(token);
        const addressList = response?.data?.addressList || [];
        setAddresses(addressList);

        // Auto-select first address if available
        if (addressList.length > 0) {
          const firstAddress = addressList[0];
          const fullAddress = `${firstAddress.houseNumber}, ${firstAddress.street}, ${firstAddress.district}, ${firstAddress.city}`;
          setSelectedAddress(fullAddress);
          setFormData(prev => ({
            ...prev,
            deliveryAddress: fullAddress
          }));
        }
      } catch (err) {
        console.error("Error fetching addresses:", err);
        setError("Không thể tải danh sách địa chỉ.");
      }
    };

    fetchAddresses();
  }, []);

  // Handle address change from Address Selector
  const handleAddressChange = (fullAddress) => {
    setSelectedAddress(fullAddress);
    setFormData({
      ...formData,
      deliveryAddress: fullAddress,
    });
  };

  // Reset address creation form
  const handleCancelNewAddress = () => {
    setIsCreatingNewAddress(false);
  };

  // Create order and handle payment
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
        amount: totalAmount,
        deliveryAddress: formData.deliveryAddress,
        deliveryPhone: formData.deliveryPhone,
        paymentMethod: formData.paymentMethod,
        cartIds: cartIds,
        orderInfo: formData.orderInfo,
        lang: "vi",
        extraData: "additional data",
      };
  
      // Call the API to create the order
      const orderResponse = await createOrderFromCart(orderRequest);
  
      if (formData.paymentMethod === "CASH") {
        // Handle success for "CASH" payment
        setOrderDetails({
          orderId: orderResponse?.orderId || "COD" + Math.floor(100000 + Math.random() * 900000),
          apptransid: "C" + Date.now(),
          amount: totalAmount,
          orderInfo: formData.orderInfo,
        });
  
        // Skip to success page
        setPaymentStep(4);
      } else if (orderResponse && orderResponse.orderurl) {
        // Redirect to payment gateway for ZaloPay
        window.location.href = orderResponse.orderurl;
      } else {
        // Demo: move to next step instead of redirecting
        setOrderDetails({
          orderId: "DEMO" + Math.floor(100000 + Math.random() * 900000),
          apptransid: "T" + Date.now(),
          amount: totalAmount,
          orderInfo: formData.orderInfo,
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
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  // Format countdown time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="Thanh toán" />

      {/* Payment Steps Indicator */}
      <div className="mb-8 pt-4">
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className="flex flex-col items-center"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  step === paymentStep
                    ? "bg-blue-600 text-white"
                    : step < paymentStep
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {step < paymentStep ? (
                  <FaCheckCircle />
                ) : (
                  step
                )}
              </div>
              <span className={`text-sm ${step === paymentStep ? "font-medium text-blue-600" : "text-gray-500"}`}>
                {step === 1 && "Phương thức"}
                {step === 2 && "Thông tin"}
                {step === 3 && "Thanh toán"}
                {step === 4 && "Hoàn tất"}
              </span>
            </div>
          ))}

          {/* Connecting lines */}
          <div className="absolute left-0 right-0 flex justify-center z-0">
            <div className="h-0.5 bg-gray-200 w-2/3 mt-5"></div>
          </div>
        </div>
      </div>

      <div className="pb-10">
        {/* Step 1: Select Payment Method */}
        {paymentStep === 1 && (
          <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
              Chọn phương thức thanh toán
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {/* ZaloPay Option */}
              <div
                onClick={() => {
                  setFormData({...formData, paymentMethod: "ZALOPAY"});
                  setPaymentStep(2);
                }}
                className={`border rounded-lg p-5 flex items-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition duration-200 ${formData.paymentMethod === "ZALOPAY" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
              >
                <div className="flex-shrink-0 mr-4">
                  <img
                    src="https://brandlogos.net/wp-content/uploads/2022/05/zalopay-logo_brandlogos.net_fjcup.png"
                    alt="ZaloPay"
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">ZaloPay</h3>
                  <p className="text-gray-600 text-sm">
                    Thanh toán nhanh chóng và an toàn qua ứng dụng ZaloPay
                  </p>
                </div>
                <div className="ml-4">
                  <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center">
                    <div className={`w-3 h-3 ${formData.paymentMethod === "ZALOPAY" ? "bg-blue-500" : "bg-white"} rounded-full`}></div>
                  </div>
                </div>
              </div>

              {/* Cash on Delivery Option */}
              <div
                onClick={() => {
                  setFormData({...formData, paymentMethod: "CASH"});
                  setPaymentStep(2);
                }}
                className={`border rounded-lg p-5 flex items-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition duration-200 ${formData.paymentMethod === "CASH" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
              >
                <div className="flex-shrink-0 mr-4 bg-green-100 p-3 rounded-lg">
                  <FaMoneyBill className="w-10 h-10 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">Thanh toán khi nhận hàng (COD)</h3>
                  <p className="text-gray-600 text-sm">
                    Thanh toán bằng tiền mặt khi đơn hàng được giao đến
                  </p>
                </div>
                <div className="ml-4">
                  <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center">
                    <div className={`w-3 h-3 ${formData.paymentMethod === "CASH" ? "bg-blue-500" : "bg-white"} rounded-full`}></div>
                  </div>
                </div>
              </div>

              {/* Coming Soon Options */}
              {/* <div className="border border-gray-200 rounded-lg p-5 flex items-center cursor-not-allowed opacity-60">
                <div className="flex-shrink-0 mr-4 bg-gray-100 p-3 rounded-lg">
                  <FaCreditCard className="w-10 h-10 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">Thẻ tín dụng / Ghi nợ</h3>
                  <p className="text-gray-600 text-sm">
                    Sắp ra mắt
                  </p>
                </div>
                <div className="ml-4">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                </div>
              </div> */}
            </div>

            <div className="mt-8 bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3 mt-1">
                  <FaShoppingCart className="text-blue-500" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-800">Thông tin giỏ hàng</h4>
                  <p className="text-blue-600">Tổng thanh toán: <span className="font-semibold">{formatCurrency(totalAmount)}</span></p>
                  <p className="text-gray-600 text-sm mt-1">Số lượng sản phẩm: {cartItems.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Enter Delivery Details */}
        {paymentStep === 2 && (
          <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              {formData.paymentMethod === "ZALOPAY" ? (
                <img
                  src="https://brandlogos.net/wp-content/uploads/2022/05/zalopay-logo_brandlogos.net_fjcup.png"
                  alt="ZaloPay"
                  className="w-12 h-12 object-contain mr-3"
                />
              ) : (
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <FaMoneyBill className="text-green-600 text-2xl" />
                </div>
              )}
              <h2 className="text-2xl font-semibold text-gray-800">
                Thông tin giao hàng {formData.paymentMethod === "CASH" ? "& thanh toán COD" : ""}
              </h2>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>{error}</div>
              </div>
            )}

            <div className="space-y-6">
              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="font-medium text-lg flex items-center mb-4 text-gray-800">
                  <FaMapMarkerAlt className="mr-2 text-blue-500" /> Địa chỉ giao hàng
                </h3>

                {!isCreatingNewAddress ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Chọn địa chỉ có sẵn *
                      </label>
                      <select
                        value={selectedAddress || ""}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="">-- Chọn địa chỉ --</option>
                        {addresses.map((address) => (
                          <option
                            key={address.id}
                            value={`${address.houseNumber}, ${address.street}, ${address.district}, ${address.city}`}
                          >
                            {`${address.houseNumber}, ${address.street}, ${address.district}, ${address.city}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => setIsCreatingNewAddress(true)}
                      className="px-4 py-2 bg-white border border-gray-300 text-blue-600 rounded-md hover:bg-gray-50 flex items-center text-sm font-medium transition duration-150"
                    >
                      <FaPlus className="mr-2" /> Tạo địa chỉ mới
                    </button>
                  </>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Tạo địa chỉ mới</h4>
                      <button
                        onClick={handleCancelNewAddress}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Quay lại
                      </button>
                    </div>
                    <AddressSelector
                      onAddressChange={handleAddressChange}
                      initialAddress={null}
                    />
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="font-medium text-lg flex items-center mb-4 text-gray-800">
                  <FaPhone className="mr-2 text-blue-500" /> Thông tin liên hệ
                </h3>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Số điện thoại giao hàng *
                  </label>
                  <input
                    type="tel"
                    name="deliveryPhone"
                    value={formData.deliveryPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deliveryPhone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-5 rounded-lg">
                <h3 className="font-medium text-lg mb-3 text-blue-800">Thông tin đơn hàng</h3>
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Tổng tiền hàng:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Phí vận chuyển:</span>
                  <span>0 VNĐ</span>
                </div>
                <div className="border-t border-blue-200 my-2 pt-2 flex justify-between font-medium text-lg">
                  <span>Tổng thanh toán:</span>
                  <span className="text-blue-700">{formatCurrency(totalAmount)}</span>
                </div>
                {formData.paymentMethod === "CASH" && (
                  <div className="mt-3 bg-green-50 p-3 rounded border border-green-200 text-green-700 text-sm">
                    <p className="flex items-center">
                      <FaMoneyBill className="mr-2" />
                      Bạn sẽ thanh toán <span className="font-semibold mx-1">{formatCurrency(totalAmount)}</span> khi nhận hàng
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setPaymentStep(1)}
                className="px-5 py-2.5 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 flex items-center font-medium transition duration-150"
              >
                <FaArrowLeft className="mr-2" /> Quay lại
              </button>

              <button
                onClick={handleCreateOrder}
                disabled={loading}
                className={`px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center font-medium transition duration-150 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Đang xử lý..." : formData.paymentMethod === "CASH" ? "Đặt hàng ngay" : "Tiếp tục thanh toán"}
                {!loading && formData.paymentMethod === "ZALOPAY" && <FaQrcode className="ml-2" />}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {paymentStep === 4 && (
          <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <FaCheckCircle className="text-green-500 text-3xl" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {formData.paymentMethod === "CASH" ? "Đặt hàng thành công!" : "Thanh toán thành công!"}
            </h2>
            <p className="text-gray-600 mb-6">
              Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
            </p>

            <div className="bg-gray-50 p-5 rounded-lg mb-6 text-left">
              <h3 className="font-medium mb-3 text-gray-800">Thông tin đơn hàng</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Mã đơn hàng:</span>
                  <span className="font-medium">{orderDetails?.orderId}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phương thức thanh toán:</span>
                  <span className="font-medium">{formData.paymentMethod === "CASH" ? "Thanh toán khi nhận hàng (COD)" : "ZaloPay"}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tổng thanh toán:</span>
                  <span className="font-medium">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Link
                to="/order-history"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150"
              >
                Xem đơn hàng
              </Link>
              <Link
                to="/"
                className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition duration-150"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        )}

        {/* Step 3: QR Code Payment - Only for ZaloPay */}
        {paymentStep === 3 && orderDetails && formData.paymentMethod === "ZALOPAY" && (
          <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <img
                src="https://brandlogos.net/wp-content/uploads/2022/05/zalopay-logo_brandlogos.net_fjcup.png"
                alt="ZaloPay"
                className="w-16 h-16 object-contain mx-auto"
              />
              <h2 className="text-2xl font-semibold mt-2 text-gray-800">
                Quét mã QR để thanh toán
              </h2>
              <p className="text-gray-500 mt-1">
                Sử dụng ứng dụng ZaloPay để quét mã và hoàn tất thanh toán
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="border-4 border-blue-100 inline-block p-4 rounded-lg bg-white">
                  {/* Placeholder QR code */}
                  <div className="bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ZaloPay_Demo_Transaction')] w-48 h-48 bg-no-repeat bg-contain"></div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600 mb-1">Thời gian còn lại:</p>
                  <p className="text-xl font-semibold text-red-500">{formatTime(countdown)}</p>
                </div>
              </div>

              <div className="flex-1">
                <div className="bg-blue-50 p-5 rounded-lg mb-4">
                  <h3 className="font-medium mb-3 text-blue-800">Thông tin thanh toán</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Mã đơn hàng:</span>
                      <span className="font-medium">{orderDetails?.orderId}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Mã giao dịch:</span>
                      <span className="font-medium">{orderDetails.apptransid}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 border-t border-blue-200 pt-2 mt-2">
                      <span>Số tiền:</span>
                      <span className="font-semibold text-blue-700">{formatCurrency(orderDetails.amount)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Vui lòng không đóng trang này cho đến khi hoàn tất thanh toán
                    </p>
                  </div>
                </div>

                {/* Demo Only: Simulate payment button */}
                <button
                  onClick={handleConfirmPayment}
                  className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium flex items-center justify-center"
                >
                  <FaCheckCircle className="mr-2" /> Giả lập thanh toán thành công
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentGateway;