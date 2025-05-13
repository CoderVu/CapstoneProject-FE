import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Home,
  Package,
  Tags,
  ShoppingCart,
  Users,
  BarChart2,
  Settings,
  Gift,
  Moon,
  Sun,
  Send,
  MessageCircle,
  LogOut,
} from "lucide-react";
import { ChatProvider } from "../../../components/context/showChat";
import ChatButton from "../../../components/chat/ChatButton";
import OrderNotification from "../../../components/Toast/OrderNotification";
import { logoutUser } from "../../../redux/actions/authActions";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Sidebar mặc định đóng
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);
  const auth = useSelector((state) => state.auth.auth);

  // Kiểm tra chế độ tối từ hệ thống hoặc localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedDarkMode || (!localStorage.getItem("darkMode") && prefersDarkMode)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Áp dụng thay đổi chế độ tối
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDarkMode]);

  // Toggle chế độ tối
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/signin');
  };  

  // Cấu hình menu
  const menuItems = [
    { path: "/admin/dashboard", name: "Tổng quan", icon: Home },
    { path: "/admin/products", name: "Sản phẩm", icon: Package },
    { path: "/admin/categories", name: "Danh mục", icon: Tags },
    { path: "/admin/orders", name: "Đơn hàng", icon: ShoppingCart },
    { path: "/admin/promotions", name: "Khuyến mãi", icon: Gift },
    { path: "/admin/customers", name: "Khách hàng", icon: Users },
    // { path: "/admin/reports", name: "Báo cáo", icon: BarChart2 },
    { path: "/admin/messages", name: "Tin nhắn", icon: MessageCircle },
    { path: "/admin/shipping", name: "Vận chuyển", icon: Send },
    { path: "/admin/settings", name: "Cài đặt", icon: Settings },
  ];

  return (
    <ChatProvider>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside
          onMouseEnter={() => setIsOpen(true)} // Mở khi hover
          onMouseLeave={() => setIsOpen(false)} // Đóng khi rời chuột
          className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r dark:border-gray-700 transition-all duration-300 ${
            isOpen ? "w-64" : "w-16"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Avatar Section */}
            <div className="flex flex-col items-center justify-center h-24 border-b dark:border-gray-700">
              <img
                className="w-12 h-12 rounded-full border-2 border-blue-500"
                src={
                  isLoggedIn && auth?.avatar
                    ? auth.avatar
                    : "https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                }
                alt="User Avatar"
              />
              {isOpen && (
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isLoggedIn ? auth?.fullName || "Admin" : "Guest"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isLoggedIn ? "Quản trị viên" : "Khách"}
                  </p>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto">
              <ul className="space-y-2 p-2">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={`flex items-center p-2 rounded-lg transition-all ${
                          isActive
                            ? "bg-gray-100 dark:bg-gray-700 text-blue-600"
                            : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span
                          className={`ml-3 ${
                            isOpen ? "block" : "hidden"
                          } transition-all`}
                        >
                          {item.name}
                        </span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Dark Mode Toggle */}
            <div className="p-2 border-t dark:border-gray-700">
              <button
                onClick={toggleDarkMode}
                className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-500" />
                )}
                <span
                  className={`ml-3 ${
                    isOpen ? "block" : "hidden"
                  } transition-all`}
                >
                  {isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
                </span>
              </button>
            </div>

            {/* Logout Button */}
            <div className="p-2 border-t dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span
                  className={`ml-3 ${
                    isOpen ? "block" : "hidden"
                  } transition-all`}
                >
                  Đăng xuất
                </span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 bg-gray-50 dark:bg-gray-900 p-4 transition-all duration-300 ${
            isOpen ? "ml-64" : "ml-16"
          }`}
        >
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <Outlet />
          </div>
        </main>

        {/* Order Notifications */}
        <OrderNotification />

        {/* Chat Button */}
        <ChatButton />
      </div>
    </ChatProvider>
  );
};

export default Sidebar;