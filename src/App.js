import React, { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Outlet,
  Route,
  ScrollRestoration,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AdminRoute from "./pages/Admin/Auth/AdminRoute";
import Footer from "./components/home/Footer/Footer";
import FooterBottom from "./components/home/Footer/FooterBottom";
import Header from "./components/home/Header/Header";
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
import Slidebar from "./pages/Admin/Home/Slidebar";
import UserProfile from "./pages/Account/UserProfile";
import ProductDetail from "./pages/Admin/Product/ProductDetail";
import ModalEditProduct from "./pages/Admin/Product/ModalEditProduct";
import { showCustomToast } from "./components/Toast/ToastNotification";
import { fetchOrderMock } from "./redux/service/orderService";
import Categories from "./pages/Admin/Category/Categories";
import ProductTable from "./pages/Admin/Product/ProductTable";
import { ChatProvider } from "./components/context/showChat";
import ChatButton from "./components/chat/ChatButton";
import OrderHistory from "./pages/Order/OrderHistory";
import OrderList from "./pages/Admin/Order/OrderList";
import Favorites from "./pages/Favorate/Favorites";
import DiscountCode from "./pages/Admin/Discount/DiscountCode";
import Search from "./components/home/Search/Search";
import BuyNowPage from "./components/pageProps/BuyNowPage";

const Layout = () => {
  return (
    <div className="wider-container">
      <Header />
      <ScrollRestoration />
      <Outlet />
      <Footer />
      <FooterBottom />
      <ChatButton />
    </div>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path ="/search" element = {<Search />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/offer" element={<Offer />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/favorite" element={<Favorites />} />
        <Route path="/buy-now" element={<BuyNowPage />} />
        <Route path="/proceed-to-checkout" element={<Payment />} />
        <Route path="/order-history" element= {<OrderHistory />} />
        <Route path="/profile" element={<UserProfile />} />
      </Route>

      {/* Route đăng nhập & đăng ký */}
      <Route path="/signup" element={<SignUp />} />
      <Route path="/oauth2/callback" element={<OAuth2Callback />} />
      <Route path="/signin" element={<SignIn />} />

      {/* Route Admin cần bảo vệ */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<Slidebar />}>
          <Route path="dashboard" element={<ProductTable />} />
          <Route path="products" element={<ProductTable />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="categories" element={<Categories />} />
          <Route path="edit-products/:id" element={<ModalEditProduct />} />
          {/* Các trang admin khác */}
          <Route path="add-products" element={<div className="text-2xl font-bold">Thêm Sản Phẩm Mới</div>} />
          <Route path="orders" element={<OrderList />} />
          <Route path="promotions" element={<DiscountCode />} />
          <Route path="customers" element={<div className="text-2xl font-bold">Quản Lý Khách Hàng</div>} />
          <Route path="reports" element={<div className="text-2xl font-bold">Báo Cáo & Thống Kê</div>} />
          <Route path="messages" element={<div className="text-2xl font-bold">Tin Nhắn</div>} />
          <Route path="shipping" element={<div className="text-2xl font-bold">Quản Lý Vận Chuyển</div>} />
          <Route path="settings" element={<div className="text-2xl font-bold">Cài Đặt Hệ Thống</div>} />
        </Route>
      </Route>
    </Route>
  )
);

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

function AppContent() {
  useEffect(() => {
    const fetchMockOrder = async () => {
      try {
        const data = await fetchOrderMock();
        showCustomToast({
          userName: data.userName,
          productName: data.productName,
          orderCode: data.orderCode,
          timeAgo: data.orderDate,
          productImage: data.imageUrl,
          productId : data.productId
        });
      } catch (error) {
        console.error("Failed to fetch mock order data:", error);
      }
    };

    fetchMockOrder();

    const interval = setInterval(fetchMockOrder, 1000000); // Fetch every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-bodyFont">
      <RouterProvider router={router} />
      <ToastContainer />
    </div>
  );
}

export default App;
