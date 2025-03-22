import React from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaCircle, FaTimes } from 'react-icons/fa';

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
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 }
        }
    };

    // Format the time the last message was received relative to now
    const formatLastMessageTime = (userId) => {
        // This is a placeholder. In a real app, you would use the actual timestamp
        return "vài phút trước";
    };

    // Search results component
    const SearchResults = () => (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full bg-white shadow-lg border border-gray-200 rounded-b-lg mt-1 overflow-hidden max-h-80 overflow-y-auto"
        >
            {users.filter(user =>
                user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
            ).length > 0 ? (
                users
                    .filter(user => user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(user => (
                        <motion.div
                            key={user.id}
                            variants={itemVariants}
                            whileHover={{ backgroundColor: "#f9fafb" }}
                            className="p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-0"
                            onClick={() => handleUserSelect(user)}
                        >
                            <div className="flex items-center">
                                <div className="relative">
                                    <img
                                        src={user.avatar || "https://via.placeholder.com/40"}
                                        alt={user.fullName}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                    />
                                    {isUserOnline(user.id) && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                    )}
                                </div>
                                <div className="ml-3">
                                    <div className="font-medium text-gray-800">{user.fullName}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{user.email || "Không có email"}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))
            ) : (
                <div className="p-4 text-center text-gray-500">
                    Không tìm thấy người dùng nào
                </div>
            )}
        </motion.div>
    );

    // Chat list component
    const ChatList = () => (
        <motion.div
            className="flex-1 overflow-y-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {chattedUsers && chattedUsers.length > 0 ? (
                chattedUsers.map(user => (
                    <motion.div
                        key={user.id}
                        variants={itemVariants}
                        whileHover={{ backgroundColor: "#f9fafb" }}
                        className="p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors duration-200"
                        onClick={() => handleUserSelect(user)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1 min-w-0">
                                <div className="relative">
                                    <img
                                        src={user.avatar || "https://via.placeholder.com/40"}
                                        alt={user.fullName}
                                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                    />
                                    {isUserOnline(user.id) && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                    )}
                                </div>
                                <div className="ml-3 flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-800 truncate">{user.fullName}</span>
                                        <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{formatLastMessageTime(user.id)}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1 truncate">
                                        {truncateMessage(getLastMessage(user.id))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <FaSearch className="text-gray-400 text-xl" />
                    </div>
                    <p className="text-gray-500 mb-1">Không có cuộc trò chuyện nào</p>
                    <p className="text-xs text-gray-400">Bắt đầu trò chuyện bằng cách tìm kiếm người dùng</p>
                </div>
            )}
        </motion.div>
    );

    return (
        <div className="flex flex-col h-full">
            {/* Search Box */}
            <div className="p-4 border-b border-gray-200" ref={searchRef}>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>

                    <input
                        type="text"
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
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
                            <FaTimes className="text-gray-400 hover:text-gray-600" />
                        </button>
                    )}

                    {search && <SearchResults />}
                </div>
            </div>

            {/* Online Users Horizontal Scroll */}
            {onlineUsers.length > 0 && (
                <div className="p-2 border-b border-gray-200 overflow-x-auto whitespace-nowrap">
                    <div className="inline-flex space-x-3 px-2 py-1">
                        {users
                            .filter(user => onlineUsers.includes(user.id))
                            .map(user => (
                                <div
                                    key={user.id}
                                    className="flex flex-col items-center justify-center cursor-pointer"
                                    onClick={() => handleUserSelect(user)}
                                >
                                    <div className="relative">
                                        <img
                                            src={user.avatar || "https://via.placeholder.com/40"}
                                            alt={user.fullName}
                                            className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
                                        />
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                    </div>
                                    <span className="text-xs mt-1 font-medium text-gray-700 max-w-[60px] truncate">
                                        {user.fullName}
                                    </span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}

            {/* Recent Chats */}
            <div className="flex-1 overflow-hidden">
                <div className="p-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Trò chuyện gần đây
                </div>
                <ChatList />
            </div>
        </div>
    );
};

export default UserList;
