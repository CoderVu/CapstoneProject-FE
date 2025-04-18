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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {categories.map((category) => (
          <div
            key={category.id}
            className="group bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105"
            onClick={() => handleCategorySelect(category.name)}
          >
            <div className="relative h-64">
              <Image
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                imgSrc={category.imageUrl}
                alt={category.name}
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="bg-white text-gray-900 py-2 px-6 rounded-full hover:bg-gray-900 hover:text-white">
                  Khám phá
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold">{category.name}</h3>
              <p className="text-gray-600">{category.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-14 text-center">
        <Link
          to="/shop"
          className="bg-gray-900 text-white py-3 px-8 rounded-full hover:bg-gray-800 transition"
        >
          Xem tất cả sản phẩm
        </Link>
      </div>
    </div>
  );
};

export default CategorySection;