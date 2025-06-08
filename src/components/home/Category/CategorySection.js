import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories } from "../../../redux/actions/categoryAction";
import { useDispatch, useSelector } from "react-redux";
import Image from "../../designLayouts/Image";

const CategorySection = () => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.category.categories);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const handleCategorySelect = (categoryName) => {
    navigate("/shop", { state: { categoryProduct: categoryName } });
  };

  return (
    <div className="py-14 px-4 bg-gray-50">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800">DANH MỤC SẢN PHẨM</h1>
        <div className="w-20 h-1 bg-blue-500 mx-auto my-4"></div>
        <p className="text-gray-600">Khám phá bộ sưu tập thời trang mới nhất</p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {categories.map((category) => (
          <div
            key={category.id}
            className="group bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer"
            onClick={() => handleCategorySelect(category.name)}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                imgSrc={category.imageUrl}
                alt={category.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-6">
                <button className="bg-white text-gray-900 py-2.5 px-8 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-gray-900 hover:text-white">
                  Khám phá ngay
                </button>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{category.name}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{category.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <Link
          to="/shop"
          className="inline-block bg-gray-900 text-white py-3.5 px-10 rounded-full hover:bg-gray-800 transition-colors duration-300 font-medium shadow-lg hover:shadow-xl"
        >
          Xem tất cả sản phẩm
        </Link>
      </div>
    </div>
  );
};

export default CategorySection;