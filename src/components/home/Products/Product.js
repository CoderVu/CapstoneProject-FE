import React from "react";
import { FaShoppingCart } from "react-icons/fa";
import { MdOutlineLabelImportant } from "react-icons/md";
import Image from "../../designLayouts/Image";
import Badge from "./Badge";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../redux/orebiSlice";

const Product = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleProductDetails = () => {
    if (!props.id) {
      console.error("ID is missing for the product.");
      return;
    }
    navigate(`/product/${props.id}`, {
      state: {
        item: props,
      },
    });
  };

  return (
    <div className="w-full relative group">
      {/* Product image with fixed height and width */}
      <div className="max-w-full h-[300px] relative overflow-hidden">
        <Image className="w-full h-full object-cover" imgSrc={props.img} />
        <div className="absolute top-6 left-8">
          {props.badge && <Badge text="New" />}
        </div>
        {/* Product actions (Add to Cart and View Details) */}
        <div className="w-full h-32 absolute bg-white -bottom-[130px] group-hover:bottom-0 duration-700">
          <ul className="w-full h-full flex flex-col items-end justify-center gap-2 font-titleFont px-2 border-l border-r">
            <li
              onClick={() =>
                dispatch(
                  addToCart({
                    id: props.id,
                    name: props.productName,
                    quantity: 1,
                    image: props.img,
                    badge: props.badge,
                    price: props.price,
                    colors: props.color,
                  })
                )
              }
              className="text-[#767676] hover:text-primeColor text-sm font-normal border-b-[1px] border-b-gray-200 hover:border-b-primeColor flex items-center justify-end gap-2 hover:cursor-pointer pb-1 duration-300 w-full"
            >
              Add to Cart
              <span>
                <FaShoppingCart />
              </span>
            </li>
            <li
              onClick={handleProductDetails}
              className="text-[#767676] hover:text-primeColor text-sm font-normal border-b-[1px] border-b-gray-200 hover:border-b-primeColor flex items-center justify-end gap-2 hover:cursor-pointer pb-1 duration-300 w-full"
            >
              View Details
              <span className="text-lg">
                <MdOutlineLabelImportant />
              </span>
            </li>
          </ul>
        </div>
      </div>
      {/* Product name, color, and price */}
      <div className="max-w-full py-6 flex flex-col gap-1 border-[1px] border-t-0 px-4">
        <div className="flex items-center justify-between font-titleFont mb-2">
          <h2 className="text-lg text-primeColor font-bold">{props.productName}</h2>
          <p className="text-[#767676] text-[14px]">${props.price}</p>
        </div>
        <div>
          <p className="text-[#767676] text-[14px]">
            {props.colors && props.colors.length > 0 ? (
              <span>
                {[...new Set(props.colors)].map((color, index) => (
                  <span
                    key={index}
                    className="inline-block w-4 h-4 rounded-full mr-2 mb-1"
                    style={{ backgroundColor: color }}
                    title={color} // Optional: Hiển thị mã màu khi hover
                  ></span>
                ))}
              </span>
            ) : (
              "No colors available"
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Product;