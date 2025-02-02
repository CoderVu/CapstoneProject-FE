import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserInfo} from '../../redux/actions/userAction';

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
            };
            reader.readAsDataURL(file);
            // Dispatch action to update avatar
            dispatch();
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
                <div className="flex flex-col items-center">
                    {avatar && (
                        <img src={avatar} alt="User Avatar" className="w-32 h-32 rounded-full object-cover mb-4" />
                    )}
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="mb-4" />
                    <div className="w-full">
                        <p className="mb-2"><strong>{profile.fullName}</strong></p>
                        <p className="mb-2">{profile.email}</p>
                        <p className="mb-2">{profile.phoneNumber}</p>
                        <a href="#" className="hover:underline">Xem địa chỉ</a>
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