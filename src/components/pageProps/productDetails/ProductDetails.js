import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { FaStar, FaRegStar, FaImage, FaInfoCircle } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Slider from "react-slick";
import Breadcrumbs from "../Breadcrumbs";
import ProductInfo from "../productDetails/ProductInfo";
import { getRating } from "../../../redux/actions/rateActions";
import { getAllColors } from "../../../redux/actions/colorAction";
import ProductTabs from "./ProductTabs";
import { postViewedProduct } from "../../../redux/service/productService";
import ProductReviewSection from "./ProductReviewSection";
import AISimilarProducts from "./AISimilarProducts";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getProductsByImgUrls } from "../../../redux/service/productService";
import findSimilarImages from "../../../redux/setup/ai";
import { fetchProductDetail, fetchProductDescription, fetchProductCareInstructions, fetchProductRelated } from "../../../redux/service/productService";
import { showSuccessToast, showErrorToast } from "../../../components/Toast/ToastNotification";
import { useDispatch, useSelector } from "react-redux";

// Add custom CSS for animations
const styles = `
  @keyframes scan {
    0% {
      top: 0;
      opacity: 0.8;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      top: 100%;
      opacity: 0.8;
    }
  }
  .animate-scan {
    animation: scan 2s linear infinite;
  }
  .animate-reverse {
    animation-direction: reverse;
  }
  
  /* Enhanced Image zoom effect */
  .image-zoom-container {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
  }
  
  .image-zoom-container img {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
    height: auto;
  }
  
  /* AI Analysis Effects */
  .ai-analysis-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: 12px;
    overflow: hidden;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }
  
  .ai-analysis-overlay.active {
    opacity: 1;
  }
  
  /* Scanning line animation */
  .scanning-line {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #3b82f6, transparent);
    animation: scan 2s linear infinite;
    z-index: 5;
  }
  
  @keyframes scan {
    0% {
      top: 0;
      opacity: 0.8;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      top: 100%;
      opacity: 0.8;
    }
  }
  
  /* Feature detection points */
  .feature-point {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #3b82f6;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
    animation: pulse 1.5s ease-in-out infinite;
    z-index: 6;
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.5);
      opacity: 1;
    }
  }
  
  /* Object detection boxes */
  .detection-box {
    position: absolute;
    border: 2px solid #10b981;
    border-radius: 4px;
    background: rgba(16, 185, 129, 0.1);
    animation: detect 2s ease-in-out infinite;
    z-index: 4;
  }
  
  @keyframes detect {
    0%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.02);
    }
  }
  
  /* Analysis grid */
  .analysis-grid {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
    opacity: 0.3;
    z-index: 3;
  }
  
  /* Processing indicator */
  .processing-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 20px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 7;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }
  
  .processing-indicator.active {
    opacity: 1;
  }
  
  .processing-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .image-zoom-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0);
    transition: background 0.3s ease-in-out;
    pointer-events: none;
    border-radius: 12px;
  }
  
  /* Thumbnail hover effects */
  .thumbnail-container {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    transition: all 0.3s ease-in-out;
  }
  
  .thumbnail-container:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
  
  .thumbnail-container img {
    transition: transform 0.3s ease-in-out;
  }
  
  .thumbnail-container:hover img {
    transform: scale(1.05);
  }
  
  /* Smooth transitions */
  .smooth-transition {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* Card hover effects */
  .card-hover {
    transition: all 0.3s ease-in-out;
  }
  
  .card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  /* Compact layout for viewport */
  .compact-layout {
    max-height: 90vh;
    overflow-y: auto;
  }
`;

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { colors } = useSelector((state) => state.color);

  const [productDetail, setProductDetail] = useState(null);
  const [productDescription, setProductDescription] = useState(null);
  const [productCareInstructions, setProductCareInstructions] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [prevLocation, setPrevLocation] = useState("");

  const [ratingSummary, setRatingSummary] = useState({
    totalReviews: 0,
    averageRating: 0,
    starCounts: [0, 0, 0, 0, 0],
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [slideDirection, setSlideDirection] = useState("left");
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [showSimilarProducts, setShowSimilarProducts] = useState(false);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.5);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [productResults, setProductResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

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

  // Memoized Settings - Image slider settings are cached to prevent re-renders
  const settings = useMemo(() => ({
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    nextArrow: <button className="slick-next bg-white shadow-md rounded-full w-8 h-8 flex items-center justify-center absolute z-10">&gt;</button>,
    prevArrow: <button className="slick-prev bg-white shadow-md rounded-full w-8 h-8 flex items-center justify-center absolute z-10">&lt;</button>,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      }
    ]
  }), []);

  // Parallel Data Loading - Uses Promise.allSettled() for faster concurrent API calls
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setProductDetail(null);
    setProductDescription(null);
    setProductCareInstructions(null);
    setRelatedProducts([]);

    // Load colors data
    dispatch(getAllColors());

    // Use Promise.allSettled for parallel loading
    Promise.allSettled([
      fetchProductDetail(id),
      fetchProductDescription(id),
      fetchProductCareInstructions(id),
      fetchProductRelated(id, 0, 30)
    ])
      .then(([detailResult, descriptionResult, careResult, relatedResult]) => {
        // Handle product detail
        if (detailResult.status === 'fulfilled') {
          setProductDetail(detailResult.value);
        } else {
          setError(detailResult.reason?.message || "Lỗi tải dữ liệu sản phẩm");
        }

        // Handle product description (optional, can fail without breaking)
        if (descriptionResult.status === 'fulfilled') {
          setProductDescription(descriptionResult.value);
        }

        // Handle product care instructions (optional, can fail without breaking)
        if (careResult.status === 'fulfilled') {
          setProductCareInstructions(careResult.value);
        }

        // Handle related products (optional, can fail without breaking)
        if (relatedResult.status === 'fulfilled') {
          setRelatedProducts(relatedResult.value || []);
        }
      })
      .catch((err) => setError(err.message || "Lỗi tải dữ liệu"))
      .finally(() => setLoading(false));
  }, [id, location, dispatch]);

  const handleImageClick = (imagePath) => {
    setSlideDirection(selectedImage ? "left" : "right");
    setSelectedImage(imagePath);
  };

  const openUploadModal = () => {
    setShowUploadModal(true);
    setUploadPreview(null);
    setUploadedImage(null);
  };

  const handleUploadImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadPreview(reader.result);
    };
    reader.readAsDataURL(file);
    setUploadedImage(file);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadPreview(null);
    setUploadedImage(null);
  }

  const findSimilarProducts = async (imageUrl) => {
    if (!imageUrl) {
      showErrorToast("Chưa có hình ảnh để tìm kiếm sản phẩm tương tự");
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisProgress(0);
      setShowSimilarProducts(true);
      setErrorMessage("");

      // Simulate AI analysis progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const data = await findSimilarImages(imageUrl);

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      // Wait a bit to show completion
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisProgress(0);
      }, 500);

      console.log("=== AI RESPONSE ===");
      console.log("Similar images from AI:", data.similar_images.map(img => ({
        url: img.url,
        similarity: img.similarity
      })));

      if (!data.similar_images || data.similar_images.length === 0) {
        setErrorMessage("Không tìm thấy sản phẩm tương tự");
        setSimilarProducts([]);
        setProductResults([]);
        return;
      }

      setSimilarProducts(data.similar_images);

      // Extract URLs from the similar_images response
      const similarImageUrls = data.similar_images.map((item) => item.url);
      console.log("URLs sent to server:", similarImageUrls);

      try {
        const resultProducts = await getProductsByImgUrls(similarImageUrls);
        console.log("=== SERVER RESPONSE ===");
        console.log("Products from server:", resultProducts.response.map(product => ({
          id: product.id,
          name: product.name,
          images: product.images?.map(img => img.path) || [],
          mainImage: product.mainImage?.path
        })));

        if (resultProducts && resultProducts.response && resultProducts.response.length > 0) {
          // Tạo map để dễ dàng tìm kiếm điểm tương đồng theo URL
          const similarityMap = new Map(
            data.similar_images.map(item => [item.url, item.similarity])
          );

          console.log("=== MATCHING PROCESS ===");
          // Xử lý sản phẩm và gán điểm tương đồng
          const productsWithSimilarity = resultProducts.response
            .map((product) => {
              console.log("\nChecking product:", {
                id: product.id,
                name: product.name,
                mainImage: product.mainImage?.path,
                allImages: product.images?.map(img => img.path) || []
              });

              // Kiểm tra tất cả hình ảnh của sản phẩm (bao gồm mainImage và images)
              const allImages = [
                product.mainImage,
                ...(product.images || [])
              ].filter(img => img && img.path);

              // Tìm hình ảnh có điểm tương đồng cao nhất
              let maxSimilarity = 0;
              let matchedImage = null;

              for (const image of allImages) {
                const similarity = similarityMap.get(image.path);
                console.log("Checking image:", {
                  path: image.path,
                  similarity: similarity,
                  inSimilarityMap: similarity !== undefined
                });

                if (similarity !== undefined && similarity > maxSimilarity) {
                  maxSimilarity = similarity;
                  matchedImage = image;
                }
              }

              // Nếu không tìm thấy hình ảnh nào khớp
              if (maxSimilarity === 0) {
                console.log("No matching image found for product");
                return null;
              }

              console.log("Found match:", {
                productId: product.id,
                matchedImage: matchedImage.path,
                similarity: maxSimilarity,
                isMainImage: matchedImage === product.mainImage
              });

              return {
                ...product,
                similarity: maxSimilarity,
                matchedImage: matchedImage
              };
            })
            .filter(product => product !== null);

          console.log("\n=== FINAL RESULTS ===");
          console.log("Products with similarity scores:", productsWithSimilarity.map(p => ({
            id: p.id,
            name: p.name,
            matchedImage: p.matchedImage.path,
            similarity: p.similarity
          })));

          if (productsWithSimilarity.length === 0) {
            setErrorMessage("Không tìm thấy sản phẩm tương ứng với hình ảnh tương tự");
            setProductResults([]);
            return;
          }

          // Sắp xếp theo điểm tương đồng giảm dần (cao nhất lên đầu)
          const sortedProducts = productsWithSimilarity.sort((a, b) => b.similarity - a.similarity);
          console.log("Sorted products:", sortedProducts.map(p => ({
            id: p.id,
            name: p.name,
            matchedImage: p.matchedImage.path,
            similarity: p.similarity
          })));

          setProductResults(sortedProducts);
          showSuccessToast(`Đã tìm thấy ${sortedProducts.length} sản phẩm tương tự về hình ảnh`);
        } else {
          setErrorMessage("Không tìm thấy thông tin sản phẩm cho hình ảnh tương tự");
          setProductResults([]);
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
        setErrorMessage("Lỗi khi tải thông tin sản phẩm");
        setProductResults([]);
      }
    } catch (error) {
      console.error('Error finding similar products:', error);
      setErrorMessage(error.message || "Lỗi xử lý hình ảnh khi tìm sản phẩm tương tự");
      setSimilarProducts([]);
      setProductResults([]);
      showErrorToast("Không thể tìm thấy sản phẩm tương tự. Vui lòng thử một hình ảnh khác.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const findSimilarByUploadedImage = async () => {
    if (!uploadedImage) {
      showErrorToast("Chưa chọn hình ảnh để tìm kiếm bằng AI");
      return;
    }

    try {
      setLoadingSimilar(true);
      setShowSimilarProducts(true);
      setShowUploadModal(false);
      setErrorMessage("");

      const formData = new FormData();
      formData.append('file', uploadedImage);

      const data = await findSimilarImages(formData);

      if (!data.similar_images || data.similar_images.length === 0) {
        setErrorMessage("Không tìm thấy sản phẩm tương tự cho hình ảnh của bạn");
        setSimilarProducts([]);
        setProductResults([]);
        return;
      }

      setSimilarProducts(data.similar_images);

      // Extract URLs from the similar_images response
      const similarImageUrls = data.similar_images.map((item) => item.url);

      try {
        const resultProducts = await getProductsByImgUrls(similarImageUrls);

        if (resultProducts && resultProducts.response && resultProducts.response.length > 0) {
          const productsWithSimilarity = resultProducts.response.map((product) => {
            const similarityData = data.similar_images.find(img =>
              product.mainImage && img.url === product.mainImage.path
            );

            return {
              ...product,
              similarity: similarityData ? similarityData.similarity : 1
            };
          });

          const sortedProducts = productsWithSimilarity.sort((a, b) => a.similarity - b.similarity);

          setProductResults(sortedProducts);
          showSuccessToast(`Đã tìm thấy ${sortedProducts.length} sản phẩm tương tự về hình ảnh`);
        } else {
          setErrorMessage("Không tìm thấy thông tin sản phẩm cho hình ảnh tương tự");
          setProductResults([]);
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
        setErrorMessage("Lỗi khi tải thông tin sản phẩm");
        setProductResults([]);
      }
    } catch (error) {
      console.error('Error finding similar products by upload:', error);
      setErrorMessage(error.message || "Lỗi xử lý hình ảnh");
      setSimilarProducts([]);
      setProductResults([]);
      showErrorToast("Không thể tìm thấy sản phẩm tương tự. Vui lòng thử một hình ảnh khác.");
    } finally {
      setLoadingSimilar(false);
    }
  };

  // Filter products based on similarity threshold
  const filteredSimilarProducts = similarProducts.filter(product =>
    product.similarity <= similarityThreshold
  );

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="w-full mx-auto border-b border-gray-300 border-t rounded-lg">
        <div className="max-w-container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            {/* Loading spinner */}
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-400 rounded-full animate-spin animate-reverse"></div>
            </div>

            {/* Loading text */}
            <div className="mt-8 text-center">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Đang tải sản phẩm...</h3>
              <p className="text-gray-500 mb-4">Vui lòng chờ trong giây lát</p>

              {/* Loading steps
              <div className="flex justify-center space-x-4 mt-6">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                  <span>Thông tin sản phẩm</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse delay-200"></div>
                  <span>Hình ảnh</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2 animate-pulse delay-400"></div>
                  <span>Mô tả</span>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full mx-auto border-b border-gray-300 border-t rounded-lg">
        <div className="max-w-container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md w-full text-center">
              <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-medium text-red-800 mb-2">Lỗi tải sản phẩm</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Inject the custom CSS */}
      <style>{styles}</style>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="mb-3">
          <Breadcrumbs title="" prevLocation={prevLocation} />
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            {/* Hình ảnh sản phẩm */}
            <div className="space-y-3">
              {/* Ảnh chính với zoom effect */}
              <div className="image-zoom-container bg-gray-50 border border-gray-200">
                {selectedImage || productDetail?.mainImage?.path ? (
                  <div className="relative">
                    <img
                      src={selectedImage || productDetail?.mainImage?.path}
                      alt={productDetail?.productName}
                      onClick={() => postViewedProduct(productDetail.id)}
                      className="w-full h-auto"
                      loading="lazy"
                      onMouseMove={(e) => {
                        const magnifier = e.target.parentElement.querySelector('.magnifier');
                        if (magnifier) {
                          const rect = e.target.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const y = e.clientY - rect.top;

                          // Calculate position for magnifier
                          const magnifierSize = 150;
                          const magnifierX = x - magnifierSize / 2;
                          const magnifierY = y - magnifierSize / 2;

                          // Constrain magnifier within image bounds
                          const constrainedX = Math.max(0, Math.min(magnifierX, rect.width - magnifierSize));
                          const constrainedY = Math.max(0, Math.min(magnifierY, rect.height - magnifierSize));

                          // Set magnifier position
                          magnifier.style.left = `${constrainedX}px`;
                          magnifier.style.top = `${constrainedY}px`;

                          // Calculate background position for zoom effect (3x zoom)
                          const imgWidth = e.target.offsetWidth;
                          const imgHeight = e.target.offsetHeight;
                          const zoomLevel = 3;

                          // Calculate the position in the original image
                          const originalX = (x / imgWidth) * 100;
                          const originalY = (y / imgHeight) * 100;

                          // Set background image and position for 3x zoom
                          magnifier.style.backgroundImage = `url(${e.target.src})`;
                          magnifier.style.backgroundSize = `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`;
                          magnifier.style.backgroundPosition = `${-x * zoomLevel + magnifierSize / 2}px ${-y * zoomLevel + magnifierSize / 2}px`;
                        }
                      }}
                      onMouseLeave={() => {
                        const magnifier = document.querySelector('.magnifier');
                        if (magnifier) {
                          magnifier.style.display = 'none';
                        }
                      }}
                      onMouseEnter={() => {
                        const magnifier = document.querySelector('.magnifier');
                        if (magnifier) {
                          magnifier.style.display = 'block';
                        }
                      }}
                    />

                    {/* AI Analysis Overlay - Only for current image analysis */}
                    <div className={`ai-analysis-overlay ${isAnalyzing ? 'active' : ''}`}>
                      {/* Analysis Grid */}
                      <div className="analysis-grid"></div>

                      {/* Scanning Line */}
                      <div className="scanning-line"></div>

                      {/* Feature Detection Points */}
                      {isAnalyzing && (
                        <>
                          <div className="feature-point" style={{ top: '20%', left: '25%' }}></div>
                          <div className="feature-point" style={{ top: '35%', left: '60%' }}></div>
                          <div className="feature-point" style={{ top: '50%', left: '15%' }}></div>
                          <div className="feature-point" style={{ top: '65%', left: '70%' }}></div>
                          <div className="feature-point" style={{ top: '80%', left: '40%' }}></div>
                        </>
                      )}

                      {/* Object Detection Boxes */}
                      {isAnalyzing && (
                        <>
                          <div className="detection-box" style={{ top: '15%', left: '20%', width: '30%', height: '25%' }}></div>
                          <div className="detection-box" style={{ top: '45%', left: '55%', width: '25%', height: '20%' }}></div>
                        </>
                      )}

                      {/* Processing Indicator */}
                      <div className={`processing-indicator ${isAnalyzing ? 'active' : ''}`}>
                        <div className="processing-spinner"></div>
                        <span>Phân tích hình ảnh... {Math.round(analysisProgress)}%</span>
                      </div>
                    </div>

                    {/* Magnifier */}
                    <div className="magnifier"></div>
                  </div>
                ) : (
                  <div className="w-full h-[250px] flex items-center justify-center text-gray-500 bg-gray-100">
                    <div className="text-center">
                      <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs">Đang tải hình ảnh...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail images */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Hình ảnh khác
                  </h3>

                  {/* AI Button */}
                  <button
                    onClick={() => setShowAiPanel(!showAiPanel)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z" />
                      <path d="M10.3 15.29a1 1 0 001.4 1.42l4-4a1 1 0 000-1.42l-4-4a1 1 0 00-1.4 1.42L13.58 12l-3.3 3.29z" />
                    </svg>
                    AI Tìm kiếm
                  </button>
                </div>
                <div className="grid grid-cols-8 gap-1">
                  {productDetail?.images &&
                    productDetail?.images.map((image, index) => {
                      const colorCode = image.color ? getColorCode(image.color) : "#FFFFFF";

                      return (
                        <div
                          key={index}
                          className={`thumbnail-container cursor-pointer ${selectedImage === image.path
                              ? "ring-1 ring-blue-500 ring-offset-1 scale-105"
                              : "hover:ring-1 hover:ring-gray-300"
                            }`}
                          onClick={() => handleImageClick(image.path)}
                        >
                          <div className="aspect-square w-full bg-gray-50 border border-gray-200">
                            <img
                              src={image.path}
                              alt={`Product image ${index + 1}`}
                              className="w-full h-full object-cover"
                              onClick={() => postViewedProduct(productDetail.id)}
                              loading="lazy"
                            />
                          </div>

                          {/* Color indicator */}
                          {image.color && (
                            <div
                              className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: colorCode }}
                              title={image.color}
                            ></div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Thông tin sản phẩm */}
            <div className="flex flex-col justify-start">
              <ProductInfo
                productInfo={productDetail}
                onImageClick={handleImageClick}
                getColorCode={getColorCode}
                getColorName={getColorName}
                colors={colors}
              />
            </div>
          </div>
        </div>

        {/* AI Panel - Slides in from the side */}
        <div className={`fixed inset-y-0 right-0 w-80 bg-gradient-to-br from-blue-900 to-purple-900 shadow-2xl transform ${showAiPanel ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50 overflow-hidden`}>
          <div className="h-full flex flex-col text-white p-6">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">AI Thị Giác</h3>
                  <p className="text-sm text-blue-200">Tìm sản phẩm tương tự</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiPanel(false)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute -left-3 top-3 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-xs font-bold">1</span>
                </div>
                <button
                  onClick={() => findSimilarProducts(selectedImage || productDetail.mainImage.path)}
                  className="w-full bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-filter backdrop-blur-sm rounded-xl p-4 transition-all duration-300 transform hover:translate-y-[-2px] border border-white border-opacity-20 flex items-center"
                >
                  <div className="mr-3 bg-gradient-to-br from-blue-400 to-purple-500 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">Tìm Kiếm Thị Giác AI</h4>
                    <p className="text-xs text-gray-300">Tìm sản phẩm tương tự</p>
                  </div>
                </button>
              </div>

              <div className="relative">
                <div className="absolute -left-3 top-3 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                  <span className="text-xs font-bold">2</span>
                </div>
                <button
                  onClick={openUploadModal}
                  className="w-full bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-filter backdrop-blur-sm rounded-xl p-4 transition-all duration-300 transform hover:translate-y-[-2px] border border-white border-opacity-20 flex items-center"
                >
                  <div className="mr-3 bg-gradient-to-br from-purple-400 to-pink-500 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">Tải Lên & Tìm Kiếm</h4>
                    <p className="text-xs text-gray-300">Tìm kiếm bằng hình ảnh của bạn</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <div className="bg-blue-800 bg-opacity-50 rounded-xl p-4 text-sm">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                  <p className="font-medium">AI Thị Giác Đang Hoạt Động</p>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">
                  AI của chúng tôi phân tích các đặc điểm hình ảnh để tìm những sản phẩm tương tự nhất trong danh mục
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload Modal - Redesigned with AI Focus */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-filter backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-blue-400 border-opacity-30 relative overflow-hidden">
              {/* Background decorative elements - AI nodes */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-purple-400 rounded-full"></div>
                <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-indigo-400 rounded-full"></div>
                <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-purple-400 rounded-full"></div>

                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full">
                  <line x1="25%" y1="25%" x2="67%" y2="33%" stroke="#7985d0" strokeWidth="0.5" />
                  <line x1="67%" y1="33%" x2="50%" y2="50%" stroke="#7985d0" strokeWidth="0.5" />
                  <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="#7985d0" strokeWidth="0.5" />
                  <line x1="75%" y1="75%" x2="33%" y2="67%" stroke="#7985d0" strokeWidth="0.5" />
                  <line x1="33%" y1="67%" x2="25%" y2="25%" stroke="#7985d0" strokeWidth="0.5" />
                </svg>
              </div>

              <div className="flex justify-between items-center mb-5 relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                      <path d="M9 13h2v3H9z" />
                      <path d="M8 12h4v1H8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Tải Ảnh Lên Cho AI Thị Giác</h3>
                </div>
                <button onClick={closeUploadModal} className="text-gray-300 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="mb-6 relative z-10">
                <div className="bg-blue-800 bg-opacity-40 rounded-lg p-4 mb-6 border-l-4 border-blue-400">
                  <div className="flex items-start">
                    <FaInfoCircle className="text-blue-300 mt-1 mr-3 flex-shrink-0" />
                    <p className="text-blue-100 text-sm">
                      AI của chúng tôi phân tích các đặc điểm hình ảnh để tìm những sản phẩm tương tự nhất trong danh mục
                    </p>
                    <p className="text-blue-100 text-sm">
                      AI tiên tiến của chúng tôi sẽ phân tích hình ảnh để tìm những sản phẩm tương tự trong cơ sở dữ liệu,
                      so sánh các đặc điểm như màu sắc, họa tiết, hình dạng và phong cách.
                    </p>
                  </div>
                </div>

                {uploadPreview ? (
                  <div className="relative mb-4 group">
                    <img
                      src={uploadPreview}
                      alt="Xem trước ảnh tải lên"
                      className="w-full h-64 object-contain rounded-xl border-2 border-blue-500 p-1"
                      loading="lazy" // Lazy Loading - Images load only when needed
                    />

                    {/* AI Processing Overlay */}
                    <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
                      {/* Target Focus Points - Simulating AI object detection */}
                      <div className="absolute w-full h-full">
                        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-blue-400 rounded-md opacity-40"></div>
                        <div className="absolute top-2/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-green-400 rounded-full opacity-30"></div>
                        <div className="absolute top-1/2 right-1/4 w-20 h-10 border-2 border-purple-400 rounded-md opacity-30"></div>
                      </div>

                      {/* Feature Points */}
                      <div className="absolute w-full h-full">
                        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
                        <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-green-400 rounded-full opacity-60"></div>
                        <div className="absolute top-2/3 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
                        <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-purple-400 rounded-full opacity-60"></div>
                        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-indigo-400 rounded-full opacity-60"></div>
                      </div>
                    </div>

                    {/* Control Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900 opacity-0 group-hover:opacity-70 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                      <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={() => {
                            setUploadPreview(null);
                            setUploadedImage(null);
                          }}
                          className="bg-red-500 text-white p-2 rounded-full"
                          title="Xóa ảnh">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* AI Scanning Animation Overlay */}
                    <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
                      <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20">
                        {Array(36).fill(0).map((_, i) => (
                          <div key={i} className="border border-blue-300"></div>
                        ))}
                      </div>
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan"></div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-blue-400 border-opacity-50 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 transition-colors bg-blue-900 bg-opacity-20 group"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 mb-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <FaImage className="text-white text-2xl" />
                      </div>
                      <p className="text-blue-100 font-medium mb-1">Nhấp để chọn hình ảnh</p>
                      <p className="text-blue-300 text-xs">hoặc kéo và thả</p>
                      <p className="text-blue-400 text-xs mt-4">Hỗ trợ JPG, PNG, WEBP</p>

                      {/* Animated upload hint */}
                      <div className="mt-4 flex items-center">
                        <svg className="w-5 h-5 text-blue-400 mr-2 opacity-70 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v12"></path>
                        </svg>
                        <span className="text-xs text-blue-300">Tải lên để bắt đầu phát hiện AI</span>
                      </div>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUploadImage}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="flex justify-end space-x-3 relative z-10">
                <button
                  onClick={closeUploadModal}
                  className="px-4 py-2 border border-blue-500 border-opacity-50 rounded-lg text-blue-200 hover:bg-blue-800 hover:bg-opacity-30 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={findSimilarByUploadedImage}
                  disabled={!uploadedImage}
                  className={`px-6 py-2 rounded-lg text-white flex items-center ${uploadedImage
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg'
                    : 'bg-gray-600 cursor-not-allowed'
                    } transition-all duration-300`}
                >
                  {uploadedImage && (
                    <span className="w-4 h-4 mr-2 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    </span>
                  )}
                  <span>Tìm Sản Phẩm Tương Tự</span>
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </button>
              </div>

              {/* AI Feature Tags */}
              <div className="mt-6 flex flex-wrap gap-2 justify-center relative z-10">
                <span className="px-2 py-1 bg-blue-800 bg-opacity-40 rounded-full text-xs text-blue-200">Phân Tích Màu Sắc</span>
                <span className="px-2 py-1 bg-purple-800 bg-opacity-40 rounded-full text-xs text-purple-200">Nhận Diện Họa Tiết</span>
                <span className="px-2 py-1 bg-indigo-800 bg-opacity-40 rounded-full text-xs text-indigo-200">Phát Hiện Hình Dạng</span>
                <span className="px-2 py-1 bg-green-800 bg-opacity-40 rounded-full text-xs text-green-200">Trích Xuất Đặc Điểm</span>
              </div>
            </div>
          </div>
        )}

        {/* AISimilarProducts component to display AI-powered similar products */}


        {/* ProductTabs - with updated styling */}
        <div className="w-full bg-white p-4 rounded-lg shadow-lg mt-4">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Thông tin sản phẩm
          </h2>
          <ProductTabs productDescription={productDescription} productCareInstructions={productCareInstructions} />
        </div>
        <AISimilarProducts
          showSimilarProducts={showSimilarProducts}
          setShowSimilarProducts={setShowSimilarProducts}
          loadingSimilar={loadingSimilar}
          filteredSimilarProducts={filteredSimilarProducts}
          similarityThreshold={similarityThreshold}
          setSimilarityThreshold={setSimilarityThreshold}
          productResults={productResults}
          errorMessage={errorMessage}
        />

        <ProductReviewSection productId={productDetail?.id} imageUser={reviews.length > 0 ? reviews[0].avatar : null} />
      </div>
    </div>
  );
};

export default ProductDetails;
