import React, { useState } from "react";

/**
 * Price filter component
 * Props:
 * - onChange: function to call with { priceMin, priceMax }
 * - selectedPrice: currently selected price id
 * - setSelectedPrice: setter for selectedPrice
 */
const Price = ({ onChange, selectedPrice, setSelectedPrice }) => {
  const [showPrices, setShowPrices] = useState(true);

  // Price ranges in VND
  const priceList = [
 
    { id: 2, priceMin: 50000, priceMax: 100000 },
    { id: 3, priceMin: 100000, priceMax: 200000 },
    { id: 4, priceMin: 200000, priceMax: 300000 },
    { id: 5, priceMin: 300000, priceMax: 400000 },
    { id: 6, priceMin: 400000, priceMax: 500000 },
    { id: 7, priceMin: 500000, priceMax: 1000000 },
  ];

  // Format number to Vietnamese currency string
  const formatVND = (value) =>
    value.toLocaleString("vi-VN") + "đ";

  const handlePriceChange = (range) => {
    if (selectedPrice === range.id) {
      setSelectedPrice(null);
      onChange({ target: { name: "price", value: { priceMin: "", priceMax: "" } } });
    } else {
      setSelectedPrice(range.id);
      onChange({
        target: {
          name: "price",
          value: { priceMin: range.priceMin, priceMax: range.priceMax },
        },
      });
    }
  };


  return (
    <div className="cursor-pointer">
      <div onClick={() => setShowPrices(!showPrices)}>
       
      </div>

      {showPrices && (
        <ul className="flex flex-col gap-2 text-sm text-[#767676]">
          {priceList.map((range) => (
            <li
              key={range.id}
              onClick={() => handlePriceChange(range)}
              className={`flex justify-between items-center p-2 border-b hover:bg-gray-50 transition-colors relative ${
                selectedPrice === range.id
                  ? "font-bold text-black after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-1 after:bg-blue-500"
                  : ""
              }`}
            >
              <span>
                {range.priceMin === 0
                  ? `Dưới ${formatVND(range.priceMax)}`
                  : `${formatVND(range.priceMin)} - ${formatVND(range.priceMax)}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Price;
