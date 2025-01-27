import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import Pagination from "../../components/pageProps/shopPage/Pagination";
import ProductBanner from "../../components/pageProps/shopPage/ProductBanner";
import ShopSideNav from "../../components/pageProps/shopPage/ShopSideNav";
import { getProducts } from "../../redux/actions/productActions";

const Shop = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.product.products);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [isGridView, setIsGridView] = useState(true);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const itemsPerPageFromBanner = (itemsPerPage) => {
    setItemsPerPage(itemsPerPage);
  };

  const handleViewChange = (isGridView) => {
    console.log("View changed to:", isGridView ? "Grid" : "List");
    setIsGridView(isGridView);
  };

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
            itemsPerPageFromBanner={itemsPerPageFromBanner}
            onViewChange={handleViewChange}
            products={products} // Pass the products array here
          />
          <Pagination itemsPerPage={itemsPerPage} />
        </div>
      </div>
      {/* ================= Products End here ===================== */}
    </div>
  );
};

export default Shop;