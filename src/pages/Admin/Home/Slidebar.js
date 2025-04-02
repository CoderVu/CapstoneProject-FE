import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Home,
  Package,
  Tags,
  ShoppingCart,
  Users,
  BarChart2,
  Settings,
  Gift,
  Menu,
  X,
  Moon,
  Sun,
  Send,
  MessageCircle,
  PlusCircle
} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  // Check for system/saved dark mode preference on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedDarkMode || (!localStorage.getItem('darkMode') && prefersDarkMode)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Apply dark mode changes whenever isDarkMode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handle mobile menu toggle
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Menu items configuration
  const menuItems = [
    { path: '/admin/dashboard', name: 'Tổng quan', icon: Home },
    { path: '/admin/products', name: 'Sản phẩm', icon: Package },
    { path: '/admin/categories', name: 'Danh mục', icon: Tags },
    { path: '/admin/orders', name: 'Đơn hàng', icon: ShoppingCart },
    { path: '/admin/promotions', name: 'Khuyến mãi', icon: Gift },
    { path: '/admin/customers', name: 'Khách hàng', icon: Users },
    { path: '/admin/reports', name: 'Báo cáo', icon: BarChart2 },
    { path: '/admin/messages', name: 'Tin nhắn', icon: MessageCircle },
    { path: '/admin/shipping', name: 'Vận chuyển', icon: Send },
    { path: '/admin/settings', name: 'Cài đặt', icon: Settings },
  ];

  // Làm cho các mã màu dễ kiểm tra hơn
  const lightModeClasses = {
    nav: "bg-white border-gray-200",
    sidebar: "bg-white border-gray-200",
    text: "text-gray-900",
    hoverBg: "hover:bg-gray-100",
    activeBg: "bg-gray-100",
    iconColor: "text-gray-500",
    activeIconColor: "text-blue-600",
    mainContent: "bg-white" 
  };

  const darkModeClasses = {
    nav: "bg-gray-800 border-gray-700",
    sidebar: "bg-gray-800 border-gray-700",
    text: "text-white",
    hoverBg: "hover:bg-gray-700",
    activeBg: "bg-gray-700",
    iconColor: "text-gray-400",
    activeIconColor: "text-blue-400",
    mainContent: "bg-gray-800"
  };

  // Chọn theme dựa trên trạng thái dark mode
  const theme = isDarkMode ? darkModeClasses : lightModeClasses;

  return (
    <>
      {/* Top Navigation */}
      <nav className={`fixed top-0 z-50 w-full ${theme.nav} border-b shadow-sm transition-colors duration-200`}>
        <div className="px-4 py-3 lg:px-5 lg:pl-3 flex justify-between items-center">
          {/* Left Section */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              type="button"
              className={`p-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} rounded-lg ${theme.hoverBg} focus:outline-none focus:ring-2 focus:ring-gray-200 ${isDarkMode ? 'dark:focus:ring-gray-600' : ''}`}
              aria-expanded={isOpen}
            >
              <span className="sr-only">Điều chỉnh Sidebar</span>
              {isOpen ? (
                <X className="w-6 h-6 sm:hidden" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <a href="/" className="flex items-center ml-2">
              <img
                src="https://flowbite.com/docs/images/logo.svg"
                className="h-8 mr-3"
                alt="Logo"
              />
              <span className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Việt Shop</span>
            </a>
          </div>

          {/* Profile Section */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className={`p-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} rounded-lg ${theme.hoverBg} focus:outline-none`}
              aria-label="Chế độ tối"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <div className="flex items-center space-x-2">
              <img
                className="w-8 h-8 rounded-full border-2 border-transparent hover:border-blue-500 transition-all duration-200"
                src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                alt="Người dùng"
              />
              <span className={`hidden md:inline text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Admin</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar and Main Content */}
      <div className="flex w-full">
        {/* Mobile Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 sm:hidden"
            onClick={toggleSidebar}
            aria-hidden="true"
          ></div>
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-40 w-64 h-full pt-20 ${theme.sidebar} border-r transition-all duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0 sm:w-20'
          }`}
        >
          <div className="h-full px-3 pb-4 overflow-y-auto">
            <ul className="space-y-2 font-medium">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `
                        flex items-center p-2 ${theme.text} rounded-lg
                        ${theme.hoverBg}
                        ${isActive ? theme.activeBg : ''}
                        transition-all duration-200
                      `}
                    >
                      <IconComponent className={`w-5 h-5 transition duration-75 ${
                        isActive
                          ? theme.activeIconColor
                          : theme.iconColor
                      }`} />
                      <span className={`ml-3 ${!isOpen ? 'sm:hidden' : ''}`}>{item.name}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`w-full transition-all duration-300 ease-in-out ${
            isOpen ? 'sm:ml-64' : 'sm:ml-20'
          } p-4 pt-20`}
        >
          <div className={`p-4 ${theme.mainContent} rounded-lg shadow-sm min-h-[calc(100vh-6rem)]`}>
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default Sidebar;