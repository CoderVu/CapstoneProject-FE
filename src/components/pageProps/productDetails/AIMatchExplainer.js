import React, { useState } from 'react';
import { FaTimes, FaLightbulb, FaPercentage, FaRobot, FaImage } from 'react-icons/fa';

/**
 * Component giải thích cách hoạt động của tính năng tìm kiếm sản phẩm bằng AI
 */
const AIMatchExplainer = ({ isOpen: initialIsOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen);

  if (!isOpen && !initialIsOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="mb-4 flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
      >
        <FaLightbulb className="mr-1" />
        <span>AI nhận diện hình ảnh hoạt động như thế nào?</span>
      </button>
    );
  }

  return (
    <div className="mb-6">
      {!initialIsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />
      )}
      <div className={`${initialIsOpen ? '' : 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50'} w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out`}>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center">
            <FaRobot className="text-2xl mr-3" />
            <h3 className="font-bold text-lg">AI Nhận Diện Hình Ảnh Hoạt Động Như Thế Nào</h3>
          </div>
          {!initialIsOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
            >
              <FaTimes className="text-white" />
            </button>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-lg mr-3 text-blue-600">
                  <FaImage className="text-lg" />
                </div>
                <div>
                  <h4 className="text-gray-800 font-medium">Trích Xuất Đặc Trưng</h4>
                  <p className="text-sm text-gray-600">
                    AI nhận diện các đặc trưng hình ảnh từ ảnh bạn tải lên, phân tích các mẫu, hình dạng,
                    màu sắc và kết cấu.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-purple-100 p-2 rounded-lg mr-3 text-purple-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-gray-800 font-medium">So Sánh Vector Đặc Trưng</h4>
                  <p className="text-sm text-gray-600">
                    Mỗi hình ảnh sản phẩm được chuyển đổi thành "vector đặc trưng" (embedding) - biểu diễn toán học
                    các đặc điểm hình ảnh trong không gian nhiều chiều.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-lg mr-3 text-green-600">
                  <FaPercentage className="text-lg" />
                </div>
                <div>
                  <h4 className="text-gray-800 font-medium">Tính Toán Độ Tương Đồng</h4>
                  <p className="text-sm text-gray-600">
                    Điểm tương đồng (0-100%) được tính toán giữa hình ảnh của bạn và các sản phẩm trong cơ sở dữ liệu,
                    khoảng cách càng thấp thì độ tương đồng càng cao.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Hiểu Phần Trăm Tương Đồng</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">90-100% Tương đồng</span>
                    <span className="text-xs font-medium text-green-600">Gần như giống hệt</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-green-500 to-green-400 h-1.5 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">70-89% Tương đồng</span>
                    <span className="text-xs font-medium text-blue-600">Rất giống nhau</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">50-69% Tương đồng</span>
                    <span className="text-xs font-medium text-indigo-600">Kiểu dáng tương tự</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Dưới 50% Tương đồng</span>
                    <span className="text-xs font-medium text-gray-600">Tương đồng thấp</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-gray-500 to-gray-400 h-1.5 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p>Lưu ý: Tương đồng về hình ảnh không đảm bảo sản phẩm có cùng tính năng, kích thước, hoặc chất liệu. Luôn kiểm tra thông tin chi tiết trước khi mua.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  Mô hình AI của chúng tôi liên tục được cải thiện với nhiều dữ liệu hơn. Độ chính xác của khớp hình ảnh ngày càng tăng khi hệ thống học hỏi từ tương tác của người dùng.
                </p>
              </div>
            </div>
          </div>

          {!initialIsOpen && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIMatchExplainer;
