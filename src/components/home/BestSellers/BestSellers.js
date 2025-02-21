import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import Heading from "../Products/Heading";
import Product from "../Products/Product";
import SampleNextArrow from "../ButtonSlide/SampleNextArrow";
import SamplePrevArrow from "../ButtonSlide/SamplePrevArrow";
import { fetchProductByCollection } from "../../../redux/service/productService";

const BestSellers = ({ collectionId = "cef76a21-1fae-4454-b353-b8c9c1833a3b" }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await fetchProductByCollection(collectionId, 0, 20);
        setProducts(data.response);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [collectionId]);

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      { breakpoint: 1025, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 769, settings: { slidesToShow: 2, slidesToScroll: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="w-full pb-16">
      {/* Tiêu đề in hoa và căn giữa */}
      <h2 className="text-2xl font-bold text-center uppercase mb-8">
        SẢN PHẨM NỔI BẬT
      </h2>
      <Slider {...settings}>
        {products.map((product) => (
          <div key={product.id} className="px-2">
            <Product
              id={product.id}
              img={product.mainImage?.path}
              secondaryImg={product.images[0]?.path}
              productName={product.productName}
              price={product.price}
              discountPrice="80"
              colors={product.variants?.map((variant) => variant.color) || []}
              badge={product.bestSeller ? "Best Seller" : ""}
              rating={product.rate?.rating}
              totalRate={product.rate?.totalRate}
              totalSold="100"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default BestSellers;
