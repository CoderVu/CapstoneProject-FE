import React, { useState, useEffect} from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getProductsOnSale} from "../../../redux/actions/productActions";

const ProductsOnSale = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(getProductsOnSale());
  }, [dispatch]);

  const productsOnSale = useSelector((state) => state.product.productsOnSale);  

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div>
      <h3 className="font-titleFont text-xl font-semibold mb-6 underline underline-offset-4 decoration-[1px]">
        Products on sale
      </h3>
      <div className="flex flex-col gap-2">
        {productsOnSale.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 border-b-[1px] border-b-gray-300 py-2 cursor-pointer"
            onClick={() => handleProductClick(item.id)}
          >
            <div>
              <img className="w-24" src={item.mainImage?.path} alt={item.productName} />
            </div>
            <div className="flex flex-col gap-2 font-titleFont">
              <p className="text-base font-medium">{item.productName}</p>
              <p className="text-sm font-semibold">${item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsOnSale;