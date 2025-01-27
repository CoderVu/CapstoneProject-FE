import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import { FaSearch, FaUser, FaCaretDown, FaShoppingCart } from "react-icons/fa";
import Flex from "../../designLayouts/Flex";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./HeaderBottom.css";

const HeaderBottom = () => {
  const products = useSelector((state) => state.product.products || []);
  const [show, setShow] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const ref = useRef();
  const userRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShow(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
    };

    document.body.addEventListener("click", handleClickOutside);
    return () => document.body.removeEventListener("click", handleClickOutside);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const handleSearch = (e) => setSearchQuery(e.target.value);

  useEffect(() => {
    const filtered = products.filter((item) =>
      item.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  return (
    <div className="w-full bg-[#F5F5F3] relative">
      <div className="max-w-container mx-auto">
        <Flex className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full px-4 pb-4 lg:pb-0 h-full lg:h-24">
          {/* Categories Dropdown */}
          <div
            onClick={() => setShow(!show)}
            ref={ref}
            className="flex h-14 cursor-pointer items-center gap-2 text-primeColor relative"
          >
            <HiOutlineMenuAlt4 className="w-5 h-5" />
            <p className="text-[14px] font-normal">Categories</p>
            {show && (
              <motion.ul
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="category-dropdown absolute top-full left-0 z-50 bg-white shadow-lg rounded-lg w-48 text-[#767676] h-auto p-4"
              >
                <li className="category-item text-gray-700 px-4 py-2 hover:bg-gray-100 duration-300 cursor-pointer">
                  New Arrivals
                </li>
                <li className="category-item text-gray-700 px-4 py-2 hover:bg-gray-100 duration-300 cursor-pointer">
                  Sneakers
                </li>
                <li className="category-item text-gray-700 px-4 py-2 hover:bg-gray-100 duration-300 cursor-pointer">
                  Boots
                </li>
                <li className="category-item text-gray-700 px-4 py-2 hover:bg-gray-100 duration-300 cursor-pointer">
                  Sandals
                </li>
                <li className="category-item text-gray-700 px-4 py-2 hover:bg-gray-100 duration-300 cursor-pointer">
                  Accessories
                </li>
              </motion.ul>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-[600px] h-[50px] text-base text-primeColor bg-white flex items-center gap-2 justify-between px-6 rounded-xl">
            <input
              className="flex-1 h-full outline-none placeholder:text-[#C4C4C4] placeholder:text-[14px]"
              type="text"
              onChange={handleSearch}
              value={searchQuery}
              placeholder="Search your products here"
            />
            <FaSearch className="w-5 h-5" />
            {searchQuery && (
              <div
                className={`w-full mx-auto h-96 bg-white top-16 absolute left-0 z-50 overflow-y-scroll shadow-2xl scrollbar-hide cursor-pointer`}
              >
                {filteredProducts.map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      navigate(`/product/${item.id}`, {
                        state: { item },
                      })
                    }
                    className="max-w-[600px] h-28 bg-gray-100 mb-3 flex items-center gap-3"
                  >
                    <img
                      className="w-24"
                      src={item.mainImage?.path}
                      alt={item.productName}
                    />
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-lg">{item.productName}</p>
                      <p className="text-xs">{item.des}</p>
                      <p className="text-sm">
                        Price:{" "}
                        <span className="text-primeColor font-semibold">${item.price}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User & Cart Icons */}
          <div className="header-bottom-icons flex gap-4 mt-2 lg:mt-0 items-center pr-6 cursor-pointer relative">
            <div onClick={() => setShowUser(!showUser)} ref={userRef} className="flex">
              <FaUser />
              <FaCaretDown />
            </div>
            {showUser && (
              <motion.ul
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="user-modal absolute top-10 right-0 z-50 bg-white shadow-lg rounded-lg w-48 text-[#767676] h-auto p-4"
              >
                {!isLoggedIn ? (
                  <>
                    <Link to="/signin">
                      <li className="user-modal-item text-gray-700 px-4 py-2 hover:bg-gray-100 duration-300 cursor-pointer">
                        Login
                      </li>
                    </Link>
                    <Link to="/signup">
                      <li className="user-modal-item text-gray-700 px-4 py-2 hover:bg-gray-100 duration-300 cursor-pointer">
                        Sign Up
                      </li>
                    </Link>
                  </>
                ) : (
                  <li className="user-modal-item text-gray-700 px-4 py-2 hover:bg-gray-100 duration-300 cursor-pointer">
                    Profile
                  </li>
                )}
              </motion.ul>
            )}
            <Link to="/cart">
              <div className="relative">
                <FaShoppingCart />
                <span className="absolute font-titleFont top-3 -right-2 text-xs w-4 h-4 flex items-center justify-center rounded-full bg-primeColor text-white">
                  {Array.isArray(products) ? products.length : 0}
                </span>
              </div>
            </Link>
          </div>
        </Flex>
      </div>
    </div>
  );
};

export default HeaderBottom;
