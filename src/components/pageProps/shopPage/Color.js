import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NavTitle from "./NavTitle";
import { getAllColors } from "../../../redux/actions/colorAction";
import { useSelector, useDispatch } from "react-redux";

const Color = ({ onChange, selectedColor, setSelectedColor }) => {
  const [showColors, setShowColors] = useState(true);
  const colors = useSelector((state) => state.color.colors);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllColors());
  }, [dispatch]);

  const handleColorChange = (color) => {
    if (selectedColor === color.id) {
      setSelectedColor(null);
      onChange({ target: { name: "colorProduct", value: "" } });
    } else {
      setSelectedColor(color.id);
      onChange({ target: { name: "colorProduct", value: color.color } });
    }
  };


  return (
    <div>
      <div onClick={() => setShowColors(!showColors)} className="cursor-pointer">
        <NavTitle title="Màu sản phẩm" icons={true} />
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
                className={`border-b-[1px] border-b-[#F0F0F0] pb-2 flex items-center gap-2 cursor-pointer relative ${selectedColor === item.id ? "font-bold text-black after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-full after:h-[2px] after:bg-blue-500" : ""
                  }`}
                onClick={() => handleColorChange(item)}
              >
                <span
                  style={{ background: item.colorCode }}
                  className="w-3 h-3 rounded-full"
                ></span>
                {item.color}
              </li>

            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default Color;
