import React, { useState } from "react";
import NavTitle from "./NavTitle";

const Price = ({ onChange, selectedPrice, setSelectedPrice }) => {
  const [showPrices, setShowPrices] = useState(true);

  const priceList = [
    { id: 950, priceOne: 0.0, priceTwo: 50 },
    { id: 951, priceOne: 50.0, priceTwo: 100 },
    { id: 952, priceOne: 100.0, priceTwo: 200 },
  ];

  const handlePriceChange = (price) => {
    setSelectedPrice(price.id); // Update selected price for CSS highlight
    onChange({
      priceMin: price.priceOne,
      priceMax: price.priceTwo,
    });
  };

  const handleClearPrice = () => {
    setSelectedPrice(null); // Reset selected price
    onChange({
      priceMin: "",
      priceMax: "",
    });
  };

  return (
    <div className="cursor-pointer">
      <div onClick={() => setShowPrices(!showPrices)}>
        <NavTitle title="Shop by Price" icons={true} />
      </div>
      {showPrices && (
        <div className="font-titleFont">
          <ul className="flex flex-col gap-4 text-sm lg:text-base text-[#767676]">
            {priceList.map((item) => (
              <li
                key={item.id}
                className={`border-b-[1px] border-b-[#F0F0F0] pb-2 flex items-center gap-2 cursor-pointer ${
                  selectedPrice === item.id ? "bg-blue-500 text-white" : ""
                }`}
                onClick={() => handlePriceChange(item)}
              >
                ${item.priceOne.toFixed(2)} - ${item.priceTwo.toFixed(2)}
              </li>
            ))}
          </ul>
          <button
            onClick={handleClearPrice}
            className="mt-4 text-sm text-red-500"
          >
            Clear Price Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default Price;