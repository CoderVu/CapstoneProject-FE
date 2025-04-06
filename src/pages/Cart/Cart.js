import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { emptyCart } from "../../assets/images/index";
import ItemCard from "./ItemCard";
import { getCartItems, removeCartItem } from "../../redux/actions/cartActions";
import ProductRelated from "../../components/pageProps/productDetails/ProductRelated";
import { FaTruck, FaTrash, FaShoppingBasket, FaCreditCard, FaRegCheckSquare, FaRegSquare, FaInfoCircle, FaGift, FaCopy, FaCheck } from "react-icons/fa";
import { getDiscountCodesForUser } from "../../redux/service/userService";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);
  const [totalAmt, setTotalAmt] = useState(0);
  const [selectedTotal, setSelectedTotal] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showOrderStatus, setShowOrderStatus] = useState(false);
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

  // Fetch cart items
  useEffect(() => {
    dispatch(getCartItems());
  }, [dispatch]);

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

  // Calculate total amount for all items
  useEffect(() => {
    let price = 0;
    cartItems.forEach((item) => {
      price += item.totalPrice * item.quantity;
    });
    setTotalAmt(price);
  }, [cartItems]);

  // Calculate total for selected items
  useEffect(() => {
    let selectedPrice = 0;
    cartItems.forEach((item) => {
      if (selectedItems.includes(item.id || item.productId)) {
        selectedPrice += item.totalPrice * item.quantity;
      }
    });
    setSelectedTotal(selectedPrice);
  }, [selectedItems, cartItems]);

  // Check if all items are selected
  useEffect(() => {
    if (cartItems.length > 0 && selectedItems.length === cartItems.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedItems, cartItems]);

  // Calculate shipping charge based on total amount
  useEffect(() => {
    if (totalAmt <= 200) {
      setShippingCharge(30);
    } else if (totalAmt <= 400) {
      setShippingCharge(25);
    } else if (totalAmt > 401) {
      setShippingCharge(20);
    }
  }, [totalAmt]);

  // Handle selecting all items
  const handleSelectAll = () => {
    if (selectAll) {
      // If currently all selected, deselect all
      setSelectedItems([]);
    } else {
      // Select all available items
      const availableItems = cartItems
        .filter(item =>
          !(item.statusColor === "UNAVAILABLE" ||
            item.statusSize === "UNAVAILABLE" ||
            item.statusQuantity === "UNAVAILABLE")
        )
        .map(item => item.id || item.productId);
      setSelectedItems(availableItems);
    }
    setSelectAll(!selectAll);
  };

  // Handle selecting individual items
  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Delete selected items
  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;

    selectedItems.forEach(itemId => {
      dispatch(removeCartItem(itemId));
    });

    setSelectedItems([]);
  };

  // Format price with commas
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
      alert("Mã giảm giá không hợp lệ hoặc không tồn tại!");
    }
  };

  // Calculate discount amount
  const calculateDiscountAmount = () => {
    if (!appliedDiscount) return 0;

    const amount = selectedItems.length > 0 ? selectedTotal : totalAmt;
    return Math.round((amount * appliedDiscount.discountPercentage) / 100);
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

  // Calculate final amount with discount
  const getFinalAmount = () => {
    const discountAmount = calculateDiscountAmount();
    return (selectedItems.length > 0 ? selectedTotal : totalAmt) + shippingCharge - discountAmount;
  };

  // Proceed to checkout
  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) return;

    navigate("/proceed-to-checkout", 
      {
        state: {
          totalAmount: totalAmt,
          shippingCharge: shippingCharge,
          selectedItems: selectedItems.length > 0
            ? selectedItems
            : cartItems.map(item => item.id || item.productId),
          selectedTotal: selectedItems.length > 0 ? selectedTotal : totalAmt,
          finalAmount: getFinalAmount(),
          appliedDiscount: appliedDiscount
        }
      }
    );
  };

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="Giỏ hàng" />

      {cartItems.length > 0 ? (
        <div className="pb-20">
          {/* Page Title with Animation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Giỏ hàng của bạn
            </h1>
            <p className="text-gray-500 mt-2">
              {cartItems.length} sản phẩm
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Cart Items */}
            <div className="w-full lg:w-8/12">
              {/* Selection Controls */}
              <div className="bg-white p-4 rounded-t-lg shadow-sm flex items-center gap-3 border border-gray-100 sticky top-0 z-10">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                >
                  {selectAll ? (
                    <FaRegCheckSquare className="text-blue-500 text-xl" />
                  ) : (
                    <FaRegSquare className="text-gray-400 text-xl" />
                  )}
                  <span className="font-medium">Tất cả ({cartItems.length})</span>
                </button>

                {selectedItems.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="ml-auto flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors px-3 py-1.5 hover:bg-red-50 rounded-full"
                  >
                    <FaTrash size={14} />
                    <span>Xóa</span>
                  </button>
                )}
              </div>

              {/* Cart Items */}
              <div className="bg-gray-50 p-4 rounded-b-lg mb-6">
                <div className="space-y-3">
                  {cartItems.map((item, index) => (
                    <ItemCard
                      key={item.id || item.productId}
                      item={item}
                      isFirstItem={index === 0}
                      onSelectItem={handleSelectItem}
                      isSelected={selectedItems.includes(item.id || item.productId)}
                    />
                  ))}
                </div>
              </div>

              {/* Promo Code */}
              <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100">
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
                        Số tiền giảm: {formatPrice(calculateDiscountAmount())} VNĐ
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
                      {discountCodes.map((code, index) => (
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
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                {code.status === "UNVAILABLE" ? "Không khả dụng" : "Khả dụng"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Có hiệu lực đến: {new Date(code.expiryDate).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                            <button
                              onClick={() => handleCopyCode(code.code)}
                              className="mt-1 text-xs flex items-center text-blue-600 hover:text-blue-800"
                            >
                              {copiedCode === code.code ? (
                                <>
                                  <FaCheck className="mr-1" size={10} />
                                  Đã sao chép
                                </>
                              ) : (
                                <>
                                  <FaCopy className="mr-1" size={10} />
                                  Sao chép mã
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
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

              {/* Shop Promotion */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaInfoCircle className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Ưu đãi từ shop</h3>
                    <p className="text-sm text-gray-500 mt-1">Mua thêm {formatPrice(1000000 - totalAmt)} VNĐ để được giảm 10%</p>
                  </div>
                </div>
              </div>

              {/* Order Status (Toggleable) */}
              <AnimatePresence>
                {showOrderStatus && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-100 overflow-hidden"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-800">Trạng thái đơn hàng</h3>
                      <button
                        onClick={() => setShowOrderStatus(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>

                    <div className="relative">
                      {/* Progress Bar */}
                      <div className="w-full h-1 bg-gray-200 absolute top-4"></div>

                      {/* Status Steps */}
                      <div className="flex justify-between relative">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center z-10 mb-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-800">Đặt hàng</span>
                          <span className="text-xs text-gray-500 mt-1">22/04/2023</span>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center z-10 mb-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-800">Xác nhận</span>
                          <span className="text-xs text-gray-500 mt-1">22/04/2023</span>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center z-10 mb-2">
                            <FaTruck className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-400">Vận chuyển</span>
                          <span className="text-xs text-gray-400 mt-1">--/--/----</span>
                        </div>

                        {/* Step 4 */}
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center z-10 mb-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-400">Hoàn tất</span>
                          <span className="text-xs text-gray-400 mt-1">--/--/----</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Toggle Order Status Button */}
              {!showOrderStatus && (
                <button
                  onClick={() => setShowOrderStatus(true)}
                  className="w-full bg-white hover:bg-gray-50 border border-gray-100 p-3 rounded-lg text-gray-600 mb-6 flex items-center justify-center gap-2 transition-colors"
                >
                  <FaTruck />
                  <span>Xem trạng thái đơn hàng</span>
                </button>
              )}

              {/* Continue Shopping */}
              <Link
                to="/shop"
                className="inline-block text-blue-500 hover:text-blue-700 hover:underline mb-6 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Tiếp tục mua sắm
              </Link>
            </div>

            {/* Right Column - Order Summary */}
            <div className="w-full lg:w-4/12 lg:sticky lg:top-4 lg:self-start">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-medium text-lg text-gray-800">Tóm tắt đơn hàng</h3>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Tạm tính ({selectedItems.length} sản phẩm):</span>
                    <span className="font-medium">{formatPrice(selectedTotal)} VNĐ</span>
                  </div>

                  <div className="flex justify-between items-center text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span className="font-medium">{formatPrice(shippingCharge)} VNĐ</span>
                  </div>

                  {/* Discount (if applied) */}
                  <div className="flex justify-between items-center text-green-600">
                    <span>Giảm giá:</span>
                    <span className="font-medium">
                      {appliedDiscount
                        ? `- ${formatPrice(calculateDiscountAmount())} VNĐ`
                        : "0 VNĐ"
                      }
                    </span>
                  </div>

                  <div className="h-px bg-gray-100 my-2"></div>

                  <div className="flex justify-between items-center font-medium text-gray-800">
                    <span>Tổng thanh toán:</span>
                    <span className="text-lg text-blue-600">{formatPrice(getFinalAmount())} VNĐ</span>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={handleProceedToCheckout}
                    disabled={selectedItems.length === 0}
                    className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                      selectedItems.length > 0
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    } transition-colors`}
                  >
                    <FaCreditCard size={16} />
                    <span>Thanh toán ({selectedItems.length})</span>
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    Bạn sẽ kiểm tra lại các món hàng và thanh toán khi chuyển đến trang thanh toán
                  </p>
                </div>
              </div>

              {/* Recently Viewed */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 mt-6">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-medium text-gray-800">Đã xem gần đây</h3>
                </div>
                <div className="p-5">
                <ProductRelated limit={3} compact={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row justify-center items-center gap-8 pb-20"
        >
          <div className="text-center">
            <img
              className="w-80 rounded-lg p-4 mx-auto"
              src={emptyCart}
              alt="Giỏ hàng trống"
            />
            <div className="mt-4">
              <h1 className="font-medium text-2xl text-gray-800 mb-3">
                Giỏ hàng của bạn đang trống
              </h1>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy thêm sản phẩm bạn yêu thích vào giỏ hàng ngay.
              </p>
              <Link to="/shop">
                <button className="bg-blue-500 hover:bg-blue-600 rounded-lg cursor-pointer px-8 py-3 font-medium text-base text-white transition-colors duration-300 shadow-sm flex items-center gap-2 mx-auto">
                  <FaShoppingBasket size={16} />
                  Bắt đầu mua sắm
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Cart;
