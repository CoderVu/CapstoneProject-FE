import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserInfo } from '../../redux/actions/authActions';
import { FaCamera, FaUser, FaMapMarkerAlt, FaSignOutAlt, FaLock, FaEdit, FaSave } from 'react-icons/fa';

const UserProfile = () => {
    const dispatch = useDispatch();
    const { auth, loading, error } = useSelector(state => state.auth);
    const [avatar, setAvatar] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const profile = auth || {};

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            dispatch(fetchUserInfo(token));
        }
    }, [dispatch]);

    useEffect(() => {
        if (profile.avatar) {
            setAvatar(profile.avatar);
        }
    }, [profile.avatar]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result);
                dispatch(); // Add necessary dispatch if you want to update the avatar on the server
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <div className="flex items-center justify-center text-red-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
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
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-48 flex items-end">
                    <div className="container mx-auto px-6 relative">
                        {/* Avatar positioned to overlap the gradient banner and content area */}
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
                    {/* Left sidebar */}
                    <div className="w-full md:w-1/4 pt-20 md:pt-8 px-6 pb-6 border-r border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 md:mt-8">Tài khoản</h2>
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex items-center space-x-3 w-full px-4 py-3 text-left rounded-lg transition-colors ${
                                    activeTab === 'profile'
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <FaUser className={activeTab === 'profile' ? 'text-blue-500' : 'text-gray-500'} />
                                <span>Thông tin tài khoản</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('addresses')}
                                className={`flex items-center space-x-3 w-full px-4 py-3 text-left rounded-lg transition-colors ${
                                    activeTab === 'addresses'
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <FaMapMarkerAlt className={activeTab === 'addresses' ? 'text-blue-500' : 'text-gray-500'} />
                                <span>Danh sách địa chỉ</span>
                            </button>

                            {profile.methodLogin !== 'GOOGLE' && (
                                <button
                                    onClick={() => setActiveTab('password')}
                                    className={`flex items-center space-x-3 w-full px-4 py-3 text-left rounded-lg transition-colors ${
                                        activeTab === 'password'
                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <FaLock className={activeTab === 'password' ? 'text-blue-500' : 'text-gray-500'} />
                                    <span>Thay đổi mật khẩu</span>
                                </button>
                            )}

                            <button
                                className="flex items-center space-x-3 w-full px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <FaSignOutAlt className="text-red-500" />
                                <span>Đăng xuất</span>
                            </button>
                        </nav>
                    </div>

                    {/* Right content area */}
                    <div className="w-full md:w-3/4 p-6 md:pt-8 md:pl-12">
                        <div className="pt-8 md:pt-4 pb-6 border-b border-gray-200">
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                                Thông tin tài khoản
                                <span className="ml-2 text-sm font-normal text-gray-500">
                                    (ID: {profile.id || 'N/A'})
                                </span>
                            </h1>
                            <p className="text-gray-600 mt-1">Quản lý thông tin cá nhân của bạn</p>
                        </div>

                        <div className="mt-8 grid md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                    <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 bg-gray-50">
                                        <span className="text-gray-900 font-medium">{profile.fullName || 'Chưa cập nhật'}</span>
                                        <FaEdit className="ml-auto text-gray-400 hover:text-blue-500 cursor-pointer" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 bg-gray-50">
                                        <span className="text-gray-900">{profile.email || 'Chưa cập nhật'}</span>
                                        {profile.emailVerified && (
                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                Đã xác thực
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                    <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 bg-gray-50">
                                        <span className="text-gray-900">{profile.phoneNumber || 'Chưa cập nhật'}</span>
                                        <FaEdit className="ml-auto text-gray-400 hover:text-blue-500 cursor-pointer" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức đăng nhập</label>
                                    <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 bg-gray-50">
                                        <span className="text-gray-900 capitalize">{profile.methodLogin?.toLowerCase() || 'Standard'}</span>
                                        {profile.methodLogin === 'GOOGLE' && (
                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                Google
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                                    <textarea
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none h-40"
                                        placeholder="Thêm ghi chú cá nhân..."
                                    ></textarea>
                                </div>

                                <div className="flex justify-end">
                                    <button className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-300">
                                        <FaSave />
                                        <span>Lưu thay đổi</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-blue-800 mb-4">Hoạt động gần đây</h3>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            Đăng nhập thành công
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Đã đăng nhập thành công vào {new Date().toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="ml-4 flex-shrink-0 text-sm text-gray-500">
                                        {new Date().toLocaleTimeString()}
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            Cập nhật thông tin
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Thông tin cá nhân đã được cập nhật
                                        </p>
                                    </div>
                                    <div className="ml-4 flex-shrink-0 text-sm text-gray-500">
                                        Hôm qua
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
