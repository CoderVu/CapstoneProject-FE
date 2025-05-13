import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { BsCheckAll } from 'react-icons/bs';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ChatList = memo(({ sortedChattedUsers, isUserOnline, getLastMessage, formatLastMessageTime, handleUserSelect }) => {
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

    return (
        <motion.div
            className="flex-1 overflow-y-auto pb-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {sortedChattedUsers && sortedChattedUsers.length > 0 ? (
                sortedChattedUsers.map(user => {
                    const isOnline = isUserOnline(user.id);
                    const lastMessage = getLastMessage(user.id);

                    return (
                        <motion.div
                            key={user.id}
                            variants={itemVariants}
                            className="px-3 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                            onClick={() => handleUserSelect(user)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center flex-1 min-w-0">
                                    <div className="relative">
                                        <img
                                            src={user.avatar || "https://via.placeholder.com/40"}
                                            alt={user.fullName}
                                            className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                        />
                                        {isOnline && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                                        )}
                                    </div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{user.fullName}</span>
                                        </div>
                                        <div className="flex items-center mt-1">
                                            <div className="flex-1 text-sm text-gray-500 dark:text-gray-400 truncate flex items-center">
                                                {Math.random() > 0.5 && (
                                                    <BsCheckAll className="text-blue-500 dark:text-blue-400 mr-1 flex-shrink-0" size={14} />
                                                )}
                                                {lastMessage}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })
            ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Không có cuộc trò chuyện nào</p>
                </div>
            )}
        </motion.div>
    );
});

export default ChatList;