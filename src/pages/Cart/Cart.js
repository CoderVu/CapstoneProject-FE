import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { emptyCart } from "../../assets/images/index";
import ItemCard from "./ItemCard";
import { getCartItems } from "../../redux/actions/cartActions";
import ProductRelated from "../../components/pageProps/productDetails/ProductRelated";
import { FaTruck } from "react-icons/fa"; // Import the truck icon

const Cart = () => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const [totalAmt, setTotalAmt] = useState("");
  const [shippingCharge, setShippingCharge] = useState("");
  const [shippingStatus, setShippingStatus] = useState("pending");
  const [progress, setProgress] = useState(0); // Set initial progress to 50%

  useEffect(() => {
    dispatch(getCartItems());
  }, [dispatch]);

  useEffect(() => {
    console.log("cartItems", cartItems);
  }, [cartItems]);

  useEffect(() => {
    let price = 0;
    cartItems.map((item) => {
      price += item.totalPrice * item.quantity;
      return price;
    });
    setTotalAmt(price);
  }, [cartItems]);

  useEffect(() => {
    if (totalAmt <= 200) {
      setShippingCharge(30);
    } else if (totalAmt <= 400) {
      setShippingCharge(25);
    } else if (totalAmt > 401) {
      setShippingCharge(20);
    }
  }, [totalAmt]);

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
    if (progress === 100) return "blue";
    if (progress >= 75) return "blue";
    if (progress >= 50) return "blue";
    return "blue";
  };

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="Giỏ hàng" />
      {cartItems.length > 0 ? (
        <div className="pb-20">
          <div className="w-full h-20 bg-[#F5F7F7] text-primeColor hidden lgl:grid grid-cols-5 place-content-center px-6 text-lg font-titleFont font-semibold text-center">
            <h2 className="col-span-1">Sản phẩm</h2>
            <h2></h2>  
            <h2 >Giá</h2>
            <h2>Số lượng</h2>
            <h2>Tổng phụ</h2>
           
          </div>
          <div className="mt-5">
            {cartItems.map((item) => (
              <div key={item.productId}>
                <ItemCard item={item} />
              </div>
            ))}
          </div>

          <button
            onClick={() => dispatch()}
            className="py-2 px-10 bg-red-500 text-white font-semibold uppercase mb-4 hover:bg-red-700 duration-300"
          >
            Đặt lại giỏ hàng
          </button>

          <div className="flex flex-col mdl:flex-row justify-between border py-4 px-4 items-center gap-2 mdl:gap-0">
            <div className="flex items-center gap-4">
              <input
                className="w-44 mdl:w-52 h-8 px-4 border text-primeColor text-sm outline-none border-gray-400"
                type="text"
                placeholder="Mã giảm giá"
              />
              <p className="text-sm mdl:text-base font-semibold">
                Áp dụng mã giảm giá
              </p>
            </div>
            <p className="text-lg font-semibold">Cập nhật giỏ hàng</p>
          </div>
          <div className="max-w-7xl gap-4 flex justify-end mt-4">
            <div className="w-96 flex flex-col gap-4">
              <h1 className="text-2xl font-semibold text-right">Tổng giỏ hàng</h1>
              <div>
                <p className="flex items-center justify-between border-[1px] border-gray-400 border-b-0 py-1.5 text-lg px-4 font-medium">
                  Tổng phụ
                  <span className="font-semibold tracking-wide font-titleFont">
                    ${totalAmt}
                  </span>
                </p>
                <p className="flex items-center justify-between border-[1px] border-gray-400 border-b-0 py-1.5 text-lg px-4 font-medium">
                  Phí vận chuyển
                  <span className="font-semibold tracking-wide font-titleFont">
                    ${shippingCharge}
                  </span>
                </p>
                <p className="flex items-center justify-between border-[1px] border-gray-400 py-1.5 text-lg px-4 font-medium">
                  Tổng cộng
                  <span className="font-bold tracking-wide text-lg font-titleFont">
                    ${totalAmt + shippingCharge}
                  </span>
                </p>
              </div>
              <div className="flex justify-end">
                <Link to="/paymentgateway">
                  <button className="w-52 h-10 bg-primeColor text-white hover:bg-black duration-300">
                    Tiến hành thanh toán
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Shipping Progress */}
          <div className="relative flex flex-col items-center mt-8">
            <div className="w-full max-w-lg bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 relative">
              {/* Progress Bar */}
              <div
                className="bg-primeColor h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>

              {/* Truck Icon */}
              <FaTruck
                className="absolute -top-6 text-3xl transition-all duration-500"
                style={{ left: `calc(${progress}% - 1rem)`, transform: 'translateX(-50%)', color: getTruckColor() }}
              />
            </div>

            {/* Shipping Status */}
            <p className="mt-2 text-lg font-semibold">
              {shippingStatus === "shipped" ? "Đơn hàng đã được giao" : "Đang giao hàng"}
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col mdl:flex-row justify-center items-center gap-4 pb-20"
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
              <button className="bg-primeColor rounded-md cursor-pointer hover:bg-black active:bg-gray-900 px-8 py-2 font-titleFont font-semibold text-lg text-gray-200 hover:text-white duration-300">
                Tiếp tục mua sắm
              </button>
            </Link>
          </div>
        </motion.div>
      )}
      {/* Sản phẩm liên quan */}
      <div className="w-full bg-white p-4 rounded-lg shadow-md mt-4">
        <ProductRelated />
      </div>
    </div>
  );
};

export default Cart;