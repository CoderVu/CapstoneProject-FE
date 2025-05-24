import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProductDetail } from "../../../redux/actions/productActions";
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{product.productName}</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionButton
            onClick={() => setModalState(prev => ({ ...prev, editProduct: true }))}
            icon={Edit}
            label="Chỉnh sửa sản phẩm"
          />
          <ActionButton
            onClick={() => setModalState(prev => ({ ...prev, addVariant: true }))}
            icon={Plus}
            label="Thêm biến thể"
            bgColor="bg-green-500"
            hoverColor="hover:bg-green-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Product Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <SectionTitle title="Thông tin cơ bản" section="basicInfo" icon={Info} />

            <AnimatePresence>
              {expandedSections.basicInfo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        icon: <Tag className="w-5 h-5 text-blue-500" />,
                        label: "Mô tả",
                        value: product.description || "Chưa có mô tả"
                      },
                      {
                        icon: <DollarSign className="w-5 h-5 text-green-500" />,
                        label: "Giá gốc",
                        value: product.price ?
                          new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price) :
                          "Chưa có giá"
                      },
                      {
                        icon: <BarChart2 className="w-5 h-5 text-indigo-500" />,
                        label: "Giá khuyến mãi",
                        value: product.discountPrice ?
                          new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.discountPrice) :
                          "Không có khuyến mãi"
                      },
                      {
                        icon: <Archive className="w-5 h-5 text-amber-500" />,
                        label: "Danh mục",
                        value: product.categoryName || "Chưa phân loại"
                      },
                      {
                        icon: <ShoppingBag className="w-5 h-5 text-red-500" />,
                        label: "Thương hiệu",
                        value: product.brandName || "Chưa có thương hiệu"
                      },
                      {
                        icon: <Box className="w-5 h-5 text-purple-500" />,
                        label: "Trạng thái",
                        value: (
                          <div className="flex flex-wrap gap-2">
                            {product.onSale && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                Đang giảm giá
                              </span>
                            )}
                            {product.bestSeller && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                Bán chạy
                              </span>
                            )}
                            {product.newProduct && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                Sản phẩm mới
                              </span>
                            )}
                            {!product.onSale && !product.bestSeller && !product.newProduct && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                Bình thường
                              </span>
                            )}
                          </div>
                        )
                      },
                      {
                        icon: <Layers className="w-5 h-5 text-orange-500" />,
                        label: "Giới tính",
                        value: (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.gender === 'male' ? 'bg-blue-100 text-blue-700' :
                            product.gender === 'female' ? 'bg-pink-100 text-pink-700' :
                            product.gender === 'kids' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {product.gender === 'male' ? 'Nam' :
                             product.gender === 'female' ? 'Nữ' :
                             product.gender === 'kids' ? 'Trẻ em' :
                             'Unisex'}
                          </span>
                        )
                      },
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 border p-3 rounded-lg bg-white shadow-sm">
                        <div className="mt-0.5">{item.icon}</div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                          <div className="font-medium text-gray-800">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 p-4 pt-0">
                    {productDescription !== null ? (
                      <ActionButton
                        onClick={() => setModalState(prev => ({ ...prev, editDescription: true }))}
                        icon={Edit}
                        label="Sửa mô tả chi tiết"
                        bgColor="bg-amber-500"
                        hoverColor="hover:bg-amber-600"
                      />
                    ) : (
                      <ActionButton
                        onClick={() => setModalState(prev => ({ ...prev, addDescription: true }))}
                        icon={Plus}
                        label="Thêm mô tả chi tiết"
                        bgColor="bg-green-500"
                        hoverColor="hover:bg-green-600"
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Variants Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <SectionTitle title="Biến thể sản phẩm" section="variants" icon={Box} />

            <AnimatePresence>
              {expandedSections.variants && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4"
                >
                  {Object.keys(variantsByColor).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(variantsByColor).map(([color, variants]) => (
                        <div key={color} className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{
                                  backgroundColor:
                                    color.toLowerCase() === 'đen' ? '#000' :
                                    color.toLowerCase() === 'trắng' ? '#fff' :
                                    color.toLowerCase() === 'đỏ' ? '#f00' :
                                    color.toLowerCase() === 'xanh' ? '#00f' :
                                    color.toLowerCase() === 'vàng' ? '#ff0' :
                                    color.toLowerCase() === 'xanh lá' ? '#0f0' :
                                    '#ccc',
                                  border: color.toLowerCase() === 'trắng' ? '1px solid #ccc' : 'none'
                                }}
                              ></div>
                              <span className="font-medium">{color}</span>
                            </div>
                            <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                              {variants.length} kích cỡ
                            </span>
                          </div>

                          <div className="divide-y divide-gray-200">
                            {variants.map((variant) => (
                              <div key={variant.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                    {variant.sizeName}
                                  </span>
                                  <span className="text-gray-700">
                                    Số lượng: <span className="font-medium">{variant.quantity}</span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEditVariant(variant)}
                                    className="p-1.5 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openDeleteVariantConfirmation(variant)}
                                    className="p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <Box className="w-12 h-12 text-gray-300 mb-2" />
                      <p>Không có biến thể nào cho sản phẩm này</p>
                      <button
                        onClick={() => setModalState(prev => ({ ...prev, addVariant: true }))}
                        className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Thêm biến thể</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right column - Images and Actions */}
        <div className="space-y-6">
          {/* Product Images */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <SectionTitle title="Hình ảnh sản phẩm" section="images" icon={Image} />

            <AnimatePresence>
              {expandedSections.images && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4"
                >
                  <div className="mb-4">
                    <p className="text-gray-500 text-sm mb-2">Hình ảnh chính:</p>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={product.mainImage.path}
                        alt={product.productName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {product.images && product.images.length > 0 ? (
                    <div>
                      <p className="text-gray-500 text-sm mb-2">Hình ảnh khác ({product.images.length}):</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {product.images.map((image) => (
                          <div key={image.id} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                              <img
                                src={image.path}
                                alt="Product"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {image.color && (
                              <span className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-0.5 rounded">
                                {image.color}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      Không có hình ảnh bổ sung.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <SectionTitle title="Thao tác nhanh" section="actions" icon={Layers} />

            <AnimatePresence>
              {expandedSections.actions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4"
                >
                  <div className="space-y-2">
                    {productCareInstructions !== null ? (
                      <ActionButton
                        onClick={() => setModalState(prev => ({ ...prev, editCareInstruction: true }))}
                        icon={Edit}
                        label="Cập nhật hướng dẫn chăm sóc"
                        bgColor="bg-indigo-500"
                        hoverColor="hover:bg-indigo-600"
                      />
                    ) : (
                      <ActionButton
                        onClick={() => setModalState(prev => ({ ...prev, addCareInstruction: true }))}
                        icon={Plus}
                        label="Thêm hướng dẫn chăm sóc"
                        bgColor="bg-green-500"
                        hoverColor="hover:bg-green-600"
                      />
                    )}
                  </div>

                  {/* Error notifications */}
                  <div className="mt-4 space-y-3">
                    {careInstructionError && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-700">
                          Sản phẩm này chưa có hướng dẫn chăm sóc. Vui lòng thêm hướng dẫn.
                        </p>
                      </div>
                    )}

                    {productDescriptionError && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-700">
                          Sản phẩm này chưa có mô tả chi tiết. Vui lòng thêm mô tả.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
