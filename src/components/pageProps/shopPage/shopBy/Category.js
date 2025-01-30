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
    if (selectedCategory === category.id) {
      setSelectedCategory(null);
      onChange({ target: { name: "categoryProduct", value: "" } });
    } else {
      setSelectedCategory(category.id);
      onChange({ target: { name: "categoryProduct", value: category.name } });
    }
  };

  return (
    <div>
      <div onClick={() => setShowCategories(!showCategories)} className="cursor-pointer">
        <NavTitle title="Category" icons={true} />
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
                className={`border-b-[1px] border-b-[#F0F0F0] pb-2 flex items-center gap-2 cursor-pointer relative
    ${selectedCategory === category.id ? "font-bold text-black after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-full after:h-[2px] after:bg-blue-500" : ""}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category.name}
              </li>


            ))}
          </ul>

        </motion.div>
      )}
    </div>
  );
};

export default Category;
