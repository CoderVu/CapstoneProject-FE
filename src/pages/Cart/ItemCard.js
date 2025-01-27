import React from "react";
import { ImCross } from "react-icons/im";
import { useDispatch } from "react-redux";
import {
  deleteItem,
  drecreaseQuantity,
  increaseQuantity,
} from "../../redux/orebiSlice";

const ItemCard = ({ item }) => {
  const dispatch = useDispatch();
  return (
    <div className="w-full grid grid-cols-5 mb-4 border py-2 rounded-lg shadow-sm">
      {/* Left Section: Image and Details */}
      <div className="flex col-span-5 mdl:col-span-2 items-center gap-4 ml-4">
        <ImCross
          onClick={() => dispatch(deleteItem(item._id))}
          className="text-primeColor hover:text-red-500 duration-300 cursor-pointer"
        />
        <img className="w-24 h-24 rounded-md border" src={item.image} alt="productImage" />
        <div className="space-y-2">
          <h1 className="font-titleFont font-semibold text-lg">{item.name}</h1>
          <div className="flex items-center gap-6">
            {/* Color */}
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <span>Color:</span>
              <span
                className="inline-block w-5 h-5 rounded-full border"
                style={{ backgroundColor: item.color }}
              ></span>
            </p>
            {/* Size */}
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <span>Size:</span>
              <span className="bg-gray-100 px-2 py-1 rounded-md border text-sm font-medium">
                {item.size}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Right Section: Price, Quantity, Total */}
      <div className="col-span-5 mdl:col-span-3 flex items-center justify-between py-4 mdl:py-0 px-4 mdl:px-0 gap-6 mdl:gap-0">
        {/* Price */}
        <div className="flex w-1/3 items-center text-lg font-semibold text-gray-700">
          ${item.price}
        </div>
        {/* Quantity */}
        <div className="w-1/3 flex items-center gap-6 text-lg">
          <span
            onClick={() => dispatch(drecreaseQuantity({ _id: item._id }))}
            className="w-8 h-8 bg-gray-100 text-xl flex items-center justify-center hover:bg-gray-300 cursor-pointer duration-300 border rounded-md"
          >
            -
          </span>
          <p className="font-medium">{item.quantity}</p>
          <span
            onClick={() => dispatch(increaseQuantity({ _id: item._id }))}
            className="w-8 h-8 bg-gray-100 text-xl flex items-center justify-center hover:bg-gray-300 cursor-pointer duration-300 border rounded-md"
          >
            +
          </span>
        </div>
        {/* Total */}
        <div className="w-1/3 flex items-center font-titleFont font-bold text-lg text-gray-800">
          <p>${item.quantity * item.price}</p>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
