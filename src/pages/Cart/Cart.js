import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link,  useNavigate} from "react-router-dom";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { emptyCart } from "../../assets/images/index";
import ItemCard from "./ItemCard";
import { getCartItems, removeCartItem } from "../../redux/actions/cartActions";
import ProductRelated from "../../components/pageProps/productDetails/ProductRelated";
import { FaTruck, FaTrash } from "react-icons/fa"; // Import truck and trash icons

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
          {/* Selection Controls */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out mr-3"
                id="select-all"
              />
              <label htmlFor="select-all" className="font-medium cursor-pointer">
                Chọn tất cả ({cartItems.length} sản phẩm)
              </label>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleDeleteSelected}
                className={`flex items-center gap-2 px-4 py-2 ${selectedItems.length > 0 ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-300 cursor-not-allowed'} text-white rounded-md transition-colors duration-300`}
                disabled={selectedItems.length === 0}
              >
                <FaTrash size={14} />
                <span>Xóa đã chọn ({selectedItems.length})</span>
              </button>

              {selectedItems.length > 0 && (
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-300">
                  Mua ngay ({selectedItems.length})
                </button>
              )}
            </div>
          </div>

          {/* Cart Header - Desktop */}
          <div className="w-full h-16 bg-[#F5F7F7] text-primeColor hidden lg:grid grid-cols-5 place-content-center px-6 text-lg font-titleFont font-semibold rounded-t-lg mb-4">
            <h2 className="col-span-1 text-left pl-4 flex items-center">Sản phẩm</h2>
            <h2></h2>
            <h2 className="text-center">Giá</h2>
            <h2 className="text-center">Số lượng</h2>
            <h2 className="text-center">Tổng phụ</h2>
          </div>

          {/* Cart Items */}
          <div className="mt-2">
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
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg mt-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
                Tóm tắt đã chọn
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Số sản phẩm đã chọn</p>
                  <p className="font-semibold text-lg">{selectedItems.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tổng tiền đã chọn</p>
                  <p className="font-semibold text-lg">{formatPrice(selectedTotal)} VNĐ</p>
                </div>
                <div>
                  <button className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-300">
                    Mua sản phẩm đã chọn
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reset Cart Button */}
          <button
            onClick={() => dispatch(/* Add your resetCart action here */)}
            className="py-2 px-10 bg-red-500 text-white font-semibold uppercase mb-4 hover:bg-red-700 duration-300 rounded-md"
          >
            Đặt lại giỏ hàng
          </button>

          {/* Coupon Section */}
          <div className="flex flex-col md:flex-row justify-between border py-4 px-4 items-center gap-2 md:gap-0 rounded-md shadow-sm mt-4 mb-6 bg-white">
            <div className="flex items-center gap-4">
              <input
                className="w-44 md:w-52 h-8 px-4 border text-primeColor text-sm outline-none border-gray-400 rounded-md"
                type="text"
                placeholder="Mã giảm giá"
              />
              <p className="text-sm md:text-base font-semibold cursor-pointer hover:text-blue-600 transition-colors">
                Áp dụng mã giảm giá
              </p>
            </div>
            <p className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition-colors">
              Cập nhật giỏ hàng
            </p>
          </div>

          {/* Cart Total */}
          <div className="max-w-7xl gap-4 flex justify-end mt-4">
            <div className="w-full md:w-96 flex flex-col gap-4 bg-white p-6 rounded-lg shadow-sm">
              <h1 className="text-2xl font-semibold">Tổng giỏ hàng</h1>
              <div>
                <p className="flex items-center justify-between border-[1px] border-gray-400 border-b-0 py-1.5 text-lg px-4 font-medium">
                  Tổng phụ
                  <span className="font-semibold tracking-wide font-titleFont">
                    {formatPrice(totalAmt)} VNĐ
                  </span>
                </p>
                <p className="flex items-center justify-between border-[1px] border-gray-400 border-b-0 py-1.5 text-lg px-4 font-medium">
                  Phí vận chuyển
                  <span className="font-semibold tracking-wide font-titleFont">
                    {formatPrice(shippingCharge)} VNĐ
                  </span>
                </p>
                <p className="flex items-center justify-between border-[1px] border-gray-400 py-1.5 text-lg px-4 font-medium">
                  Tổng cộng
                  <span className="font-bold tracking-wide text-lg font-titleFont">
                    {formatPrice(totalAmt + shippingCharge)} VNĐ
                  </span>
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full md:w-52 h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-all duration-300"
                >
                  Tiến hành thanh toán
                </button>
               
              </div>
            </div>
          </div>

          {/* Shipping Progress */}
          <div className="relative flex flex-col items-center mt-12 mb-8 bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Trạng thái giao hàng</h2>
            <div className="w-full max-w-lg bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 relative mb-8">
              {/* Progress Bar */}
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>

              {/* Status Points */}
              <div className="absolute -top-2 left-0 w-6 h-6 rounded-full bg-blue-600 border-2 border-white"></div>
              <div className="absolute -top-2 left-1/3 w-6 h-6 rounded-full bg-gray-300 border-2 border-white" style={{ backgroundColor: progress >= 50 ? '#3B82F6' : '#D1D5DB' }}></div>
              <div className="absolute -top-2 left-2/3 w-6 h-6 rounded-full bg-gray-300 border-2 border-white" style={{ backgroundColor: progress >= 75 ? '#3B82F6' : '#D1D5DB' }}></div>
              <div className="absolute -top-2 right-0 w-6 h-6 rounded-full bg-gray-300 border-2 border-white" style={{ backgroundColor: progress >= 100 ? '#3B82F6' : '#D1D5DB' }}></div>

              {/* Truck Icon */}
              <FaTruck
                className="absolute -top-8 text-3xl transition-all duration-500"
                style={{ left: `calc(${progress}% - 1rem)`, transform: 'translateX(-50%)', color: getTruckColor() }}
              />
            </div>

            {/* Status Labels */}
            <div className="flex justify-between w-full max-w-lg text-sm font-medium">
              <span className="text-blue-600">Chờ xử lý</span>
              <span className={progress >= 50 ? "text-blue-600" : "text-gray-500"}>Đã xác nhận</span>
              <span className={progress >= 75 ? "text-blue-600" : "text-gray-500"}>Đang giao hàng</span>
              <span className={progress >= 100 ? "text-blue-600" : "text-gray-500"}>Đã giao hàng</span>
            </div>

            {/* Update Status Buttons (for demo) */}
            <div className="flex gap-2 mt-6">
              <button onClick={() => updateShippingStatus("pending")} className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50">Chờ xử lý</button>
              <button onClick={() => updateShippingStatus("processed")} className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50">Đã xác nhận</button>
              <button onClick={() => updateShippingStatus("shipped")} className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50">Đang giao</button>
              <button onClick={() => updateShippingStatus("delivered")} className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50">Đã giao</button>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row justify-center items-center gap-4 pb-20"
        >
          <div>
            <img
              className="w-80 rounded-lg p-4 mx-auto"
              src={emptyCart}
              alt="emptyCart"
            />
          </div>
          <div className="max-w-[500px] p-4 py-8 bg-white flex gap-4 flex-col items-center rounded-md shadow-lg">
            <h1 className="font-titleFont text-xl font-bold uppercase">
              Giỏ hàng của bạn đang trống.
            </h1>
            <p className="text-sm text-center px-10 -mt-2">
              Giỏ hàng của bạn đang chờ đợi. Hãy thêm sản phẩm vào giỏ hàng để làm nó vui vẻ.
            </p>
            <Link to="/shop">
              <button className="bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer px-8 py-2 font-titleFont font-semibold text-lg text-white transition-colors duration-300">
                Tiếp tục mua sắm
              </button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Related Products */}
      {cartItems.length > 0 && (
        <div className="w-full bg-white p-6 rounded-lg shadow-md mt-8 mb-12">
          <h2 className="text-2xl font-semibold mb-6">Sản phẩm liên quan</h2>
          <ProductRelated />
        </div>
      )}
    </div>
  );
};

export default Cart;
