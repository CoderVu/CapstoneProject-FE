import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaTimes, FaFilter, FaChevronDown } from "react-icons/fa";
import axios from "../../../redux/setup/axios";
import Product from "../Products/Product";

// Search Component
const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);

  // State variables
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 30
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    gender: "",
    category: "",
    onSale: false,
    priceRange: [0, 1000000]
  });

  // Extract query params on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const keyword = queryParams.get("keyword");

    if (keyword) {
      setSearchQuery(keyword);
      performSearch(keyword);
    }

    // Focus the search input when the component mounts
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [location.search]);

  // Search for products
  const performSearch = async (keyword, page = 0, size = 30) => {
    if (!keyword) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios({
        method: 'GET',
        url: `/api/v1/public/products/search`,
        params: { keyword, page, size }
      });

      const { data } = response.data;
      setSearchResults(data.response || []);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        size: data.size
      });
    } catch (err) {
      console.error("Error searching products:", err);
      setError("Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      // Update URL with search query
      navigate(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);

      // Perform search
      performSearch(searchQuery.trim());
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    performSearch(searchQuery, newPage);
  };

  // Apply filters to search results
  const applyFilters = () => {
    // Client-side filtering - in a real app, you'd likely pass these filters to the API
    let filtered = [...searchResults];

    if (filters.gender) {
      filtered = filtered.filter(product =>
        product.gender?.toLowerCase() === filters.gender.toLowerCase()
      );
    }

    if (filters.category) {
      filtered = filtered.filter(product =>
        product.categoryName?.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    if (filters.onSale) {
      filtered = filtered.filter(product => product.onSale);
    }

    filtered = filtered.filter(product =>
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    return filtered;
  };

  // Format price with commas
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Generate pagination buttons
  const renderPagination = () => {
    const pageButtons = [];
    const { currentPage, totalPages } = pagination;

    // Previous button
    pageButtons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
      >
        &laquo;
      </button>
    );

    // Page numbers
    for (let i = 0; i < totalPages; i++) {
      if (
        i === 0 ||
        i === totalPages - 1 ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pageButtons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-1 rounded ${
              i === currentPage
                ? "bg-blue-600 text-white"
                : "border border-gray-300 hover:bg-gray-100"
            }`}
          >
            {i + 1}
          </button>
        );
      } else if (
        (i === currentPage - 2 && currentPage > 2) ||
        (i === currentPage + 2 && currentPage < totalPages - 3)
      ) {
        pageButtons.push(
          <span key={i} className="px-2">
            ...
          </span>
        );
      }
    }

    // Next button
    pageButtons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
      >
        &raquo;
      </button>
    );

    return pageButtons;
  };

  // Map API product data to Product component props
  const mapProductDataToProps = (product) => {
    return {
      id: product.id,
      img: product.mainImage?.path || "https://via.placeholder.com/300x400",
      secondaryImg: product.images && product.images.length > 1 ? product.images[1]?.path : null,
      badge: product.newProduct,
      productName: product.productName,
      price: product.price,
      discountPrice: product.discountPrice,
      color: product.variants?.map(variant => variant.color).filter(Boolean),
      rating: product.rate?.rating || 0,
      totalRate: product.rate?.totalRate || 0,
      onSale: product.onSale,
      // Add any other props required by the Product component
    };
  };

  // Get filtered results
  const filteredResults = applyFilters();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto">
          <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 shadow-sm">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full py-3 px-4 outline-none text-gray-700 text-lg"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-3 text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            )}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 px-6 flex items-center justify-center transition-colors"
            >
              <FaSearch className="mr-2" />
              <span>Tìm kiếm</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters (Desktop) */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <h3 className="font-medium text-lg mb-4 text-gray-800">Bộ lọc</h3>

            {/* Gender Filter */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Giới tính</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value=""
                    checked={filters.gender === ""}
                    onChange={() => setFilters({...filters, gender: ""})}
                    className="mr-2"
                  />
                  <span>Tất cả</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={filters.gender === "male"}
                    onChange={() => setFilters({...filters, gender: "male"})}
                    className="mr-2"
                  />
                  <span>Nam</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={filters.gender === "female"}
                    onChange={() => setFilters({...filters, gender: "female"})}
                    className="mr-2"
                  />
                  <span>Nữ</span>
                </label>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Khoảng giá</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>{formatPrice(filters.priceRange[0])}</span>
                  <span>{formatPrice(filters.priceRange[1])}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="50000"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters({
                    ...filters,
                    priceRange: [filters.priceRange[0], parseInt(e.target.value)]
                  })}
                  className="w-full"
                />
              </div>
            </div>

            {/* Sale Filter */}
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.onSale}
                  onChange={() => setFilters({...filters, onSale: !filters.onSale})}
                  className="mr-2"
                />
                <span>Đang giảm giá</span>
              </label>
            </div>
          </div>
        </div>

        {/* Mobile Filters Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full py-2 px-4 bg-white border border-gray-300 rounded-lg flex items-center justify-between shadow-sm"
          >
            <span className="flex items-center">
              <FaFilter className="mr-2" />
              Bộ lọc
            </span>
            <FaChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="mt-2 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              {/* Gender Filter */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Giới tính</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilters({...filters, gender: ""})}
                    className={`px-3 py-1 rounded-full border ${
                      filters.gender === ""
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setFilters({...filters, gender: "male"})}
                    className={`px-3 py-1 rounded-full border ${
                      filters.gender === "male"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    Nam
                  </button>
                  <button
                    onClick={() => setFilters({...filters, gender: "female"})}
                    className={`px-3 py-1 rounded-full border ${
                      filters.gender === "female"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    Nữ
                  </button>
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Khoảng giá</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{formatPrice(filters.priceRange[0])}</span>
                    <span>{formatPrice(filters.priceRange[1])}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="50000"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({
                      ...filters,
                      priceRange: [filters.priceRange[0], parseInt(e.target.value)]
                    })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Sale Filter */}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.onSale}
                    onChange={() => setFilters({...filters, onSale: !filters.onSale})}
                    className="mr-2"
                  />
                  <span>Đang giảm giá</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Results Content */}
        <div className="flex-1">
          {/* Search Info */}
          {searchQuery && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Kết quả tìm kiếm cho "{searchQuery}"
              </h2>
              <p className="text-gray-600">
                Tìm thấy {filteredResults.length} sản phẩm
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Empty Results */}
          {!loading && !error && searchQuery && filteredResults.length === 0 && (
            <div className="text-center py-10">
              <FaSearch className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Chúng tôi không tìm thấy sản phẩm nào phù hợp với từ khóa "{searchQuery}".
                Vui lòng thử lại với từ khóa khác.
              </p>
            </div>
          )}

          {/* Results Grid - Using Product Component */}
          {!loading && !error && filteredResults.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredResults.map((product) => (
                <Product
                  key={product.id}
                  {...mapProductDataToProps(product)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {renderPagination()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
