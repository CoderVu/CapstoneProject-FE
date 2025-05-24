import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import ProductBanner from "../../components/pageProps/shopPage/ProductBanner";
import ShopSideNav from "../../components/pageProps/shopPage/ShopSideNav";
import { getAllProducts, filterProductsLocally } from "../../redux/actions/productActions";

const Shop = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { products, totalPages, totalElements, loading, error } = useSelector(
    (state) => state.product
  );
  // CONSOLE LOG
  console.log(products);
  

  // Pagination & view states
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(0);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [isGridView, setIsGridView] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    gender: "",
    categoryProduct: "",
    brandProduct: "",
    priceMin: "",
    priceMax: "",
    colorProduct: "",
    sizeProduct: "",
  });

  // Map filter keys to labels
  const filterLabels = {
    gender: "Giới tính",
    categoryProduct: "Danh mục",
    brandProduct: "Thương hiệu",
    priceMin: "Giá từ",
    priceMax: "Giá đến",
    colorProduct: "Màu sắc",
    sizeProduct: "Kích cỡ",
  };

  // Ref to skip initial dispatch
  const didMountRef = useRef(false);

  // If navigated with initial category filter, set it
  useEffect(() => {
    if (location.state?.categoryProduct) {
      setFilters((prev) => ({ ...prev, ...location.state }));
      setCurrentPage(0);
    }
  }, [location.state]);

  // Fetch all products on mount
  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  // Apply client-side filtering and pagination
  useEffect(() => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedProducts(products.slice(startIndex, endIndex));
  }, [products, currentPage, itemsPerPage]);

  // Dispatch filter action when filters/page/size change (after mount)
  useEffect(() => {
    if (didMountRef.current) {
      dispatch(filterProductsLocally(filters));
    } else {
      didMountRef.current = true;
      // Uncomment to load default products on first mount
      // dispatch(filterProduct({ ...filters, page, size: itemsPerPage }));
    }
  }, [dispatch, filters, currentPage, itemsPerPage]);

  // Handlers only update state; effect handles dispatch
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(0); // Reset to first page when filters change
    dispatch(filterProductsLocally(newFilters));
  };

  const handleClearFilter = (key) => {
    setFilters((prev) => ({
      ...prev,
      ...(key === "priceMin" || key === "priceMax"
        ? { priceMin: "", priceMax: "" }
        : { [key]: "" }),
    }));
    setCurrentPage(0);
  };

  const handleClearAllFilters = () => {
    setFilters({
      gender: "",
      categoryProduct: "",
      brandProduct: "",
      priceMin: "",
      priceMax: "",
      colorProduct: "",
      sizeProduct: "",
    });
    setCurrentPage(0);
  };

  const itemsPerPageFromBanner = (count) => {
    setItemsPerPage(count);
    setCurrentPage(0);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewChange = (grid) => {
    setIsGridView(grid);
  };

  const hasActiveFilters = Object.values(filters).some((val) => !!val);

  return (
    <div className="max-w-container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Breadcrumbs title="" gender={filters.gender} />
        <button
          className="flex items-center gap-2 py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 md:hidden"
          onClick={() => setIsMobileFilterOpen((open) => !open)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          Bộ lọc
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 pb-12">
        {/* Mobile filter sidebar */}
        {isMobileFilterOpen && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden"
            onClick={() => setIsMobileFilterOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              className="absolute top-0 left-0 h-full w-80 bg-white shadow-xl overflow-y-auto p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Bộ lọc</h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setIsMobileFilterOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ShopSideNav onFilterChange={handleFilterChange} initialFilters={filters} />
            </motion.div>
          </div>
        )}

        {/* Desktop sidebar */}
        <div className="hidden md:block md:w-[250px] lg:w-[280px] flex-shrink-0">
          <div className="sticky top-20 w-full p-5 bg-white rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              {/* <h2 className="text-lg font-bold text-gray-800">Lọc sản phẩm</h2>
              {hasActiveFilters && (
                <button
                  onClick={handleClearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Xóa tất cả
                </button>
              )} */}
            </div>
            <ShopSideNav onFilterChange={handleFilterChange} initialFilters={filters} />
          </div>
        </div>

        <div className="flex-1">
          {/* Applied Filters */}
          {hasActiveFilters && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-700">Bộ lọc đã chọn:</h3>
                <button
                  onClick={handleClearAllFilters}
                  className="text-sm text-red-600 hover:text-red-800 hover:underline"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(filters).map(
                  (key) =>
                    filters[key] && (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm"
                      >
                        <span className="text-xs text-gray-500 mr-1">
                          {filterLabels[key]}:
                        </span>
                        <span className="text-sm font-medium">{filters[key]}</span>
                        <button
                          onClick={() => handleClearFilter(key)}
                          className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </motion.div>
                    )
                )}
              </div>
            </div>
          )}

          {totalElements > 0 ? (
            <ProductBanner
              products={displayedProducts}
              itemsPerPage={itemsPerPage}
              page={currentPage}
              itemsPerPageFromBanner={itemsPerPageFromBanner}
              onViewChange={handleViewChange}
              loading={loading}
            />
          ) : (
            !loading && (
              <div className="flex flex-col justify-center items-center bg-white rounded-xl shadow-md py-12 px-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-gray-300 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-xl text-gray-700 font-medium mb-2">Không tìm thấy sản phẩm nào</p>
                <p className="text-gray-500 text-center mb-6">Vui lòng thử lại với bộ lọc khác</p>
                <button
                  onClick={handleClearAllFilters}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )
          )}

          {/* Loading & Error */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">Lỗi: {error}</p>
            </div>
          )}

          {/* Pagination */}
          {totalElements > 0 && !loading && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl shadow-md px-6 py-4">
              <div className="flex space-x-1 justify-center items-center mb-4 sm:mb-0">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className={`rounded-full border py-2 px-3 text-center text-sm transition-all ${
                    currentPage === 0
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-600 hover:text-white hover:bg-blue-600 hover:border-blue-600"
                  }`}
                >
                  <span className="hidden sm:inline mr-1">«</span> Trước
                </button>

                <div className="hidden md:flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i).map((i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`min-w-[36px] h-[36px] rounded-full py-2 px-3 text-center text-sm transition-all ${
                        i === currentPage
                          ? "bg-blue-600 text-white border border-blue-600"
                          : "border border-gray-300 text-gray-600 hover:border-blue-300"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <span className="md:hidden text-gray-700 text-sm px-2">
                  {currentPage + 1} / {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className={`rounded-full border py-2 px-3 text-center text-sm transition-all ${
                    currentPage === totalPages - 1
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-600 hover:text-white hover:bg-blue-600 hover:border-blue-600"
                  }`}
                >
                  Tiếp <span className="hidden sm:inline ml-1">»</span>
                </button>
              </div>
              <p className="text-sm text-gray-500">
                {currentPage * itemsPerPage + 1} - {Math.min((currentPage + 1) * itemsPerPage, totalElements)} trong {totalElements} sản phẩm
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
