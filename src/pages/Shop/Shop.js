import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import ProductBanner from "../../components/pageProps/shopPage/ProductBanner";
import ShopSideNav from "../../components/pageProps/shopPage/ShopSideNav";
import { getProducts, filterProduct } from "../../redux/actions/productActions";

const Shop = () => {
  const dispatch = useDispatch();
  const { products, totalPages, totalElements, loading, error } = useSelector((state) => state.product);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [isGridView, setIsGridView] = useState(true);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    categoryProduct: "",
    brandProduct: "",
    priceMin: "",
    priceMax: "",
    colorProduct: "",
    sizeProduct: "",
  });

  useEffect(() => {
    dispatch(getProducts(page, itemsPerPage));
  }, [dispatch, page, itemsPerPage]);

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
    setFilters(newFilters);
    dispatch(filterProduct({ ...newFilters, page, size: itemsPerPage }));
  };

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="Products" />
      <div className="w-full h-full flex pb-20 gap-10">
        <div className="w-[20%] lgl:w-[25%] hidden mdl:inline-flex h-full">
          <ShopSideNav onFilterChange={handleFilterChange} />
        </div>
        <div className="w-full mdl:w-[80%] lgl:w-[75%] h-full flex flex-col gap-10">
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
              <p className="text-lg text-gray-500"></p>
            </div>
          )}
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error: {error}</div>
          ) : (
            <div className="flex flex-col justify-between flex-grow">
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
                  `Showing ${page * itemsPerPage + 1} - ${page * itemsPerPage + products.length
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