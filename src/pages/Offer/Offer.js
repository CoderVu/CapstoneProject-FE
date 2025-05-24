import React, { useState, useEffect } from 'react';
import { fetchDiscountCodes, applyDiscountCodeToMe, getDiscountCodesForUser } from '../../redux/service/discountService';
import { showSuccessToast, showErrorToast } from '../../components/Toast/ToastNotification';

const discountImages = [
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
];

const getRandomImage = () => discountImages[Math.floor(Math.random() * discountImages.length)];
const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const Offer = () => {
  const [availableCodes, setAvailableCodes] = useState([]);
  const [userCodes, setUserCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    const loadCodes = async () => {
      try {
        setLoading(true);
        const [available, user] = await Promise.all([fetchDiscountCodes(), getDiscountCodesForUser()]);
        const userCodeSet = new Set((user?.data || []).map((c) => c.code));
        setAvailableCodes(
          (available?.data || [])
            .filter((c) => !userCodeSet.has(c.code))
            .map((c) => ({ ...c, image: getRandomImage() }))
        );
        setUserCodes((user?.data || []).map((c) => ({ ...c, image: getRandomImage() })));
      } catch {
        showErrorToast('Không thể tải mã giảm giá.');
      } finally {
        setLoading(false);
      }
    };
    loadCodes();
  }, []);

  // Thêm hàm loadCodes ra ngoài để tái sử dụng
  const loadCodes = async () => {
    try {
      setLoading(true);
      const [available, user] = await Promise.all([fetchDiscountCodes(), getDiscountCodesForUser()]);
      const userCodeSet = new Set((user?.data || []).map((c) => c.code));
      setAvailableCodes(
        (available?.data || [])
          .filter((c) => !userCodeSet.has(c.code))
          .map((c) => ({ ...c, image: getRandomImage() }))
      );
      setUserCodes((user?.data || []).map((c) => ({ ...c, image: getRandomImage() })));
    } catch {
      showErrorToast('Không thể tải mã giảm giá.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCode = async (code) => {
    try {
      setApplying(true);
      await applyDiscountCodeToMe(code);
      showSuccessToast('Áp dụng mã giảm giá thành công!');
      await loadCodes(); // Gọi lại API để load lại data
    } catch {
      showErrorToast('Áp dụng mã giảm giá thất bại.');
    } finally {
      setApplying(false);
    }
  };

  // Hàm kiểm tra hết hạn
  const isExpired = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);
    return exp < today;
  };

  const renderCodes = (codes, isAvailable) =>
    codes
      .filter(code => code.status !== "USED") // Ẩn mã đã sử dụng
      .length ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {codes
          .filter(code => code.status !== "USED") // Ẩn mã đã sử dụng
          .map((code) => (
            <div
              key={code.id}
              className="relative overflow-hidden bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className={`absolute top-0 right-0 text-xs font-semibold px-2 py-1 rounded-bl-lg ${isExpired(code.expiryDate) ? 'bg-gray-400 text-white' : 'bg-yellow-500 text-white'}`}>
                {isExpired(code.expiryDate)
                  ? 'Đã hết hạn'
                  : `Hết hạn: ${formatDate(code.expiryDate)}`}
              </div>
              <div className="flex">
                <div className="w-1/3">
                  <img
                    src={code.image}
                    alt="Discount"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="w-2/3 p-4">
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{code.code}</h3>
                      <div className="text-3xl font-extrabold text-red-600 mb-2">{code.discountPercentage}%</div>
                      <p className="text-sm text-gray-600">Giảm giá cho đơn hàng của bạn</p>
                    </div>
                    {isAvailable ? (
                      <button
                        onClick={() => handleApplyCode(code.code)}
                        disabled={applying || isExpired(code.expiryDate)}
                        className="mt-3 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applying ? 'Đang áp dụng...' : 'Áp dụng ngay'}
                      </button>
                    ) : (
                      <button
                        onClick={() => window.location.href = '/cart'}
                        disabled={isExpired(code.expiryDate)}
                        className="mt-3 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Mua hàng để áp dụng
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-10">
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p className="text-gray-500 text-lg">Không có mã giảm giá nào.</p>
      </div>
    );
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Mã giảm giá</h2>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-6 py-3 font-medium text-sm focus:outline-none transition-colors duration-200 ${activeTab === 'available'
            ? 'text-red-600 border-b-2 border-red-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Mã khả dụng
        </button>
        <button
          onClick={() => setActiveTab('my-codes')}
          className={`px-6 py-3 font-medium text-sm focus:outline-none transition-colors duration-200 ${activeTab === 'my-codes'
            ? 'text-red-600 border-b-2 border-red-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Mã của tôi
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : (
        renderCodes(activeTab === 'available' ? availableCodes : userCodes, activeTab === 'available')
      )}
    </div>
  );
};

export default Offer;
