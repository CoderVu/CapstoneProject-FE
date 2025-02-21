import React, { useEffect, useState } from "react";
import { fetchProductViewed } from "../../../redux/service/productService";
import Product from "../Products/Product";

const ViewedProducts = () => {
  const [viewedProducts, setViewedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchViewedProducts = async () => {
      try {
        const data = await fetchProductViewed();
        setViewedProducts(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchViewedProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    viewedProducts.length > 0 && (
      <div className="w-full pb-16">
        <h2 className="text-2xl font-bold text-center uppercase mb-8">
          Sản phẩm đã xem
        </h2>
        <div className="grid grid-cols-4 gap-6">
          {viewedProducts.map((product) => (
            <Product
              key={product.id}
              id={product.id}
              img={product.mainImage?.path}
              secondaryImg={product.images[0]?.path}
              productName={product.productName}
              price={product.price}
              discountPrice="80"
              colors={product.variants?.map((variant) => variant.color) || []}
              badge={product.newProduct ? "New" : ""}
              rating={product.rate?.rating}
              totalRate={product.rate?.totalRate}
              totalSold="100"
            />
          ))}
        </div>
      </div>
    )
  );
};

export default ViewedProducts;