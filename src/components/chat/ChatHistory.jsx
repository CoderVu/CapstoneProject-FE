import React, { useEffect, useCallback, memo } from 'react';
import { parseISO, format, differenceInMinutes, isToday, isYesterday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { vi } from 'date-fns/locale';

// Sử dụng memo để tránh re-render không cần thiết
const ChatHistory = memo(({ messages, auth, getUserById, clickedMessageIndex, toggleTimestamp, messagesEndRef }) => {
    // Format message time for timestamps
    const formatMessageTime = useCallback((time) => {
        if (!time) return "Không xác định";

        try {
            const date = parseISO(time);

            if (isToday(date)) {
                return format(date, "HH:mm", { locale: vi });
            } else if (isYesterday(date)) {
                return `Hôm qua, ${format(date, "HH:mm", { locale: vi })}`;
            } else {
                return format(date, "HH:mm, dd/MM/yyyy", { locale: vi });
            }
        } catch (error) {
            console.error("Error parsing date:", error);
            return "Không xác định";
        }
    }, []);

    // Format date for day separators
    const formatDateHeader = useCallback((time) => {
        if (!time) return "";

        try {
            const date = parseISO(time);

            if (isToday(date)) {
                return "Hôm nay";
            } else if (isYesterday(date)) {
                return "Hôm qua";
            } else {
                return format(date, "EEEE, dd/MM/yyyy", { locale: vi });
            }
        } catch (error) {
            return "";
        }
    }, []);

    // Check if we should show timestamp under message
    const shouldShowTimestamp = useCallback((currentMessage, previousMessage) => {
        if (!previousMessage) return true;
        if (!currentMessage?.timestamp || !previousMessage?.timestamp) return false;

        try {
            const currentTime = parseISO(currentMessage.timestamp);
            const previousTime = parseISO(previousMessage.timestamp);

            return differenceInMinutes(currentTime, previousTime) > 10;
        } catch (error) {
            return false;
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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Ensure messages is an array before using reduce
    const validMessages = Array.isArray(messages) ? messages : [];

    // Group và sort messages - được memoize để tránh tính toán lại khi re-render
    const { sortedMessages, groupedMessages } = React.useMemo(() => {
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
    }, [validMessages, shouldShowDateSeparator]); // Chỉ tính toán lại khi messages thay đổi

    // Animations
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
        }
    };

    // Fallback when there are no messages
    if (!sortedMessages.length) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
            </div>
        );
    }

    return (
        <div className="px-4 py-6 space-y-4 text-sm">
            {Array.isArray(groupedMessages) && groupedMessages.map((group) => {
                if (group.type === 'date') {
                    // Date Separator
                    return (
                        <div key={group.id} className="flex justify-center my-6">
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
                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        >
                            <div className="flex items-start max-w-[80%]">
                                {/* Avatar - only show for others and only on the first message in a group */}
                                {!isOwnMessage && (
                                    <img
                                        src={user?.avatar || "https://via.placeholder.com/40"}
                                        alt={user?.fullName || "User"}
                                        className="w-8 h-8 rounded-full mt-1 mr-2 object-cover border border-gray-200"
                                    />
                                )}

                                {/* Messages Column */}
                                <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
                                    {/* User name - only for others and only on the first message */}
                                    {!isOwnMessage && (
                                        <span className="text-xs text-gray-500 ml-1 mb-1">
                                            {user?.fullName || "Người dùng"}
                                        </span>
                                    )}

                                    {/* Message bubbles */}
                                    <div className="space-y-1">
                                        {group.messages.map((msg, msgIndex) => (
                                            <div key={`${msg.timestamp || msgIndex}-${msgIndex}`} className="relative">
                                                <motion.div
                                                    initial="initial"
                                                    animate="animate"
                                                    variants={messageVariants}
                                                    custom={isOwnMessage}
                                                    className="inline-block"
                                                    onClick={() => toggleTimestamp(msgIndex)}
                                                >
                                                    {/* Image Message */}
                                                    {msg.imageUrl && (
                                                        <div
                                                            className={`max-w-xs rounded-lg p-1 ${
                                                                isOwnMessage
                                                                    ? "bg-blue-500 text-white rounded-br-none"
                                                                    : "bg-white border border-gray-200 rounded-bl-none"
                                                            }`}
                                                        >
                                                            <img
                                                                src={msg.imageUrl}
                                                                alt="Chat Image"
                                                                className="max-w-full rounded-md"
                                                                loading="lazy"
                                                                onLoad={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Text Message */}
                                                    {msg.message && (
                                                        <div
                                                            className={`max-w-xs py-2 px-3 rounded-lg ${
                                                                isOwnMessage
                                                                    ? "bg-blue-500 text-white rounded-br-none"
                                                                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                                                            }`}
                                                        >
                                                            {msg.message}
                                                        </div>
                                                    )}

                                                    {/* Timestamp on hover/click */}
                                                    <AnimatePresence>
                                                        {(
                                                            msgIndex === clickedMessageIndex ||
                                                            msgIndex === group.messages.length - 1
                                                        ) && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0 }}
                                                                className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? "text-right" : "text-left"}`}
                                                            >
                                                                {formatMessageTime(msg.timestamp)}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }
                return null;
            })}
            <div ref={messagesEndRef} />
        </div>
    );
});

export default ChatHistory;