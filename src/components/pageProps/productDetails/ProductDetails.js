import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Breadcrumbs from "../Breadcrumbs";
import ProductInfo from "../productDetails/ProductInfo";
import ProductsOnSale from "./ProductsOnSale";
import { getProductDetail } from "../../../redux/actions/productActions";

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const productDetail = useSelector((state) => state.productDetail);
  const { loading, error, product } = productDetail;
  const [prevLocation, setPrevLocation] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(getProductDetail(id));
    }
    setPrevLocation(location.pathname);
  }, [dispatch, id, location]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full mx-auto border-b-[1px] border-b-gray-300">
      <div className="max-w-container mx-auto px-4">
        <div className="xl:-mt-10 -mt-7">
          <Breadcrumbs title="" prevLocation={prevLocation} />
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 h-full -mt-5 xl:-mt-8 pb-10 bg-gray-100 p-4">
          <div className="h-full">
            <ProductsOnSale />
          </div>
          <div className="h-full xl:col-span-2 flex items-center justify-center">
            {product.mainImage?.path ? (
              <img
                className="max-w-full max-h-[400px] w-auto h-auto object-contain"
                src={product.mainImage.path}
                alt={product.productName}
              />
            ) : (
              <div className="w-full h-[300px] flex items-center justify-center text-gray-500 bg-gray-200 rounded-lg">
                No Image Available
              </div>
            )}
          </div>

          <div className="h-full w-full md:col-span-2 xl:col-span-3 xl:p-14 flex flex-col gap-6 justify-center">
            <ProductInfo productInfo={product} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
