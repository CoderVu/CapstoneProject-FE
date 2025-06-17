import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  FaCamera, FaUser, FaMapMarkerAlt, FaSignOutAlt, FaLock,
  FaEdit, FaSave, FaShieldAlt, FaHistory, FaEnvelope,
  FaPhone, FaTimes, FaCheckCircle, FaEye, FaEyeSlash
} from 'react-icons/fa';
import { fetchUserInfo } from '../../redux/actions/authActions';
import AddressManagement from './AddressManagement';
import { updateUserInfo, changePassword } from '../../redux/service/userService';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const dispatch = useDispatch();
  const { auth, loading, error } = useSelector(state => state.auth);
  const [avatar, setAvatar] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState({
    fullName: false,
  });
  const [profileData, setProfileData] = useState({
    fullName: '',
    phoneNumber: '',
    notes: '',
    avatar: null,

  });
  const [token, setToken] = useState(null);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const profile = React.useMemo(() => auth || {}, [auth]);

  // Fetch user info on mount and get token
  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (authToken) {
      setToken(authToken);
      dispatch(fetchUserInfo(authToken));
    }
  }, [dispatch]);

  // Update local state when profile data changes
  useEffect(() => {
    if (profile) {
      setProfileData({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        notes: profile.notes || '',
        avatar: profile.avatar || null,
      });

      if (profile.avatar) {
        setAvatar(profile.avatar);
      }
    }
  }, [profile]);


  // Handle avatar change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Lưu file để gửi lên server
      setProfileData(prev => ({
        ...prev,
        avatar: file
      }));

      // Hiển thị preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  // Toggle edit mode for a field
  const toggleEditMode = (field) => {
    setEditMode(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      // Tạo FormData để gửi lên server
      const formData = new FormData();
      formData.append('fullName', profileData.fullName);
      formData.append('phoneNumber', profileData.phoneNumber);

      // Thêm file avatar nếu có
      if (profileData.avatar) {
        formData.append('avatar', profileData.avatar);
      }

      // Gọi API cập nhật thông tin người dùng
      const response = await updateUserInfo(formData);

      // Cập nhật state nếu thành công
      if (response) {
        // Reset avatar sau khi upload thành công
        setProfileData(prev => ({
          ...prev,
          avatar: null
        }));

        // Refresh user data
        dispatch(fetchUserInfo(token));


      }
      // Reset edit mode for all fields
      setEditMode({
        fullName: false,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Handle password change
  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword(passwordData.oldPassword, passwordData.newPassword);
      
      // Reset form
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswords({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false
      });
    } catch (error) {
      console.error("Error changing password:", error);
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Loading state
  if (loading && !profile.id) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <FaTimes className="h-12 w-12" />
          </div>
          <h2 className="text-xl font-bold text-center text-gray-800 mb-4">Lỗi kết nối</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors duration-300"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-48 flex items-end">
          <div className="container mx-auto px-6 relative">
            <div className="absolute bottom-0 transform translate-y-1/2">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <FaUser className="text-gray-400" size={48} />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-2.5 rounded-full cursor-pointer shadow-md transition-all duration-300 transform group-hover:scale-110">
                  <FaCamera className="text-white" size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-1/4 pt-20 md:pt-8 px-6 pb-6 border-r border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 md:mt-8">Tài khoản</h2>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-3 w-full px-4 py-3 text-left rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <FaUser className={activeTab === 'profile' ? 'text-blue-500' : 'text-gray-500'} />
                <span>Thông tin tài khoản</span>
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`flex items-center space-x-3 w-full px-4 py-3 text-left rounded-lg transition-colors ${activeTab === 'addresses' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <FaMapMarkerAlt className={activeTab === 'addresses' ? 'text-blue-500' : 'text-gray-500'} />
                <span>Danh sách địa chỉ</span>
              </button>
              {profile.methodLogin !== 'GOOGLE' && (
                <button
                  onClick={() => setActiveTab('password')}
                  className={`flex items-center space-x-3 w-full px-4 py-3 text-left rounded-lg transition-colors ${activeTab === 'password' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <FaLock className={activeTab === 'password' ? 'text-blue-500' : 'text-gray-500'} />
                  <span>Thay đổi mật khẩu</span>
                </button>
              )}
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center space-x-3 w-full px-4 py-3 text-left rounded-lg transition-colors ${activeTab === 'security' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <FaShieldAlt className={activeTab === 'security' ? 'text-blue-500' : 'text-gray-500'} />
                <span>Bảo mật</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <FaSignOutAlt className="text-red-500" />
                <span>Đăng xuất</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4 p-6 md:pt-8 md:pl-12">
            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                  Thông tin tài khoản
                  {profile.id && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      (ID: {profile.id.substring(0, 8)}...)
                    </span>
                  )}
                </h1>
                <p className="text-gray-600 mt-1 mb-6">Quản lý thông tin cá nhân của bạn</p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaCheckCircle className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Xác thực tài khoản
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          {profile.emailVerified
                            ? "Tài khoản của bạn đã được xác thực."
                            : "Vui lòng xác thực email của bạn để đảm bảo an toàn cho tài khoản."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                      {editMode.fullName ? (
                        <div className="flex items-center">
                          <input
                            type="text"
                            name="fullName"
                            value={profileData.fullName}
                            onChange={handleInputChange}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nhập họ và tên"
                          />
                          <button
                            onClick={() => toggleEditMode('fullName')}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-r-lg border-y border-r border-gray-300"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 bg-gray-50">
                          <span className="text-gray-900 font-medium">
                            {profile.fullName || 'Chưa cập nhật'}
                          </span>
                          <button
                            onClick={() => toggleEditMode('fullName')}
                            className="ml-auto text-gray-400 hover:text-blue-500 cursor-pointer"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 bg-gray-50">
                        <span className="text-gray-900">{profile.email || 'Chưa cập nhật'}</span>
                        {profile.emailVerified && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            <FaCheckCircle className="mr-1" size={10} /> Đã xác thực
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                      {editMode.phone ? (
                        <div className="flex items-center">
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={profileData.phoneNumber}

                            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nhập số điện thoại"
                          />

                        </div>
                      ) : (
                        <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 bg-gray-50">
                          <span className="text-gray-900">
                            {profile.phoneNumber || 'Chưa cập nhật'}
                          </span>


                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức đăng nhập</label>
                      <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 bg-gray-50">
                        <span className="text-gray-900 capitalize">
                          {profile.methodLogin?.toLowerCase() || 'Standard'}
                        </span>
                        {profile.methodLogin === 'GOOGLE' && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Google
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                      <textarea
                        name="notes"
                        value={profileData.notes}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none h-40"
                        placeholder="Thêm ghi chú cá nhân..."
                      ></textarea>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Liên kết tài khoản</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <FaEnvelope className="text-blue-600" />
                            </div>
                            <span className="ml-3 text-gray-800">Email</span>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            Đã liên kết
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <FaPhone className="text-blue-600" />
                            </div>
                            <span className="ml-3 text-gray-800">Số điện thoại</span>
                          </div>
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                            Chưa liên kết
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-300"
                      >
                        <FaSave />
                        <span>Lưu thay đổi</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-10">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Hoạt động gần đây</h3>
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      <div className="flex items-start p-4">
                        <div className="flex-shrink-0 pt-0.5">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaHistory className="text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">Đăng nhập thành công</h4>
                            <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-700">
                            Đăng nhập vào tài khoản từ {navigator.userAgent.includes('Mobile') ? 'thiết bị di động' : 'máy tính'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start p-4">
                        <div className="flex-shrink-0 pt-0.5">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <FaEdit className="text-green-600" />
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">Cập nhật thông tin</h4>
                            <p className="text-sm text-gray-500">Hôm qua</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-700">
                            Thông tin cá nhân của bạn đã được cập nhật
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <AddressManagement token={token} />
              </motion.div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Thay đổi mật khẩu</h1>
                <p className="text-gray-600 mb-6">Cập nhật mật khẩu của bạn để bảo mật tài khoản</p>

                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm max-w-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                      <div className="relative">
                        <input
                          type={showPasswords.oldPassword ? "text" : "password"}
                          name="oldPassword"
                          value={passwordData.oldPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('oldPassword')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.oldPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                      <div className="relative">
                        <input
                          type={showPasswords.newPassword ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nhập mật khẩu mới"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('newPassword')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.newPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {passwordData.newPassword && (
                        <p className="text-xs text-gray-500 mt-1">
                          Mật khẩu phải có ít nhất 6 ký tự
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 ${
                            passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                              ? 'border-red-300 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                          placeholder="Nhập lại mật khẩu mới"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirmPassword')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">
                          Mật khẩu không khớp
                        </p>
                      )}
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={handleChangePassword}
                        disabled={changingPassword || !passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors duration-300 flex items-center justify-center"
                      >
                        {changingPassword ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            <span>Đang đổi mật khẩu...</span>
                          </>
                        ) : (
                          <>
                            <FaLock className="mr-2" />
                            <span>Cập nhật mật khẩu</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Password requirements */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Yêu cầu mật khẩu:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${passwordData.newPassword && passwordData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          Ít nhất 6 ký tự
                        </li>
                        <li className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${passwordData.newPassword && passwordData.newPassword !== passwordData.oldPassword ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          Khác với mật khẩu hiện tại
                        </li>
                        <li className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          Xác nhận mật khẩu khớp
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Bảo mật tài khoản</h1>
                <p className="text-gray-600 mb-6">Quản lý các cài đặt bảo mật cho tài khoản của bạn</p>

                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Xác thực hai yếu tố</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700">Bảo vệ tài khoản của bạn bằng xác thực hai yếu tố</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Thêm một lớp bảo mật bổ sung cho tài khoản của bạn
                      </p>
                    </div>
                    <div className="ml-4">
                      <button className="px-4 py-2 border border-blue-500 text-blue-600 hover:bg-blue-50 font-medium rounded-md transition-colors">
                        Thiết lập
                      </button>
                      {/* <Link to="/admin/dashboard" className="ml-2 text-sm text-blue-500 hover:underline">
                        Quản lý
                      </Link> */}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Phiên đăng nhập</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">
                          {navigator.userAgent.includes('Chrome') ? 'Chrome' :
                            navigator.userAgent.includes('Firefox') ? 'Firefox' :
                              navigator.userAgent.includes('Safari') ? 'Safari' : 'Web Browser'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {navigator.platform} • {new Date().toLocaleDateString()} ({new Date().toLocaleTimeString()})
                        </p>
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Hiện tại
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
