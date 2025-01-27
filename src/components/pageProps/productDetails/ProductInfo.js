import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../redux/orebiSlice";

const ProductInfo = ({ productInfo }) => {
  const dispatch = useDispatch();
  const [selectedColor, setSelectedColor] = useState(productInfo.colorCodes ? productInfo.colorCodes[0] : "");
  const [selectedSize, setSelectedSize] = useState(productInfo.sizeId || "");
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-4xl font-semibold">{productInfo.productName}</h2>
      <p className="text-xl font-semibold">${productInfo.price}</p>
      <p className="text-base text-gray-600">{productInfo.description}</p>
      <p className="text-sm">Be the first to leave a review.</p>

      {/* Colors */}
      <div className="font-medium text-lg">
        <span className="font-normal">Colors:</span>
        <div className="flex gap-2 mt-2">
          {productInfo.colorCodes &&
            productInfo.colorCodes.map((colorCode, index) => (
              <span
                key={index}
                className={`w-6 h-6 rounded-full cursor-pointer ${selectedColor === colorCode ? "border-2 border-black" : ""
                  }`}
                style={{ backgroundColor: colorCode }}
                onClick={() => setSelectedColor(colorCode)}
              ></span>
            ))}
        </div>
      </div>

      {/* Size */}
      <div className="font-medium text-lg mt-4">
        <span className="font-normal">Size:</span>
        <div className="flex gap-2 mt-2">
          {Array.isArray(productInfo.sizeNames) &&
            productInfo.sizeNames.map((size) => (
              <span
                key={size}
                className={`px-3 py-1 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200 ${selectedSize === size ? "bg-gray-200" : ""
                  }`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </span>
            ))}
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {productInfo.images &&
          productInfo.images.map((image, index) => (
            <div
              key={index}
              className={`w-full h-32 border rounded-md cursor-pointer overflow-hidden ${selectedImage === image.path ? "border-2 border-black" : "border-gray-300"
                }`}
              onClick={() => setSelectedImage(image.path)} // Set selected image
            >
              <img
                src={image.path}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
      </div>

      {/* Modal for viewing image */}
      {selectedImage && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Selected product"
              className="w-auto max-h-screen rounded-md"
            />
            <button
              onClick={() => setSelectedImage(null)} // Close modal
              className="absolute top-2 right-2 bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() =>
          dispatch(
            addToCart({
              id: productInfo.id,
              name: productInfo.productName,
              quantity: 1,
              image: productInfo.mainImage?.path,
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
        <span className="text-base font-medium">Categories:</span> {productInfo.categoryId}
        <br />
        <span className="text-base font-medium">Brand:</span> {productInfo.brandId}
      </p>
    </div>
  );
};

export default ProductInfo;
