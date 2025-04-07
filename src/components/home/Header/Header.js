import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import { FaSearch, FaUser, FaShoppingCart, FaHeart, FaTimes, FaChevronDown, FaChevronRight } from "react-icons/fa";
import { logo } from "../../../assets/images";
import Image from "../../designLayouts/Image";
import { navBarList } from "../../../constants";
import { getCategories } from "../../../redux/actions/categoryAction";
import { logoutUser } from "../../../redux/actions/authActions";

const Header = () => {
  // Redux state
  const products = useSelector((state) => state.product.products || []);
  const categories = useSelector((state) => state.category.categories);
  const cartItems = useSelector((state) => state.cart.cartItems || []);
  const auth = useSelector((state) => state.auth.auth);
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);

  // Component state
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [shopNavPosition, setShopNavPosition] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  // Refs for click-outside detection
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  const menuRef = useRef(null);
  const modalRef = useRef(null);
  const shopNavRef = useRef(null);

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  // Responsive menu handler
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setShowMenu(false);
      } else {
        setShowMenu(true);
      }
      updateShopNavPosition();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update Shop nav position for modal positioning
  const updateShopNavPosition = () => {
    if (shopNavRef.current) {
      const rect = shopNavRef.current.getBoundingClientRect();
      setShopNavPosition({
        left: rect.left,
        center: rect.left + rect.width / 2,
        width: rect.width
      });
    }
  };

  // Click outside handlers for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }

      if (searchInputRef.current && !searchInputRef.current.contains(e.target)) {
        if (searchQuery === "") {
          setShowSearch(false);
        }
      }

      if (menuRef.current && !menuRef.current.contains(e.target) && window.innerWidth < 1024) {
        setShowMenu(false);
      }

      if (modalRef.current && !modalRef.current.contains(e.target) && !e.target.closest('[data-category="Shop"]')) {
        setShowModal(false);
      }
    };

    document.body.addEventListener("click", handleClickOutside);
    return () => document.body.removeEventListener("click", handleClickOutside);
  }, [searchQuery]);

  // Category hover handler
  const handleCategoryHover = (category) => {
    setActiveCategory(category);
    setShowModal(true);
    updateShopNavPosition();
  };

  // Logout handler
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
    setShowUserMenu(false);
    setShowMenu(false);
  };

  // Handle category selection
  const handleCategorySelect = (categoryProduct) => {
    navigate("/shop", { state: { categoryProduct } });
    setShowModal(false);
    setShowMenu(false);
  };

  // Toggle mobile menu section
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      // Navigate to search page with the query
      navigate(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
    }
  };

  // Animation variants
  const menuVariants = {
    closed: { opacity: 0, x: "100%" },
    open: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    }
  };

  const accordionVariants = {
    hidden: { height: 0, opacity: 0, overflow: "hidden" },
    visible: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-container mx-auto">
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-20 px-4">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <Image className="h-10 w-auto" imgSrc={logo} alt="Logo" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <nav className="flex space-x-1">
              {navBarList.map(({ id, title, link }) => (
                <NavLink
                  key={id}
                  to={link}
                  state={{ data: location.pathname.split("/")[1] }}
                  className={({ isActive }) => `
                    px-4 py-2 text-base font-medium rounded-lg transition-colors duration-200
                    ${isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                  data-category={title}
                  ref={title === "Shop" ? shopNavRef : null}
                  onMouseEnter={() => title === "Shop" && handleCategoryHover(title)}
                >
                  {title}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative" ref={searchInputRef}>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaSearch className="w-5 h-5" />
              </button>

              {/* Search Dropdown */}
              <AnimatePresence>
                {showSearch && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, width: 0 }}
                    animate={{ opacity: 1, y: 0, width: "300px" }}
                    exit={{ opacity: 0, y: 10, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 bg-white rounded-lg shadow-lg z-50 overflow-hidden"
                  >
                    <form onSubmit={handleSearchSubmit} className="flex items-center border border-gray-200 rounded-t-lg">
                      <input
                        className="w-full py-3 px-4 outline-none text-gray-700"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm sản phẩm..."
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3"
                      >
                        <FaSearch className="w-4 h-4" />
                      </button>
                    </form>

                    {/* Quick Search Suggestions */}
                    <div className="p-3 border-t border-gray-100">
                      <div className="text-sm text-gray-500 mb-2">Tìm kiếm nhanh</div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            navigate('/search?keyword=áo');
                            setShowSearch(false);
                          }}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                        >
                          Áo
                        </button>
                        <button
                          onClick={() => {
                            navigate('/search?keyword=quần');
                            setShowSearch(false);
                          }}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                        >
                          Quần
                        </button>
                        <button
                          onClick={() => {
                            navigate('/search?keyword=giày');
                            setShowSearch(false);
                          }}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                        >
                          Giày
                        </button>
                        <button
                          onClick={() => {
                            navigate('/search?keyword=sale');
                            setShowSearch(false);
                          }}
                          className="px-3 py-1 text-sm bg-red-50 hover:bg-red-100 rounded-full text-red-600"
                        >
                          Sale
                        </button>
                      </div>

                      {/* Advanced Search Link */}
                      <div className="mt-3 text-center">
                        <button
                          onClick={() => {
                            navigate('/search');
                            setShowSearch(false);
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                        >
                          Tìm kiếm nâng cao
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Favorites */}
            <Link to="/favorite" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <FaHeart className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link to={isLoggedIn ? "/cart" : "/signin"} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <FaShoppingCart className="w-5 h-5" />
              {(isLoggedIn ? cartItems.length : 0) > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full">
                  {isLoggedIn ? cartItems.length : 0}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                {isLoggedIn && auth?.avatar ? (
                  <img
                    src={auth.avatar}
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <FaUser className="w-5 h-5" />
                )}
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-100 w-56 z-50 overflow-hidden"
                  >
                    {isLoggedIn ? (
                      <>
                        <div className="p-4 border-b border-gray-100">
                          <p className="font-medium text-gray-900">{auth?.fullName || "User"}</p>
                          <p className="text-xs text-gray-500 mt-1">{auth?.email}</p>
                        </div>
                        <div className="py-1">
                          <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Tài khoản của tôi
                          </Link>
                          <Link to="/order-history" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Đơn hàng
                          </Link>
                          <Link to="/favorite" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Danh sách yêu thích
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            Đăng xuất
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="py-1">
                        <Link to="/signin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Đăng nhập
                        </Link>
                        <Link to="/signup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Đăng ký
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle - IMPROVED WITH TEXT */}
            <button
              className="lg:hidden flex items-center space-x-1 py-2 px-3 text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-all"
              onClick={() => setShowMenu(!showMenu)}
            >
              <span className="text-sm font-medium">{showMenu ? "Đóng" : "Menu"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - ENHANCED WITH LUXURY STYLING */}
      <AnimatePresence>
        {showMenu && window.innerWidth < 1024 && (
          <motion.div
            ref={menuRef}
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed top-0 right-0 bottom-0 w-[320px] bg-white shadow-xl z-50 overflow-y-auto"
          >
            {/* Menu Header */}
            <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
              <div className="flex items-center justify-between p-5">
                <Link to="/" onClick={() => setShowMenu(false)} className="flex items-center">
                  <Image className="h-8 w-auto" imgSrc={logo} alt="Logo" />
                </Link>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              {/* User info bar */}
              {isLoggedIn ? (
                <div className="px-5 pb-4 flex items-center">
                  <div className="flex-shrink-0">
                    {auth?.avatar ? (
                      <img
                        src={auth.avatar}
                        alt={auth.fullName}
                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <FaUser className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800">{auth?.fullName || "User"}</p>
                    <p className="text-xs text-gray-500 truncate">{auth?.email}</p>
                  </div>
                </div>
              ) : (
                <div className="px-5 pb-4 flex flex-col space-y-2">
                  <Link
                    to="/signin"
                    onClick={() => setShowMenu(false)}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-md transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setShowMenu(false)}
                    className="w-full py-2 px-4 border border-gray-300 hover:border-gray-400 text-gray-700 text-center font-medium rounded-md transition-colors"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}

              {/* Mobile Search */}
              <div className="px-5 pb-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      navigate(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
                      setShowMenu(false);
                    }
                  }}
                  className="flex items-center border border-gray-300 rounded-lg overflow-hidden"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="flex-1 py-2 px-3 outline-none text-gray-700"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2"
                  >
                    <FaSearch className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            <div className="py-2 px-5">
              {/* Main Navigation Links */}
              <div className="py-3 border-b border-gray-100">
                {navBarList.map(({ id, title, link }) => (
                  <NavLink
                    key={id}
                    to={link}
                    onClick={() => setShowMenu(false)}
                    className={({ isActive }) => `
                      block px-2 py-3 text-base font-medium rounded-md transition-colors
                      ${isActive ? 'text-blue-600' : 'text-gray-800 hover:text-blue-600'}
                    `}
                  >
                    {title}
                  </NavLink>
                ))}
              </div>

              {/* Accordions for Menu Sections */}
              <div className="py-3 border-b border-gray-100">
                {/* Categories Section */}
                <div className="mb-1">
                  <button
                    onClick={() => toggleSection('categories')}
                    className="flex items-center justify-between w-full px-2 py-3 text-left text-base font-medium text-gray-800 hover:text-blue-600 transition-colors"
                  >
                    <span>Danh mục</span>
                    <FaChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        expandedSection === 'categories' ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {expandedSection === 'categories' && (
                      <motion.div
                        variants={accordionVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="pl-3 pr-2"
                      >
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleCategorySelect(category.name)}
                            className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-blue-600 py-2 px-2 rounded hover:bg-gray-50 transition-colors"
                          >
                            <span>{category.name}</span>
                            <FaChevronRight className="w-3 h-3 text-gray-400" />
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            navigate("/shop");
                            setShowMenu(false);
                          }}
                          className="w-full text-left mt-2 py-2 px-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center"
                        >
                          Xem tất cả danh mục
                          <FaChevronRight className="w-3 h-3 ml-1" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Account Section */}
                {isLoggedIn && (
                  <div className="mb-1">
                    <button
                      onClick={() => toggleSection('account')}
                      className="flex items-center justify-between w-full px-2 py-3 text-left text-base font-medium text-gray-800 hover:text-blue-600 transition-colors"
                    >
                      <span>Tài khoản</span>
                      <FaChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${
                          expandedSection === 'account' ? 'transform rotate-180' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {expandedSection === 'account' && (
                        <motion.div
                          variants={accordionVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="pl-3 pr-2 space-y-1"
                        >
                          <Link
                            to="/profile"
                            onClick={() => setShowMenu(false)}
                            className="block py-2 px-2 text-sm text-gray-600 hover:text-blue-600 rounded hover:bg-gray-50 transition-colors"
                          >
                            Tài khoản của tôi
                          </Link>
                          <Link
                            to="/OrderHistory"
                            onClick={() => setShowMenu(false)}
                            className="block py-2 px-2 text-sm text-gray-600 hover:text-blue-600 rounded hover:bg-gray-50 transition-colors"
                          >
                            Đơn hàng
                          </Link>
                          <Link
                            to="/favorite"
                            onClick={() => setShowMenu(false)}
                            className="block py-2 px-2 text-sm text-gray-600 hover:text-blue-600 rounded hover:bg-gray-50 transition-colors"
                          >
                            Danh sách yêu thích
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div className="py-3">
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/cart"
                    onClick={() => setShowMenu(false)}
                    className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <FaShoppingCart className="w-6 h-6 text-blue-600 mb-1" />
                    <span className="text-sm font-medium text-gray-800">Giỏ hàng</span>
                  </Link>
                  <Link
                    to="/favorite"
                    onClick={() => setShowMenu(false)}
                    className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <FaHeart className="w-6 h-6 text-red-500 mb-1" />
                    <span className="text-sm font-medium text-gray-800">Yêu thích</span>
                  </Link>
                </div>
              </div>

              {/* Sign Out Button (if logged in) */}
              {isLoggedIn && (
                <div className="pt-3 border-t border-gray-100 mt-3">
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 text-red-600 hover:text-red-700 text-base font-medium transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shop Categories Modal - COMPACT & CENTERED */}
      <AnimatePresence>
        {showModal && activeCategory === "Shop" && (
          <div
            className="fixed inset-0 bg-black bg-opacity-10 z-30 flex justify-center"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              ref={modalRef}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute top-20 w-full max-w-4xl mx-auto bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
              style={{
                marginTop: '1rem',
                maxHeight: 'calc(100vh - 7rem)',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={() => setShowModal(true)}
            >
              <div className="relative p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Danh mục sản phẩm</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>

                {/* Category Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className="p-3 bg-gray-50 hover:bg-blue-50 rounded-md transition-colors text-left border border-gray-100 hover:border-blue-200"
                      onClick={() => handleCategorySelect(category.name)}
                    >
                      <h3 className="font-medium text-gray-800 mb-1">{category.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">{category.description || 'Khám phá sản phẩm trong danh mục này'}</p>
                    </button>
                  ))}
                </div>

                {/* View All Button */}
                <div className="mt-5 text-center">
                  <button
                    onClick={() => {
                      navigate("/shop");
                      setShowModal(false);
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Xem tất cả danh mục
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
