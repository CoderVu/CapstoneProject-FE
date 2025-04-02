import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../../../redux/actions/categoryAction";
import { useDispatch, useSelector } from "react-redux";
import Image from "../../designLayouts/Image";

const CategorySection = () => {
  // Sample clothing categories for shop
  const dispatch = useDispatch();
    const categories = useSelector((state) => state.category.categories);
   useEffect(() => {
    const fetchCategories = async () => {
     dispatch(getCategories());
    };
    fetchCategories();
  }
  , [dispatch]);
 
  return (
    <div className="py-14 px-2 md:px-8 lg:px-12 bg-gray-50">
      {/* Section Header */}
      <div className="flex flex-col items-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">DANH MỤC SẢN PHẨM</h1>
        <div className="w-20 h-1 bg-blue-500 mb-4"></div>
        <p className="text-center text-gray-600 max-w-2xl">
          Khám phá bộ sưu tập đa dạng với những thiết kế thời trang mới nhất và phong cách nhất
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {categories.map((category) => (
          <Link
            to={`/category/${category.id}`}
            key={category.id}
            className="group overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div className="relative overflow-hidden h-64 sm:h-72">
              <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
              <Image
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                imgSrc={category.imageUrl}
                alt={category.name}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <button className="bg-white text-gray-900 hover:bg-gray-900 hover:text-white py-2 px-6 rounded-full font-medium transition-colors duration-300">
                  Khám phá
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
              <p className="text-gray-600 mt-1">{category.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-14 text-center">
        <Link
          to="/products"
          className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-8 rounded-full transition-colors duration-300"
        >
          Xem tất cả sản phẩm
        </Link>
      </div>
    </div>
  );
};

export default CategorySection;
