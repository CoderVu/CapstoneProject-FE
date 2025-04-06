import React, { useState, useEffect } from 'react';
import { addDiscountCode, fetchDiscountCodes, applyDiscountCodeToUser } from '../../../redux/service/discountService';
import { fetchAllUser } from '../../../redux/service/userService';

const AddDiscountCode = () => {
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [discountCodes, setDiscountCodes] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [addSuccess, setAddSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetchAllUser();
        setUsers(response);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage('');
      setAddSuccess(false);
      const response = await addDiscountCode(discountPercentage, expiryDate);
      console.log("response.data", response.data);
      setAddSuccess(true);
      setDiscountPercentage('');
      setExpiryDate('');
      // Tự động tắt thông báo thành công sau 3 giây
      setTimeout(() => {
        setAddSuccess(false);
      }, 3000);
      // call lại hàm để lấy danh sách mã giảm giá mới nhất
      const updatedCodes = await fetchDiscountCodes();

      console.log("updatedCodes", updatedCodes.data);
      setDiscountCodes(updatedCodes.data);

    } catch (error) {
      console.error('Lỗi khi thêm mã giảm giá:', error);
      setErrorMessage('Có lỗi xảy ra khi thêm mã giảm giá. Vui lòng thử lại.');
    }
  };

  return (
    <div className="add-discount-code p-4 bg-white shadow-md rounded-lg border border-gray-100 max-w-md">
      <h2 className="text-lg font-bold mb-3 text-gray-800">Thêm Mã Giảm Giá</h2>
      {addSuccess && (
        <div className="mb-3 p-2 bg-green-100 text-green-700 rounded-md text-sm">
          Thêm mã giảm giá thành công!
        </div>
      )}
      {errorMessage && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-md text-sm">
          {errorMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="mb-2">
          <label htmlFor="discountPercentage" className="block text-xs font-medium text-gray-700 mb-1">Phần Trăm Giảm Giá:</label>
          <input
            type="number"
            id="discountPercentage"
            value={discountPercentage}
            onChange={(e) => setDiscountPercentage(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Nhập phần trăm giảm giá"
          />
        </div>
        <div className="mb-2">
          <label htmlFor="expiryDate" className="block text-xs font-medium text-gray-700 mb-1">Ngày Hết Hạn:</label>
          <input
            type="datetime-local"
            id="expiryDate"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500 transition-colors"
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'Thêm Mã'}
        </button>
      </form>
    </div>
  );
};

const ApplyDiscountToUser = () => {
  const [users, setUsers] = useState([]);
  const [discountCodes, setDiscountCodes] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('');
  const [selectedCode, setSelectedCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserTable, setShowUserTable] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersResponse, codesResponse] = await Promise.all([
          fetchAllUser(),
          fetchDiscountCodes()
        ]);
        setUsers(usersResponse);

        // Lọc chỉ lấy các mã còn khả dụng
        const availableCodes = Array.isArray(codesResponse.data)
          ? codesResponse.data.filter(code => code.status === 'AVAILABLE' || code.status === 'ASSIGNED')
          : [];
        setDiscountCodes(availableCodes);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [applySuccess]);

  const handleApplyDiscount = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedCode) {
      setErrorMessage('Vui lòng chọn người dùng và mã giảm giá');
      return;
    }

    try {
      setApplying(true);
      setErrorMessage('');
      // Fix: Ensure parameters are passed in the correct order (first discountCode, then userId)
      await applyDiscountCodeToUser(selectedCode, selectedUser);
      setApplySuccess(true);
      setSelectedUser('');
      setSelectedUserName('');
      setSelectedCode('');
      setSearchTerm('');
      setShowUserTable(false);

      // Tự động tắt thông báo thành công sau 3 giây
      setTimeout(() => {
        setApplySuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Lỗi khi áp dụng mã giảm giá:', error);
      setErrorMessage('Có lỗi xảy ra khi áp dụng mã giảm giá. Vui lòng thử lại.');
    } finally {
      setApplying(false);
    }
  };

  // Lọc danh sách người dùng theo từ khóa tìm kiếm
  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phoneNumber?.includes(searchTerm)
  );

  // Tính toán phân trang cho danh sách người dùng
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Xử lý chọn người dùng từ bảng
  const handleSelectUser = (user) => {
    setSelectedUser(user.id);
    setSelectedUserName(user.fullName || user.email || user.phoneNumber);
    setShowUserTable(false);
  };

  // Xử lý khi người dùng nhấp vào ô tìm kiếm
  const handleSearchFocus = () => {
    setShowUserTable(true);
  };

  return (
    <div className="apply-discount p-4 bg-white shadow-md rounded-lg border border-gray-100 max-w-md mt-4">
      <h2 className="text-lg font-bold mb-3 text-gray-800">Gán Mã Giảm Giá Cho Người Dùng</h2>

      {applySuccess && (
        <div className="mb-3 p-2 bg-green-100 text-green-700 rounded-md text-sm">
          Áp dụng mã giảm giá thành công!
        </div>
      )}

      {errorMessage && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-md text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleApplyDiscount} className="space-y-3">
        <div className="mb-2 relative">
          <label htmlFor="searchUser" className="block text-xs font-medium text-gray-700 mb-1">Tìm Người Dùng:</label>
          <div className="relative">
            <input
              type="text"
              id="searchUser"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowUserTable(true);
                setCurrentPage(1);
              }}
              onFocus={handleSearchFocus}
              placeholder="Nhập tên, email hoặc số điện thoại"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {selectedUser && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700 flex justify-between items-center">
                <span>Đã chọn: {selectedUserName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser('');
                    setSelectedUserName('');
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {showUserTable && searchTerm && (
            <div className="absolute z-10 mt-1 w-full md:w-[450px] bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-3 text-center text-gray-500">Đang tải...</div>
              ) : currentUsers.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email/SĐT</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chọn</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.fullName || '—'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {user.email || user.phoneNumber || '—'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          <button
                            type="button"
                            onClick={() => handleSelectUser(user)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            Chọn
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-3 text-center text-gray-500">Không tìm thấy người dùng</div>
              )}

              {filteredUsers.length > usersPerPage && (
                <div className="p-2 border-t border-gray-200 bg-gray-50">
                  <Pagination
                    totalItems={filteredUsers.length}
                    itemsPerPage={usersPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}

              <div className="p-2 border-t border-gray-200 bg-gray-50 text-right">
                <button
                  type="button"
                  onClick={() => setShowUserTable(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-2">
          <label htmlFor="selectedCode" className="block text-xs font-medium text-gray-700 mb-1">Chọn Mã Giảm Giá:</label>
          <select
            id="selectedCode"
            value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option key="default-code" value="">-- Chọn mã giảm giá --</option>
            {discountCodes.map(code => (
              <option key={code.id || code.code} value={code.code}>
                {code.code} - Giảm {code.discountPercentage}%
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-green-500 transition-colors"
          disabled={loading || applying || !selectedUser || !selectedCode}
        >
          {applying ? 'Đang áp dụng...' : 'Áp Dụng Mã'}
        </button>
      </form>
    </div>
  );
};

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5; // Show at most 5 page numbers

    if (totalPages <= maxPagesToShow) {
      // If we have few pages, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Complex logic for when we have many pages
      // Always include first page, last page, current page, and 1-2 pages around current
      if (currentPage <= 3) {
        // We're near the start
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // We're near the end
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // We're in the middle
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-1 mt-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-2 py-1 rounded-md text-xs ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        &laquo;
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`px-2 py-1 rounded-md text-xs ${
            page === currentPage
              ? 'bg-indigo-600 text-white'
              : page === '...'
                ? 'bg-white text-gray-500 cursor-default'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-2 py-1 rounded-md text-xs ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        &raquo;
      </button>
    </div>
  );
};

const DiscountCodeList = () => {
  const [discountCodes, setDiscountCodes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // Increased from 5 to 8 for more compact display
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        setLoading(true);
        const response = await fetchDiscountCodes();
        setDiscountCodes(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách mã giảm giá:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCodes();
  }, []);

  const discountImages = [
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  ];

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        alert('Mã đã được sao chép: ' + code);
      })
      .catch(err => {
        console.error('Không thể sao chép mã:', err);
      });
  };

  // Get current codes
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCodes = discountCodes.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="discount-code-list p-4 md:p-6 bg-white shadow-lg rounded-xl mt-8 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Danh Sách Mã Giảm Giá</h2>
        <div className="text-gray-500 text-xs md:text-sm">
          Hiển thị {discountCodes.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, discountCodes.length)} trên {discountCodes.length} mã
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent mx-auto mb-2"></div>
          Đang tải mã giảm giá...
        </div>
      ) : discountCodes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentCodes.map((code, index) => {
              const isAvailable = code.status === 'AVAILABLE';

              return (
                <div
                  key={code.code}
                  className={`p-3 border rounded-lg ${isAvailable ? 'border-gray-200' : 'border-gray-200 bg-gray-100 opacity-70'}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={discountImages[(indexOfFirstItem + index) % discountImages.length]}
                        alt="Giảm Giá"
                        className={`w-full h-full object-cover ${!isAvailable && 'filter grayscale'}`}
                      />
                      <div className={`absolute top-0 right-0 ${isAvailable ? 'bg-red-500' : 'bg-gray-500'} text-white font-bold text-xs p-1 rounded-bl-lg`}>
                        {code.discountPercentage}%
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-gray-900 truncate">{code.code}</p>
                          <p className="text-xs text-gray-600">Giảm: <span className="font-semibold text-green-600">{code.discountPercentage}%</span></p>
                          <p className="text-xs text-gray-600">Hết hạn: <span className="font-semibold">{new Date(code.expiryDate).toLocaleDateString()}</span></p>
                        </div>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {isAvailable ? 'Khả dụng' : 'Hết hạn'}
                        </div>
                      </div>

                      {isAvailable && (
                        <button
                          onClick={() => handleCopyCode(code.code)}
                          className="mt-2 px-2 py-1 text-xs text-white rounded-md bg-indigo-600 hover:bg-indigo-700 transition-colors"
                        >
                          Sao Chép
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <Pagination
              totalItems={discountCodes.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        <div className="py-8 text-center text-gray-500">
          Chưa có mã giảm giá nào. Hãy tạo mã mới ở trên!
        </div>
      )}
    </div>
  );
};

const DiscountCodeManager = () => {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Quản Lý Mã Giảm Giá</h1>
      <div className="grid gap-8 lg:grid-cols-[350px_1fr] grid-cols-1">
        <div className="space-y-4">
          <AddDiscountCode />
          <ApplyDiscountToUser />
        </div>
        <DiscountCodeList />
      </div>
    </div>
  );
};

export default DiscountCodeManager;
