import React, { useEffect, useState, useRef } from 'react';
import { showSuccessToast, showErrorToast } from './ToastNotification';
import orderNotificationService from '../../ws/orderNotificationService';
import { Bell, X, Volume2, VolumeX } from 'lucide-react';
import notificationSound from '../../assets/sounds/notification.wav';
import { useNavigate } from 'react-router-dom';
import {WS_URL_ORDER} from '../../redux/setup/ws';
const OrderNotification = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(() => {
        // Load notifications from localStorage on initial render
        const savedNotifications = localStorage.getItem('orderNotifications');
        return savedNotifications ? JSON.parse(savedNotifications) : [];
    });
    const [isOpen, setIsOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(() => {
        // Load mute state from localStorage
        return localStorage.getItem('notificationsMuted') === 'true';
    });
    const audioRef = useRef(new Audio(notificationSound));

    // Save notifications to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('orderNotifications', JSON.stringify(notifications));
    }, [notifications]);

    // Save mute state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('notificationsMuted', isMuted.toString());
    }, [isMuted]);

    useEffect(() => {
        orderNotificationService.connect(WS_URL_ORDER, 'admin');
        // Add message listener
        const handleNewOrder = (message) => {
            if (message.type === 'newOrder') {
                // Add new notification to state
                setNotifications(prev => [{
                    id: Date.now(),
                    orderCode: message.orderCode,
                    timestamp: new Date()
                }, ...prev]);

                // Play notification sound if not muted
                if (!isMuted) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(error => {
                        console.error('Error playing notification sound:', error);
                    });
                }

                // Show toast notification
                showSuccessToast(`Thông báo: #${message.orderCode}`);
            }
        };

        orderNotificationService.addMessageListener(handleNewOrder);

        // Cleanup on unmount
        return () => {
            orderNotificationService.removeMessageListener(handleNewOrder);
            orderNotificationService.disconnect();
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        };
    }, [isMuted]);

    const clearNotifications = () => {
        setNotifications([]);
        localStorage.removeItem('orderNotifications');
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    };

    const handleOrderClick = (orderCode) => {
        // Navigate to orders page with search parameter
        navigate('/admin/orders', { state: { searchOrderCode: orderCode } });
        setIsOpen(false); // Close notification panel
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            {/* Notification Bell */}
            <div className="flex items-center space-x-2">
                <button
                    onClick={toggleMute}
                    className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    title={isMuted ? "Bật thông báo" : "Tắt thông báo"}
                >
                    {isMuted ? (
                        <VolumeX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    ) : (
                        <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    )}
                </button>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                    <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                            {notifications.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Notifications Panel */}
            {isOpen && notifications.length > 0 && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 transform transition-all duration-200 ease-in-out">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            Thông báo
                        </h3>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={clearNotifications}
                                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                            >
                                Xóa tất cả
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.map(notification => (
                            <div
                                key={notification.id}
                                className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p 
                                            className="text-sm font-medium text-gray-800 dark:text-gray-200 cursor-pointer hover:text-blue-600"
                                            onClick={() => handleOrderClick(notification.orderCode)}
                                        >
                                            Mã đơn hàng {notification.orderCode}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {new Date(notification.timestamp).toLocaleTimeString('vi-VN')}
                                        </p>
                                    </div>
                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                                        Mới
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderNotification; 