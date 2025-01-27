import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../redux/orebiSlice";

const ProductInfo = ({ productInfo }) => {
  const dispatch = useDispatch();
  const [selectedColor, setSelectedColor] = useState(productInfo.colors ? productInfo.colors[0] : "");
  const [selectedSize, setSelectedSize] = useState(productInfo.sizes ? productInfo.sizes[0] : "");

  // Mock array of image URLs using the same image URL multiple times
  const mockImages = Array(5).fill(productInfo.img);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-4xl font-semibold">{productInfo.productName}</h2>
      <p className="text-xl font-semibold">${productInfo.price}</p>
      <p className="text-base text-gray-600">{productInfo.des}</p>
      <p className="text-sm">Be the first to leave a review.</p>

      {/* Colors */}
      <div className="font-medium text-lg">
        <span className="font-normal">Colors:</span>
        <div className="flex gap-2 mt-2">
          {productInfo.colors && productInfo.colors.map((color, index) => (
            <span
              key={index}
              className={`w-6 h-6 rounded-full cursor-pointer ${selectedColor === color ? 'border-2 border-black' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            ></span>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="font-medium text-lg mt-4">
        <span className="font-normal">Sizes:</span>
        <div className="flex gap-2 mt-2">
          {productInfo.sizes && productInfo.sizes.map((size, index) => (
            <span
              key={index}
              className={`px-3 py-1 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200 ${selectedSize === size ? 'bg-gray-200' : ''}`}
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </span>
          ))}
        </div>
      </div>

      {/* Image Gallery */}
      <div className="flex gap-4 overflow-x-auto mt-4">
        {mockImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Product image ${index + 1}`}
            className="w-32 h-32 object-cover rounded-md"
          />
        ))}
      </div>

      <button
        onClick={() =>
          dispatch(
            addToCart({
              _id: productInfo.id,
              name: productInfo.productName,
              quantity: 1,
              image: productInfo.img,
              badge: productInfo.badge,
              price: productInfo.price,
              color: selectedColor,
              size: selectedSize,
            })
          )
        }
        className="w-full py-4 bg-primeColor hover:bg-black duration-300 text-white text-lg font-titleFont mt-4"
      >
        Add to Cart
      </button>
      <p className="font-normal text-sm mt-4">
        <span className="text-base font-medium"> Categories:</span> Spring
        collection, Streetwear, Women Tags: featured SKU: N/A
      </p>
    </div>
  );
};

export default ProductInfo;