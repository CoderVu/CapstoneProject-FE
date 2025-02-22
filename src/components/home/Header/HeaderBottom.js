import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import { FaSearch, FaUser, FaCaretDown, FaShoppingCart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Flex from "../../designLayouts/Flex";
import "./HeaderBottom.css";
import { getCategories } from "../../../redux/actions/categoryAction";
import { logoutUser } from "../../../redux/actions/authActions";

const HeaderBottom = () => {
  const products = useSelector((state) => state.product.products || []);
  const categories = useSelector((state) => state.category.categories);
  const cartItems = useSelector((state) => state.cart.cartItems || []);
  const auth = useSelector((state) => state.auth.auth);
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showCategories, setShowCategories] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const categoriesRef = useRef(null);
  const userMenuRef = useRef(null);
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setShowCategories(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.body.addEventListener("click", handleClickOutside);
    return () => document.body.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  useEffect(() => {
    setFilteredProducts(
      products.filter((item) =>
        item.productName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, products]);

  useEffect(() => {
    console.log("User Avatar:", auth?.avatar);
  }, [auth]);

  const handleCategorySelect = (category) => {
    navigate("/shop", { state: { category } });
    console.log("Category Selected:", category);
  };

  return (
    <div className="w-full bg-[#F5F5F3] relative">
      <div className="max-w-container mx-auto">
        <Flex className="flex flex-col lg:flex-row items-center justify-between w-full px-4 pb-4 lg:pb-0 h-full lg:h-24">
          {/* Categories Dropdown */}
          <div onClick={() => setShowCategories(!showCategories)} ref={categoriesRef} className="flex h-14 cursor-pointer items-center gap-2 text-primeColor relative">
            <HiOutlineMenuAlt4 className="w-5 h-5" />
            <p className="text-[14px] font-normal">Categories</p>
            {showCategories && (
              <motion.ul initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="category-dropdown absolute top-full left-0 z-50 bg-white shadow-lg rounded-lg w-48 text-[#767676] h-auto p-4">
                {categories.map((category) => (
                  <li key={category.id} className="category-item text-gray-700 px-4 py-2 hover:bg-gray-100 duration-300 cursor-pointer" onClick={() => handleCategorySelect(category)}>{category.name}</li>
                ))}
              </motion.ul>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-[600px] h-[50px] text-base text-primeColor bg-white flex items-center gap-2 justify-between px-6 rounded-xl">
            <input className="flex-1 h-full outline-none placeholder:text-[#C4C4C4] placeholder:text-[14px]" type="text" onChange={(e) => setSearchQuery(e.target.value)} value={searchQuery} placeholder="Search your products here" />
            <FaSearch className="w-5 h-5" />
            {searchQuery && (
              <div className="w-full mx-auto h-96 bg-white top-16 absolute left-0 z-50 overflow-y-scroll shadow-2xl scrollbar-hide cursor-pointer">
                {filteredProducts.map((item) => (
                  <div key={item.id} onClick={() => navigate(`/product/${item.id}`, { state: { item } })} className="max-w-[600px] h-28 bg-gray-100 mb-3 flex items-center gap-3">
                    <img className="w-24" src={item.mainImage?.path} alt={item.productName} />
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-lg">{item.productName}</p>
                      <p className="text-xs">{item.des}</p>
                      <p className="text-sm">Price: <span className="text-primeColor font-semibold">${item.price}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User & Cart Icons */}
          <div className="header-bottom-icons flex gap-4 mt-2 lg:mt-0 items-center pr-6 cursor-pointer relative">
            <div onClick={() => setShowUserMenu(!showUserMenu)} ref={userMenuRef} className="flex items-center gap-2">
              {isLoggedIn && auth?.avatar ? (
                <img src={auth.avatar} alt="User Avatar" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <FaUser />
              )}
              <FaCaretDown />
            </div>
            {showUserMenu && (
              <motion.ul initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="user-modal absolute top-10 right-0 z-50 bg-white shadow-lg rounded-lg w-48 text-[#767676] h-auto p-4">
                {!isLoggedIn ? (
                  <>
                    <Link to="/signin"><li className="user-modal-item text-gray-700 px-4 py-2 hover:bg-gray-100 duration-300 cursor-pointer">Login</li></Link>
                    <Link to="/signup"><li className="user-modal-item text-gray-700 px-4 py-2 hover:bg-gray-100 duration-300 cursor-pointer">Sign Up</li></Link>
                  </>
                ) : (
                  <>
                    <li className="user-modal-item text-gray-700 px-4 py-2 hover:bg-gray-100 duration-300 cursor-pointer" onClick={handleLogout}>Logout</li>
                    <Link to="/profile"><li className="user-modal-item text-gray-700 px-4 py-2 hover:bg-gray-100 duration-300 cursor-pointer">Account</li></Link>
                  </>
                )}
              </motion.ul>
            )}
            {isLoggedIn ? (
              <Link to="/cart">
                <div className="relative">
                  <FaShoppingCart />
                  <span className="absolute font-titleFont top-3 -right-2 text-xs w-4 h-4 flex items-center justify-center rounded-full bg-primeColor text-white">{cartItems.length}</span>
                </div>
              </Link>
            ) : (
              <div onClick={() => navigate("/signin")} className="relative">
                <FaShoppingCart />
                <span className="absolute font-titleFont top-3 -right-2 text-xs w-4 h-4 flex items-center justify-center rounded-full bg-primeColor text-white">0</span>
              </div>
            )}
          </div>
        </Flex>
      </div>
    </div>
  );
};

export default HeaderBottom;