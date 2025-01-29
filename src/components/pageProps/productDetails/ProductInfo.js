import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../redux/orebiSlice";

const ProductInfo = ({ productInfo }) => {
  const dispatch = useDispatch();
  const [selectedColor, setSelectedColor] = useState(productInfo.variants[0]?.color || "");
  const [selectedSize, setSelectedSize] = useState(productInfo.variants[0]?.sizeName || "");
  const [selectedImage, setSelectedImage] = useState(null); // Quản lý ảnh được chọn
  const [isImageModalOpen, setImageModalOpen] = useState(false); // Quản lý modal

  // Tìm variant được chọn dựa trên color và size
  const selectedVariant = productInfo.variants.find(
    (variant) => variant.color === selectedColor && variant.sizeName === selectedSize
  );

  return (
    <div className="flex flex-col gap-y-4">
      <h2 className="text-3xl font-semibold">{productInfo.productName}</h2>
      <p className="text-lg font-semibold">${productInfo.price}</p>
      <p className="text-base text-gray-600">{productInfo.description}</p>
      <p className="text-sm text-gray-500">Be the first to leave a review.</p>

      {/* Colors */}
      <div className="font-medium text-base">
        <span className="font-normal">Colors:</span>
        <div className="flex gap-x-2 gap-y-2 mt-1 flex-wrap">
          {productInfo.variants &&
            [...new Set(productInfo.variants.map((variant) => variant.color))].map((color, index) => (
              <span
                key={index}
                className={`w-6 h-6 cursor-pointer ${
                  selectedColor === color ? "border-2 border-black" : "border border-gray-300"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              ></span>
            ))}
        </div>
      </div>

      {/* Size */}
      <div className="font-medium text-base">
        <span className="font-normal">Size:</span>
        <div className="flex gap-x-2 gap-y-2 mt-1 flex-wrap">
          {Array.isArray(productInfo.variants) &&
            [...new Set(productInfo.variants.map((variant) => variant.sizeName))].map((sizeName, index) => (
              <span
                key={index}
                className={`px-3 py-1 border border-gray-300 rounded-md cursor-pointer ${
                  selectedSize === sizeName ? "bg-gray-200" : ""
                }`}
                onClick={() => setSelectedSize(sizeName)}
              >
                {sizeName}
              </span>
            ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="font-medium text-base">
        <span className="font-normal">Quantity:</span>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-3 py-1 border border-gray-300 rounded-md">
            {selectedVariant?.quantity || 0}
          </span>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        {productInfo.images &&
          productInfo.images.map((image, index) => (
            <div
              key={index}
              className={`w-full h-28 border rounded-md cursor-pointer overflow-hidden ${
                selectedImage === image.path ? "border-2 border-black" : "border-gray-300"
              }`}
              onClick={() => {
                setSelectedImage(image.path);
                setImageModalOpen(true); // Mở modal khi ảnh được chọn
              }}
            >
              <img
                src={image.path}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
      </div>

      {/* Modal xem ảnh */}
      {isImageModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Selected product"
              className="max-w-full max-h-screen rounded-md"
            />
            <button
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white rounded-full text-black font-bold"
              onClick={() => setImageModalOpen(false)} // Đóng modal
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Add to Cart and Buy Now Buttons */}
      <div className="flex gap-4 mt-2">
        <button
          onClick={() =>
            dispatch(
              addToCart({
                id: productInfo.id,
                name: productInfo.productName,
                quantity: 1,
                availableQuantity: selectedVariant?.quantity || 0,
                image: productInfo.mainImage?.path,
                price: productInfo.price,
                color: selectedColor,
                size: selectedSize,
              })
            )
          }
          className="flex-1 py-3 bg-primeColor hover:bg-black duration-300 text-white text-base font-titleFont"
        >
          Add to Cart
        </button>
        <button className="flex-1 py-3 bg-black hover:bg-primeColor duration-300 text-white text-base font-titleFont">
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductInfo;
