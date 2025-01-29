import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import ProductBanner from "../../components/pageProps/shopPage/ProductBanner";
import ShopSideNav from "../../components/pageProps/shopPage/ShopSideNav";
import { getProducts } from "../../redux/actions/productActions";

const Shop = () => {
  const dispatch = useDispatch();
  const { products, totalPages, totalElements, loading, error } = useSelector((state) => state.product);
  const [itemsPerPage, setItemsPerPage] = useState(3 );
  const [isGridView, setIsGridView] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    dispatch(getProducts(page, itemsPerPage));
  }, [dispatch, page, itemsPerPage]);

  const itemsPerPageFromBanner = (itemsPerPage) => {
    setItemsPerPage(itemsPerPage);
    setPage(0); // Reset to the first page when itemsPerPage changes
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleViewChange = (isGridView) => {
    console.log("View changed to:", isGridView ? "Grid" : "List");
    setIsGridView(isGridView);
  };

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="Products" />
      <div className="w-full h-full flex pb-20 gap-10">
        <div className="w-[20%] lgl:w-[25%] hidden mdl:inline-flex h-full">
          <ShopSideNav />
        </div>
        <div className="w-full mdl:w-[80%] lgl:w-[75%] h-full flex flex-col gap-10">
          <ProductBanner
            itemsPerPage={itemsPerPage}
            page={page}
            itemsPerPageFromBanner={itemsPerPageFromBanner}
            onViewChange={handleViewChange}
            products={products} // Directly pass the products from backend
            loading={loading} // Pass the loading state
          />
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error: {error}</div>
          ) : (
            <div className="flex flex-col justify-between flex-grow">
              <div className="flex space-x-1 justify-center items-center">
                {/* Prev Button */}
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                  className="rounded-full border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                >
                  Prev
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index)}
                    className={`min-w-9 rounded-full py-2 px-3.5 text-center text-sm transition-all shadow-sm ${
                      index === page
                        ? "bg-slate-800 text-white"
                        : "border border-slate-300 text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages - 1}
                  className="rounded-full border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                >
                  Next
                </button>
              </div>
              <p className="text-base font-normal text-lightText mt-4">
                Products from {page * itemsPerPage + 1} to {Math.min((page + 1) * itemsPerPage, totalElements)} of {totalElements}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;