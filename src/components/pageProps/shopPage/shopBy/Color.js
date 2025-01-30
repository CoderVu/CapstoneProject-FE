import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NavTitle from "./NavTitle";
import { getAllColors } from "../../../../redux/actions/colorAction";
import { useSelector, useDispatch } from "react-redux";

const Color = ({ onChange, selectedColor, setSelectedColor }) => {
  const [showColors, setShowColors] = useState(true);
  const colors = useSelector((state) => state.color.colors);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllColors());
  }, [dispatch]);

  const handleColorChange = (color) => {
    setSelectedColor(color.id); // Update selected color for CSS highlight
    onChange({ target: { name: "colorProduct", value: color.color } });
  };

  const handleClearColor = () => {
    setSelectedColor(null); // Reset selected color
    onChange({ target: { name: "colorProduct", value: "" } }); // Clear color filter
  };

  return (
    <div>
      <div onClick={() => setShowColors(!showColors)} className="cursor-pointer">
        <NavTitle title="Shop by Color" icons={true} />
      </div>
      {showColors && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ul className="flex flex-col gap-4 text-sm lg:text-base text-[#767676]">
            {colors.map((item) => (
              <li
                key={item.id}
                className={`border-b-[1px] border-b-[#F0F0F0] pb-2 flex items-center gap-2 cursor-pointer ${
                  selectedColor === item.id ? "bg-blue-500 text-white" : ""
                }`}
                onClick={() => handleColorChange(item)}
              >
                <span
                  style={{ background: item.colorCode }}
                  className={`w-3 h-3 rounded-full`}
                ></span>
                {item.color}
              </li>
            ))}
          </ul>
          <button
            onClick={handleClearColor}
            className="mt-4 text-sm text-red-500"
          >
            Clear Color Filter
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Color;
