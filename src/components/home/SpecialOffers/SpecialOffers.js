import React, { useEffect, useState } from "react";
import Product from "../Products/Product";
import { useNavigate } from "react-router-dom";
import { fetchAllProductsOnSale } from "../../../redux/service/productService";
import Slider from "react-slick";
import SampleNextArrow from "../ButtonSlide/SampleNextArrow";
import SamplePrevArrow from "../ButtonSlide/SamplePrevArrow";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
// import { data } from "autoprefixer";
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
  
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1025,
        settings: { slidesToShow: 3, slidesToScroll: 1, infinite: true },
      },
      {
        breakpoint: 769,
        settings: { slidesToShow: 2, slidesToScroll: 2, infinite: true },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1, slidesToScroll: 1, infinite: true },
      },
    ],
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="w-full pb-20">
        {/* Tiêu đề in hoa và căn giữa */}
        <h2 className="text-2xl font-bold text-center uppercase mb-8">
          Sản phẩm đang giảm giá
      </h2>
     <Slider {...settings}>
        {productsOnSale.map((product) => (
          <div key={product.id} className="px-2">
            <Product
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
          </div>
        ))}
      </Slider>
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