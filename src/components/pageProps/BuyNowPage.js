import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaQrcode, FaArrowLeft, FaCheckCircle, FaPlus, FaCreditCard, FaMapMarkerAlt, FaPhone, FaShoppingBag, FaMoneyBill, FaGift, FaCopy, FaCheck } from "react-icons/fa";
import { createOrderNow } from "../../redux/service/orderService";
import AddressSelector from "../../pages/payment/AddressSelector";
import { fetchAddress } from "../../redux/service/authService";
import { getDiscountCodesForUser } from "../../redux/service/userService";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { motion } from "framer-motion"
const BuyNowPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { product } = location.state || {};

    // If no product data, redirect to home
    useEffect(() => {
      if (!product) {
        navigate('/');
      }
    }, [product, navigate]);

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
      orderInfo: "Thanh toán đơn hàng mua ngay",
      paymentMethod: "",
    });

    // States for discount feature
    const [discountCodes, setDiscountCodes] = useState([]);
    const [loadingDiscounts, setLoadingDiscounts] = useState(false);
    const [promoCode, setPromoCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [copiedCode, setCopiedCode] = useState(null);

    // Default discount images
    const discountImages = [
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
    ];

    // Calculate total amount from product data
    const totalAmount = product?.amount || 0;

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

    // Fetch user's discount codes
    useEffect(() => {
      const fetchDiscountCodes = async () => {
        try {
          setLoadingDiscounts(true);
          const response = await getDiscountCodesForUser();
          if (response && response.data) {
            setDiscountCodes(response.data);
          }
        } catch (error) {
          console.error("Lỗi khi lấy mã giảm giá:", error);
        } finally {
          setLoadingDiscounts(false);
        }
      };

      fetchDiscountCodes();
    }, []);

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

      if (product) {
        fetchAddresses();
      }
    }, [product]);

    // Validate phone number
    const validatePhoneNumber = (phoneNumber) => {
      // Kiểm tra số điện thoại Việt Nam
      // Bắt đầu bằng 0, theo sau là 9 chữ số hoặc
      // Bắt đầu bằng +84, theo sau là 9 chữ số
      const vietnamPhoneRegex = /^(0|(\+84))[3|5|7|8|9][0-9]{8}$/;
      return vietnamPhoneRegex.test(phoneNumber);
    };

    // Handle address change from Address Selector
    const handleAddressChange = (address) => {
        // Format the address as a single string
        const fullAddress = `${address.houseNumber}, ${address.street}, ${address.district}, ${address.city}`;

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

      // Validate phone number
      if (!validatePhoneNumber(formData.deliveryPhone)) {
        setError("Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng số điện thoại Việt Nam");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Calculate final amount with discount
        const finalAmount = getFinalAmount();

        // Prepare order request
        const orderRequest = {
          productId: product.productId,
          size: product.size,
          color: product.color,
          quantity: product.quantity,
          deliveryAddress: formData.deliveryAddress,
          deliveryPhone: formData.deliveryPhone,
          paymentMethod: formData.paymentMethod,
          amount: finalAmount, // Use discounted amount
          orderInfo: formData.orderInfo,
          lang: "vi",
          extraData: "additional data",
          discountCode: appliedDiscount ? appliedDiscount.code : null,
          discountAmount: calculateDiscountAmount(),
          originalAmount: totalAmount,
        };

        console.log("Order Request:", orderRequest);
        // Call the API to create the order
        const orderResponse = await createOrderNow(orderRequest);

        if (formData.paymentMethod === "CASH") {
          // Handle success for "CASH" payment
          setOrderDetails({
            orderId: orderResponse?.orderId || "COD" + Math.floor(100000 + Math.random() * 900000),
            apptransid: "C" + Date.now(),
            amount: finalAmount, // Use discounted amount
            orderInfo: formData.orderInfo,
            discountAmount: calculateDiscountAmount(),
            originalAmount: totalAmount,
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
            amount: finalAmount, // Use discounted amount
            orderInfo: formData.orderInfo,
            discountAmount: calculateDiscountAmount(),
            originalAmount: totalAmount,
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

    // Handle applying discount code
    const handleApplyPromoCode = () => {
      if (!promoCode.trim()) return;

      const foundDiscount = discountCodes.find(code => code.code === promoCode);
      if (foundDiscount) {
        setAppliedDiscount(foundDiscount);
        // Clear input field after successful application
        setPromoCode("");
      } else {
        // Show error message or handle invalid code
        setError("Mã giảm giá không hợp lệ hoặc không tồn tại!");
      }
    };

    // Calculate discount amount
    const calculateDiscountAmount = () => {
      if (!appliedDiscount) return 0;
      return Math.round((totalAmount * appliedDiscount.discountPercentage) / 100);
    };

    // Copy discount code to clipboard
    const handleCopyCode = (code) => {
      navigator.clipboard.writeText(code)
        .then(() => {
          setCopiedCode(code);
          setTimeout(() => setCopiedCode(null), 2000);

          // Auto-fill the promo code input
          setPromoCode(code);
        })
        .catch(err => {
          console.error('Không thể sao chép mã:', err);
        });
    };

    // Check if discount code is expired
    const isExpired = (expiryDate) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const exp = new Date(expiryDate);
      exp.setHours(0, 0, 0, 0);
      return exp < today;
    };

    // Calculate final amount with discount
    const getFinalAmount = () => {
      const discountAmount = calculateDiscountAmount();
      return totalAmount - discountAmount;
    };

    if (!product) {
      return <div className="max-w-container mx-auto px-4 py-8 text-center">Đang tải...</div>;
    }

    return (

      <div className="max-w-container mx-auto px-4 pb-10">
           <Breadcrumbs title="Thanh toán" />

           <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 p-3 mb-6"
>
  {/* Desktop View */}
  <div className="hidden md:flex items-center">
    {/* Product Image */}
    <div className="relative flex-shrink-0 mr-4">
      <div className="w-20 h-20 bg-gray-50 rounded-md overflow-hidden border border-gray-100">
        <img
          className="w-full h-full object-contain p-1"
          src={product.productImage}
          alt={product.productName}
        />
      </div>
      
      {/* Bạn có thể thêm badge giảm giá nếu có */}
      {product.discount && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-bl-md">
          -{product.discount}%
        </div>
      )}
    </div>

    {/* Product Info */}
    <div className="flex-1">
      <h3 className="font-medium text-gray-800 line-clamp-1">{product.productName}</h3>

      <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500">
        {product.color && (
          <div className="flex items-center gap-1">
            <span className="text-xs">Màu:</span>
            <div className="flex items-center gap-1">
              <span
                className="inline-block w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: product.color }}
              ></span>
              <span className="text-xs">{product.color}</span>
            </div>
          </div>
        )}

        {product.size && (
          <div className="flex items-center gap-1">
            <span className="text-xs">Size:</span>
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 leading-none">
              {product.size}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <span className="text-red-500 font-medium">₫{formatCurrency(product.amount).replace(' VNĐ', '')}</span>
          {product.originalPrice && product.originalPrice > product.amount && (
            <span className="text-gray-400 text-xs line-through">₫{formatCurrency(product.originalPrice).replace(' VNĐ', '')}</span>
          )}
        </div>

        <div className="flex items-center text-sm">
          <span className="text-gray-500 mr-2">SL: {product.quantity}</span>
        </div>
      </div>
    </div>
  </div>

  {/* Mobile View */}
  <div className="md:hidden">
    {/* Header with product name */}
    <div className="flex items-center mb-3">
      <h3 className="font-medium text-gray-800 text-sm line-clamp-1 flex-1">{product.productName}</h3>
     
    </div>

    {/* Content with image and info */}
    <div className="flex items-start">
      {/* Product Image */}
      <div className="relative flex-shrink-0 mr-3">
        <div className="w-20 h-20 bg-gray-50 rounded-md overflow-hidden border border-gray-100">
          <img
            className="w-full h-full object-contain p-1"
            src={product.productImage}
            alt={product.productName}
          />
        </div>

        {/* Sale Tag - nếu có */}
        {product.discount && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-2xs font-medium px-1 py-0.5 rounded-bl-md">
            -{product.discount}%
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1">
        <div className="flex items-center flex-wrap gap-2 mb-1.5 mt-1">
          {product.color && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>Màu:</span>
              <div className="inline-flex items-center gap-1">
                <span
                  className="inline-block w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: product.color }}
                ></span>
                <span>{product.color}</span>
              </div>
            </div>
          )}

          {product.size && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>Size:</span>
              <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 leading-none">
                {product.size}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-end">
          <div>
            <div className="text-red-500 font-medium">₫{formatCurrency(product.amount).replace(' VNĐ', '')}</div>
            {product.originalPrice && product.originalPrice > product.amount && (
              <div className="text-gray-400 text-xs line-through">₫{formatCurrency(product.originalPrice).replace(' VNĐ', '')}</div>
            )}
          </div>

          <div className="flex items-center">
            <span className="text-gray-500 text-xs">SL: {product.quantity}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Promotion Info (nếu có) */}
  {product.promotion && (
    <div className="bg-orange-50 py-2 px-3 text-xs text-orange-600 border-t border-orange-100 mt-3">
      <div className="flex items-start">
        <span className="inline-block bg-orange-100 text-orange-600 p-0.5 rounded text-xs mr-1.5">Ưu đãi</span>
        <span>{product.promotion}</span>
      </div>
    </div>
  )}
</motion.div>
        {/* Payment Steps Indicator */}
        <div className="mb-8 pt-4 relative">
          <div className="flex justify-between items-center max-w-3xl mx-auto">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className="flex flex-col items-center relative z-10"
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

              {/* Coming Soon Options
              <div className="border border-gray-200 rounded-lg p-5 flex items-center cursor-not-allowed opacity-60">
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
                  <FaShoppingBag className="text-blue-500" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-800">Thông tin sản phẩm</h4>
                  <p className="text-blue-600">Tổng thanh toán: <span className="font-semibold">{formatCurrency(totalAmount)}</span></p>
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
                <h3 className="font-medium text-lg mb-3 text-blue-800">Thông tin sản phẩm</h3>
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Tên sản phẩm:</span>
                  <span className="font-medium">{product.productName}</span>
                </div>
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Số lượng:</span>
                  <span>{product.quantity}</span>
                </div>
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Tổng tiền hàng:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Phí vận chuyển:</span>
                  <span>0 VNĐ</span>
                </div>

                {/* Discount information */}
                {appliedDiscount && (
                  <div className="flex justify-between text-green-600 mb-2">
                    <span>Giảm giá ({appliedDiscount.discountPercentage}%):</span>
                    <span>- {formatCurrency(calculateDiscountAmount())}</span>
                  </div>
                )}

                <div className="border-t border-blue-200 my-2 pt-2 flex justify-between font-medium text-lg">
                  <span>Tổng thanh toán:</span>
                  <span className="text-blue-700">{formatCurrency(getFinalAmount())}</span>
                </div>
                {formData.paymentMethod === "CASH" && (
                  <div className="mt-3 bg-green-50 p-3 rounded border border-green-200 text-green-700 text-sm">
                    <p className="flex items-center">
                      <FaMoneyBill className="mr-2" />
                      Bạn sẽ thanh toán <span className="font-semibold mx-1">{formatCurrency(getFinalAmount())}</span> khi nhận hàng
                    </p>
                  </div>
                )}
              </div>

              {/* Promo Code Section */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 mt-6">
                <div className="flex items-center gap-3">
                  <FaGift className="text-orange-500 text-xl" />
                  <h3 className="font-medium text-gray-800">Mã giảm giá</h3>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <input
                    className="flex-1 h-10 px-4 border text-gray-800 text-sm outline-none border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button
                    onClick={handleApplyPromoCode}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>

                {/* Applied Discount */}
                {appliedDiscount && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium text-green-700">Mã: {appliedDiscount.code}</span>
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                          Giảm {appliedDiscount.discountPercentage}%
                        </span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        Số tiền giảm: {formatCurrency(calculateDiscountAmount())}
                      </p>
                    </div>
                    <button
                      onClick={() => setAppliedDiscount(null)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                )}

                {/* User's Discount Codes */}
                {discountCodes.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Mã giảm giá của bạn:</h4>
                    <div className="space-y-3">
                      {discountCodes
                        .filter(code => code.status === "AVAILABLE" || code.status === "ASSIGNED") // Chỉ hiển thị mã AVAILABLE và ASSIGNED
                        .map((code, index) => {
                          const expired = isExpired(code.expiryDate);
                          return (
                            <div key={code.code} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center shadow-sm hover:shadow-md transition-shadow">
                              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md mr-3">
                                <img
                                  src={discountImages[index % discountImages.length]}
                                  alt="Discount"
                                  className="h-full w-full object-cover"
                                />
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-bl-md">
                                  {code.discountPercentage}%
                                </div>
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium text-gray-800">{code.code}</h5>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {expired
                                    ? "Hết hạn"
                                    : `Có hiệu lực đến: ${new Date(code.expiryDate).toLocaleDateString("vi-VN", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })}`}
                                </p>
                                <button
                                  onClick={() => !expired && handleCopyCode(code.code)}
                                  className={`mt-1 text-xs flex items-center ${expired
                                      ? "text-gray-400 cursor-not-allowed"
                                      : "text-blue-600 hover:text-blue-800"
                                    }`}
                                  disabled={expired}
                                >
                                  {copiedCode === code.code ? (
                                    <>
                                      <FaCheck className="mr-1" size={10} />
                                      Đã sao chép
                                    </>
                                  ) : (
                                    <>
                                      <FaCopy className="mr-1" size={10} />
                                      {expired ? "Hết hạn" : "Sao chép mã"}
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {loadingDiscounts && (
                  <div className="mt-3 flex justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
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
                {orderDetails?.originalAmount !== orderDetails?.amount && (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>Tổng tiền hàng:</span>
                      <span className="font-medium">{formatCurrency(orderDetails?.originalAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span className="font-medium">- {formatCurrency(orderDetails?.discountAmount || 0)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Tổng thanh toán:</span>
                  <span className="text-blue-600">{formatCurrency(orderDetails?.amount || 0)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Link
                to="/orders"
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
                    {orderDetails?.originalAmount !== orderDetails?.amount && (
                      <>
                        <div className="flex justify-between text-gray-600">
                          <span>Tổng tiền hàng:</span>
                          <span className="font-medium">{formatCurrency(orderDetails?.originalAmount || 0)}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Giảm giá:</span>
                          <span>- {formatCurrency(orderDetails?.discountAmount || 0)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-gray-600 border-t border-blue-200 pt-2 mt-2">
                      <span>Số tiền cần thanh toán:</span>
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
    );
  };

  export default BuyNowPage;
