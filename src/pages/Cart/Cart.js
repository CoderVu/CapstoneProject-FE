import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { emptyCart } from "../../assets/images/index";
import ItemCard from "./ItemCard";
import { getCartItems, removeCartItem } from "../../redux/actions/cartActions";
import ProductRelated from "../../components/pageProps/productDetails/ProductRelated";
import { FaTruck, FaTrash, FaShoppingBasket, FaCreditCard } from "react-icons/fa"; // Added more icons

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);
  const [totalAmt, setTotalAmt] = useState(0);
  const [selectedTotal, setSelectedTotal] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [shippingStatus, setShippingStatus] = useState("pending");
  const [progress, setProgress] = useState(25); // Set initial progress to 25%
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    dispatch(getCartItems());
  }, [dispatch]);

  useEffect(() => {
    let price = 0;
    cartItems.forEach((item) => {
      price += item.totalPrice * item.quantity;
    });
    setTotalAmt(price);
  }, [cartItems]);

  useEffect(() => {
    // Calculate total for selected items
    let selectedPrice = 0;
    cartItems.forEach((item) => {
      if (selectedItems.includes(item.id || item.productId)) {
        selectedPrice += item.totalPrice * item.quantity;
      }
    });
    setSelectedTotal(selectedPrice);
  }, [selectedItems, cartItems]);

  useEffect(() => {
    // Check if all items are selected
    if (cartItems.length > 0 && selectedItems.length === cartItems.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedItems, cartItems]);

  useEffect(() => {
    if (totalAmt <= 200) {
      setShippingCharge(30);
    } else if (totalAmt <= 400) {
      setShippingCharge(25);
    } else if (totalAmt > 401) {
      setShippingCharge(20);
    }
  }, [totalAmt]);

  // Function to handle selecting all items
  const handleSelectAll = () => {
    if (selectAll) {
      // If currently all selected, deselect all
      setSelectedItems([]);
    } else {
      // Select all items
      const allItemIds = cartItems.map(item => item.id || item.productId);
      setSelectedItems(allItemIds);
    }
    setSelectAll(!selectAll);
  };

  // Function to handle selecting individual items
  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Function to delete selected items
  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;

    selectedItems.forEach(itemId => {
      dispatch(removeCartItem(itemId));
    });

    setSelectedItems([]);
  };

  // Function to update shipping status
  const updateShippingStatus = (status) => {
    setShippingStatus(status);
    if (status === "pending") {
      setProgress(25);
    } else if (status === "processed") {
      setProgress(50);
    } else if (status === "shipped") {
      setProgress(75);
    } else if (status === "delivered") {
      setProgress(100);
    }
  };

  // Function to determine truck color based on progress
  const getTruckColor = () => {
    if (progress === 100) return "#4F46E5";
    if (progress >= 75) return "#3B82F6";
    if (progress >= 50) return "#60A5FA";
    return "#93C5FD";
  };

  // Format price with commas
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) return;

    navigate("/paymentgateway",
      {
        state: {
          totalAmount: totalAmt,
          shippingCharge: shippingCharge,
          selectedItems: selectedItems.length > 0
          ? selectedItems
          : cartItems.map(item => item.id || item.productId),
          selectedTotal: selectedItems.length > 0 ? selectedTotal : totalAmt,
          finalAmount: selectedItems.length > 0 ? selectedTotal + shippingCharge : totalAmt + shippingCharge
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
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
              Giỏ hàng của bạn
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Bạn có {cartItems.length} sản phẩm trong giỏ hàng
            </p>
          </motion.div>

          {/* Selection Controls */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out mr-3"
                id="select-all"
              />
              <label htmlFor="select-all" className="font-medium cursor-pointer text-gray-800 dark:text-gray-200">
                Chọn tất cả ({cartItems.length} sản phẩm)
              </label>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleDeleteSelected}
                className={`flex items-center gap-2 px-4 py-2 ${selectedItems.length > 0 ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-300 cursor-not-allowed'} text-white rounded-md transition-colors duration-300 shadow-sm`}
                disabled={selectedItems.length === 0}
              >
                <FaTrash size={14} />
                <span>Xóa đã chọn ({selectedItems.length})</span>
              </button>

              {selectedItems.length > 0 && (
                <button
                  onClick={handleProceedToCheckout}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-300 shadow-sm"
                >
                  <FaShoppingBasket size={16} />
                  <span>Mua ngay ({selectedItems.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Cart Header - Desktop */}
          <div className="w-full h-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 text-gray-800 dark:text-gray-100 hidden lg:grid grid-cols-5 place-content-center px-6 text-lg font-titleFont font-semibold rounded-t-lg mb-4 border border-gray-100 dark:border-gray-700">
            <h2 className="col-span-1 text-left pl-4 flex items-center">Sản phẩm</h2>
            <h2></h2>
            <h2 className="text-center">Giá</h2>
            <h2 className="text-center">Số lượng</h2>
            <h2 className="text-center">Tổng phụ</h2>
          </div>

          {/* Cart Items */}
          <div className="mt-2 space-y-4">
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

          {/* Selected Items Summary */}
          {selectedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg mt-6 mb-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
                <FaShoppingBasket className="mr-2" size={18} />
                Tóm tắt đã chọn
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Số sản phẩm đã chọn</p>
                  <p className="font-semibold text-2xl text-gray-800 dark:text-gray-200">{selectedItems.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tổng tiền đã chọn</p>
                  <p className="font-semibold text-2xl text-gray-800 dark:text-gray-200">{formatPrice(selectedTotal)} VNĐ</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Thao tác</p>
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-300 shadow-sm flex items-center justify-center gap-2"
                  >
                    <FaCreditCard size={16} />
                    <span>Thanh toán ngay</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Reset Cart Button */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => dispatch(/* Add your resetCart action here */)}
              className="py-2 px-6 bg-red-500 text-white font-semibold rounded-md hover:bg-red-700 duration-300 shadow-sm flex items-center gap-2"
            >
              <FaTrash size={14} />
              Đặt lại giỏ hàng
            </button>

            <Link to="/shop" className="py-2 px-6 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-600 duration-300 shadow-sm">
              Tiếp tục mua sắm
            </Link>
          </div>

          {/* Coupon Section */}
          <div className="flex flex-col md:flex-row justify-between border py-5 px-6 items-center gap-4 md:gap-0 rounded-md shadow-sm mt-4 mb-8 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <input
                className="w-44 md:w-52 h-10 px-4 border text-gray-800 dark:text-gray-200 text-sm outline-none border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                type="text"
                placeholder="Mã giảm giá"
              />
              <button className="text-sm md:text-base font-semibold cursor-pointer text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                Áp dụng mã giảm giá
              </button>
            </div>
            <button className="text-base font-semibold cursor-pointer text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-md">
              Cập nhật giỏ hàng
            </button>
          </div>

          {/* Cart Total */}
          <div className="max-w-7xl gap-4 flex justify-end mt-8">
            <div className="w-full md:w-96 flex flex-col gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-3 mb-2">Tổng giỏ hàng</h1>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md overflow-hidden">
                <p className="flex items-center justify-between py-3 text-base px-4 font-medium text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">
                  Tổng phụ
                  <span className="font-semibold tracking-wide font-titleFont">
                    {formatPrice(totalAmt)} VNĐ
                  </span>
                </p>
                <p className="flex items-center justify-between py-3 text-base px-4 font-medium text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">
                  Phí vận chuyển
                  <span className="font-semibold tracking-wide font-titleFont">
                    {formatPrice(shippingCharge)} VNĐ
                  </span>
                </p>
                <p className="flex items-center justify-between py-3 text-base px-4 font-bold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-600">
                  Tổng cộng
                  <span className="font-bold tracking-wide text-lg font-titleFont">
                    {formatPrice(totalAmt + shippingCharge)} VNĐ
                  </span>
                </p>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                >
                  <FaCreditCard size={16} />
                  <span>Tiến hành thanh toán</span>
                </button>
              </div>
            </div>
          </div>

          {/* Shipping Progress */}
          <div className="relative flex flex-col items-center mt-12 mb-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Trạng thái giao hàng</h2>
            <div className="w-full max-w-lg bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 relative mb-10">
              {/* Progress Bar */}
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>

              {/* Status Points */}
              <div className="absolute -top-2 left-0 w-6 h-6 rounded-full bg-blue-600 border-2 border-white dark:border-gray-800"></div>
              <div className="absolute -top-2 left-1/3 w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800" style={{ backgroundColor: progress >= 50 ? '#3B82F6' : '#D1D5DB' }}></div>
              <div className="absolute -top-2 left-2/3 w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800" style={{ backgroundColor: progress >= 75 ? '#3B82F6' : '#D1D5DB' }}></div>
              <div className="absolute -top-2 right-0 w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800" style={{ backgroundColor: progress >= 100 ? '#3B82F6' : '#D1D5DB' }}></div>

              {/* Truck Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute -top-8"
                style={{ left: `calc(${progress}% - 1rem)` }}
              >
                <FaTruck
                  className="text-3xl transition-all duration-500"
                  style={{ color: getTruckColor() }}
                />
              </motion.div>
            </div>

            {/* Status Labels */}
            <div className="flex justify-between w-full max-w-lg text-sm font-medium">
              <span className="text-blue-600 dark:text-blue-400">Chờ xử lý</span>
              <span className={progress >= 50 ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}>Đã xác nhận</span>
              <span className={progress >= 75 ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}>Đang giao hàng</span>
              <span className={progress >= 100 ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}>Đã giao hàng</span>
            </div>

            {/* Update Status Buttons (for demo) */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              <button onClick={() => updateShippingStatus("pending")} className={`px-3 py-1.5 text-sm rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${shippingStatus === "pending" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700" : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"}`}>Chờ xử lý</button>
              <button onClick={() => updateShippingStatus("processed")} className={`px-3 py-1.5 text-sm rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${shippingStatus === "processed" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700" : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"}`}>Đã xác nhận</button>
              <button onClick={() => updateShippingStatus("shipped")} className={`px-3 py-1.5 text-sm rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${shippingStatus === "shipped" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700" : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"}`}>Đang giao</button>
              <button onClick={() => updateShippingStatus("delivered")} className={`px-3 py-1.5 text-sm rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${shippingStatus === "delivered" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700" : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"}`}>Đã giao</button>
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
          <div>
            <img
              className="w-80 rounded-lg p-4 mx-auto"
              src={emptyCart}
              alt="emptyCart"
            />
          </div>
          <div className="max-w-[500px] p-8 py-10 bg-white dark:bg-gray-800 flex gap-4 flex-col items-center rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
            <h1 className="font-titleFont text-2xl font-bold uppercase text-gray-800 dark:text-gray-200">
              Giỏ hàng của bạn đang trống.
            </h1>
            <p className="text-base text-center px-10 -mt-2 text-gray-600 dark:text-gray-400">
              Giỏ hàng của bạn đang chờ đợi. Hãy thêm sản phẩm vào giỏ hàng để làm nó vui vẻ.
            </p>
            <Link to="/shop">
              <button className="bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer px-8 py-3 font-titleFont font-semibold text-lg text-white transition-colors duration-300 shadow-md flex items-center gap-2">
                <FaShoppingBasket size={18} />
                Tiếp tục mua sắm
              </button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Related Products */}
      {cartItems.length > 0 && (
        <div className="w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mt-8 mb-12 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-4">Sản phẩm liên quan</h2>
          <ProductRelated />
        </div>
      )}
    </div>
  );
};

export default Cart;
