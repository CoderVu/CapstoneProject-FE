import React from "react";
import { Link } from "react-router-dom";
import {
  saleImgOne,
  saleImgTwo,
  saleImgThree,
  saleImgFour,
  saleImgFive,
  saleImgSix,
  saleImgSeven,
  saleImgEight,
  saleImgNine,
  saleImgTen,
  saleImgEleven,
  saleImgTwelve,

} from "../../../assets/images/index";
import Image from "../../designLayouts/Image";

const Sale = () => {
  const images = [
    { src: saleImgOne, discount: "35%" },
    { src: saleImgTwo, discount: "40%" },
    { src: saleImgThree, discount: "50%" },
    { src: saleImgFour, discount: "50%" },
    { src: saleImgFive, discount: "50%" },
    { src: saleImgSix, discount: "50%" },
    { src: saleImgSeven, discount: "50%" },
    { src: saleImgEight, discount: "50%" },
    { src: saleImgNine, discount: "50%" },
    { src: saleImgTen, discount: "50%" },
    { src: saleImgEleven, discount: "50%" },
    { src: saleImgTwelve, discount: "50%" },
   
  ];

  return (
    <div className="py-20">
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-4xl font-bold mb-2">EVERYBODY BONDI</h1>
        <h2 className="text-xl">BOND 9 - Max cushion for all.</h2>
      </div>
      
      {/* Grid layout: 5 items per row on lg, 6 on xl */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {images.map((item, index) => (
          <div key={index} className="relative">
            <Link to="/shop">
              <Image className="h-full w-full object-cover" imgSrc={item.src} />
              <div className="absolute top-2 left-2 text-white bg-red-600 px-2 py-1 rounded">
                {item.discount}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sale;
