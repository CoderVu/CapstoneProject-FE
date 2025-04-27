import React, { useMemo } from "react";
import { FaStar, FaRegStar, FaShoppingCart, FaEye, FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AIMatchExplainer from "./AIMatchExplainer"; // Import the component

/**
 * Component hiển thị kết quả tìm kiếm sản phẩm tương tự bằng AI
 */
const AISimilarProducts = ({
  showSimilarProducts,
  setShowSimilarProducts,
  loadingSimilar,
  filteredSimilarProducts = [],
  similarityThreshold,
  setSimilarityThreshold,
  productResults = [], // Mảng sản phẩm mặc định rỗng
  errorMessage = "" // Thông báo lỗi mặc định rỗng
}) => {
  const navigate = useNavigate();

  // Định dạng giá với dấu phân cách hàng nghìn
  const formatPrice = (price) => {
    if (!price) return "0";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Hàm điều hướng đến trang chi tiết sản phẩm
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Logic nâng cao: Ghép sản phẩm với filteredSimilarProducts dựa trên đường dẫn hình ảnh
  // QUAN TRỌNG: Tất cả hooks phải được gọi trước bất kỳ lệnh return điều kiện nào
  const enhancedProductResults = useMemo(() => {
    if (!productResults?.length || !filteredSimilarProducts?.length) {
      return productResults;
    }

    return productResults.map(product => {
      // Lấy tất cả đường dẫn hình ảnh từ sản phẩm (mainImage và các hình khác)
      const productImagePaths = [
        product.mainImage?.path,
        ...(product.images?.map(img => img.path) || [])
      ].filter(Boolean); // Loại bỏ giá trị null/undefined

      // Tìm nếu bất kỳ hình ảnh nào của sản phẩm khớp với filteredSimilarProducts
      const matchingSimilarProduct = filteredSimilarProducts.find(similarProduct =>
        productImagePaths.some(imagePath =>
          imagePath === similarProduct.url ||
          // Cũng kiểm tra nếu phần tên file khớp
          imagePath.includes(similarProduct.filename?.split('.')[0])
        )
      );

      // Nếu có sự khớp, sử dụng điểm tương đồng từ filteredSimilarProducts
      if (matchingSimilarProduct) {
        return {
          ...product,
          similarity: matchingSimilarProduct.similarity,
          matchedImage: matchingSimilarProduct.url
        };
      }

      // Nếu không khớp, giữ nguyên sản phẩm gốc với điểm tương đồng của nó
      return product;
    });
  }, [productResults, filteredSimilarProducts]);

  // Lọc kết quả sản phẩm dựa trên ngưỡng tương đồng
  const filteredProductResults = useMemo(() => {
    return enhancedProductResults.filter(
      product => product.similarity <= similarityThreshold
    ).sort((a, b) => a.similarity - b.similarity); // Sắp xếp theo tương đồng, kết quả tốt nhất đầu tiên
  }, [enhancedProductResults, similarityThreshold]);

  // Ghi log kết quả sản phẩm đã xử lý
  console.log("Kết quả sản phẩm đã xử lý:", enhancedProductResults);
  console.log("Kết quả sản phẩm đã lọc:", filteredProductResults);

  // Lấy class CSS phù hợp cho nhãn phần trăm tương đồng
  const getMatchBadgeClass = (similarity) => {
    const matchPercent = (1 - similarity) * 100;
    if (matchPercent >= 90) return "from-green-600 to-green-500";
    if (matchPercent >= 70) return "from-blue-600 to-purple-600";
    if (matchPercent >= 50) return "from-blue-500 to-indigo-500";
    return "from-gray-600 to-gray-500";
  };

  // Lấy class CSS phù hợp cho thanh tiến trình tương đồng
  const getProgressBarClass = (similarity) => {
    const matchPercent = (1 - similarity) * 100;
    if (matchPercent >= 90) return "from-green-500 to-green-400";
    if (matchPercent >= 70) return "from-blue-500 to-purple-500";
    if (matchPercent >= 50) return "from-blue-400 to-indigo-500";
    return "from-gray-500 to-gray-400";
  };

  // Hàm hiển thị đánh giá sao
  const renderRating = (rating, totalRate) => {
    // Lấy giá trị đánh giá thực tế, đầu tiên kiểm tra product.rate.rating, sau đó là product.rating
    const ratingValue = typeof rating === 'object' ? (rating?.rating || 0) : (rating || 0);

    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, idx) => (
          idx < Math.floor(ratingValue) ? (
            <FaStar key={idx} className="text-yellow-400 text-xs" />
          ) : (
            <FaRegStar key={idx} className="text-gray-300 text-xs" />
          )
        ))}
        {totalRate > 0 && (
          <span className="ml-1.5 text-xs text-gray-500">({totalRate})</span>
        )}
      </div>
    );
  };

  // Nếu component không nên hiển thị, trả về null
  // QUAN TRỌNG: Lệnh return điều kiện này phải đến SAU tất cả các lệnh gọi hook
  if (!showSimilarProducts) return null;

  return (
    <div className="w-full bg-white text-black p-6 rounded-xl shadow-xl mt-6 transition-all duration-300 ease-in-out border border-gray-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-300 pb-4 gap-4">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-lg mr-4 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Kết Quả Tìm Kiếm Ảnh AI</h2>
            <p className="text-gray-500 text-sm">Tìm thấy {filteredProductResults.length || filteredSimilarProducts.length || 0} sản phẩm tương tự về mặt hình ảnh</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg flex-1 md:flex-auto">
            <span className="text-sm text-gray-600 mr-2 whitespace-nowrap">Mức độ khớp:</span>
            <select
              value={similarityThreshold}
              onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
              className="bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1"
            >
              <option value="1">Tất cả kết quả</option>
              <option value="0.5">Khớp trung bình (50%+)</option>
              <option value="0.3">Khớp cao (70%+)</option>
              <option value="0.1">Khớp hoàn hảo (90%+)</option>
            </select>
          </div>
          <button
            onClick={() => setShowSimilarProducts(false)}
            className="text-gray-600 hover:text-white bg-gray-100 hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors flex items-center whitespace-nowrap"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Đóng
          </button>
        </div>
      </div>

      {/* Thêm component AIMatchExplainer */}
      <AIMatchExplainer isOpen={false} />

      {/* Hiển thị thông báo lỗi nếu có */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hiển thị sản phẩm tương tự */}
      {loadingSimilar ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-gray-300 border-opacity-50"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          </div>
          <div className="mt-6 text-center">
            <h3 className="text-xl font-medium text-gray-800">Đang Phân Tích Ảnh</h3>
            <p className="text-gray-500 text-sm">Đang xử lý hình ảnh và tính toán mức độ tương đồng</p>
          </div>
        </div>
      ) : filteredProductResults.length > 0 ? (
        <div>
          <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  AI đã phân tích hình ảnh và tìm thấy {filteredProductResults.length} sản phẩm tương tự về mặt hình ảnh. Nhấp vào bất kỳ sản phẩm nào để xem chi tiết.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {filteredProductResults.map((product, index) => (
              <motion.div
                key={product.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-all duration-300 border border-gray-200"
                onClick={() => handleProductClick(product.id)}
              >
                {/* Phần hình ảnh sản phẩm */}
                <div className="relative overflow-hidden aspect-[3/4]">
                  {/* Sử dụng hình ảnh khớp nếu có, nếu không sử dụng hình ảnh sản phẩm thông thường */}
                  <img
                    src={product.matchedImage || product.mainImage?.path || (product.images && product.images.length > 0 ? product.images[0].path : '')}
                    alt={product.productName || `Sản phẩm tương tự ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Nhãn độ khớp - Sử dụng lớp động dựa trên phần trăm khớp */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className={`bg-gradient-to-r ${getMatchBadgeClass(product.similarity)} text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm`}>
                      Giống {((1 - product.similarity) * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* Nhãn sản phẩm */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {/* {product.newProduct && (
                      <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">Mới</span>
                    )}
                    {product.bestSeller && (
                      <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-md">Bán Chạy</span>
                    )}
                    {product.onSale && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">Giảm Giá</span>
                    )} */}
                  </div>

                  {/* Lớp phủ hành động */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-4 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-full flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Logic thêm vào giỏ hàng nếu cần
                        }}
                        className="flex-1 bg-white text-gray-900 py-1.5 text-xs font-medium rounded-md hover:bg-gray-100 transition flex items-center justify-center gap-1"
                      >
                        <FaShoppingCart className="text-xs" />
                        <span>Thêm vào giỏ</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product.id);
                        }}
                        className="flex-1 bg-blue-600 text-white py-1.5 text-xs font-medium rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-1"
                      >
                        <FaEye className="text-xs" />
                        <span>Xem chi tiết</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Thông tin sản phẩm */}
                <div className="p-4 flex flex-col gap-2">
                  {/* Tên thương hiệu nếu có */}
                  {product.brandName && (
                    <span className="text-xs text-gray-500 font-medium">{product.brandName}</span>
                  )}

                  {/* Tên sản phẩm */}
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                    {product.productName || 'Sản phẩm'}
                  </h3>

                  {/* Đánh giá - Đã sửa để xử lý đúng cấu trúc đối tượng đánh giá */}
                  {product.rate && renderRating(product.rate.rating, product.rate.totalRate)}

                  {/* Giá & Giảm giá */}
                  <div className="mt-1 flex items-baseline gap-2">
                    {product.discountPrice ? (
                      <>
                        <span className="text-xs text-gray-400 line-through font-normal">
                          {formatPrice(product.price)}đ
                        </span>
                        <span className="text-sm font-bold text-red-600">
                          {formatPrice(product.discountPrice)}đ
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-gray-900">
                        {formatPrice(product.price)}đ
                      </span>
                    )}
                  </div>

                  {/* Điểm tương đồng - Cập nhật với các lớp màu động */}
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getProgressBarClass(product.similarity)}`}
                        style={{ width: `${(1 - product.similarity) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">Độ tương đồng</span>
                      <span className="text-xs font-semibold text-gray-700">{((1 - product.similarity) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : filteredSimilarProducts.length > 0 ? (
        <div>
          <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  AI đã phân tích hình ảnh và tìm thấy {filteredSimilarProducts.length} mẫu hình ảnh tương tự. Đây là các kết quả khớp hình ảnh trực tiếp mà không có dữ liệu sản phẩm.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filteredSimilarProducts.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white border border-gray-300 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={product.url}
                    alt={`Sản phẩm tương tự ${index + 1}`}
                    className="w-full h-56 object-cover"
                  />
                  <div className={`absolute top-3 right-3 bg-gradient-to-r ${getMatchBadgeClass(product.similarity)} text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm`}>
                    Giống {((1 - product.similarity) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-gray-800 font-medium">Hình ảnh tương tự #{index + 1}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {product.filename ? product.filename.split('-').slice(-1)[0].split('.')[0] : 'Mẫu tương tự'}
                  </p>

                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden mt-2">
                    <div
                      className={`h-2.5 rounded-full bg-gradient-to-r ${getProgressBarClass(product.similarity)}`}
                      style={{ width: `${(1 - product.similarity) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">Độ tương đồng</span>
                    <span className="text-sm font-semibold text-gray-700">{((1 - product.similarity) * 100).toFixed(0)}%</span>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <button className="py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all duration-300 flex items-center">
                      <FaEye className="mr-2" />
                      Xem sản phẩm tương tự
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-300">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Không tìm thấy kết quả nào</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {errorMessage || "AI không tìm thấy sản phẩm nào phù hợp với ngưỡng tương đồng bạn đã chọn. Hãy giảm ngưỡng hoặc sử dụng hình ảnh khác."}
          </p>
          <div className="mt-6 space-x-3">
            {similarityThreshold !== 1 && (
              <button
                onClick={() => setSimilarityThreshold(1)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors shadow-md"
              >
                Hiển thị tất cả kết quả
              </button>
            )}
            <button
              onClick={() => setShowSimilarProducts(false)}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISimilarProducts;
