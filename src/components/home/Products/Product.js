import React from "react";
import { FaShoppingCart, FaStar, FaRegStar } from "react-icons/fa";
import Image from "../../designLayouts/Image";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../redux/orebiSlice";

const renderStars = (rating) => {
  return Array.from({ length: 5 }).map((_, index) =>
    index < rating ? (
      <FaStar key={index} className="text-yellow-500 text-sm" />
    ) : (
      <FaRegStar key={index} className="text-gray-300 text-sm" />
    )
  );
};

const Product = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleProductDetails = () => {
    navigate(`/product/${props.id}`, {
      state: {
        item: props,
      },
    });
  };

  // Tính phần trăm giảm giá
  const discountPercentage =
    props.price && props.discountPrice
      ? Math.round(((props.price - props.discountPrice) / props.price) * 100)
      : null;

  return (
    <div className="w-full relative group bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition">
      {/* Ảnh sản phẩm */}
      <div className="w-full h-[280px] relative">
        <Image className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" imgSrc={props.img} />
        
        {/* Badge hiển thị "New" */}
        {props.badge && (
          <span className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
            New
          </span>
        )}

        {/* Badge hiển thị % giảm giá */}
        {discountPercentage > 0 && (
          <span className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 text-xs font-bold rounded">
            -{discountPercentage}%
          </span>
        )}
      </div>

      {/* Thông tin sản phẩm */}
      <div className="p-4 flex flex-col gap-2">
        <h2 className="text-lg font-bold text-gray-900 truncate">{props.productName}</h2>
        
        {/* Màu sắc */}
        <p className="text-[#767676] text-[14px]">
          {props.colors && props.colors.length > 0 ? (
            <span>
              {[...new Set(props.colors)].map((color, index) => (
                <span
                  key={index}
                  className="inline-block w-4 h-4 rounded-full mr-2 mb-1"
                  style={{ backgroundColor: color }}
                  title={color} // Hiển thị mã màu khi hover
                ></span>
              ))}
            </span>
          ) : (
            "No colors available"
          )}
        </p>

        {/* Giá & Đánh giá */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {props.discountPrice ? (
              <>
                <p className="text-gray-400 text-sm line-through">{props.price}đ</p>
                <p className="text-red-600 text-lg font-bold">{props.discountPrice}đ</p>
              </>
            ) : (
              <p className="text-gray-900 text-lg font-bold">{props.price}đ</p>
            )}
          </div>
          <div className="flex items-center">
            {renderStars(props.rating)}
            <span className="ml-1 text-sm text-gray-600">({props.totalRate})</span>
          </div>
        </div>

        {/* Số lượng đã bán */}
        <p className="text-gray-600 text-sm">Đã bán: {props.totalSold}</p>

        {/* Nút hành động */}
        <div className="flex gap-2 mt-3">
          <button 
            onClick={() =>
              dispatch(
                addToCart({
                  id: props.id,
                  name: props.productName,
                  quantity: 1,
                  image: props.img,
                  price: props.price,
                  colors: props.color,
                })
              )
            }
            className="flex-1 bg-blue-600 text-white py-2 text-sm font-semibold rounded hover:bg-blue-700 transition"
          >
            Thêm vào giỏ
          </button>
          <button 
            onClick={handleProductDetails}
            className="flex-1 bg-gray-100 text-gray-900 py-2 text-sm font-semibold rounded hover:bg-gray-200 transition"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;
