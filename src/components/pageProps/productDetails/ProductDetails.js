import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaStar, FaRegStar, FaSearch, FaUpload, FaCamera, FaImage, FaInfoCircle, FaRobot, FaBrain } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Slider from "react-slick";
import Breadcrumbs from "../Breadcrumbs";
import ProductInfo from "../productDetails/ProductInfo";
import { getProductDetail } from "../../../redux/actions/productActions";
import { getRating } from "../../../redux/actions/rateActions";
import ProductTabs from "./ProductTabs";
import { postViewedProduct } from "../../../redux/service/productService";
import ProductRelated from "./ProductRelated";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
`;
const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { productDetail, loading, error } = useSelector((state) => state.productDetail);
  const productDescription = useSelector((state) => state.productDescription.productDescription);
  const productCareInstructions = useSelector((state) => state.productCareInstructions.productCareInstructions);
  const ratingState = useSelector((state) => state.rating);
  const { rating, totalPages, totalElements } = ratingState;
  const [prevLocation, setPrevLocation] = useState("");
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(30);
  const [hasMore, setHasMore] = useState(true);
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
  const [similarityThreshold, setSimilarityThreshold] = useState(0.5); // Default threshold for similarity
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [showAiPanel, setShowAiPanel] = useState(false);
  useEffect(() => {
    if (id) {
      dispatch(getProductDetail(id, page, size));
      dispatch(getRating(id, 0, size));
      postViewedProduct(id); // Post the viewed product ID when the component mounts
    }
    setPrevLocation(location.pathname);
  }, [dispatch, id, location, page, size]);

  useEffect(() => {
    if (rating) {
      const fetchUserDetails = async (review) => {
        try {
          const userResponse = await fetch(`http://192.168.1.28:8080/api/v1/public/users/${review.userId}`);
          const userData = await userResponse.json();
          if (userData.statusCode === 200) {
            return { ...review, user: userData.data };
          }
        } catch (error) {
          console.error("Failed to fetch user details:", error);
        }
        return review;
      };

      const fetchAllUserDetails = async () => {
        const reviewsWithUserDetails = await Promise.all(rating.map(fetchUserDetails));
        setReviews(reviewsWithUserDetails);

        setHasMore(reviewsWithUserDetails.length === size);

        // Tính toán tỷ lệ sao
        const totalReviews = reviewsWithUserDetails.length;
        const starCounts = [0, 0, 0, 0, 0];
        let totalRating = 0;

        reviewsWithUserDetails.forEach((review) => {
          starCounts[review.rate - 1]++;
          totalRating += review.rate;
        });

        const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

        setRatingSummary({
          totalReviews,
          averageRating: averageRating.toFixed(1),
          starCounts,
        });
      };

      fetchAllUserDetails();
    }
  }, [rating, size]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    dispatch(getRating(id, nextPage, size));
  };

  const handleImageClick = (imagePath) => {
    setSlideDirection(selectedImage ? "left" : "right");
    setSelectedImage(imagePath);
  };

  const findSimilarProducts = async (imageUrl) => {
    try {
      setLoadingSimilar(true);
      setShowSimilarProducts(true);

      const response = await fetch('http://127.0.0.1:5000/api/find_similar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setSimilarProducts(data.similar_images || []);
    } catch (error) {
      console.error('Error finding similar products:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleUploadImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview the image
    const reader = new FileReader();
    reader.onload = () => {
      setUploadPreview(reader.result);
    };
    reader.readAsDataURL(file);
    setUploadedImage(file);
  };

  const findSimilarByUploadedImage = async () => {
    if (!uploadedImage) return;

    try {
      setLoadingSimilar(true);
      setShowSimilarProducts(true);
      setShowUploadModal(false);

      const formData = new FormData();
      formData.append('file', uploadedImage);

      const response = await fetch('http://127.0.0.1:5000/api/find_similar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setSimilarProducts(data.similar_images || []);
    } catch (error) {
      console.error('Error finding similar products by upload:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const openUploadModal = () => {
    setShowUploadModal(true);
    setUploadPreview(null);
    setUploadedImage(null);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadPreview(null);
    setUploadedImage(null);
  };

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    nextArrow: <button className="slick-next ">&gt;</button>,
    prevArrow: <button className="slick-prev">&lt;</button>,
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
  };

  if (loading) return <div className="w-full h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-gray-600">Đang tải thông tin sản phẩm...</span>
  </div>;

  if (error) return <div className="w-full h-screen flex items-center justify-center text-red-500">
    <p>Đã xảy ra lỗi: {error}</p>
  </div>;

  // Filter products based on similarity threshold
  const filteredSimilarProducts = similarProducts.filter(product => product.similarity <= similarityThreshold);


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
                      src={selectedImage || productDetail.mainImage.path}
                      alt={productDetail.productName}
                      onClick={() => postViewedProduct(productDetail.id)}
                      className="w-full h-auto rounded-lg"
                    />
                    {/* AI Floating Button */}
                    <button
                      onClick={() => setShowAiPanel(!showAiPanel)}
                      className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300 z-10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
                        <path d="M10.3 15.29a1 1 0 001.4 1.42l4-4a1 1 0 000-1.42l-4-4a1 1 0 00-1.4 1.42L13.58 12l-3.3 3.29z"/>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-[400px] flex items-center justify-center text-gray-500 bg-gray-200 rounded-lg">
                    No Image Available
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
                    <h3 className="text-lg font-semibold">AI Vision</h3>
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
                        <h4 className="font-medium">AI Visual Search</h4>
                        <p className="text-xs text-gray-300">Find similar products</p>
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
                        <h4 className="font-medium">Upload & Find</h4>
                        <p className="text-xs text-gray-300">Search with your image</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <div className="bg-blue-800 bg-opacity-50 rounded-lg p-3 text-xs">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                      <p className="font-medium">AI Vision Active</p>
                    </div>
                    <p className="text-gray-300">Our AI analyzes visual features to find the most similar products in our catalog</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="relative mt-2">
              <Slider {...settings}>
                {productDetail?.images &&
                  productDetail?.images.map((image, index) => (
                    <div
                      key={index}
                      className={`thumbnail ${selectedImage === image.path ? "border-2 border-blue-500" : "border border-gray-300"} rounded-lg cursor-pointer`}
                      onClick={() => handleImageClick(image.path)}
                    >
                      <img
                        src={image.path}
                        alt={`Product image ${index + 1}`}
                        className="w-20 h-30 object-cover rounded-lg m"
                        onClick={() => postViewedProduct(productDetail.id)} // Post the viewed product ID when the thumbnail is clicked
                      />
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
            <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-blue-400 border-opacity-30">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                      <path d="M9 13h2v3H9z" />
                      <path d="M8 12h4v1H8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">AI Vision Upload</h3>
                </div>
                <button onClick={closeUploadModal} className="text-gray-300 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-blue-800 bg-opacity-40 rounded-lg p-4 mb-6 border-l-4 border-blue-400">
                  <div className="flex items-start">
                    <FaInfoCircle className="text-blue-300 mt-1 mr-3" />
                    <p className="text-blue-100 text-sm">
                      Our advanced AI will analyze your image to find visually similar products in our database, comparing features like color, pattern, shape, and style.
                    </p>
                  </div>
                </div>

                {uploadPreview ? (
                  <div className="relative mb-4 group">
                    <img
                      src={uploadPreview}
                      alt="Upload preview"
                      className="w-full h-64 object-contain rounded-xl border-2 border-blue-500 p-1"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900 opacity-0 group-hover:opacity-70 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                      <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={() => {
                            setUploadPreview(null);
                            setUploadedImage(null);
                          }}
                          className="bg-red-500 text-white p-2 rounded-full"
                          title="Remove image"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* AI Scanning Animation Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-xl overflow-hidden">
                        <div className="h-px w-full bg-blue-400 absolute top-1/2 animate-pulse"></div>
                        <div className="h-full w-px bg-blue-400 absolute left-1/2 animate-pulse"></div>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-blue-400 border-opacity-50 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 transition-colors bg-blue-900 bg-opacity-20"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 mb-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <FaImage className="text-white text-2xl" />
                      </div>
                      <p className="text-blue-100 font-medium mb-1">Click to select an image</p>
                      <p className="text-blue-300 text-xs">or drag and drop</p>
                      <p className="text-blue-400 text-xs mt-4">Supports JPG, PNG, WEBP</p>
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

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeUploadModal}
                  className="px-4 py-2 border border-blue-500 border-opacity-50 rounded-lg text-blue-200 hover:bg-blue-800 hover:bg-opacity-30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={findSimilarByUploadedImage}
                  disabled={!uploadedImage}
                  className={`px-6 py-2 rounded-lg text-white flex items-center ${
                    uploadedImage
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg'
                      : 'bg-gray-600 cursor-not-allowed'
                  } transition-all duration-300`}
                >
                  {uploadedImage && (
                    <span className="w-4 h-4 mr-2 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    </span>
                  )}
                  <span>Find Similar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Similar Products Results - Redesigned with AI Focus */}
        {showSimilarProducts && (
          <div className="w-full bg-gradient-to-r from-gray-900 to-blue-900 text-white p-6 rounded-xl shadow-xl mt-6 transition-all duration-300 ease-in-out border border-blue-500 border-opacity-20">
            <div className="flex justify-between items-center mb-6 border-b border-blue-500 border-opacity-30 pb-4">
              <div className="flex items-center">
                <div className="bg-blue-600 p-3 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">AI Vision Results</h2>
                  <p className="text-blue-300 text-sm">Powered by deep learning image processing</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-blue-800 bg-opacity-50 px-3 py-2 rounded-lg">
                  <span className="text-sm text-blue-200 mr-2">Similarity Threshold:</span>
                  <select
                    value={similarityThreshold}
                    onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                    className="bg-blue-900 border border-blue-600 rounded-md px-3 py-1 text-sm text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">All Products</option>
                    <option value="0.5">Medium Match</option>
                    <option value="0.3">High Match</option>
                    <option value="0.1">Perfect Match</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowSimilarProducts(false)}
                  className="text-blue-200 hover:text-white bg-blue-800 bg-opacity-40 hover:bg-opacity-60 px-3 py-2 rounded-lg transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close
                </button>
              </div>
            </div>

            {loadingSimilar ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-300 border-opacity-25"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-purple-500 animate-spin" style={{ animationDelay: '0.2s', animationDuration: '1.5s' }}></div>
                </div>
                <div className="mt-6 space-y-2 text-center">
                  <h3 className="text-xl font-medium text-blue-100">AI Image Analysis In Progress</h3>
                  <p className="text-blue-300 text-sm">Analyzing visual features and processing similarity metrics</p>
                  <div className="flex justify-center space-x-1 mt-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            ) : filteredSimilarProducts.length > 0 ? (
              <div className="space-y-6">
                <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-2 4a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-blue-100">
                        <span className="font-semibold">AI Analysis Complete:</span> Found {filteredSimilarProducts.length} visually similar products based on deep learning image recognition
                      </p>
                      <p className="text-blue-300 text-sm mt-1">
                        Similarity is calculated using neural networks trained on millions of product images
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {filteredSimilarProducts.map((product, index) => (
                    <div key={index} className="bg-gradient-to-b from-blue-800 to-blue-900 border border-blue-700 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-blue-900/40 transition-all duration-300 group">
                      <div className="relative overflow-hidden">
                        <img
                          src={product.url}
                          alt={`Similar product ${index + 1}`}
                          className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                          <div className="p-3 w-full">
                            <span className="text-white text-sm font-medium">{product.filename.substring(0, 25)}{product.filename.length > 25 ? '...' : ''}</span>
                          </div>
                        </div>

                        {/* AI Match Badge */}
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                          </svg>
                          AI Match
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="mb-2">
                          <div className="text-center mb-1">
                            <span className="text-blue-100 font-medium">Similarity Score</span>
                          </div>
                          <div className="w-full bg-blue-800 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-400 to-purple-500 h-2.5 rounded-full relative"
                              style={{ width: `${(1 - product.similarity) * 100}%` }}
                            >
                              <div className="absolute top-0 left-0 w-full h-full bg-blue-200 opacity-30 animate-pulse"></div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-blue-300">Match</span>
                            <span className="text-sm font-semibold text-blue-100">{((1 - product.similarity) * 100).toFixed(0)}%</span>
                          </div>
                        </div>

                        <button className="w-full mt-2 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg text-sm text-white font-medium transition-all duration-300 transform group-hover:translate-y-[-2px]">
                          View Product
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-700">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-800 flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-blue-100 mb-2">No Visual Matches Found</h3>
                <p className="text-blue-300 max-w-md mx-auto">
                  Our AI couldn't find products matching your selected similarity threshold. Try lowering the threshold or using a different image.
                </p>
                <button
                  onClick={() => setSimilarityThreshold(1)}
                  className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                  Show All Results
                </button>
              </div>
            )}
          </div>
        )}

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
        <div className="w-full bg-white p-6 rounded-lg shadow-lg mt-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Sản phẩm tương tự
          </h2>
          <ProductRelated />
        </div>

        {/* Reviews section with updated design */}
        <div className="w-full bg-gradient-to-r from-white to-blue-50 p-6 rounded-lg shadow-lg mt-4 border border-blue-100">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Đánh giá sản phẩm</h2>

            {/* AI Powered Badge */}
            {ratingSummary.totalReviews > 0 && (
              <div className="ml-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                </svg>
                AI Sentiment Analysis
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
                    <span className="text-sm font-medium text-blue-800">AI Insight</span>
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
                          className={`h-2 rounded-full ${
                            star > 3 ? 'bg-green-500' : star > 2 ? 'bg-yellow-500' : 'bg-red-500'
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

          {/* Danh sách đánh giá */}
          {reviews.length > 0 ? (
            <div>
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800">Nhận xét từ khách hàng</h3>
              </div>

              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start">
                      <img
                        className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-blue-100"
                        src={review.user?.avatar || "https://via.placeholder.com/40"}
                        alt={review.user?.fullName || "User Avatar"}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">{review.user?.fullName || "Anonymous"}</p>
                            <div className="flex items-center mt-1">
                              {Array.from({ length: 5 }).map((_, index) =>
                                index < review.rate ? (
                                  <FaStar key={index} className="text-yellow-400 text-sm" />
                                ) : (
                                  <FaRegStar key={index} className="text-gray-300 text-sm" />
                                )
                              )}
                              <span className="ml-2 text-sm text-gray-600">{review.rate} sao</span>
                            </div>
                          </div>

                          {/* AI Sentiment Analysis Badge */}
                          <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                            review.rate >= 4 ? 'bg-green-100 text-green-800' :
                            review.rate >= 3 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {review.rate >= 4 ? 'Tích cực' : review.rate >= 3 ? 'Trung tính' : 'Tiêu cực'}
                          </div>
                        </div>

                        <p className="text-gray-700 mt-3">{review.comment}</p>

                        {review.imageRatings && review.imageRatings.length > 0 && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {review.imageRatings.map((image, index) => (
                              <div key={index} className="relative group">
                                <img className="w-20 h-20 object-cover rounded-lg border border-gray-200" src={image} alt={`Review ${index}`} />
                                <div className="absolute inset-0 bg-blue-900 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg"></div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Xem thêm đánh giá
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg font-medium mb-2">Chưa có đánh giá nào cho sản phẩm này</p>
              <p className="text-gray-400">Hãy là người đầu tiên chia sẻ trải nghiệm của bạn</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
