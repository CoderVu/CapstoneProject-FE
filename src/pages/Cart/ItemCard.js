import React, { useState } from "react";
import { ImChrome, ImCross, ImInsertTemplate, ImRadioChecked, ImTicket } from "react-icons/im";
import { useDispatch } from "react-redux";
import { removeCartItem } from "../../redux/actions/cartActions";
import ModalUpdateCart from "./ModalUpdateCart";

const ItemCard = ({ item, isFirstItem }) => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = () => {
    dispatch(removeCartItem(item.id));
  };

  return (
    <div>
      {/* Hiển thị tiêu đề chỉ 1 lần nếu là item đầu tiên */}
      {isFirstItem && (
        <div className="w-full h-16 bg-[#F5F7F7] text-primeColor hidden lgl:grid grid-cols-5 px-6 text-lg font-titleFont font-semibold items-center">
          <h2 className="col-span-2">Sản phẩm</h2>
          <h2>Giá</h2>
          <h2>Số lượng</h2>
          <h2>Tổng phụ</h2>
        </div>
      )}

      <div className="w-full grid grid-cols-5 mb-4 border py-2 rounded-lg shadow-sm items-center px-4">
        {/* Cột sản phẩm */}
        <div className="flex col-span-2 items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <ImCross
              onClick={handleDelete}
              className="text-primeColor hover:text-red-500 duration-300 cursor-pointer"
            />
           
          </div>
          <img className="w-20 h-20 rounded-md border" src={item.image} alt="productImage" />
          <div className="space-y-2">
            <h1 className="font-titleFont font-semibold text-lg">{item.productName}</h1>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span>Color:</span>
                <span
                  className="inline-block w-5 h-5 rounded-full border"
                  style={{ backgroundColor: item.color }}
                ></span>
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span>Size:</span>
                <span className="bg-gray-100 px-2 py-1 rounded-md border text-sm font-medium">
                  {item.size}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Cột giá */}
        <div className="flex items-center justify-center text-lg font-semibold text-gray-700">
          {item.totalPrice} VNĐ
        </div>

        {/* Cột số lượng */}
        <div className="flex items-center justify-center text-lg font-semibold text-gray-700">
          {item.quantity}
        </div>

        {/* Cột tổng phụ */}
        <div className="flex items-center justify-center font-titleFont font-bold text-lg text-gray-800">
          {item.totalPrice * item.quantity} VNĐ
        </div>

        {/* Cột chỉnh sửa */}
        <div className="px-6 py-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="py-2 px-6 bg-blue-500 text-white rounded hover:bg-blue-700 duration-300 text-sm"
          >
            Chỉnh sửa
          </button>
        </div>
      </div>

      {isModalOpen && (
        <ModalUpdateCart
          productId={item.productId}
          item={item}
          productDetail={item.productDetail}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ItemCard;