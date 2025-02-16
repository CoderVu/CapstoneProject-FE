import React, { useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import {
  bannerImgOne,
  bannerImgTwo,
  bannerImgThree,
  bannerImgFour,
  bannerImgFive
} from "../../assets/images";
import Image from "../designLayouts/Image";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Banner = () => {
  const [dotActive, setDotActive] = useState(0);

  const NextArrow = ({ onClick }) => (
    <div
      className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 cursor-pointer bg-gray-800 bg-opacity-50 p-2 rounded-full"
      onClick={onClick}
    >
      <i className="fas fa-chevron-right text-white text-2xl"></i>
    </div>
  );

  const PrevArrow = ({ onClick }) => (
    <div
      className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 cursor-pointer bg-gray-800 bg-opacity-50 p-2 rounded-full"
      onClick={onClick}
    >
      <i className="fas fa-chevron-left text-white text-2xl"></i>
    </div>
  );

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    beforeChange: (_, next) => setDotActive(next),
    appendDots: (dots) => (
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        <ul className="flex p-0 bg-opacity-50 bg-gray-900 rounded-full px-2 py-1">{dots}</ul>
      </div>
    ),
    customPaging: (i) => (
      <div
        className={`rounded-full ${i === dotActive ? "bg-white" : "bg-gray-400"} w-3 h-3 cursor-pointer transition-all`}
      />
    ),
    responsive: [
      {
        breakpoint: 576,
        settings: {
          dots: true,
          appendDots: (dots) => (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-20">
              <ul className="flex p-0 bg-opacity-50 bg-gray-900 rounded-full px-2 py-1">{dots}</ul>
            </div>
          ),
          customPaging: (i) => (
            <div
              className={`rounded-full ${i === dotActive ? "bg-white" : "bg-gray-400"} w-2 h-2 cursor-pointer transition-all`}
            />
          ),
        },
      },
    ],
  };

  return (
    <div className="w-full bg-white overflow-hidden relative">
      <Slider {...settings} className="w-full relative">
        {[bannerImgOne, bannerImgTwo, bannerImgThree, bannerImgFour, bannerImgFive].map((img, index) => (
          <div key={index} className="relative w-full">
            <Link to="/offer" className="w-full block">
              <div className="w-full relative flex justify-center items-center">
                <Image imgSrc={img} className="w-full object-cover" />
              </div>
            </Link>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Banner;
