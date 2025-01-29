import React, { useState } from "react";
import { motion } from "framer-motion";
import NavTitle from "./NavTitle";

const Category = () => {
  const [showCategories, setShowCategories] = useState(true);
  const categories = [
    {
      id: 990,
      title: "New Arrivalss",
    },
    {
      id: 991,
      title: "Sneakers",
    },
    {
      id: 992,
      title: "Boots",
    },
    {
      id: 993,
      title: "Sandals",
    },
    {
      id: 994,
      title: "Accessories",
    },
  ];

  return (
    <div>
      {/* Header with toggle functionality */}
      <div
        onClick={() => setShowCategories(!showCategories)}
        className="cursor-pointer"
      >
        <NavTitle title="Shop by Category" icons={true} />
      </div>
      
      {/* Conditional rendering of categories */}
      {showCategories && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ul className="flex flex-col gap-4 text-sm lg:text-base text-[#767676]">
            {categories.map((category) => (
              <li
                key={category.id}
                className="border-b-[1px] border-b-[#F0F0F0] pb-2 flex items-center gap-2"
              >
                {category.title}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default Category;
