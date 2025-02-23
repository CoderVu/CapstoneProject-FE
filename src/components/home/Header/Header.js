import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { HiOutlineMenuAlt4 } from "react-icons/hi"; // Import icon
import { logo } from "../../../assets/images";
import Image from "../../designLayouts/Image";
import { navBarList } from "../../../constants";
import Flex from "../../designLayouts/Flex";
import Modal from "./Modal";
import "./Header.css";

const Header = () => {
  const [showMenu, setShowMenu] = useState(false); // Responsive menu state
  const [showModal, setShowModal] = useState(false);
  const [subMenu, setSubMenu] = useState([]);
  const location = useLocation();
  const categories = useSelector((state) => state.category.categories);

  useEffect(() => {
    const ResponsiveMenu = () => {
      if (window.innerWidth < 768) {
        setShowMenu(false);
      } else {
        setShowMenu(true);
      }
    };
    ResponsiveMenu();
    window.addEventListener("resize", ResponsiveMenu);
    return () => window.removeEventListener("resize", ResponsiveMenu);
  }, []);

  const handleMouseEnter = (title, subMenu) => {
    if (title === "Shop") {
      setSubMenu(subMenu || []);
      setShowModal(true);
    }
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      setShowModal(false);
    }, 200);
  };

  return (
    <div className="w-full h-20 bg-white sticky top-0 z-50 border-b border-transparent">
      <nav className="navbar h-full px-4 max-w-container mx-auto relative">
        <Flex className="flex items-center justify-between h-full">
          <Link to="/">
            <Image className="w-20 object-cover" imgSrc={logo} />
          </Link>
          <div className="flex-1 flex justify-end lg:justify-center">
            <button
              className="lg:hidden text-2xl"
              onClick={() => setShowMenu(!showMenu)}
            >
              <HiOutlineMenuAlt4 />
            </button>
            {showMenu && (
              <motion.ul
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="hidden lg:flex flex-row items-center w-full lg:w-auto z-50 p-0 gap-2 lg:gap-4"
              >
                {navBarList.map(({ id, title, link, subMenu }) => (
                  <div
                    key={id}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(title, subMenu)}
                  >
                    <NavLink
                      className="flex font-normal hover:font-bold w-full lg:w-auto h-6 justify-center items-center px-4 lg:px-12 text-base text-[#767676] hover:underline underline-offset-[4px] decoration-[1px] hover:text-[#262626] md:border-r-[2px] border-r-gray-300 hoverEffect last:border-r-0"
                      to={link}
                      state={{ data: location.pathname.split("/")[1] }}
                    >
                      <li>{title}</li>
                    </NavLink>
                  </div>
                ))}
              </motion.ul>
            )}
          </div>
        </Flex>
      </nav>
      {showModal && <Modal subMenu={subMenu} categories={categories} onClose={handleMouseLeave} />}
      {showMenu && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-16 lg:hidden"
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg p-4 w-10/12 max-w-sm mt-4"
          >
            <button
              className="text-right text-xl mb-4"
              onClick={() => setShowMenu(false)}
            >
              &times;
            </button>
            <ul className="flex flex-col gap-4">
              {navBarList.map(({ id, title, link }) => (
                <li key={id}>
                  <NavLink
                    className="block text-lg text-center text-[#767676] hover:text-[#262626]"
                    to={link}
                    state={{ data: location.pathname.split("/")[1] }}
                    onClick={() => setShowMenu(false)}
                  >
                    {title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Header;