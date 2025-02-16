import React from "react";
import { Link } from "react-router-dom";
import { bannerImgFive } from "../../../assets/images/index";
import ShopNow from "../../designLayouts/ShopNow";
import Image from "../../designLayouts/Image";

const YearProduct = () => {
  return (
    <Link to="/shop" className="block group">
      <div className="relative w-full h-80 bg-[#f3f3f3] md:bg-transparent flex items-center justify-center overflow-hidden">
        {/* Ảnh chỉ hiển thị trên màn hình lớn */}
        <Image
          className="w-full h-full object-cover hidden md:block transition-transform duration-300 group-hover:scale-105"
          imgSrc={bannerImgFive}
        />
        
        {/* Nội dung sản phẩm */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-white md:bg-transparent bg-opacity-80 md:bg-opacity-0 px-6 md:px-0 transition-all duration-300 group-hover:bg-opacity-90">
          <h1 className="text-4xl md:text-5xl font-bold text-white ">
            Product of The Year
          </h1>
          <p className="text-base md:text-lg text-white max-w-lg mt-2">
            Discover our best-selling product of the year, crafted for comfort
            and style.
          </p>
          <div className="mt-4">
            <ShopNow />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default YearProduct;
