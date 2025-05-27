import React from "react";
import { useSelector } from "react-redux";
import Slider from "react-slick";
import Product from "../../home/Products/Product";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SampleNextArrow from "../../home/ButtonSlide/SampleNextArrow";
import SamplePrevArrow from "../../home/ButtonSlide/SamplePrevArrow";
import { Link } from "react-router-dom";

const ProductRelated = ({ limit, compact = false, showTitle = true }) => {
  const productRelated = useSelector((state) => state.productRelated.productRelated);
  const data = productRelated?.response;

  if (!data || data.length === 0) {
    return null;
  }

  // Lọc dữ liệu dựa vào limit nếu được cung cấp
  const limitedData = limit ? data.slice(0, limit) : data;
const settings = {
  infinite: true,
  speed: 500,
  slidesToShow: compact ? 2 : 4,
  slidesToScroll: 1,
  arrows: true, // Luôn hiện nút mũi tên
  autoplay: false, // Không tự động chuyển
  pauseOnHover: false, // Không tự chuyển khi hover
  nextArrow: <SampleNextArrow />,
  prevArrow: <SamplePrevArrow />,
  responsive: [
    {
      breakpoint: 1280,
      settings: {
        slidesToShow: compact ? 2 : 3,
        slidesToScroll: 1
      },
    },
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: compact ? 1 : 2,
        slidesToScroll: 1,
        dots: true
      },
    },
    {
      breakpoint: 640,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: true,
        arrows: true // vẫn hiện mũi tên ở mobile nếu muốn
      },
    },
  ],
};

  return (
  <div className="w-full">
    {showTitle && (
      <h2 className={`font-${compact ? 'medium' : 'bold'} ${compact ? 'text-lg' : 'text-2xl'} ${compact ? '' : 'text-center'} ${compact ? 'mb-4' : 'uppercase mb-8'}`}>
        Sản phẩm liên quan
      </h2>
    )}

    {compact ? (
      // Hiển thị trong chế độ compact (dành cho sidebar)
      <div>
        {limitedData.length <= 2 ? (
          // Nếu chỉ có 1-2 sản phẩm, hiển thị grid
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {limitedData.map((product) => (
              <div key={product.id}>
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
          </div>
        ) : (
          // Nếu có nhiều hơn 2 sản phẩm, hiển thị slider
          <Slider {...settings}>
            {limitedData.map((product) => (
              <div key={product.id} className="px-1.5 pb-1">
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
        )}
      </div>
    ) : (
      // Hiển thị đầy đủ (dành cho trang sản phẩm)
      <Slider {...settings}>
        {limitedData.map((product) => (
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
    )}

    {compact && limitedData.length > 0 && (
      <div className="mt-3 text-center">
        <Link to="/shop" className="text-blue-500 hover:text-blue-600 text-sm">
          Xem tất cả
        </Link>
      </div>
    )}
  </div>
);
}

export default ProductRelated;
