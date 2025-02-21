import React, { useEffect, useState } from "react";
import Product from "../Products/Product";
import { useNavigate } from "react-router-dom";
import { fetchAllProductsOnSale } from "../../../redux/service/productService";

const SpecialOffers = () => {
  const [productsOnSale, setProductsOnSale] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await fetchAllProductsOnSale();
        setProductsOnSale(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  return (
    <div className="w-full pb-20">
        {/* Tiêu đề in hoa và căn giữa */}
        <h2 className="text-2xl font-bold text-center uppercase mb-8">
          Sản phẩm đang giảm giá
      </h2>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lgl:grid-cols-3 xl:grid-cols-4 gap-10">
        {productsOnSale.map((product) => (
          <Product
            key={product.id}
            id={product.id}
            img={product.mainImage?.path}
            secondaryImg={product.images[0]?.path}
            productName={product.productName}
            price={product.price}
            colors={product.variants?.map((variant) => variant.color) || []}
            sizes={product.variants?.map((variant) => variant.sizeName) || []}
            color={product.color}
            badge={product.newProduct}
            des={product.description}
            discountPrice={product.discountPrice}
            rating={product.rate?.rating}
            totalRate={product.rate?.totalRate}
            totalSold="100"
          />
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <button
          onClick={() => navigate("/shop")}
          className="bg-primeColor text-white py-2 px-4 rounded hover:bg-black transition duration-300"
        >
          Xem tất cả
        </button>
      </div>
    </div>
  );
};

export default SpecialOffers;