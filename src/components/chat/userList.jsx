import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    RiSearchLine, RiCloseLine, RiCheckboxCircleFill, RiErrorWarningFill
} from 'react-icons/ri';
import { FiUsers, FiPlus } from 'react-icons/fi';
import { BiPin } from 'react-icons/bi';
import { BsCheckAll } from 'react-icons/bs';
import ChatList from './ChatList';

const UserList = ({
    users,
    onlineUsers,
    searchTerm,
    setSearchTerm,
    search,
    setSearch,
    handleUserSelect,
    searchRef,
    chattedUsers,
    lastMessages
}) => {
    // Get the latest message for display
    const getLastMessage = (userId) => {
        return lastMessages[userId] || "Chưa có tin nhắn";
    };

    // Truncate long messages
    const truncateMessage = (message, maxLength = 30) => {
        if (!message) return "";
        return message.length > maxLength
            ? message.substring(0, maxLength) + "..."
            : message;
    };

    // Check if user is online
    const isUserOnline = (userId) => {
        return onlineUsers.includes(userId);
    };

    // Format the time the last message was received relative to now
    const formatLastMessageTime = (userId) => {
        // For demonstration, we will generate a random time in the past
        const randomHours = Math.floor(Math.random() * 24);
        const randomMinutes = Math.floor(Math.random() * 60);
        const date = new Date();
        date.setHours(date.getHours() - randomHours);
        date.setMinutes(date.getMinutes() - randomMinutes);

        return formatDistanceToNow(date, {
            addSuffix: true,
            locale: vi
        });
    };

    // Filter and sort chatted users: online users first, then by recent activity
    const sortedChattedUsers = useMemo(() => {
        if (!chattedUsers || !Array.isArray(chattedUsers)) return [];

        return [...chattedUsers].sort((a, b) => {
            // Online users first
            if (isUserOnline(a.id) && !isUserOnline(b.id)) return -1;
            if (!isUserOnline(a.id) && isUserOnline(b.id)) return 1;

            // Then sort by recent activity (placeholder)
            return 0;
        });
    }, [chattedUsers, onlineUsers]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.2 }
        }
    };

    const searchResultVariants = {
        hidden: { opacity: 0, y: -10, height: 0 },
        visible: {
            opacity: 1,
            y: 0,
            height: 'auto',
            transition: { duration: 0.2 }
        },
        exit: {
            opacity: 0,
            y: -10,
            height: 0,
            transition: { duration: 0.15 }
        }
    };

    // Search results component
    const SearchResults = () => {
        const filteredUsers = users.filter(user =>
            user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <motion.div
                variants={searchResultVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute z-10 w-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-b-lg mt-1 overflow-hidden max-h-80 overflow-y-auto"
            >
                {filteredUsers.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {filteredUsers.map(user => (
                            <motion.div
                                key={user.id}
                                variants={itemVariants}
                                className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center border-b border-gray-100 dark:border-gray-700 last:border-0"
                                onClick={() => handleUserSelect(user)}
                            >
                                <div className="flex items-center">
                                    <div className="relative">
                                        <img
                                            src={user.avatar || "https://via.placeholder.com/40"}
                                            alt={user.fullName}
                                            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                        />
                                        {isUserOnline(user.id) && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <div className="font-medium text-gray-800 dark:text-gray-200">{user.fullName}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user.email || "Không có email"}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <RiErrorWarningFill className="mx-auto text-xl mb-2 text-gray-400 dark:text-gray-500" />
                        <p>Không tìm thấy người dùng nào</p>
                        <p className="text-xs mt-1">Thử tìm kiếm với từ khóa khác</p>
                    </div>
                )}
            </motion.div>
        );
    };

    // Online users horizontal scrolling list
    const OnlineUsersList = () => {
        const onlineUsersList = users.filter(user => onlineUsers.includes(user.id));

        if (onlineUsersList.length === 0) return null;

        return (
            <div className="p-2 overflow-x-auto whitespace-nowrap hide-scrollbar">
                <div className="inline-flex space-x-3 px-2 py-1.5">
                    {onlineUsersList.map(user => (
                        <div
                            key={user.id}
                            className="flex flex-col items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-105"
                            onClick={() => handleUserSelect(user)}
                        >
                            <div className="relative">
                                <img
                                    src={user.avatar || "https://via.placeholder.com/40"}
                                    alt={user.fullName}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 dark:border-blue-400"
                                />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                            </div>
                            <span className="text-xs mt-1.5 font-medium text-gray-700 dark:text-gray-300 max-w-[60px] truncate">
                                {user.fullName}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };



    // Add a style to hide scrollbars but keep functionality
    const scrollbarStyle = document.createElement('style');
    scrollbarStyle.textContent = `
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }`;

    if (!document.head.contains(scrollbarStyle)) {
        document.head.appendChild(scrollbarStyle);
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800">
            {/* Search Box */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700" ref={searchRef}>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <RiSearchLine className="text-gray-400 dark:text-gray-500" />
                    </div>

                    <input
                        type="text"
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white text-gray-900"
                        placeholder="Tìm kiếm người dùng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={() => setSearch(true)}
                    />

                    {searchTerm && (
                        <button
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => {
                                setSearchTerm("");
                                setSearch(false);
                            }}
                        >
                            <RiCloseLine className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                        </button>
                    )}

                    <AnimatePresence>
                        {search && <SearchResults />}
                    </AnimatePresence>
                </div>
            </div>

            {/* Online Users Horizontal Scroll */}
            <OnlineUsersList />

            {/* Divider with label */}
            <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between">
                <span>CÁC CUỘC TRÒ CHUYỆN</span>
                <button className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded">
                    <BiPin className="text-gray-400 dark:text-gray-500" />
                </button>
            </div>

            {/* Recent Chats */}
            <ChatList
                sortedChattedUsers={sortedChattedUsers}
                isUserOnline={isUserOnline}
                getLastMessage={getLastMessage}
                formatLastMessageTime={formatLastMessageTime}
                handleUserSelect={handleUserSelect}
            />
        </div>
    );
};

export default UserList;
