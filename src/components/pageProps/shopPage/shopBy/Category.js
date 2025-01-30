import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NavTitle from "./NavTitle";
import { getCategories } from "../../../../redux/actions/categoryAction";
import { useSelector, useDispatch } from "react-redux";

const Category = ({ onChange, selectedCategory, setSelectedCategory }) => {
  const [showCategories, setShowCategories] = useState(true);
  const categories = useSelector((state) => state.category.categories);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category.id); // Update selected category for CSS highlight
    onChange({ target: { name: "categoryProduct", value: category.name } });
  };

  const handleClearCategory = () => {
    setSelectedCategory(null); // Reset selected category
    onChange({ target: { name: "categoryProduct", value: "" } }); // Clear category filter
  };

  return (
    <div>
      <div onClick={() => setShowCategories(!showCategories)} className="cursor-pointer">
        <NavTitle title="Shop by Category" icons={true} />
      </div>
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
                className={`border-b-[1px] border-b-[#F0F0F0] pb-2 flex items-center gap-2 cursor-pointer ${
                  selectedCategory === category.id ? "bg-blue-500 text-white" : ""
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category.name}
              </li>
            ))}
          </ul>
          <button
            onClick={handleClearCategory}
            className="mt-4 text-sm text-red-500"
          >
            Clear Category Filter
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Category;
