import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaStar, FaRegStar } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumbs from "../Breadcrumbs";
import ProductInfo from "../productDetails/ProductInfo";
import ProductsOnSale from "./ProductsOnSale";
import { getProductDetailAndDescription } from "../../../redux/actions/productActions";
import { getRating } from "../../../redux/actions/rateActions";
import ProductTabs from "./ProductTabs";
import { postViewedProduct } from "../../../redux/service/productService";
import "../productDetails/productDetails.css"; // Import the CSS file

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

  useEffect(() => {
    if (id) {
      dispatch(getProductDetailAndDescription(id));
      dispatch(getRating(id, 0, size));
      postViewedProduct(id); // Post the viewed product ID when the component mounts
    }
    setPrevLocation(location.pathname);
  }, [dispatch, id, location, size]);

  useEffect(() => {
    if (rating) {
      const fetchUserDetails = async (review) => {
        try {
          const userResponse = await fetch(`http://localhost:8080/api/v1/public/users/${review.userId}`);
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

        const averageRating = totalRating / totalReviews;

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full mx-auto border-b-[1px] border-b-gray-300 border-t-[1px] border-radius-[10px]">
      <div className="max-w-container mx-auto px-4">
        <div className="xl:-mt-10 -mt-7">
          <Breadcrumbs title="" prevLocation={prevLocation} />
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 h-full -mt-5 xl:-mt-8 pb-10 bg-gray-100 p-4">
          {/* Hình ảnh chiếm 60% */}
          <div className="h-full md:col-span-2 xl:col-span-3 flex flex-col items-center justify-center">
            <div className="image-container">
              <div className={`image-slide ${slideDirection === "left" ? "slide-left" : "slide-right"}`}>
                {selectedImage || productDetail?.mainImage?.path ? (
                  <img
                    src={selectedImage || productDetail.mainImage.path}
                    alt={productDetail.productName}
                    onClick={() => postViewedProduct(productDetail.id)} // Post the viewed product ID when the image is clicked
                  />
                ) : (
                  <div className="w-full h-[400px] flex items-center justify-center text-gray-500 bg-gray-200 rounded-lg">
                    No Image Available
                  </div>
                )}
              </div>
            </div>

            {/* Image Gallery */}
            <div className="thumbnail-container mt-2">
              {productDetail?.images &&
                productDetail?.images.map((image, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${selectedImage === image.path ? "selected" : ""}`}
                    onClick={() => handleImageClick(image.path)}
                  >
                    <img
                      src={image.path}
                      alt={`Product image ${index + 1}`}
                      onClick={() => postViewedProduct(productDetail.id)} // Post the viewed product ID when the thumbnail is clicked
                    />
                  </div>
                ))}
            </div>
          </div>

          {/* Chi tiết sản phẩm chiếm 40% */}
          <div className="h-full w-full md:col-span-1 xl:col-span-2 xl:p-14 flex flex-col gap-6 justify-center">
            <ProductInfo productInfo={productDetail} onImageClick={handleImageClick} />
          </div>
        </div>
        {/* ProductTabs */}
        <div className="w-full bg-white p-4 rounded-lg shadow-md mt-8">
          <ProductTabs productDescription={productDescription} productCareInstructions={productCareInstructions} />
        </div>

        {/* Thống kê đánh giá */}
        <div className="w-full bg-white p-4 rounded-lg shadow-md mt-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Lịch sử đánh giá</h2>
          <div className="flex items-center mb-4">
            <div className="text-4xl font-bold text-gray-900">{ratingSummary.averageRating}/5</div>
            <div className="ml-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, index) =>
                  index < Math.round(ratingSummary.averageRating) ? (
                    <FaStar key={index} className="text-yellow-500 text-lg" />
                  ) : (
                    <FaRegStar key={index} className="text-gray-300 text-lg" />
                  )
                )}
              </div>
              <div className="text-sm text-gray-600">{ratingSummary.totalReviews} đánh giá</div>
            </div>
          </div>

          {/* Biểu đồ thống kê số sao */}
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingSummary.starCounts.map((count, index) => ({ star: `${5 - index} sao`, count }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="star" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#facc15" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Danh sách đánh giá */}
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="mb-4 border-b border-gray-200 pb-4">
                <div className="flex items-center mb-2">
                  <img
                    className="w-10 h-10 rounded-full object-cover mr-2"
                    src={review.user?.avatar || "https://via.placeholder.com/40"}
                    alt={review.user?.fullName || "User Avatar"}
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{review.user?.fullName || "Anonymous"}</p>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, index) =>
                        index < review.rate ? (
                          <FaStar key={index} className="text-yellow-500 text-sm" />
                        ) : (
                          <FaRegStar key={index} className="text-gray-300 text-sm" />
                        )
                      )}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{review.rate} sao</span>
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                {review.imageRatings && review.imageRatings.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {review.imageRatings.map((image, index) => (
                      <img key={index} className="w-20 h-20 object-cover rounded-lg" src={image} alt={`Review ${index}`} />
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-600">Chưa có đánh giá nào.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;