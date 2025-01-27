import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import ProductBanner from "../../components/pageProps/shopPage/ProductBanner";
import ShopSideNav from "../../components/pageProps/shopPage/ShopSideNav";
import { getProducts } from "../../redux/actions/productActions";
import ReactPaginate from "react-paginate";
import Product from "../../components/home/Products/Product";
const Shop = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.product.products || []);
  const loading = useSelector((state) => state.product.loading);
  const error = useSelector((state) => state.product.error);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [isGridView, setIsGridView] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    dispatch(getProducts(page, itemsPerPage)); 
  }, [dispatch, page, itemsPerPage]);

  const itemsPerPageFromBanner = (itemsPerPage) => {
    setItemsPerPage(itemsPerPage);
    setPage(0); // Reset to page 0 when items per page is changed
  };

  const handleViewChange = (isGridView) => {
    console.log("View changed to:", isGridView ? "Grid" : "List");
    setIsGridView(isGridView);
  };

  const handlePageClick = (event) => {
    const newPage = event.selected;
    setPage(newPage); // Update the page state
  };

  const endOffset = (page + 1) * itemsPerPage;
  const currentItems = products.slice(page * itemsPerPage, endOffset);
  const pageCount = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="Products" />
      {/* ================= Products Start here =================== */}
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
            products={currentItems} // Only pass the products for the current page
          />
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error: {error}</div>
          ) : (
            <>
              <div className={`grid ${isGridView ? "grid-cols-3 gap-6" : "grid-cols-1 gap-4"}`}>
                {currentItems.map((item) => (
                  <div key={item.id} className="w-full">
                    <Product
                      id={item.id}
                      img={item.mainImage?.path}
                      productName={item.productName}
                      price={item.price}
                      color={item.colors.join(", ")}
                      badge={item.newProduct ? "New" : ""}
                      des={item.description}
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col mdl:flex-row justify-center mdl:justify-between items-center">
                <ReactPaginate
                  nextLabel=""
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={3}
                  marginPagesDisplayed={2}
                  pageCount={pageCount}
                  previousLabel=""
                  pageLinkClassName="w-9 h-9 border-[1px] border-lightColor hover:border-gray-500 duration-300 flex justify-center items-center"
                  pageClassName="mr-6"
                  containerClassName="flex text-base font-semibold font-titleFont py-10"
                  activeClassName="bg-black text-white"
                />
                <p className="text-base font-normal text-lightText">
                  Products from {page * itemsPerPage + 1} to {endOffset} of {products.length}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      {/* ================= Products End here ===================== */}
    </div>
  );
};


export default Shop;