import React, { useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import Image from "../../designLayouts/Image";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

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
  const [isHovered, setIsHovered] = useState(false);

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
    <div className="w-full flex flex-col items-center bg-white shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition">
      {/* Ảnh sản phẩm */}
      <div
        className="w-full relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-full h-[500px] relative">
          <Image
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            imgSrc={isHovered && props.secondaryImg ? props.secondaryImg : props.img}
          />

          {/* Badge hiển thị "New" */}
          {props.badge && (
            <span className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 text-xs font-bold">
              New
            </span>
          )}

          {/* Badge hiển thị % giảm giá */}
          {discountPercentage > 0 && (
            <span className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 text-xs font-bold">
              -{discountPercentage}%
            </span>
          )}

          {/* Nút hành động hiển thị khi hover */}
          <div
            className={`absolute bottom-0 left-0 w-full flex gap-2 p-4 transform transition-all duration-300 ${
              isHovered ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <button
              onClick={() =>
                dispatch(
                  // Thêm logic thêm vào giỏ hàng ở đây
                )
              }
              className="flex-1 bg-yellow-500 text-white py-2 text-sm font-semibold hover:bg-yellow-600 transition"
            >
              Thêm vào giỏ hàng
            </button>
            <button
              onClick={handleProductDetails}
              className="flex-1 bg-blue-600 text-white py-2 text-sm font-semibold hover:bg-blue-700 transition"
            >
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="w-full p-5 flex flex-col gap-2">
        <h2 className="text-lg font-bold text-gray-900 truncate" title={props.productName}>
          {props.productName}
        </h2>

        {/* Màu sắc */}
        <p className="text-[#767676] text-[14px] flex items-center gap-1">
          {props.colors && props.colors.length > 0 ? (
            <>
              {[...new Set(props.colors)].slice(0, 3).map((color, index) => (
                <span
                  key={index}
                  className="inline-block w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color }}
                  title={color}
                ></span>
              ))}
              {new Set(props.colors).size > 3 && (
                <span className="text-xs text-gray-500">
                  +{new Set(props.colors).size - 3}
                </span>
              )}
            </>
          ) : (
            "Không có màu sắc"
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
      </div>
    </div>
  );
};

export default Product;