import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProductDetail } from "../../../redux/actions/productActions";
import { getAllColors } from "../../../redux/actions/colorAction";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag,
  ArrowLeft,
  ShoppingBag,
  Archive,
  BarChart2,
  DollarSign,
  Box,
  Image,
  Info,
  Heart,
  AlertCircle,
  Layers,
  Save,
  X
} from "lucide-react";
import ModalUpdateProduct from "./ModalEditProduct";
import ModalAddVariant from "./ModalAddVariant";
import ModalEditVariant from "./ModalEditVariant";
import ModalEditProductDesciption from "./ModalEditProductDesciption";
import ModalAddProductDescription from "./ModalAddProductDescription";
import ModalAddCareInstruction from "./ModalAddCareInstruction";
import ModalEditProductCareInstruction from "./ModalEditProductCareInstruction";
import { deleteVariantProduct } from "../../../redux/service/productService";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const product = useSelector((state) => state.productDetail.productDetail);
  const productDescription = useSelector((state) => state.productDescription.productDescription);
  const productCareInstructions = useSelector((state) => state.productCareInstructions.productCareInstructions);
  const { colors } = useSelector((state) => state.color);
  const [isLoading, setIsLoading] = useState(true);
  const [variantList, setVariantList] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [careInstructionError, setCareInstructionError] = useState(false);
  const [productDescriptionError, setProductDescriptionError] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    variants: true,
    images: true,
    actions: true
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState(null);
  const [modalState, setModalState] = useState({
    editProduct: false,
    addVariant: false,
    editVariant: false,
    editDescription: false,
    addDescription: false,
    addCareInstruction: false,
    editCareInstruction: false,
  });

  useEffect(() => {
    const fetchProductDetail = async () => {
      setIsLoading(true);
      try {
        await dispatch(getProductDetail(id));
        await dispatch(getAllColors());
        setCareInstructionError(false);
        setProductDescriptionError(false);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setCareInstructionError(true);
          setProductDescriptionError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetail();
  }, [dispatch, id]);

  useEffect(() => {
    if (product && product.variants) {
      setVariantList(product.variants);
    }
  }, [product]);

  // Update error states based on productDescription and productCareInstructions
  useEffect(() => {
    setProductDescriptionError(productDescription === null);
  }, [productDescription]);

  useEffect(() => {
    setCareInstructionError(productCareInstructions === null);
  }, [productCareInstructions]);

  // Helper function to get color code by color name
  const getColorCode = (colorName) => {
    const color = colors.find(c => c.color === colorName);
    return color ? color.colorCode : "#FFFFFF";
  };

  // Helper function to get color name by color code
  const getColorName = (colorCode) => {
    const color = colors.find(c => c.colorCode === colorCode);
    return color ? color.color : "Unknown";
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleEditVariant = (variant) => {
    setSelectedVariant(variant);
    setModalState((prev) => ({ ...prev, editVariant: true }));
  };

  const openDeleteVariantConfirmation = (variant) => {
    setVariantToDelete(variant);
    setIsDeleting(true);
  };

  const handleDeleteVariant = async () => {
    try {
      await deleteVariantProduct(variantToDelete.id);
      setVariantList((prev) => prev.filter((variant) => variant.id !== variantToDelete.id));
      dispatch(getProductDetail(id));
      setIsDeleting(false);
    } catch (error) {
      console.error("Failed to delete variant:", error);
    }
  };

  const handleCloseModal = (modalName) => {
    setModalState((prev) => ({ ...prev, [modalName]: false }));
    dispatch(getProductDetail(id));
  };

  // Group variants by color
  const variantsByColor = variantList.reduce((acc, variant) => {
    if (!acc[variant.color]) acc[variant.color] = [];
    acc[variant.color].push(variant);
    return acc;
  }, {});

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-3 text-gray-600">Đang tải thông tin sản phẩm...</span>
    </div>
  );

  if (!product || !product.productName) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-2">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <span className="text-gray-600">Không tìm thấy thông tin sản phẩm</span>
      </div>
    </div>
  );

  const SectionTitle = ({ title, section, icon: Icon }) => (
    <div
      className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors rounded-t-lg"
      onClick={() => toggleSection(section)}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-600" />
        <h3 className="font-medium text-gray-800">{title}</h3>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-gray-500" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-500" />
      )}
    </div>
  );

  const ActionButton = ({ onClick, icon: Icon, label, bgColor = "bg-blue-500", hoverColor = "hover:bg-blue-600" }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 ${bgColor} ${hoverColor} text-white rounded-lg transition-colors focus:ring-2 focus:ring-offset-1 focus:outline-none`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/products')}
                className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{product.productName}</h1>
                <p className="text-sm text-gray-500">Quản lý chi tiết sản phẩm</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setModalState(prev => ({ ...prev, editProduct: true }))}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Edit className="w-4 h-4" />
                <span>Chỉnh sửa sản phẩm</span>
              </button>
              <button
                onClick={() => setModalState(prev => ({ ...prev, addVariant: true }))}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm biến thể</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Basic Info & Variants */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Product Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Info className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
                    <p className="text-sm text-gray-600">Chi tiết sản phẩm và phân loại</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: <Tag className="w-5 h-5 text-blue-500" />,
                      label: "Mô tả",
                      value: product.description || "Chưa có mô tả",
                      bgColor: "bg-blue-50",
                      iconBg: "bg-blue-100"
                    },
                    {
                      icon: <DollarSign className="w-5 h-5 text-green-500" />,
                      label: "Giá gốc",
                      value: product.price ?
                        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price) :
                        "Chưa có giá",
                      bgColor: "bg-green-50",
                      iconBg: "bg-green-100"
                    },
                    {
                      icon: <BarChart2 className="w-5 h-5 text-red-500" />,
                      label: "Giá khuyến mãi",
                      value: product.discountPrice ?
                        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.discountPrice) :
                        "Không có khuyến mãi",
                      bgColor: "bg-red-50",
                      iconBg: "bg-red-100"
                    },
                    {
                      icon: <Archive className="w-5 h-5 text-purple-500" />,
                      label: "Danh mục",
                      value: product.categoryName || "Chưa phân loại",
                      bgColor: "bg-purple-50",
                      iconBg: "bg-purple-100"
                    },
                    {
                      icon: <ShoppingBag className="w-5 h-5 text-orange-500" />,
                      label: "Thương hiệu",
                      value: product.brandName || "Chưa có thương hiệu",
                      bgColor: "bg-orange-50",
                      iconBg: "bg-orange-100"
                    },
                    {
                      icon: <Box className="w-5 h-5 text-indigo-500" />,
                      label: "Trạng thái",
                      value: (
                        <div className="flex flex-wrap gap-2">
                          {product.onSale && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-200">
                              Đang giảm giá
                            </span>
                          )}
                          {product.bestSeller && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium border border-yellow-200">
                              Bán chạy
                            </span>
                          )}
                          {product.newProduct && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">
                              Sản phẩm mới
                            </span>
                          )}
                          {!product.onSale && !product.bestSeller && !product.newProduct && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                              Bình thường
                            </span>
                          )}
                        </div>
                      ),
                      bgColor: "bg-indigo-50",
                      iconBg: "bg-indigo-100"
                    },
                    {
                      icon: <Layers className="w-5 h-5 text-pink-500" />,
                      label: "Giới tính",
                      value: (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          product.gender === 'male' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          product.gender === 'female' ? 'bg-pink-100 text-pink-700 border-pink-200' :
                          product.gender === 'kids' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                          'bg-gray-100 text-gray-700 border-gray-200'
                        }`}>
                          {product.gender === 'male' ? 'Nam' :
                           product.gender === 'female' ? 'Nữ' :
                           product.gender === 'kids' ? 'Trẻ em' :
                           'Unisex'}
                        </span>
                      ),
                      bgColor: "bg-pink-50",
                      iconBg: "bg-pink-100"
                    },
                  ].map((item, index) => (
                    <div key={index} className={`${item.bgColor} rounded-xl p-4 border border-gray-100`}>
                      <div className="flex items-start gap-3">
                        <div className={`${item.iconBg} p-2 rounded-lg`}>
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-2 font-medium">{item.label}</p>
                          <div className="text-gray-900 font-semibold">{item.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  {productDescription !== null ? (
                    <button
                      onClick={() => setModalState(prev => ({ ...prev, editDescription: true }))}
                      className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Sửa mô tả chi tiết</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setModalState(prev => ({ ...prev, addDescription: true }))}
                      className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm mô tả chi tiết</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Variants Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Box className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Biến thể sản phẩm</h3>
                    <p className="text-sm text-gray-600">Quản lý màu sắc và kích thước</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {Object.keys(variantsByColor).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(variantsByColor).map(([color, variants]) => (
                      <div key={color} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                        <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                              style={{
                                backgroundColor: getColorCode(color),
                              }}
                            ></div>
                            <span className="font-semibold text-gray-900">{color}</span>
                          </div>
                          <span className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-sm font-medium">
                            {variants.length} kích cỡ
                          </span>
                        </div>

                        <div className="divide-y divide-gray-200">
                          {variants.map((variant) => (
                            <div key={variant.id} className="p-4 bg-white hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                                    {variant.sizeName}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-600">Số lượng:</span>
                                    <span className="font-semibold text-gray-900">{variant.quantity}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEditVariant(variant)}
                                    className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                                    title="Chỉnh sửa"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openDeleteVariantConfirmation(variant)}
                                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                    title="Xóa"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Box className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không có biến thể</h3>
                    <p className="text-gray-600 mb-6">Sản phẩm này chưa có biến thể nào</p>
                    <button
                      onClick={() => setModalState(prev => ({ ...prev, addVariant: true }))}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm biến thể đầu tiên</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column - Images and Actions */}
          <div className="space-y-8">
            {/* Product Images */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Image className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Hình ảnh sản phẩm</h3>
                    <p className="text-sm text-gray-600">Quản lý hình ảnh và màu sắc</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Hình ảnh chính:</p>
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50">
                    <img
                      src={product.mainImage.path}
                      alt={product.productName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {product.images && product.images.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Hình ảnh khác ({product.images.length}):
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {product.images.map((image) => (
                        <div key={image.id} className="relative group">
                          <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50">
                            <img
                              src={image.path}
                              alt="Product"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {image.color && (
                            <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black bg-opacity-80 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm">
                              <div
                                className="w-3 h-3 rounded-full border border-white"
                                style={{
                                  backgroundColor: getColorCode(image.color),
                                }}
                              ></div>
                              <span className="font-medium">{image.color}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>Không có hình ảnh bổ sung</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Layers className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Thao tác nhanh</h3>
                    <p className="text-sm text-gray-600">Quản lý mô tả và hướng dẫn</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  {productCareInstructions !== null ? (
                    <button
                      onClick={() => setModalState(prev => ({ ...prev, editCareInstruction: true }))}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Cập nhật hướng dẫn chăm sóc</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setModalState(prev => ({ ...prev, addCareInstruction: true }))}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm hướng dẫn chăm sóc</span>
                    </button>
                  )}
                </div>

                {/* Error notifications */}
                <div className="mt-6 space-y-3">
                  {careInstructionError && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 mb-1">Thiếu hướng dẫn chăm sóc</p>
                        <p className="text-sm text-yellow-700">
                          Sản phẩm này chưa có hướng dẫn chăm sóc. Vui lòng thêm hướng dẫn.
                        </p>
                      </div>
                    </div>
                  )}

                  {productDescriptionError && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 mb-1">Thiếu mô tả chi tiết</p>
                        <p className="text-sm text-yellow-700">
                          Sản phẩm này chưa có mô tả chi tiết. Vui lòng thêm mô tả.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isDeleting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Xác nhận xóa biến thể</h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa biến thể màu "{variantToDelete?.color}" kích cỡ "{variantToDelete?.sizeName}"? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleting(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteVariant}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                >
                  Xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Other Modals */}
      <ModalUpdateProduct isOpen={modalState.editProduct} onRequestClose={() => handleCloseModal("editProduct")} product={product} />
      <ModalAddVariant isOpen={modalState.addVariant} onRequestClose={() => handleCloseModal("addVariant")} productId={product.id} />
      <ModalEditVariant isOpen={modalState.editVariant} onRequestClose={() => handleCloseModal("editVariant")} productId={product.id} variant={selectedVariant} onSubmit={(updatedVariant) => {
        const updatedVariants = variantList.map((v) => (v.id === updatedVariant.id ? updatedVariant : v));
        setVariantList(updatedVariants);
      }} />

      {/* Conditionally render modals based on whether data exists */}
      {productDescription !== null ? (
        <ModalEditProductDesciption
          isOpen={modalState.editDescription}
          onRequestClose={() => handleCloseModal("editDescription")}
          productId={product.id}
          productDescription={productDescription}
        />
      ) : (
        <ModalAddProductDescription
          isOpen={modalState.addDescription}
          onRequestClose={() => handleCloseModal("addDescription")}
          product={product}
        />
      )}

      {productCareInstructions !== null ? (
        <ModalEditProductCareInstruction
          isOpen={modalState.editCareInstruction}
          onRequestClose={() => handleCloseModal("editCareInstruction")}
          productId={product.id}
          productCareInstructions={productCareInstructions}
        />
      ) : (
        <ModalAddCareInstruction
          isOpen={modalState.addCareInstruction}
          onRequestClose={() => handleCloseModal("addCareInstruction")}
          product={product}
        />
      )}
    </div>
  );
};

export default ProductDetail;
