import React, { useState } from "react";
import NavTitle from "./NavTitle";

const Price = ({ onChange, selectedPrice, setSelectedPrice }) => {
  const [showPrices, setShowPrices] = useState(true);

  const priceList = [
    { id: 950, priceOne: 0.0, priceTwo: 50.0 },
    { id: 951, priceOne: 50.0, priceTwo: 100.0 },
    { id: 952, priceOne: 100.0, priceTwo: 200.0 },
    { id: 953, priceOne: 200.0, priceTwo: 400.0 },
    { id: 954, priceOne: 400.0, priceTwo: 600.0 },
    { id: 955, priceOne: 600.0, priceTwo: 1000.0 },
  ];

  const handlePriceChange = (price) => {
    if (selectedPrice === price.id) {
      setSelectedPrice(null);
      onChange({
        target: {
          name: "price",
          value: { priceMin: "", priceMax: "" }, 
        },
      });
    } else {
      setSelectedPrice(price.id);
      onChange({
        target: {
          name: "price",
          value: { priceMin: price.priceOne, priceMax: price.priceTwo },
        },
      });
    }
  };
  
  return (
    <div className="cursor-pointer">
      <div onClick={() => setShowPrices(!showPrices)}>
        <NavTitle title="Price" icons={true} />
      </div>
      {showPrices && (
        <div className="font-titleFont">
          <ul className="flex flex-col gap-4 text-sm lg:text-base text-[#767676]">
            {priceList.map((item) => (
              <li
                key={item.id}
                className={`border-b-[1px] border-b-[#F0F0F0] pb-2 flex items-center gap-2 cursor-pointer relative ${
                  selectedPrice === item.id ? "font-bold text-black after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-full after:h-[2px] after:bg-blue-500" : ""
                }`}
                onClick={() => handlePriceChange(item)}
              >
                ${item.priceOne.toFixed(2)} - ${item.priceTwo.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Price;