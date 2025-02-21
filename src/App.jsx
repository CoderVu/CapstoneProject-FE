import React, { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  createRoutesFromElements,
  Route,
  ScrollRestoration,
} from "react-router-dom";
import AdminRoute from "./components/Auth/AdminRoute";
import Footer from "./components/home/Footer/Footer";
import FooterBottom from "./components/home/Footer/FooterBottom";
import Header from "./components/home/Header/Header";
import HeaderBottom from "./components/home/Header/HeaderBottom";
import About from "./pages/About/About";
import SignIn from "./pages/Account/SignIn";
import OAuth2Callback from "./pages/Account/OAuth2Callback";
import SignUp from "./pages/Account/SignUp";
import Cart from "./pages/Cart/Cart";
import Contact from "./pages/Contact/Contact";
import Home from "./pages/Home/Home";
import Offer from "./pages/Offer/Offer";
import Payment from "./pages/payment/Payment";
import ProductDetails from "./components/pageProps/productDetails/ProductDetails";
import Shop from "./pages/Shop/Shop";
import Dashboard from "./pages/Admin/Home/Dashboard";
import AdminLayout from "./pages/Admin/Layout/AdminLayout";
import UserProfile from "./pages/Account/UserProfile";
import Products from "./pages/Admin/Products";
import ToastNotification, { showCustomToast } from "./components/Toast/ToastNotification";

import { fetchOrderMock } from "./redux/service/orderService";

const Layout = () => {
  return (
    <div>
      <Header />
      <HeaderBottom />
      <ScrollRestoration />
      <Outlet />
      <Footer />
      <FooterBottom />
    </div>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/offer" element={<Offer />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/paymentgateway" element={<Payment />} />
        <Route path="/profile" element={<UserProfile />} />
      </Route>

      {/* Route đăng nhập & đăng ký */}
      <Route path="/signup" element={<SignUp />} />
      <Route path="/oauth2/callback" element={<OAuth2Callback />} />
      <Route path="/signin" element={<SignIn />} />

      {/* Route Admin cần bảo vệ */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="home" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          {/* Thêm các trang admin khác nếu cần */}
        </Route>
      </Route>
    </Route>
  )
);

function App() {
  useEffect(() => {
    const fetchMockOrder = async () => {
      try {
        const data = await fetchOrderMock();
        showCustomToast({
          userName: "Nguyễn Văn A",
          productName: "Áo thun nam",
          productCode: "Mã SP: 123456",
          timeAgo: "15 phút trước",
        });
      } catch (error) {
        console.error("Failed to fetch mock order data:", error);
      }
    };

    fetchMockOrder();
  }, []);

  return (
    <div className="font-bodyFont">
      <RouterProvider router={router} />
      <ToastNotification />
    </div>
  );
}

export default App;