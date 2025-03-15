import React, { useState } from "react";
import axios from "../../../redux/setup/axios";
import { useDispatch, useSelector } from "react-redux";
import { getProductDetail } from "../../../redux/actions/productActions";
import { getCategories } from "../../../redux/actions/categoryAction";
import { getAllBrands } from "../../../redux/actions/brandAction";
import { useEffect } from "react";

import { showSuccessToast, showErrorToast } from "../../../components/Toast/ToastNotification";
const AddProductForm = ({ isOpen, onRequestClose }) => {
  const categories = useSelector((state) => state.category.categories);
  const brands = useSelector((state) => state.brand.brands);
  const dispatch = useDispatch();
  const [productData, setProductData] = useState({
    productName: "",
    description: "",
    price: 0,
    discountPrice: 0,
    onSale: false,
    bestSeller: false,
    categoryName: "",
    gender: "",
    brandName: "",
    newProduct: false,
    imageFiles: [],
    colorImages: {}, // Add this line
  });
  const [imageInputs, setImageInputs] = useState([{ file: null, color: "" }]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setProductData({ ...productData, [name]: checked });
    } else if (type === "file") {
      setProductData({ ...productData, [name]: Array.from(files) });
    } else {
      setProductData({ ...productData, [name]: value });
    }
  };

  const handleImageInputChange = (index, e) => {
    const newImageInputs = [...imageInputs];
    newImageInputs[index].file = e.target.files[0];
    setImageInputs(newImageInputs);
  };

  const handleColorChange = (index, e) => {
    const newImageInputs = [...imageInputs];
    newImageInputs[index].color = e.target.value;
    setImageInputs(newImageInputs);
  };

  const handleAddImageInput = () => {
    setImageInputs([...imageInputs, { file: null, color: "" }]);
  };

  const handleRemoveImageInput = (index) => {
    setImageInputs(imageInputs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      for (const key in productData) {
        if (key === "imageFiles") {
          productData[key].forEach((file) => formData.append(key, file));
        } else if (key === "colorImages") {
          for (const color in productData[key]) {
            productData[key][color].forEach((file) => formData.append(`colorImages[${color}]`, file));
          }
        } else {
          formData.append(key, productData[key]);
        }
      }

      // Add new image files from imageInputs
      imageInputs.forEach((input) => {
        if (input.file) {
          formData.append("imageFiles", input.file);
          if (!productData.colorImages[input.color]) {
            productData.colorImages[input.color] = [];
          }
          productData.colorImages[input.color].push(input.file);
        }
      });

      const response = await axios.post(
        `/api/v1/admin/products/add`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      showSuccessToast(response.data.message);
      onRequestClose();
      // Handle success (e.g., show a success message, redirect, etc.)
    } catch (error) {
      console.error("Error adding product:", error);
      showErrorToast(error.response.data.message);
      // Handle error (e.g., show an error message)
    }
  };
  useEffect(() => {
    if (isOpen) {
      dispatch(getCategories());
      dispatch(getAllBrands());
    }
  }, [isOpen, dispatch]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Thêm sản phẩm mới</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Tên sản phẩm</label>
            <input
              type="text"
              name="productName"
              value={productData.productName}
              onChange={handleChange}
              placeholder="Tên sản phẩm"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Mô tả</label>
            <textarea
              name="description"
              value={productData.description}
              onChange={handleChange}
              placeholder="Mô tả"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Giá</label>
            <input
              type="number"
              name="price"
              value={productData.price}
              onChange={handleChange}
              placeholder="Giá"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Giá khuyến mãi</label>
            <input
              type="number"
              name="discountPrice"
              value={productData.discountPrice}
              onChange={handleChange}
              placeholder="Giá khuyến mãi"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="onSale"
                checked={productData.onSale}
                onChange={handleChange}
                className="mr-2"
              />
              Đang giảm giá
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="bestSeller"
                checked={productData.bestSeller}
                onChange={handleChange}
                className="mr-2"
              />
              Bán chạy
            </label>
          </div>
          <select
            name="categoryName"
            value={productData.categoryName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <div>
            <label className="block mb-1">Giới tính</label>
            <input
              type="text"
              name="gender"
              value={productData.gender}
              onChange={handleChange}
              placeholder="Giới tính"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <select
            name="brandName"
            value={productData.brandName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.brandName}>
                {brand.brandName}
              </option>
            ))}
          </select>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="newProduct"
                checked={productData.newProduct}
                onChange={handleChange}
                className="mr-2"
              />
              Sản phẩm mới
            </label>
          </div>
          <div>
            <label className="block mb-1">Ảnh sản phẩm</label>
            {imageInputs.map((input, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="file"
                  onChange={(e) => handleImageInputChange(index, e)}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  value={input.color}
                  onChange={(e) => handleColorChange(index, e)}
                  placeholder="Màu sắc"
                  className="w-full p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImageInput(index)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddImageInput}
              className="w-full px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
            >
              + Thêm ảnh khác
            </button>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onRequestClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Thêm sản phẩm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;