import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Home, Package, Tag, Edit, Plus } from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Top Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-3 py-3 lg:px-5 lg:pl-3 flex justify-between items-center">
          {/* Left Section */}
          <div className="flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            >
              <span className="sr-only">Toggle Sidebar</span>
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                ></path>
              </svg>
            </button>
            <a href="/" className="flex items-center ml-2">
              <img
                src="https://flowbite.com/docs/images/logo.svg"
                className="h-8 mr-3"
                alt="Logo"
              />
              <span className="text-xl font-semibold dark:text-white">Flowbite</span>
            </a>
          </div>

          {/* Profile Section */}
          <div className="flex items-center">
            <img
              className="w-8 h-8 rounded-full"
              src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
              alt="User"
            />
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className="flex w-full">
        <aside className={`fixed top-0 left-0 z-40 w-64 h-full pt-20 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700`}>
          <div className="h-full px-3 pb-4 overflow-y-auto">
            <ul className="space-y-2 font-medium">
              <li>
                <NavLink
                  to="/admin/home"
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Home className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400" />
                  <span className="ml-3">Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/products"
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Package className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400" />
                  <span className="ml-3">Product</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/add-products"
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Plus className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400" />
                  <span className="ml-3">Add Product</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/categories"
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Tag className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400" />
                  <span className="ml-3">Category</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/edit-products"
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400" />
                  <span className="ml-3">Edit Product</span>
                </NavLink>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main_body_content w-full sm:ml-64 pl-5 pt-20">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default Sidebar;