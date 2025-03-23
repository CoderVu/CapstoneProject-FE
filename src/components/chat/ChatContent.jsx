import { useRef, useCallback, useEffect, useState, useContext } from "react";
import { useSelector } from "react-redux";
import { ChatContext } from "../context/showChat";
import chatService from "../../ws/configSocket";
import { fetchAllUser } from "../../redux/service/userService";
import { fetchAllChat, fetchAllChatedWithMe, postImageChat } from "../../redux/service/chatService";
import { motion } from 'framer-motion';
import { FaPaperPlane, FaImage, FaSmile, FaTimes, FaAngleLeft, FaEllipsisV, FaSearch, FaPhone, FaVideo, FaComment } from 'react-icons/fa';
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
    }, [showEmojiPicker]);

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
            chatService.connect("ws://192.168.1.17:8080/ws", auth?.id);
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

    // Get current message text from the contentEditable div
    const getCurrentMessageText = () => {
        if (!messageInputRef.current) return "";

        // Get text content, removing any HTML tags
        const plainText = messageInputRef.current.innerText || messageInputRef.current.textContent || "";
        return plainText.trim();
    };

    const handleSendMessage = async () => {
        if (!selectedUser) {
            setError("Vui lòng chọn người nhận.");
            return;
        }

        // Get the current message text from contentEditable
        const currentMessageText = getCurrentMessageText();
        console.log("Sending message:", currentMessageText);

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
                    setError("Tải lên hình ảnh thất bại.");
                    return;
                }
            }

            console.log("Sending payload:", payload);
            chatService.sendMessage(payload);

            // Clear message input
            if (messageInputRef.current) {
                messageInputRef.current.innerHTML = "";
            }
            setMessage("");
            setError("");
            setEmojiUrl(null);
            setShowEmojiPicker(false);
        } else {
            console.log("Message is empty, not sending");
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
    };

    return (
        <div className="fixed bottom-4 right-4 w-full md:w-4/5 lg:w-3/5 h-[600px] max-h-[90vh] bg-white rounded-lg shadow-2xl flex overflow-hidden" style={{ maxWidth: '1200px', zIndex: 1000 }}>
            {/* Header Bar - Only for Mobile */}
            {isMobileView && selectedUser && !showUserList && (
                <div className="absolute top-0 left-0 right-0 bg-white z-10 border-b flex items-center p-3">
                    <button
                        onClick={handleUnselectUser}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full"
                    >
                        <FaAngleLeft className="text-lg" />
                    </button>
                    <div className="ml-2 flex items-center">
                        <img
                            src={selectedUser?.avatar || "https://dbimage.blob.core.windows.net/images/649dd9cb-5be3-4b34-8f4b-55e4f1182ef7-download.png"}
                            alt={selectedUser?.fullName || "User"}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="ml-2 font-medium">{selectedUser?.fullName}</span>
                        {onlineUsers.includes(selectedUser.id) && (
                            <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                    </div>
                </div>
            )}

            {/* User List Panel */}
            {(showUserList || !isMobileView) && (
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="w-full md:w-1/3 h-full border-r border-gray-200 flex flex-col"
                >
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Tin nhắn</h2>
                        <button
                            onClick={() => setShowChat(false)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        >
                            <FaTimes />
                        </button>
                    </div>
                    <UserList
                        users={users}
                        onlineUsers={onlineUsers}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        search={search}
                        setSearch={setSearch}
                        handleUserSelect={handleUserSelect}
                        searchRef={searchRef}
                        chattedUsers={chattedUsers}
                        lastMessages={messages.reduce((acc, msg) => {
                            if (msg.sender === auth?.id) {
                                acc[msg.receiver] = msg.message || "Đã gửi một ảnh";
                            } else {
                                acc[msg.sender] = msg.message || "Đã gửi một ảnh";
                            }
                            return acc;
                        }, {})}
                    />
                </motion.div>
            )}

            {/* Chat Area */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${isMobileView && showUserList ? 'hidden' : 'flex'} flex-col h-full ${selectedUser ? 'w-full md:w-2/3' : 'w-full'}`}
            >
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="hidden md:flex justify-between items-center p-4 border-b border-gray-200 bg-white">
                            <div className="flex items-center">
                                <img
                                    src={selectedUser?.avatar || "https://dbimage.blob.core.windows.net/images/649dd9cb-5be3-4b34-8f4b-55e4f1182ef7-download.png"}
                                    alt={selectedUser?.fullName || "User"}
                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                />
                                <div className="ml-3">
                                    <h3 className="font-semibold text-gray-800">{selectedUser?.fullName}</h3>
                                    <div className="flex items-center text-sm text-gray-500">
                                        {onlineUsers.includes(selectedUser.id) ? (
                                            <>
                                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                <span>Đang hoạt động</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                                <span>Ngoại tuyến</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full mx-1">
                                    <FaPhone />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full mx-1">
                                    <FaVideo />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full mx-1">
                                    <FaEllipsisV />
                                </button>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className={`flex-1 ${isMobileView && !showUserList ? 'pt-16' : ''} overflow-y-auto bg-gray-50`}>
                            <ChatHistory
                                messages={messages}
                                auth={auth}
                                getUserById={getUserById}
                                clickedMessageIndex={clickedMessageIndex}
                                toggleTimestamp={toggleTimestamp}
                                messagesEndRef={messagesEndRef}
                            />
                        </div>

                        {/* Image Preview */}
                        {previewUrl && (
                            <div className="p-2 border-t border-gray-200 bg-white">
                                <div className="relative inline-block">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="h-20 rounded-md object-cover border border-gray-300"
                                    />
                                    <button
                                        onClick={() => {
                                            setImage(null);
                                            setPreviewUrl(null);
                                        }}
                                        className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Message Input Area */}
                        <div className="p-3 border-t border-gray-200 bg-white">
                            <div className="flex items-end">
                                <div className="flex-1 relative">
                                    <div
                                        id="messageInput"
                                        ref={messageInputRef}
                                        contentEditable
                                        onKeyPress={handleKeyPress}
                                        className="min-h-[52px] max-h-[120px] overflow-y-auto p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                        onInput={handleInputChange}
                                        onPaste={handlePaste}
                                        data-placeholder="Nhập tin nhắn..."
                                    ></div>

                                    <div className="absolute right-2 bottom-2 flex items-center">
                                        <label htmlFor="imageInput" className="p-2 text-gray-500 hover:text-blue-500 cursor-pointer">
                                            <FaImage />
                                        </label>
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
                                                className="p-2 text-gray-500 hover:text-blue-500"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowEmojiPicker(!showEmojiPicker);
                                                }}
                                            >
                                                <FaSmile />
                                            </button>

                                            {showEmojiPicker && (
                                                <div className="absolute bottom-10 right-0 z-10">
                                                    <EmojiPicker onEmojiClick={handleEmojiSelect} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSendMessage}
                                    className={`ml-2 rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 ${
                                        message.trim() || image || emojiUrl
                                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-400'
                                    }`}
                                >
                                    <FaPaperPlane className={message.trim() || image || emojiUrl ? '' : 'opacity-50'} />
                                </button>
                            </div>

                            {error && (
                                <div className="mt-2 text-red-500 text-sm">{error}</div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <FaComment className="text-blue-500 text-4xl" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Tin nhắn của bạn</h3>
                        <p className="text-gray-500 text-center max-w-md">
                            Chọn một người dùng từ danh sách bên trái để bắt đầu cuộc trò chuyện
                        </p>
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
