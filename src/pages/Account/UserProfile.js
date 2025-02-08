import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserInfo } from '../../redux/actions/userAction';
import { FaCamera } from 'react-icons/fa';

const UserProfile = () => {
    const dispatch = useDispatch();
    const { profile, loading, error } = useSelector(state => state.user);
    const [avatar, setAvatar] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            dispatch(fetchUserInfo(token));
        }
    }, [dispatch]);

    useEffect(() => {
        if (profile) {
            setAvatar(profile.avatar);
        }
    }, [profile]);

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

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-red-500 text-center">Error: {error}</div>;

    return (
        <div className="container mx-auto flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 p-6">
                <h1 className="text-2xl font-bold mb-6">TÀI KHOẢN</h1>
                <ul>
                    <li className="mb-2"><a href="#" className="hover:underline">Thông tin tài khoản</a></li>
                    <li className="mb-2"><a href="#" className="hover:underline">Danh sách địa chỉ</a></li>
                    <li><a href="#" className="hover:underline">Đăng xuất</a></li>
                </ul>
            </div>
            <div className="w-full md:w-1/2 p-6">
                <h1 className="text-2xl font-bold mb-6">THÔNG TIN TÀI KHOẢN</h1>
                <div className="flex flex-col items-center relative">
                    <div className="relative w-32 h-32 mb-4">
                        {avatar && (
                            <img src={avatar} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
                        )}
                        <label className="absolute bottom-0 right-0 bg-gray-800 p-2 rounded-full cursor-pointer">
                            <FaCamera className="text-white" size={20} />
                            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                        </label>
                    </div>
                    <div className="w-full text-center">
                        <p className="mb-2 font-bold">{profile.fullName}</p>
                        <p className="mb-2">{profile.email}</p>
                        <p className="mb-2">{profile.phoneNumber}</p>
                        {/* Hide password change option if methodLogin is GOOGLE */}
                        {profile.methodLogin !== 'GOOGLE' && (
                            <a href="#" className="text-blue-500 hover:underline">Thay đổi mật khẩu</a>
                        )}
                    </div>
                    <div className="mt-6 w-full">
                        <textarea className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ghi chú..."></textarea>
                    </div>
                    <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Lưu thay đổi</button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
