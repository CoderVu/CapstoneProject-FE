import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import ProductBanner from "../../components/pageProps/shopPage/ProductBanner";
import ShopSideNav from "../../components/pageProps/shopPage/ShopSideNav";
import { filterProduct } from "../../redux/actions/productActions";

const Shop = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { products, totalPages, totalElements, loading, error } = useSelector((state) => state.product);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [isGridView, setIsGridView] = useState(true);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    gender: "",
    categoryProduct: "",
    brandProduct: "",
    priceMin: "",
    priceMax: "",
    colorProduct: "",
    sizeProduct: "",
  });

  useEffect(() => {
    if (location.state && location.state.gender) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        ...location.state,
      }));
    }
  }, [location.state]);

  useEffect(() => {
    dispatch(filterProduct({ ...filters, page, size: itemsPerPage }));
  }, [dispatch, filters, page, itemsPerPage]);

  const itemsPerPageFromBanner = (itemsPerPage) => {
    setItemsPerPage(itemsPerPage);
    setPage(0);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleViewChange = (isGridView) => {
    setIsGridView(isGridView);
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }));
    dispatch(filterProduct({ ...filters, ...newFilters, page, size: itemsPerPage }));
  };

  const handleClearFilter = (filterKey) => {
    let newFilters = { ...filters };
    if (filterKey === "priceMin" || filterKey === "priceMax") {
      newFilters = { ...newFilters, priceMin: "", priceMax: "" };
    } else {
      newFilters[filterKey] = "";
    }
    setFilters(newFilters);
    dispatch(filterProduct({ ...newFilters, page, size: itemsPerPage }));
  };

  return (
    <div className="max-w-container mx-auto px-3">
      <div className="flex justify-between items-center">
        <Breadcrumbs title="" gender={filters.gender} />
      </div>
      <div className="w-full h-full flex pb-20 gap-10">
        <div className="w-[15%] lgl:w-[15%] hidden mdl:inline-flex h-full">
          <div className="w-full p-4 bg-white rounded-lg shadow">
            <ShopSideNav onFilterChange={handleFilterChange} />
          </div>
        </div>
        <div className="w-full mdl:w-[75%] lgl:w-[75%] h-full flex flex-col">
          {/* Applied Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(filters).map((key) => (
              key !== "gender" && filters[key] && (
                <div key={key} className="flex items-center bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
                  <span>{`${filters[key]}`}</span>
                  <button
                    onClick={() => handleClearFilter(key)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              )
            ))}
          </div>
          {totalElements > 0 ? (
            <ProductBanner
              itemsPerPage={itemsPerPage}
              page={page}
              itemsPerPageFromBanner={itemsPerPageFromBanner}
              onViewChange={handleViewChange}
              products={products}
              loading={loading}
            />
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-lg text-gray-500">No products found</p>
            </div>
          )}
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error: {error}</div>
          ) : (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              {totalElements > 0 && (
                <div className="flex space-x-1 justify-center items-center">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                    className="rounded-full border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800"
                  >
                    Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index)}
                      className={`min-w-9 rounded-full py-2 px-3.5 text-center text-sm transition-all shadow-sm ${index === page ? "bg-slate-800 text-white" : "border border-slate-300 text-slate-600"
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages - 1}
                    className="rounded-full border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800"
                  >
                    Next
                  </button>
                </div>
              )}
              <p className="text-base font-normal text-lightText mt-4">
                {totalElements > 0 ? (
                  `Showing ${page * itemsPerPage + 1} - ${page * itemsPerPage + (products ? products.length : 0)
                  } of ${totalElements} products`
                ) : (
                  ""
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;