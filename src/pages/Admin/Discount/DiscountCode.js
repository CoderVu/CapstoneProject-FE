import React, { useState, useEffect } from 'react';
import { addDiscountCode, fetchDiscountCodes, applyDiscountCodeToUser, deleteDiscountCode } from '../../../redux/service/discountService';
import { fetchAllUser } from '../../../redux/service/userService';
import { Gift, User, Percent, Calendar, Loader2, CheckCircle, XCircle, Copy, Trash2, Users, Search, BadgePercent } from 'lucide-react';

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
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
      <div className="flex items-center mb-4 gap-2">
        <Gift className="h-6 w-6 text-indigo-500" />
        <h2 className="text-lg font-bold text-gray-800">Thêm Mã Giảm Giá</h2>
      </div>
      {addSuccess && (
        <div className="mb-3 flex items-center gap-2 p-2 bg-green-50 text-green-700 rounded-md text-sm border border-green-200">
          <CheckCircle className="h-4 w-4" /> Thêm mã giảm giá thành công!
        </div>
      )}
      {errorMessage && (
        <div className="mb-3 flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
          <XCircle className="h-4 w-4" /> {errorMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="discountPercentage" className="block text-xs font-medium text-gray-700 mb-1">Phần Trăm Giảm Giá</label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="number"
              id="discountPercentage"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              required
              min={1}
              max={100}
              className="pl-9 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập phần trăm giảm giá"
            />
          </div>
        </div>
        <div>
          <label htmlFor="expiryDate" className="block text-xs font-medium text-gray-700 mb-1">Ngày Hết Hạn</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="datetime-local"
              id="expiryDate"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
              className="pl-9 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500 transition-colors disabled:opacity-60"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <BadgePercent className="h-4 w-4" />} Thêm Mã
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
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
      <div className="flex items-center mb-4 gap-2">
        <Users className="h-6 w-6 text-green-500" />
        <h2 className="text-lg font-bold text-gray-800">Gán Mã Giảm Giá Cho Người Dùng</h2>
      </div>
      {applySuccess && (
        <div className="mb-3 flex items-center gap-2 p-2 bg-green-50 text-green-700 rounded-md text-sm border border-green-200">
          <CheckCircle className="h-4 w-4" /> Áp dụng mã giảm giá thành công!
        </div>
      )}
      {errorMessage && (
        <div className="mb-3 flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
          <XCircle className="h-4 w-4" /> {errorMessage}
        </div>
      )}
      <form onSubmit={handleApplyDiscount} className="space-y-4">
        <div className="relative">
          <label htmlFor="searchUser" className="block text-xs font-medium text-gray-700 mb-1">Tìm Người Dùng</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
              className="pl-9 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          {showUserTable && searchTerm && (
            <div className="absolute z-20 mt-1 w-full md:w-[450px] bg-white border border-gray-300 rounded-xl shadow-lg max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-3 text-center text-gray-500 flex items-center justify-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Đang tải...</div>
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
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{user.fullName || '—'}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{user.email || user.phoneNumber || '—'}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          <button
                            type="button"
                            onClick={() => handleSelectUser(user)}
                            className="text-green-600 hover:text-green-900 font-medium flex items-center gap-1"
                          >
                            <User className="h-4 w-4" /> Chọn
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
        <div>
          <label htmlFor="selectedCode" className="block text-xs font-medium text-gray-700 mb-1">Chọn Mã Giảm Giá</label>
          <select
            id="selectedCode"
            value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value)}
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
          >
            <option key="default-code" value="">-- Chọn mã giảm giá --</option>
            {discountCodes.map(code => (
              <option key={code.id || code.code} value={code.code}>
                {code.code} - Giảm {code.discountPercentage}% {code.status === 'AVAILABLE' ? '🟢' : code.status === 'ASSIGNED' ? '🔵' : code.status === 'USED' ? '🟡' : '⚪'}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-green-500 transition-colors disabled:opacity-60"
          disabled={loading || applying || !selectedUser || !selectedCode}
        >
          {applying ? <Loader2 className="animate-spin h-4 w-4" /> : <BadgePercent className="h-4 w-4" />} Áp Dụng Mã
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
        className={`px-2 py-1 rounded-md text-xs ${currentPage === 1
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
          className={`px-2 py-1 rounded-md text-xs ${page === currentPage
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
        className={`px-2 py-1 rounded-md text-xs ${currentPage === totalPages
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
  const [itemsPerPage] = useState(8);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL'); // Thêm state lọc

  useEffect(() => {
    fetchCodes();
  }, []);

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

  const handleDeleteCode = async (code) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã này?')) return;
    try {
      await deleteDiscountCode(code);
      setDiscountCodes(prev => prev.filter(item => item.code !== code));
    } catch (error) {
      alert('Xóa mã giảm giá thất bại!');
    }
  };

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

  // Lọc theo trạng thái
  const filteredCodes = filterStatus === 'ALL'
    ? discountCodes
    : discountCodes.filter(code => code.status === filterStatus);

  // Get current codes
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCodes = filteredCodes.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <BadgePercent className="h-6 w-6 text-indigo-500" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Danh Sách Mã Giảm Giá</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs md:text-sm">Lọc:</span>
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="border border-gray-300 rounded px-2 py-1 text-xs md:text-sm"
          >
            <option value="ALL">Tất cả</option>
            <option value="AVAILABLE">Khả dụng</option>
            <option value="USED">Đã sử dụng</option>
            <option value="EXPIRED">Hết hạn</option>
            <option value="ASSIGNED">Đã gán</option>
          </select>
        </div>
        <div className="text-gray-500 text-xs md:text-sm">
          Hiển thị {filteredCodes.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredCodes.length)} trên {filteredCodes.length} mã
        </div>
      </div>
      {loading ? (
        <div className="py-8 text-center text-gray-500 flex flex-col items-center gap-2">
          <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
          Đang tải mã giảm giá...
        </div>
      ) : filteredCodes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentCodes.map((code, index) => {
              const isAvailable = code.status === 'AVAILABLE';
              const isUsed = code.status === 'USED';
              const isExpired = code.status === 'EXPIRED';
              const isAssigned = code.status === 'ASSIGNED';
              return (
                <div
                  key={code.code}
                  className={`p-4 border rounded-xl shadow-sm flex items-start gap-4 transition-all duration-200 hover:shadow-md relative bg-white ${
                    isAvailable
                      ? 'border-green-200'
                      : isUsed
                        ? 'border-yellow-200 bg-yellow-50'
                        : isExpired
                          ? 'border-gray-200 bg-gray-50'
                          : isAssigned
                            ? 'border-blue-200 bg-blue-50'
                            : 'border-gray-200'
                  }`}
                >
                  <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100">
                    <img
                      src={discountImages[(indexOfFirstItem + index) % discountImages.length]}
                      alt="Giảm Giá"
                      className={`w-full h-full object-cover ${!isAvailable && 'filter grayscale'}`}
                    />
                    <div className={`absolute top-0 right-0 px-2 py-1 rounded-bl-lg text-xs font-bold text-white ${
                      isAvailable ? 'bg-green-500'
                        : isUsed ? 'bg-yellow-500'
                        : isExpired ? 'bg-gray-500'
                        : isAssigned ? 'bg-blue-500'
                        : 'bg-gray-500'
                    }`}>
                      {code.discountPercentage}%
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-base font-bold text-gray-900 truncate flex items-center gap-1">
                          <BadgePercent className="h-4 w-4 text-indigo-500" /> {code.code}
                        </p>
                        <p className="text-xs text-gray-600">Giảm: <span className="font-semibold text-green-600">{code.discountPercentage}%</span></p>
                        <p className="text-xs text-gray-600">Hết hạn: <span className="font-semibold">{new Date(code.expiryDate).toLocaleDateString()}</span></p>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                        isAvailable ? 'bg-green-100 text-green-800'
                        : isUsed ? 'bg-yellow-100 text-yellow-800'
                        : isExpired ? 'bg-gray-100 text-gray-800'
                        : isAssigned ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isAvailable
                          ? <><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>Khả dụng</>
                          : isUsed
                            ? <><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span>Đã sử dụng</>
                            : isExpired
                              ? <><span className="w-2 h-2 rounded-full bg-gray-400 inline-block"></span>Hết hạn</>
                              : isAssigned
                                ? <><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>Đã gán</>
                                : code.status}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {isAvailable && (
                        <button
                          onClick={() => handleCopyCode(code.code)}
                          className="px-2 py-1 text-xs text-white rounded-md bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-1"
                        >
                          <Copy className="h-4 w-4" /> Sao Chép
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCode(code.code)}
                        className="px-2 py-1 text-xs text-white rounded-md bg-red-500 hover:bg-red-600 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" /> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4">
            <Pagination
              totalItems={filteredCodes.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        <div className="py-8 text-center text-gray-500 flex flex-col items-center gap-2">
          <Gift className="h-8 w-8 text-gray-300" />
          Chưa có mã giảm giá nào. Hãy tạo mã mới ở trên!
        </div>
      )}
    </div>
  );
};

const DiscountCodeManager = () => {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 flex items-center justify-center gap-2">
        <BadgePercent className="h-8 w-8 text-indigo-500" /> Quản Lý Mã Giảm Giá
      </h1>
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
