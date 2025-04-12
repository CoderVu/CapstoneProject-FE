import { useRef, useCallback, useEffect, useState, useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import { ChatContext } from "../context/showChat";
import chatService from "../../ws/configSocket";
import { fetchAllUser } from "../../redux/service/userService";
import { fetchAllChat, fetchAllChatedWithMe, postImageChat } from "../../redux/service/chatService";
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaPaperPlane, FaImage, FaSmile, FaTimes, FaAngleLeft, FaEllipsisV, FaSearch,
    FaPhone, FaVideo, FaComment, FaPlus, FaMicrophone, FaRegFileImage, FaGift,
    FaThumbtack, FaUserFriends, FaBell, FaArrowRight, FaUserCircle
} from 'react-icons/fa';
import { IoMdSettings } from 'react-icons/io';
import { RiSearchLine } from 'react-icons/ri';
import EmojiPicker from 'emoji-picker-react';
import UserList from './userList';
import ChatHistory from './ChatHistory';

const ChatContent = () => {
    const { showChat, setShowChat, selectedUser, setSelectedUser } = useContext(ChatContext);
    const auth = useSelector((state) => state.auth.auth);
    const [searchTerm, setSearchTerm] = useState("");
    const [search, setSearch] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [users, setUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [error, setError] = useState("");
    const [clickedMessageIndex, setClickedMessageIndex] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emojiUrl, setEmojiUrl] = useState(null);
    const messagesEndRef = useRef(null);
    const searchRef = useRef(null);
    const messageInputRef = useRef(null);
    const [chattedUsers, setChattedUsers] = useState([]);
    const listenerAddedRef = useRef(false);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
    const [showUserList, setShowUserList] = useState(true);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    // Memoize the lastMessages object to prevent unnecessary re-renders when typing
    const lastMessages = useMemo(() => {
        return messages.reduce((acc, msg) => {
            if (msg.sender === auth?.id) {
                acc[msg.receiver] = msg.message || "Đã gửi một ảnh";
            } else {
                acc[msg.sender] = msg.message || "Đã gửi một ảnh";
            }
            return acc;
        }, {});
    }, [messages, auth?.id]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobileView(mobile);
            if (mobile && selectedUser) {
                setShowUserList(false);
            } else {
                setShowUserList(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [selectedUser]);

    const fetchChattedUsers = async () => {
        try {
            const users = await fetchAllChatedWithMe(auth?.id);
            setChattedUsers(users);
        } catch (error) {
            console.error("Error fetching chatted users:", error);
        }
    };

    useEffect(() => {
        fetchChattedUsers();
    }, [auth?.id]);

    const handleUnselectUser = () => {
        setSelectedUser(null);
        if (isMobileView) {
            setShowUserList(true);
        }
    };

    const handleClickOutside = useCallback((e) => {
        if (searchRef.current && !searchRef.current.contains(e.target)) {
            setSearch(false);
        }

        // Close emoji picker when clicking outside
        if (showEmojiPicker && !e.target.closest('.emoji-picker-container')) {
            setShowEmojiPicker(false);
        }

        // Close attachment menu when clicking outside
        if (showAttachMenu && !e.target.closest('.attachment-menu-container')) {
            setShowAttachMenu(false);
        }
    }, [showEmojiPicker, showAttachMenu]);

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [handleClickOutside]);

    useEffect(() => {
        const handleIncomingMessage = (message) => {
            if (message.type === "onlineUsers") {
                setOnlineUsers(message.onlineUsers);
            } else if (message.type === "typing") {
                // Handle typing indicator from other users
                if (message.sender !== auth?.id && message.receiver === auth?.id) {
                    setIsTyping(message.isTyping);
                }
            } else if (message && (message.message && message.message.trim() !== "" || message.imageUrl)) {
                setMessages((prevMessages) => {
                    // Check if the message is already in the state
                    if (!prevMessages.some(msg => msg.timestamp === message.timestamp && msg.sender === message.sender)) {
                        return [...prevMessages, message];
                    }
                    return prevMessages;
                });
            }
        };

        if (showChat) {
            chatService.connect("ws://192.168.1.70:8080/ws", auth?.id);
            if (!listenerAddedRef.current) {
                chatService.addMessageListener(handleIncomingMessage);
                listenerAddedRef.current = true;
            }
        } else {
            chatService.disconnect();
            listenerAddedRef.current = false;
        }

        return () => {
            chatService.removeMessageListener(handleIncomingMessage);
        };
    }, [showChat, auth?.id]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const users = await fetchAllUser();
                setUsers(users);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchChatHistory = async () => {
            if (selectedUser) {
                try {
                    const chatHistory = await fetchAllChat(auth?.id, selectedUser.id);
                    setMessages(chatHistory);

                    // On mobile, hide the user list when a user is selected
                    if (isMobileView) {
                        setShowUserList(false);
                    }
                } catch (error) {
                    console.error("Error fetching chat history:", error);
                }
            }
        };
        fetchChatHistory();
    }, [selectedUser, auth?.id, isMobileView]);

    // Send typing indicator to other user
    const sendTypingIndicator = (isTyping) => {
        if (selectedUser) {
            const payload = {
                type: "typing",
                sender: auth?.id,
                receiver: selectedUser.id,
                isTyping: isTyping
            };
            chatService.sendMessage(payload);
        }
    };

    // Get current message text from the contentEditable div
    const getCurrentMessageText = () => {
        if (!messageInputRef.current) return "";

        // Get text content, removing any HTML tags
        const plainText = messageInputRef.current.innerText || messageInputRef.current.textContent || "";
        return plainText.trim();
    };

    const handleSendMessage = async () => {
        if (!selectedUser) {
            setError("Vui lòng chọn người nhận");
            return;
        }

        // Get the current message text from contentEditable
        const currentMessageText = getCurrentMessageText();

        if (currentMessageText || image || emojiUrl) {
            const payload = {
                sender: auth?.id,
                receiver: selectedUser.id,
                message: currentMessageText,
                imageUrl: emojiUrl || null,
                timestamp: new Date().toISOString()
            };

            if (image) {
                try {
                    const imageUrl = await postImageChat(image);
                    payload.imageUrl = imageUrl;
                    setImage(null);
                    setPreviewUrl(null);
                } catch (error) {
                    setError("Tải lên hình ảnh thất bại");
                    return;
                }
            }

            chatService.sendMessage(payload);

            // Clear message input
            if (messageInputRef.current) {
                messageInputRef.current.innerHTML = "";
            }
            setMessage("");
            setError("");
            setEmojiUrl(null);
            setShowEmojiPicker(false);
            setShowAttachMenu(false);

            // Send typing stopped indicator
            sendTypingIndicator(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setSearch(false);

        // On mobile, hide the user list when a user is selected
        if (isMobileView) {
            setShowUserList(false);
        }
    };

    const getUserById = (userId) => {
        return users.find(user => user.id === userId);
    };

    const toggleTimestamp = (index) => {
        setClickedMessageIndex(clickedMessageIndex === index ? null : index);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewUrl(event.target.result);
            };
            reader.readAsDataURL(file);
            setShowAttachMenu(false);
        }
    };

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const file = items[i].getAsFile();
                setImage(file);
                setPreviewUrl(URL.createObjectURL(file));
            }
        }
    };

    const handleEmojiSelect = (emojiObject) => {
        // Update emojiUrl state if it exists
        if (emojiObject.imageUrl) {
            setEmojiUrl(emojiObject.imageUrl);
        }

        // Insert emoji at cursor position in contentEditable div
        if (messageInputRef.current && emojiObject.emoji) {
            // Insert at current cursor position
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const emoji = document.createTextNode(emojiObject.emoji);
            range.deleteContents();
            range.insertNode(emoji);

            // Move cursor after the inserted emoji
            range.setStartAfter(emoji);
            range.setEndAfter(emoji);
            selection.removeAllRanges();
            selection.addRange(range);

            // Trigger input event to update message state
            const inputEvent = new Event('input', { bubbles: true });
            messageInputRef.current.dispatchEvent(inputEvent);

            // Also update message state
            setMessage(getCurrentMessageText());
        }

        setShowEmojiPicker(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleInputChange = (e) => {
        const text = e.currentTarget.innerText || e.currentTarget.textContent;
        setMessage(text);

        // Send typing indicator
        if (text.trim()) {
            sendTypingIndicator(true);

            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set new timeout to send typing stopped after 2 seconds of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                sendTypingIndicator(false);
            }, 2000);
        } else {
            sendTypingIndicator(false);
        }
    };

    // Create memoized props for UserList to prevent unnecessary re-renders
    const userListProps = useMemo(() => ({
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
    }), [users, onlineUsers, searchTerm, search, chattedUsers, lastMessages]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.3 }
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.2 }
        }
    };

    return (
        <div className="fixed bottom-4 right-4 w-full md:w-4/5 lg:w-3/5 h-[600px] max-h-[90vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex overflow-hidden" style={{ maxWidth: '1200px', zIndex: 1000 }}>
            {   /* User List Panel */}
            <AnimatePresence>
            {(showUserList || !isMobileView) && (
    <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
        className={`${isMobileView ? 'w-full translate-x-3' : 'w-1/3'} h-full border-r border-gray-200 dark:border-gray-700 flex flex-col`}
    >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <FaUserCircle className="text-blue-500 dark:text-blue-400 text-xl" />
                </div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Tin nhắn</h2>
            </div>
            <div className="flex items-center gap-2">
                <button
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    aria-label="Settings"
                >
                    <IoMdSettings className="text-lg" />
                </button>
                <button
                    onClick={() => setShowChat(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    aria-label="Close"
                >
                    <FaTimes />
                </button>
            </div>
        </div>
        <UserList {...userListProps} />
    </motion.div>
)}
            </AnimatePresence>

            {/* Chat Area */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${isMobileView && showUserList ? 'hidden' : 'flex'} flex-col h-full ${selectedUser ? (isMobileView ? 'w-full' : 'w-2/3') : 'w-full'}`}
            >
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                            <div className="flex items-center">
                                {isMobileView && (
                                    <button
                                        onClick={handleUnselectUser}
                                        className="p-2 mr-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                                    >
                                        <FaAngleLeft className="text-lg" />
                                    </button>
                                )}
                                <div className="relative">
                                    <img
                                        src={selectedUser?.avatar || "https://dbimage.blob.core.windows.net/images/649dd9cb-5be3-4b34-8f4b-55e4f1182ef7-download.png"}
                                        alt={selectedUser?.fullName || "User"}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                    />
                                    {onlineUsers.includes(selectedUser.id) && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                                    )}
                                </div>
                                <div className="ml-3">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">{selectedUser?.fullName}</h3>
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                        {isTyping ? (
                                            <span className="text-blue-500 dark:text-blue-400 animate-pulse">
                                                Đang nhập...
                                            </span>
                                        ) : onlineUsers.includes(selectedUser.id) ? (
                                            <span>Đang hoạt động</span>
                                        ) : (
                                            <span>Ngoại tuyến</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                    <FaPhone />
                                </button>
                                <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                    <FaVideo />
                                </button>
                                <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                    <RiSearchLine />
                                </button>
                                <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                    <FaEllipsisV />
                                </button>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className={`flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 bg-opacity-60 dark:bg-opacity-60`}>
                            <ChatHistory
                                messages={messages}
                                auth={auth}
                                getUserById={getUserById}
                                clickedMessageIndex={clickedMessageIndex}
                                toggleTimestamp={toggleTimestamp}
                                messagesEndRef={messagesEndRef}
                                isTyping={isTyping}
                                selectedUser={selectedUser}
                            />
                        </div>

                        {/* Image Preview */}
                        {previewUrl && (
                            <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                <div className="relative inline-block">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="h-24 rounded-md object-cover border border-gray-300 dark:border-gray-600"
                                    />
                                    <button
                                        onClick={() => {
                                            setImage(null);
                                            setPreviewUrl(null);
                                        }}
                                        className="absolute -top-2 -right-2 bg-gray-800 dark:bg-gray-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center shadow-md"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Message Input Area */}
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <div className="flex items-end">
                                <div className="flex-1 relative">
                                    {/* Message Input */}
                                    <div
                                        id="messageInput"
                                        ref={messageInputRef}
                                        contentEditable
                                        onKeyPress={handleKeyPress}
                                        className="min-h-[52px] max-h-[120px] overflow-y-auto py-3 px-4 pr-16 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white text-gray-800"
                                        onInput={handleInputChange}
                                        onPaste={handlePaste}
                                        data-placeholder="Nhập tin nhắn..."
                                    ></div>

                                    {/* Attachment & Emoji Controls */}
                                    <div className="absolute right-3 bottom-2.5 flex items-center gap-1">
                                        <div className="relative attachment-menu-container">
                                            <button
                                                type="button"
                                                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowAttachMenu(!showAttachMenu);
                                                    setShowEmojiPicker(false);
                                                }}
                                            >
                                                <FaPlus className="text-lg" />
                                            </button>

                                            {/* Attachment Menu */}
                                            {showAttachMenu && (
                                                <div className="absolute bottom-11 right-0 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                                    <div className="p-1 w-40 grid grid-cols-3 gap-1">
                                                        <label
                                                            htmlFor="imageInput"
                                                            className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                                                        >
                                                            <FaRegFileImage className="text-lg text-blue-500 dark:text-blue-400" />
                                                            <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">Hình ảnh</span>
                                                        </label>
                                                        <div className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                                                            <FaGift className="text-lg text-red-500 dark:text-red-400" />
                                                            <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">Quà</span>
                                                        </div>
                                                        <div className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                                                            <FaUserFriends className="text-lg text-green-500 dark:text-green-400" />
                                                            <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">Liên hệ</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <input
                                            type="file"
                                            id="imageInput"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />

                                        <div className="relative emoji-picker-container">
                                            <button
                                                type="button"
                                                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowEmojiPicker(!showEmojiPicker);
                                                    setShowAttachMenu(false);
                                                }}
                                            >
                                                <FaSmile className="text-lg" />
                                            </button>

                                            {showEmojiPicker && (
                                                <div className="absolute bottom-11 right-0 z-10">
                                                    <EmojiPicker
                                                        onEmojiClick={handleEmojiSelect}
                                                        theme="auto"
                                                        emojiStyle="native"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Send button or voice recording button based on if there's a message */}
                                {message.trim() || image || emojiUrl ? (
                                    <button
                                        onClick={handleSendMessage}
                                        className="ml-2 rounded-full w-12 h-12 flex items-center justify-center bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white shadow-md transition-all duration-200"
                                    >
                                        <FaPaperPlane className="text-lg" />
                                    </button>
                                ) : (
                                    <button
                                        className="ml-2 rounded-full w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                    >
                                        <FaMicrophone className="text-lg" />
                                    </button>
                                )}
                            </div>

                            {error && (
                                <div className="mt-2 text-red-500 text-sm">{error}</div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
                        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6">
                            <FaComment className="text-blue-500 dark:text-blue-400 text-4xl" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Tin nhắn của bạn</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                            Chọn một người dùng từ danh sách bên trái để bắt đầu cuộc trò chuyện
                        </p>
                        <button
                            onClick={() => setShowUserList(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg shadow-md transition-colors duration-200"
                        >
                            <FaSearch className="text-sm" />
                            <span>Tìm kiếm người dùng</span>
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

// Add CSS for placeholder text
const style = document.createElement('style');
style.textContent = `
[contenteditable=true]:empty:before {
  content: attr(data-placeholder);
  color: #9ca3af;
  pointer-events: none;
  display: block;
}`;
document.head.appendChild(style);

export default ChatContent;
