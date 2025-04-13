import React, { useState } from 'react';
import { FaStar, FaUpload, FaTimes, FaSpinner } from 'react-icons/fa';
import axios from "../../../src/redux/setup/axios";
import { showSuccessToast, showErrorToast } from '../../components/Toast/ToastNotification';
const OrderRating = ({ orderId, onRatingSuccess, onClose }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

  // Function to handle star rating hover
  const handleRatingHover = (hoverRating) => {
    setHoveredRating(hoverRating);
  };

  // Function to handle star rating click
  const handleRatingClick = (clickedRating) => {
    setRating(clickedRating);
  };

  // Function to handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 0) {
      // Limit to 5 images
      const newFiles = files.slice(0, 5 - images.length);

      if (newFiles.length > 0) {
        setImages([...images, ...newFiles]);

        // Create preview URLs for the images
        const newImagePreviews = newFiles.map(file => URL.createObjectURL(file));
        setImagePreviewUrls([...imagePreviewUrls, ...newImagePreviews]);
      }
    }
  };

  // Function to remove an image
  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newImagePreviewUrls = [...imagePreviewUrls];
    URL.revokeObjectURL(newImagePreviewUrls[index]); // Clean up the URL
    newImagePreviewUrls.splice(index, 1);
    setImagePreviewUrls(newImagePreviewUrls);
  };

  // Function to submit the rating
  const handleSubmitRating = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Create form data for multipart/form-data request
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('rating', rating);
      formData.append('comment', comment);

      // Add images if there are any
      images.forEach(image => {
        formData.append('imageFiles', image);
      });

      // Get the token from localStorage
      const token = localStorage.getItem('token');

      // Make API call to submit rating
      const response = await axios.post('/api/v1/user/order/rating', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.statusCode === 200) {
        setSuccess(true);
        showSuccessToast('Đánh giá của bạn đã được gửi thành công!');
        
        // Cleanup preview URLs
        imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        setIsSubmitting(false);

        // Inform parent component of successful rating immediately
        if (onRatingSuccess) {
          onRatingSuccess();
        }

        // Close the modal after a short delay to show success message
        onClose();
      } else {
        showErrorToast(response.data.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError(err.response?.data?.message || 'Có lỗi khi gửi đánh giá. Vui lòng thử lại sau.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={(e) => {
      // Close modal when clicking on backdrop
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Đánh giá đơn hàng #{orderId}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Đóng"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 flex items-start">
              <FaTimes className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success ? (
            <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="font-medium">Cảm ơn bạn đã đánh giá!</p>
              <p className="text-sm mt-1">Đánh giá của bạn đã được gửi thành công.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitRating}>
              {/* Rating Stars */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Đánh giá của bạn:</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => handleRatingHover(star)}
                      onMouseLeave={() => handleRatingHover(0)}
                      onClick={() => handleRatingClick(star)}
                      className="text-3xl focus:outline-none"
                      aria-label={`${star} sao`}
                    >
                      <FaStar
                        className={`${
                          (hoveredRating || rating) >= star
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600">
                    {rating > 0 ?
                      (rating === 1 ? 'Không hài lòng' :
                       rating === 2 ? 'Tạm được' :
                       rating === 3 ? 'Bình thường' :
                       rating === 4 ? 'Hài lòng' :
                       'Rất hài lòng')
                    : ''}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
                  Nhận xét của bạn:
                </label>
                <textarea
                  id="comment"
                  rows="4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Thêm hình ảnh (tối đa 5 ảnh):
                </label>

                {/* Image Preview */}
                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index}`}
                          className="h-24 w-24 object-cover rounded border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-70 group-hover:opacity-100 transition-opacity"
                          aria-label="Xóa ảnh"
                        >
                          <FaTimes className="text-red-500 w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {images.length < 5 && (
                  <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                    <label className="flex flex-col items-center cursor-pointer">
                      <FaUpload className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Chọn ảnh để tải lên</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {images.length}/5 ảnh đã tải lên
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md mr-2 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Đang gửi...
                    </>
                  ) : 'Gửi đánh giá'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderRating;
