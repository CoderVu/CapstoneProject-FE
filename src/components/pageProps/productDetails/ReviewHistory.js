import React, { useState, useEffect } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

// Helper component for displaying star ratings
const RatingStars = ({ rating }) => {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index}>
          {index < Math.floor(rating) ? (
            <FaStar className="text-yellow-400" />
          ) : (
            <FaRegStar className="text-gray-300" />
          )}
        </span>
      ))}
    </div>
  );
};

// Helper to format ISO date string to a readable format
const formatDate = (dateString) => {
  try {
    if (!dateString) return "";
    // Remove the timezone part if it exists
    const dateWithoutTimezone = dateString.split("[")[0];
    const date = new Date(dateWithoutTimezone);
    return format(date, "d MMMM yyyy 'lúc' HH:mm", { locale: vi });
  } catch (error) {
    console.error("Date formatting error:", error);
    return dateString;
  }
};

const ReviewHistory = ({ reviews, loading = false, productId }) => {
  const [expandedImages, setExpandedImages] = useState(null);
  const [prevReviewCount, setPrevReviewCount] = useState(0);
  const [newReviews, setNewReviews] = useState([]);
  const [validatedReviews, setValidatedReviews] = useState([]);

  // Validate reviews to ensure they belong to the current product
  useEffect(() => {
    if (!productId || !reviews || reviews.length === 0) {
      setValidatedReviews([]);
      return;
    }

    // Filter reviews to ensure they belong to the current product
    const filtered = reviews.filter(review => review.productId === productId);

    if (filtered.length !== reviews.length) {
      console.warn(
        `ReviewHistory: Filtered out ${reviews.length - filtered.length} reviews that didn't match productId ${productId}`
      );
    }

    setValidatedReviews(filtered);
  }, [reviews, productId]);

  // Handle new reviews coming in
  useEffect(() => {
    if (validatedReviews.length > prevReviewCount && prevReviewCount > 0) {
      // Identify the new reviews added
      const newOnes = validatedReviews.slice(prevReviewCount);
      setNewReviews(newOnes.map(review => review.id));

      // Clear the "new" status after a delay
      const timer = setTimeout(() => {
        setNewReviews([]);
      }, 3000);

      return () => clearTimeout(timer);
    }

    setPrevReviewCount(validatedReviews.length);
  }, [validatedReviews, prevReviewCount]);

  if (loading && validatedReviews.length === 0) {
    return (
      <div className="p-8 text-center animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
        <div className="space-y-6">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!validatedReviews || validatedReviews.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto text-gray-300 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p className="text-lg font-medium mb-2">
          Chưa có đánh giá nào cho sản phẩm này
        </p>
        <p className="text-gray-400">
          Hãy là người đầu tiên chia sẻ trải nghiệm của bạn
        </p>
      </div>
    );
  }

  const handleImageClick = (reviewId, index) => {
    setExpandedImages({ reviewId, index });
  };

  const closeExpandedImage = () => {
    setExpandedImages(null);
  };

  // Loading indicator for "Load More"
  const LoadingMore = () => {
    if (!loading || validatedReviews.length === 0) return null;

    return (
      <div className="my-8 flex justify-center">
        <div className="animate-pulse flex items-center space-x-4">
          <div className="w-6 h-6 bg-blue-200 rounded-full"></div>
          <div className="h-4 bg-blue-200 rounded w-36"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 py-4">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Đánh giá từ khách hàng ({validatedReviews.length})
      </h3>

      {/* Verification notice */}
      {validatedReviews.length !== reviews.length && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4 text-sm text-yellow-700">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Một số đánh giá không thuộc về sản phẩm này đã được lọc.</span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {validatedReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={newReviews.includes(review.id) ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`border rounded-lg p-5 bg-white dark:bg-gray-800 shadow-sm relative
              ${newReviews.includes(review.id)
                ? "border-blue-300 dark:border-blue-700 shadow-blue-100 dark:shadow-blue-900/30"
                : "border-gray-200 dark:border-gray-700"}`}
          >
            {newReviews.includes(review.id) && (
              <div className="absolute -right-2 -top-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                Mới
              </div>
            )}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 mr-3">
                <img
                  src={review.avatar || "/default-avatar.png"}
                  alt={review.userFullName}
                  className="w-full h-full rounded-full object-cover"
                />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {review.userFullName}
                  </h4>
                  <div className="flex items-center gap-2">
                    <RatingStars rating={review.rate} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {review.rate.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(review.createdAt)}
              </span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-sm my-3">
              {review.comment}
            </p>

            {review.imageRatings && review.imageRatings.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Hình ảnh đánh giá:
                </p>
                <div className="flex flex-wrap gap-2">
                  {review.imageRatings.map((img, index) => (
                    <div
                      key={index}
                      className="cursor-pointer relative group"
                      onClick={() => handleImageClick(review.id, index)}
                    >
                      <img
                        src={img}
                        alt={`Review ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-md border border-gray-200 dark:border-gray-700 transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-md transition-all flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading more indicator */}
      <LoadingMore />

      {/* Image Modal for expanded view */}
      {expandedImages && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeExpandedImage}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative max-w-3xl max-h-[90vh] p-2"
          >
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 z-10"
              onClick={closeExpandedImage}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={
                validatedReviews
                  .find((r) => r.id === expandedImages.reviewId)
                  ?.imageRatings[expandedImages.index]
              }
              alt="Expanded view"
              className="max-h-[85vh] max-w-full object-contain rounded-lg"
            />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ReviewHistory;
