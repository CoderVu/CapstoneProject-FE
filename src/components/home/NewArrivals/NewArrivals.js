import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import Heading from "../Products/Heading";
import Product from "../Products/Product";
import SampleNextArrow from "../ButtonSlide/SampleNextArrow";
import SamplePrevArrow from "../ButtonSlide/SamplePrevArrow";
import { fetchProductByCollection } from "../../../redux/service/productService";

const NewArrivals = ({ collectionId = "078bde4d-daff-4d85-83f0-90461d036e22"}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log("Product ratings:", products.map(product => product.rate));

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await fetchProductByCollection(collectionId, 0, 20);
        setProducts(data.response);
        setLoading(false);
      } catch (error) {
        setError(error);
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
    <div className="w-full pb-16">
      <Heading heading="New Arrivals" />
      <Slider {...settings}>
        {products.map((product) => (
          <div key={product.id} className="px-2">
            <Product
              id={product.id}
              img={product.mainImage?.path}
              productName={product.productName}
              price={product.price}
              discountPrice= "80"
              colors={product.variants?.map((variant) => variant.color) || []}
              badge={product.newProduct ? "New" : ""}
              rating={product.rate?.rating} 
              totalRate={product.rate?.totalRate} 
              totalSold= "100"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default NewArrivals;
