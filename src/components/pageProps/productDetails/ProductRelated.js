import React from "react";
import { useSelector } from "react-redux";
import Slider from "react-slick";
import Product from "../../home/Products/Product";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SampleNextArrow from "../../home/ButtonSlide/SampleNextArrow";
import SamplePrevArrow from "../../home/ButtonSlide/SamplePrevArrow";

const ProductRelated = () => {
  const productRelated = useSelector((state) => state.productRelated.productRelated);
  const data = productRelated?.response;

  if (!data || data.length === 0) {
    return null;
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


  return (
    <div className="w-full pb-16">
      <h2 className="text-2xl font-bold text-center uppercase mb-8">
        Sản phẩm liên quan
      </h2>
      <Slider {...settings}>
        {data.map((product) => (
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
    </div>
  );
};

export default ProductRelated;