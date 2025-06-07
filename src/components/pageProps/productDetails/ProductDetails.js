import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { FaStar, FaRegStar, FaImage, FaInfoCircle } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Slider from "react-slick";
import Breadcrumbs from "../Breadcrumbs";
import ProductInfo from "../productDetails/ProductInfo";
import { getRating } from "../../../redux/actions/rateActions";
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
`;

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();

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
  }, [id, location]);

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
      setLoadingSimilar(true);
      setShowSimilarProducts(true);
      setErrorMessage("");

      const data = await findSimilarImages(imageUrl);
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
      setLoadingSimilar(false);
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
    <div className="w-full mx-auto border-b border-gray-300 border-t rounded-lg">
      {/* Inject the custom CSS */}
      <style>{styles}</style>

      <div className="max-w-container mx-auto px-4">
        <div className="xl:-mt-10 -mt-7">
          <Breadcrumbs title="" prevLocation={prevLocation} />
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-4 h-full -mt-5 xl:-mt-8 pb-10 bg-gray-100 p-4">
          {/* Hình ảnh chiếm 40% */}
          <div className="w-full md:col-span-2 xl:col-span-2 object-cover rounded-lg">
            <div className="image-container relative">
              <div className={`image-slide ${slideDirection === "left" ? "slide-left" : "slide-right"}`}>
                {selectedImage || productDetail?.mainImage?.path ? (
                  <div className="relative">
                    <img
                      src={selectedImage || productDetail?.mainImage?.path}
                      alt={productDetail?.productName}
                      onClick={() => postViewedProduct(productDetail.id)}
                      className="w-full h-auto rounded-lg"
                      loading="lazy" // Lazy Loading - Images load only when needed
                    />
                    {/* AI Floating Button */}
                    <button
                      onClick={() => setShowAiPanel(!showAiPanel)}
                      className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300 z-10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z" />
                        <path d="M10.3 15.29a1 1 0 001.4 1.42l4-4a1 1 0 000-1.42l-4-4a1 1 0 00-1.4 1.42L13.58 12l-3.3 3.29z" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-[400px] flex items-center justify-center text-gray-500 bg-gray-200 rounded-lg">
                    Đang tải hình ảnh...
                  </div>
                )}
              </div>
            </div>

            {/* AI Panel - Slides in from the side */}
            <div className={`fixed inset-y-0 right-0 w-72 bg-gradient-to-br from-blue-900 to-purple-900 shadow-2xl transform ${showAiPanel ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50 overflow-hidden`}>
              <div className="h-full flex flex-col text-white p-6">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center mr-2 animate-pulse">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold">Tìm Kiếm Sản Phẩm Tương Tự</h3>
                  </div>
                  <button
                    onClick={() => setShowAiPanel(false)}
                    className="text-white hover:text-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
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
                  <div className="bg-blue-800 bg-opacity-50 rounded-lg p-3 text-xs">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                      <p className="font-medium">AI Thị Giác Đang Hoạt Động</p>
                    </div>
                    <p className="text-gray-300">AI của chúng tôi phân tích các đặc điểm hình ảnh để tìm những sản phẩm tương tự nhất trong danh mục</p>
                    <p className="text-gray-300">AI tiên tiến của chúng tôi sẽ phân tích hình ảnh để tìm những sản phẩm tương tự trong cơ sở dữ liệu, so sánh các đặc điểm như màu sắc, họa tiết, hình dạng và phong cách.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-2">
              <Slider {...settings}>
                {productDetail?.images &&
                  productDetail?.images.map((image, index) => (
                    <div
                      key={index}
                      className={`thumbnail ${selectedImage === image.path ? "border-2 border-blue-500" : "border border-gray-300"} rounded-lg cursor-pointer p-1 mx-1`}
                      onClick={() => handleImageClick(image.path)}
                    >
                      <div className="aspect-square w-full overflow-hidden rounded-lg">
                        <img
                          src={image.path}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                          onClick={() => postViewedProduct(productDetail.id)}
                          loading="lazy" // Lazy Loading - Images load only when needed
                        />
                      </div>
                    </div>
                  ))}
              </Slider>
            </div>
          </div>

          {/* Chi tiết sản phẩm chiếm 60% */}
          <div className="h-full w-full md:col-span-3 xl:col-span-3 xl:p-14 flex flex-col gap-6 justify-center">
            <ProductInfo productInfo={productDetail} onImageClick={handleImageClick} />
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

        {/* ProductTabs - with updated styling */}
        <div className="w-full bg-white p-6 rounded-lg shadow-lg mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Thông tin sản phẩm
          </h2>
          <ProductTabs productDescription={productDescription} productCareInstructions={productCareInstructions} />
        </div>

        {/* Sản phẩm liên quan */}
        {/* <div className="w-full bg-white p-6 rounded-lg shadow-lg mt-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Sản phẩm tương tự
          </h2>
          <ProductRelated />
        </div> */}

        {/* Reviews section with updated design */}
        <div className="w-full bg-gradient-to-r from-white to-blue-50 p-6 rounded-lg shadow-lg mt-4 border border-blue-100">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>

            {/* AI Powered Badge */}
            {ratingSummary.totalReviews > 0 && (
              <div className="ml-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                </svg>
                Phân Tích Cảm Xúc AI
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center border border-blue-100">
              <div className="text-4xl font-bold text-blue-600 mb-2">{ratingSummary.averageRating || 0}<span className="text-xl text-gray-500">/5</span></div>
              <div className="flex items-center mb-2">
                {Array.from({ length: 5 }).map((_, index) =>
                  index < Math.round(ratingSummary.averageRating) ? (
                    <FaStar key={index} className="text-yellow-400 text-xl" />
                  ) : (
                    <FaRegStar key={index} className="text-gray-300 text-xl" />
                  )
                )}
              </div>
              <div className="text-sm text-gray-600 mb-3">Dựa trên {ratingSummary.totalReviews} đánh giá</div>

              {ratingSummary.totalReviews > 0 && (
                <div className="w-full bg-blue-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-blue-800">Phân Tích AI</span>
                  </div>
                  <p className="text-xs text-blue-600">
                    {ratingSummary.averageRating >= 4.5
                      ? "Sản phẩm có đánh giá xuất sắc"
                      : ratingSummary.averageRating >= 4
                        ? "Người dùng rất hài lòng với sản phẩm này"
                        : ratingSummary.averageRating >= 3
                          ? "Sản phẩm có chất lượng khá tốt"
                          : "Sản phẩm cần cải thiện"}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Phân bố đánh giá</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center">
                    <div className="flex items-center w-16">
                      <span className="text-sm font-medium text-gray-700">{star} sao</span>
                    </div>
                    <div className="w-full mx-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${star > 3 ? 'bg-green-500' : star > 2 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          style={{ width: `${ratingSummary.totalReviews > 0 ? (ratingSummary.starCounts[star - 1] / ratingSummary.totalReviews) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-10 text-right">{ratingSummary.starCounts[star - 1]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Biểu đồ đánh giá</h3>
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ratingSummary.starCounts.map((count, index) => ({ star: `${5 - index} sao`, count }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="star" fontSize={12} />
                    <YAxis allowDecimals={false} fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      background={{ fill: '#f3f4f6', radius: [4, 4, 0, 0] }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <ProductReviewSection productId={productDetail?.id} imageUser={reviews.length > 0 ? reviews[0].avatar : null} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
