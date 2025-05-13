import React, { useEffect, useCallback, memo, useMemo } from 'react';
import { parseISO, format, differenceInMinutes, isToday, isYesterday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { vi } from 'date-fns/locale';
import { BsCheck, BsCheckAll } from 'react-icons/bs';
import { FaSpinner } from 'react-icons/fa';

// Memoed component to avoid unnecessary re-renders
const ChatHistory = memo(({ messages, auth, getUserById, clickedMessageIndex, toggleTimestamp, messagesEndRef, isTyping, selectedUser }) => {
    // Format message time for timestamps
    const formatMessageTime = useCallback((time) => {
        if (!time) return "";

        try {
            const date = parseISO(time);
            const now = new Date();
            const messageDate = new Date(date);

            // If message is from today, show only time
            if (isToday(date)) {
                return format(date, "HH:mm", { locale: vi });
            }
            // If message is from yesterday, show "Hôm qua" and time
            else if (isYesterday(date)) {
                return `Hôm qua ${format(date, "HH:mm", { locale: vi })}`;
            }
            // If message is from this year, show date and time
            else if (messageDate.getFullYear() === now.getFullYear()) {
                return format(date, "dd/MM HH:mm", { locale: vi });
            }
            // If message is from previous years, show full date and time
            else {
                return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
            }
        } catch (error) {
            console.error("Error parsing date:", error);
            return "";
        }
    }, []);

    // Format date for day separators with Vietnamese locale
    const formatDateHeader = useCallback((time) => {
        if (!time) return "";

        try {
            const date = parseISO(time);
            const now = new Date();
            const messageDate = new Date(date);

            if (isToday(date)) {
                return "Hôm nay";
            } else if (isYesterday(date)) {
                return "Hôm qua";
            } else if (messageDate.getFullYear() === now.getFullYear()) {
                return format(date, "dd/MM/yyyy", { locale: vi });
            } else {
                return format(date, "dd/MM/yyyy", { locale: vi });
            }
        } catch (error) {
            return "";
        }
    }, []);

    // Check if we should show a date separator between messages
    const shouldShowDateSeparator = useCallback((currentMessage, previousMessage) => {
        if (!previousMessage) return true;
        if (!currentMessage?.timestamp || !previousMessage?.timestamp) return false;

        try {
            const currentDate = parseISO(currentMessage.timestamp);
            const previousDate = parseISO(previousMessage.timestamp);

            return (
                currentDate.getDate() !== previousDate.getDate() ||
                currentDate.getMonth() !== previousDate.getMonth() ||
                currentDate.getFullYear() !== previousDate.getFullYear()
            );
        } catch (error) {
            return false;
        }
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Ensure messages is an array before using reduce
    const validMessages = Array.isArray(messages) ? messages : [];

    // Group and sort messages - memoized to avoid recalculations
    const { sortedMessages, groupedMessages } = useMemo(() => {
        // Sort messages chronologically
        const sorted = [...validMessages].sort((a, b) =>
            new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
        );

        // Group consecutive messages from the same sender
        const grouped = sorted.reduce((groups, message, index) => {
            if (!groups) groups = [];
            const previousMessage = sorted[index - 1];

            // Check if we need to create a new day separator
            if (shouldShowDateSeparator(message, previousMessage)) {
                groups.push({
                    type: 'date',
                    date: message.timestamp,
                    id: `date-${message.timestamp || index}`
                });
            }

            // Check if this message should start a new group
            const shouldStartNewGroup =
                index === 0 ||
                message.sender !== previousMessage?.sender ||
                !previousMessage?.timestamp || !message?.timestamp ||
                differenceInMinutes(
                    parseISO(message.timestamp),
                    parseISO(previousMessage.timestamp)
                ) > 10;

            if (shouldStartNewGroup) {
                groups.push({
                    type: 'message-group',
                    sender: message.sender,
                    messages: [message],
                    id: `group-${message.sender}-${message.timestamp || index}`
                });
            } else {
                // Add to the last group
                const lastGroup = groups[groups.length - 1];
                if (lastGroup && lastGroup.type === 'message-group') {
                    lastGroup.messages.push(message);
                }
            }

            return groups;
        }, []);

        return { sortedMessages: sorted, groupedMessages: grouped };
    }, [validMessages, shouldShowDateSeparator]);

    // Animation variants
    const messageVariants = {
        initial: (isOwnMessage) => ({
            opacity: 0,
            x: isOwnMessage ? 20 : -20,
            scale: 0.9,
        }),
        animate: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: { duration: 0.2 }
        },
        exit: {
            opacity: 0,
            y: 10,
            transition: { duration: 0.15 }
        }
    };

    // Typing indicator animation
    const typingVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: 5, transition: { duration: 0.2 } }
    };

    // Fallback when there are no messages
    if (!sortedMessages.length && !isTyping) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm w-full max-w-sm">
                    <div className="font-medium mb-3">Chưa có tin nhắn nào</div>
                    <p className="text-sm">Hãy bắt đầu cuộc trò chuyện với {selectedUser?.fullName || "người dùng này"}!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-5 space-y-4 text-sm">
            {Array.isArray(groupedMessages) && groupedMessages.map((group) => {
                if (group.type === 'date') {
                    // Date Separator
                    return (
                        <div key={group.id} className="flex justify-center my-5">
                            <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-1 rounded-full text-xs font-medium">
                                {formatDateHeader(group.date)}
                            </div>
                        </div>
                    );
                } else if (group.type === 'message-group') {
                    // Message Group
                    const isOwnMessage = group.sender === auth?.id;
                    const user = getUserById ? getUserById(group.sender) : null;

                    return (
                        <div
                            key={group.id}
                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
                        >
                            <div className="flex items-start max-w-[85%]">
                                {/* Avatar - only show for others and only on the first message in a group */}
                                {!isOwnMessage && (
                                    <div className="mt-1 mr-2 flex-shrink-0">
                                        <img
                                            src={user?.avatar || "https://via.placeholder.com/40"}
                                            alt={user?.fullName || "User"}
                                            className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                        />
                                    </div>
                                )}

                                {/* Messages Column */}
                                <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
                                    {/* User name - only for others and only on the first message */}
                                    {!isOwnMessage && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 mb-1 font-medium">
                                            {user?.fullName || "Người dùng"}
                                        </span>
                                    )}

                                    {/* Message bubbles */}
                                    <div className="space-y-1">
                                        {group.messages.map((msg, msgIndex) => {
                                            const isLastMessage = msgIndex === group.messages.length - 1;
                                            const showStatus = isOwnMessage && isLastMessage;

                                            return (
                                                <div key={`${msg.timestamp || msgIndex}-${msgIndex}`} className="relative group">
                                                    <motion.div
                                                        initial="initial"
                                                        animate="animate"
                                                        exit="exit"
                                                        variants={messageVariants}
                                                        custom={isOwnMessage}
                                                        className="inline-block"
                                                    >
                                                        {/* Image Message */}
                                                        {msg.imageUrl && (
                                                            <div
                                                                className={`max-w-xs rounded-2xl ${
                                                                    isOwnMessage
                                                                        ? "bg-blue-500 rounded-br-none"
                                                                        : "bg-white dark:bg-gray-700 rounded-bl-none border border-gray-200 dark:border-gray-600"
                                                                }`}
                                                                onClick={() => toggleTimestamp(msgIndex)}
                                                            >
                                                                <img
                                                                    src={msg.imageUrl}
                                                                    alt="Chat Image"
                                                                    className="max-w-full rounded-lg mx-1 my-1"
                                                                    loading="lazy"
                                                                    onLoad={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Text Message */}
                                                        {msg.message && (
                                                            <div
                                                                className={`py-2.5 px-3.5 rounded-2xl ${
                                                                    isOwnMessage
                                                                        ? "bg-blue-500 text-white rounded-br-none"
                                                                        : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-bl-none"
                                                                }`}
                                                                onClick={() => toggleTimestamp(msgIndex)}
                                                            >
                                                                {msg.message}
                                                            </div>
                                                        )}

                                                        {/* Message status (sent/delivered/read) */}
                                                        {showStatus && (
                                                            <div className="text-right mt-0.5 mr-1">
                                                                <span className="text-blue-500 dark:text-blue-400">
                                                                    <BsCheckAll size={16} />
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Timestamp on hover/click */}
                                                        <AnimatePresence>
                                                            {msgIndex === clickedMessageIndex && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -5 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0 }}
                                                                    className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isOwnMessage ? "text-right mr-1" : "text-left ml-1"}`}
                                                                >
                                                                    {formatMessageTime(msg.timestamp)}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }
                return null;
            })}

            {/* Typing indicator */}
            <AnimatePresence>
                {isTyping && selectedUser && (
                    <motion.div
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={typingVariants}
                        className="flex items-start mb-3"
                    >
                        <div className="flex items-start">
                            <img
                                src={selectedUser?.avatar || "https://via.placeholder.com/40"}
                                alt={selectedUser?.fullName || "User"}
                                className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-600 mr-2"
                            />
                            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-bl-none py-3 px-4">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div ref={messagesEndRef} className="h-1" />
        </div>
    );
});

export default ChatHistory;
