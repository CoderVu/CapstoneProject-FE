import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NavTitle from "./NavTitle";
import { getAllBrands } from "../../../../redux/actions/brandAction";
import { useSelector, useDispatch } from "react-redux";

const Brand = ({ onChange, selectedBrand, setSelectedBrand }) => {
  const [showBrands, setShowBrands] = useState(true);
  const brands = useSelector((state) => state.brand.brands);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllBrands());
  }, [dispatch]);

  const handleBrandChange = (brand) => {
    if (selectedBrand === brand.brandId) {
      setSelectedBrand(null);
      onChange({ target: { name: "brandProduct", value: "" } });
    }
    else {
      setSelectedBrand(brand.brandId);
      onChange({ target: { name: "brandProduct", value: brand.brandName } });
    }
  };

  return (
    <div>
      <div onClick={() => setShowBrands(!showBrands)} className="cursor-pointer">
        <NavTitle title="Brand" icons={true} />
      </div>
      {showBrands && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ul className="flex flex-col gap-4 text-sm lg:text-base text-[#767676]">
            {brands.map((item) => (
              <li
                key={item.brandId}
                className={`border-b-[1px] border-b-[#F0F0F0] pb-2 flex items-center gap-2 cursor-pointer relative ${selectedBrand === item.brandId ? "font-bold text-black after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-full after:h-[2px] after:bg-blue-500" : ""
                  }`}
                onClick={() => handleBrandChange(item)}
              >
                {item.brandName}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

export default Brand;
