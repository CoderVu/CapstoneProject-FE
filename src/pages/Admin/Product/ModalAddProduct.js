import React, { useState, useEffect } from "react";
import axios from "../../../redux/setup/axios";
import { useDispatch, useSelector } from "react-redux";
import { getProductDetail } from "../../../redux/actions/productActions";
import { getCategories } from "../../../redux/actions/categoryAction";
import { getAllBrands } from "../../../redux/actions/brandAction";
import { showSuccessToast, showErrorToast } from "../../../components/Toast/ToastNotification";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Plus, Tag, DollarSign, Bookmark, Check } from "lucide-react";

const colorOptions = [
  { name: "Black", value: "Black", hex: "#000000" },
  { name: "White", value: "White", hex: "#FFFFFF" },
  { name: "Red", value: "Red", hex: "#FF0000" },
  { name: "Blue", value: "Blue", hex: "#0000FF" },
  { name: "Green", value: "Green", hex: "#008000" },
  { name: "Yellow", value: "Yellow", hex: "#FFFF00" },
  
];

const getColorHex = (colorName) => {
  const color = colorOptions.find((c) => c.name === colorName);
  return color ? color.hex : "#FFFFFF";
};

const AddProductForm = ({ isOpen, onRequestClose }) => {
  const categories = useSelector((state) => state.category.categories);
  const brands = useSelector((state) => state.brand.brands);
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    colorImages: {},
  });


  const [imageInputs, setImageInputs] = useState([{ file: null, color: "" }]);
  const [previewImages, setPreviewImages] = useState([]);

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
    const file = e.target.files[0];
    newImageInputs[index].file = file;
    setImageInputs(newImageInputs);

    // Create preview URL
    if (file) {
      const newPreviews = [...previewImages];
      newPreviews[index] = URL.createObjectURL(file);
      setPreviewImages(newPreviews);
    }
  };

  const handleColorChange = (index, e) => {
    const newImageInputs = [...imageInputs];
    newImageInputs[index].color = e.target.value;
    setImageInputs(newImageInputs);
  };

  const handleAddImageInput = () => {
    setImageInputs([...imageInputs, { file: null, color: "" }]);
    setPreviewImages([...previewImages, null]);
  };

  const handleRemoveImageInput = (index) => {
    // Revoke object URL to prevent memory leaks
    if (previewImages[index]) {
      URL.revokeObjectURL(previewImages[index]);
    }

    setImageInputs(imageInputs.filter((_, i) => i !== index));
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

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
    } catch (error) {
      console.error("Error adding product:", error);
      showErrorToast(error.response?.data?.message || "Có lỗi xảy ra khi thêm sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      dispatch(getCategories());
      dispatch(getAllBrands());
    }

    // Cleanup function to prevent memory leaks
    return () => {
      previewImages.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [isOpen, dispatch]);

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewImages.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onRequestClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-4">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center">
                <Plus className="mr-2 h-6 w-6 text-blue-500" />
                Thêm sản phẩm mới
              </h2>
              <button
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={onRequestClose}
              >
                <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  {/* Thông tin cơ bản */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="productName"
                      value={productData.productName}
                      onChange={handleChange}
                      placeholder="Nhập tên sản phẩm"
                      required
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mô tả sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={productData.description}
                      onChange={handleChange}
                      placeholder="Mô tả chi tiết về sản phẩm"
                      required
                      rows={4}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Giá gốc (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="number"
                          name="price"
                          value={productData.price}
                          onChange={handleChange}
                          placeholder="0"
                          required
                          min="0"
                          className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Giá khuyến mãi (VNĐ)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="number"
                          name="discountPrice"
                          value={productData.discountPrice}
                          onChange={handleChange}
                          placeholder="0"
                          min="0"
                          className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Danh mục <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <select
                          name="categoryName"
                          value={productData.categoryName}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                        >
                          <option value="">Chọn danh mục</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Thương hiệu <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Bookmark className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <select
                          name="brandName"
                          value={productData.brandName}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                        >
                          <option value="">Chọn thương hiệu</option>
                          {brands.map((brand) => (
                            <option key={brand.id} value={brand.brandName}>
                              {brand.brandName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Giới tính
                    </label>
                    <select
                      name="gender"
                      value={productData.gender}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Trạng thái sản phẩm</h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            name="onSale"
                            checked={productData.onSale}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className={`w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full shadow-inner transition-colors ${productData.onSale ? 'bg-green-500 dark:bg-green-600' : ''}`}></div>
                          <div className={`absolute w-4 h-4 bg-white rounded-full shadow inset-y-0 left-0 m-0.5 transition-transform ${productData.onSale ? 'transform translate-x-5' : ''}`}></div>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">Đang giảm giá</span>
                      </label>

                      <label className="flex items-center space-x-3 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            name="bestSeller"
                            checked={productData.bestSeller}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className={`w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full shadow-inner transition-colors ${productData.bestSeller ? 'bg-green-500 dark:bg-green-600' : ''}`}></div>
                          <div className={`absolute w-4 h-4 bg-white rounded-full shadow inset-y-0 left-0 m-0.5 transition-transform ${productData.bestSeller ? 'transform translate-x-5' : ''}`}></div>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">Sản phẩm bán chạy</span>
                      </label>

                      <label className="flex items-center space-x-3 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            name="newProduct"
                            checked={productData.newProduct}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className={`w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full shadow-inner transition-colors ${productData.newProduct ? 'bg-green-500 dark:bg-green-600' : ''}`}></div>
                          <div className={`absolute w-4 h-4 bg-white rounded-full shadow inset-y-0 left-0 m-0.5 transition-transform ${productData.newProduct ? 'transform translate-x-5' : ''}`}></div>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">Sản phẩm mới</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Hình ảnh sản phẩm <span className="text-red-500">*</span>
                    </h3>
                    <div className="space-y-3">
                      {imageInputs.map((input, index) => (
                        <motion.div
                          key={index}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Ảnh {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveImageInput(index)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900 text-red-500 rounded-full transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                              <label className={`
                                flex justify-center items-center border-2 border-dashed rounded-lg h-24
                                ${previewImages[index] ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}
                                cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                              `}>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageInputChange(index, e)}
                                  className="hidden"
                                />

                                {previewImages[index] ? (
                                  <div className="relative w-full h-full">
                                    <img
                                      src={previewImages[index]}
                                      alt="Preview"
                                      className="w-full h-full object-contain p-2"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition-opacity">
                                      <Upload className="h-6 w-6 text-white opacity-0 hover:opacity-100" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center">
                                    <Upload className="w-8 h-8 mx-auto text-gray-400" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tải ảnh lên</p>
                                  </div>
                                )}
                              </label>
                            </div>

                            <select
                              value={input.color}
                              onChange={(e) => handleColorChange(index, e)}
                              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                              <option value="">Chọn màu</option>
                              {colorOptions.map((color) => (
                                <option key={color.value} value={color.value} style={{ backgroundColor: color.hex, color: "#fff" }}>
                                  {color.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </motion.div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddImageInput}
                        className="w-full p-3 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Thêm ảnh khác
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t dark:border-gray-700 mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onRequestClose}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    px-6 py-2.5 rounded-lg text-white 
                    ${isSubmitting
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'}
                    transition-colors flex items-center
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-1" />
                      Thêm sản phẩm
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddProductForm;