import React, { useEffect, useState } from "react";
import Heading from "../Products/Heading";
import Product from "../Products/Product";
import { fetchAllProductsOnSale } from "../../../redux/service/productService";

const SpecialOffers = () => {
  const [productsOnSale, setProductsOnSale] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <Heading heading="Special Offers" />
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lgl:grid-cols-3 xl:grid-cols-4 gap-10">
        {productsOnSale.map((product) => (
          <Product
            key={product.id}
            id={product.id}
            img={product.mainImage?.path}
            productName={product.productName}
            price={product.price}
            colors={product.variants?.map((variant) => variant.color) || []}
            sizes={product.variants?.map((variant) => variant.sizeName) || []}
            color={product.color}
            badge={product.newProduct}
            des={product.description}
            discountPrice="80"
            rating={product.rate?.rating}
            totalRate={product.rate?.totalRate}
            totalSold="100"
          />
        ))}
      </div>
    </div>
  );
};

export default SpecialOffers;