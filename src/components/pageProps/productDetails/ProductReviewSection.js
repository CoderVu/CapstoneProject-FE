import React, { useState, useEffect } from "react";
import axios from "../../../redux/setup/axios";
import ReviewHistory from "./ReviewHistory";

const ProductReviewSection = ({ productId, imageUser }) => {
  const [reviewsData, setReviewsData] = useState(null);
  const [displayedReviews, setDisplayedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // Reset state when productId changes
    setDisplayedReviews([]);
    setReviewsData(null);
    setCurrentPage(0);
    setError(null);
    setLoading(true);
    setHasMore(false);
  }, [productId]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;

      try {
        const response = await axios.get(
          `/api/v1/public/products/rated/${productId}?page=${currentPage}&size=5`
        );

        if (response.data && response.data.statusCode === 200) {
          const data = response.data.data;

          // Verify the reviews are for the correct product
          if (data.response && data.response.length > 0) {
            // Filter to ensure we only include reviews for this specific product
            const validReviews = data.response.filter(
              review => review.productId === productId
            );

            if (validReviews.length !== data.response.length) {
              console.warn(
                `Filtered out ${data.response.length - validReviews.length} reviews that didn't match productId ${productId}`
              );
            }

            setReviewsData({
              ...data,
              response: validReviews,
              totalElements: validReviews.length
            });

            // If first page, set as displayed reviews
            if (currentPage === 0) {
              setDisplayedReviews(validReviews);
            } else {
              // Append to existing reviews, but prevent duplicates
              setDisplayedReviews(prev => {
                const existingIds = new Set(prev.map(r => r.id));
                const uniqueNewReviews = validReviews.filter(r => !existingIds.has(r.id));
                return [...prev, ...uniqueNewReviews];
              });
            }

            // Check if there are more pages (only if we received reviews for this product)
            setHasMore(
              validReviews.length > 0 &&
              data.currentPage < data.totalPages - 1
            );
          } else {
            // No reviews for this product
            setReviewsData({
              ...data,
              response: [],
              totalElements: 0
            });
            setDisplayedReviews([]);
            setHasMore(false);
          }
        } else {
          throw new Error("Failed to fetch reviews");
        }
      } catch (err) {
        console.error(`Error fetching reviews for product ${productId}:`, err);
        setError("Không thể tải đánh giá sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId, currentPage]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      setLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  };

  // If there's an error
  if (error && !loading) {
    return (
      <div className="p-6 text-center text-red-500 border border-red-200 rounded-lg bg-red-50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-lg font-medium mb-2">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            setCurrentPage(0);
            // Trigger a re-fetch by changing a dependency
            setTimeout(() => setCurrentPage(0), 100);
          }}
          className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition"
        >
          Tải lại
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      {/* Review List */}
      <ReviewHistory
        reviews={displayedReviews || []}
        loading={loading}
        productId={productId}
      />

      {/* Load More Button */}
      {!loading && hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
          >
            {loadingMore ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang tải...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Xem thêm đánh giá
              </>
            )}
          </button>
        </div>
      )}

      {/* Debug info - remove in production */}
      {false && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-xs text-gray-600 dark:text-gray-400">
          <p>Product ID: {productId}</p>
          <p>Current Page: {currentPage}</p>
          <p>Total Reviews: {reviewsData?.totalElements || 0}</p>
          <p>Display Reviews: {displayedReviews.length}</p>
          <p>Has More: {hasMore ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

export default ProductReviewSection;
