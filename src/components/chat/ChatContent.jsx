import { useRef, useCallback, useEffect, useState, useContext } from "react";
import { useSelector } from "react-redux";
import { ChatContext } from "../context/showChat";
import chatService from "../../ws/configSocket";
import { fetchAllUser } from "../../redux/service/userService";
import { fetchAllChat, fetchAllChatedWithMe, postImageChat } from "../../redux/service/chatService";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faImage, faSmile } from '@fortawesome/free-solid-svg-icons';
import { parseISO, format, differenceInMinutes } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';

const ChatContent = () => {
    const { showChat, setShowChat, selectedUser, setSelectedUser } = useContext(ChatContext);
    const auth = useSelector((state) => state.auth.auth);
    const [searchTerm, setSearchTerm] = useState("");
    const [search, setSearch] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null); // State for image preview
    const [users, setUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [error, setError] = useState("");
    const [clickedMessageIndex, setClickedMessageIndex] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State for emoji picker visibility
    const [emojiUrl, setEmojiUrl] = useState(null); // State for emoji URL
    const messagesEndRef = useRef(null);
    const searchRef = useRef(null);
    const [chattedUsers, setChattedUsers] = useState([]);
    const listenerAddedRef = useRef(false); // Ref to track if listener is added

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
    };

    const handleClickChatContent = () => {
        setShowChat(false);
    };

    const handleClickOutside = useCallback((e) => {
        if (searchRef.current && !searchRef.current.contains(e.target)) {
            setSearch(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [handleClickOutside]);

    useEffect(() => {
        const handleIncomingMessage = (message) => {
            console.log("Incoming message:", message); // Log incoming message
            if (message.type === "onlineUsers") {
                setOnlineUsers(message.onlineUsers);
            } else if (message && (message.message && message.message.trim() !== "" || message.imageUrl)) {
                setMessages((prevMessages) => {
                    // Check if the message is already in the state
                    if (!prevMessages.some(msg => msg.timestamp === message.timestamp && msg.sender === message.sender)) {
                        return [...prevMessages, message];
                    }
                    console.log("Message already exists in the state:", message);
                    return prevMessages;
                });
            }
        };

        if (showChat) {
            chatService.connect("ws://192.168.1.40:8080/ws", auth?.id);
            if (!listenerAddedRef.current) {
                chatService.addMessageListener(handleIncomingMessage);
                listenerAddedRef.current = true; // Mark listener as added
            }
        } else {
            chatService.disconnect();
            listenerAddedRef.current = false; // Reset listener added flag
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
                    console.log("senderId", auth?.id);
                    console.log("receiverId", selectedUser.id);
                    setMessages(chatHistory);
                } catch (error) {
                    console.error("Error fetching chat history:", error);
                }
            }
        };
        fetchChatHistory();
    }, [selectedUser, auth?.id]);

    const handleSendMessage = async () => {
        if (!selectedUser) {
            setError("Please select a recipient.");
            return;
        }
        if (message.trim() !== "" || image || emojiUrl) {
            const payload = {
                sender: auth?.id,
                receiver: selectedUser.id,
                message: message.trim(),
                imageUrl: emojiUrl || null, // Use emojiUrl if it exists
                timestamp: new Date().toISOString() // Add current timestamp
            };
            if (image) {
                try {
                    const imageUrl = await postImageChat(image);
                    payload.imageUrl = imageUrl; // Add imageUrl key to the payload
                    setImage(null); // Clear the image after sending the message
                    setPreviewUrl(null); // Clear the preview URL
                } catch (error) {
                    setError("Image upload failed.");
                    return;
                }
            }
            chatService.sendMessage(payload);
            setMessage(""); // Clear the input field after sending the message
            setError(""); // Clear any previous error
            setEmojiUrl(null); // Clear the emoji URL after sending the message
            document.getElementById("messageInput").innerHTML = "";
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setSearch(false);
    };

    const getUserById = (userId) => {
        return users.find(user => user.id === userId);
    };

    const formatMessageTime = (time) => {
        if (time) {
            try {
                const date = parseISO(time);
                return format(date, "HH:mm, MMM d, yyyy");
            } catch (error) {
                console.error("Error parsing date:", error);
                return "Invalid Date";
            }
        } else {
            console.error("Time is undefined or null");
            return "Unknown Time";
        }
    };

    const shouldShowTimestamp = (currentMessage, previousMessage) => {
        if (!previousMessage) return true;
        if (!currentMessage.timestamp || !previousMessage.timestamp) return false;
        const currentTime = parseISO(currentMessage.timestamp);
        const previousTime = parseISO(previousMessage.timestamp);
        return differenceInMinutes(currentTime, previousTime) > 10;
    };

    const toggleTimestamp = (index) => {
        setClickedMessageIndex(clickedMessageIndex === index ? null : index);
    };

    const sortedMessages = messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = document.createElement("img");
                img.src = event.target.result;
                img.style.maxWidth = "50px";
                img.style.maxHeight = "50px";
                img.style.margin = "5px";
                document.getElementById("messageInput").appendChild(img);
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
                setPreviewUrl(URL.createObjectURL(file)); // Set the preview URL
            }
        }
    };

    useEffect(() => {
        const handleEmojiClick = (event) => {
            const imgElement = event.target.closest("img.epr-emoji-img");

            if (imgElement && imgElement.src) {
                const emojiUrl = imgElement.src;
                setEmojiUrl(emojiUrl);
                setShowEmojiPicker(false);

                // Create an img element for the emoji and append it to the messageInput div
                const img = document.createElement("img");
                img.src = emojiUrl;
                img.style.maxWidth = "20px";
                img.style.maxHeight = "20px";
                img.style.margin = "5px";
                document.getElementById("messageInput").appendChild(img);
            } else {
                console.warn("❌ Không tìm thấy ảnh emoji.");
            }
        };

        // Add event listener
        document.addEventListener("click", handleEmojiClick);

        // Cleanup event listener on component unmount
        return () => {
            document.removeEventListener("click", handleEmojiClick);
        };
    }, []);

    return (
        <div className={`fixed bottom-0 right-0 w-3/4 h-3/4 bg-white border border-gray-300 rounded-t-lg shadow-lg flex ${showChat ? "block" : "hidden"}`} style={{ zIndex: 1000 }}>
            {/* Danh sách người dùng */}
            <div className="w-1/3 border-r border-gray-300 p-4">
                <div className="relative" ref={searchRef}>
                    <input
                        type="text"
                        className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={() => {
                            setSearchTerm("");
                            setSearch(true);
                        }}
                    />
                    {search && (
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1">
                            {(users || []).filter(user => user.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                                <div key={user.id} className="p-3 cursor-pointer hover:bg-gray-200 flex items-center justify-between" onClick={() => handleUserSelect(user)}>
                                    <div className="flex items-center">
                                        <img src={user.avatar || "default-avatar.png"} alt={user.fullName} className="w-8 h-8 rounded-full mr-2" />
                                        <div>
                                            <div className="font-bold">{user.fullName}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                    {onlineUsers.includes(user.id) && (
                                        <span className="ml-2 w-3 h-3 bg-green-500 rounded-full"></span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {!search && (
                        <div className="mt-4">
                            {(chattedUsers || []).map(user => (
                                <div key={user.id} className="p-3 cursor-pointer hover:bg-gray-200 flex items-center justify-between" onClick={() => handleUserSelect(user)}>
                                    <div className="flex items-center">
                                        <img src={user.avatar || "default-avatar.png"} alt={user.fullName} className="w-8 h-8 rounded-full mr-2" />
                                        <div>
                                            <div className="font-bold">{user.fullName}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                    {onlineUsers.includes(user.id) && (
                                        <span className="ml-2 w-3 h-3 bg-green-500 rounded-full"></span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Nội dung chat */}
            <div className="w-2/3 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-gray-100">
                    <div className="flex items-center">
                        <img src={selectedUser?.avatar || "https://dbimage.blob.core.windows.net/images/649dd9cb-5be3-4b34-8f4b-55e4f1182ef7-download.png"} alt={selectedUser?.fullName || "Message"} className="w-8 h-8 rounded-full mr-2" />
                        <h2 className="text-lg font-bold">{selectedUser ? selectedUser.fullName : "Message"}</h2>
                        {selectedUser && onlineUsers.includes(selectedUser.id) && (
                            <span className="ml-2 w-3 h-3 bg-green-500 rounded-full"></span>
                        )}
                    </div>
                    <button className="text-gray-500 hover:text-gray-700" onClick={handleClickChatContent}>X</button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-2">
                    {sortedMessages.map((msg, index) => {
                        const user = getUserById(msg.sender);
                        const previousMessage = sortedMessages[index - 1];
                        const showTimestamp = shouldShowTimestamp(msg, previousMessage) || index === clickedMessageIndex;
                        return (
                            <div key={index} className={`flex ${msg.sender === auth?.id ? "justify-end" : "justify-start"}`} onClick={() => toggleTimestamp(index)}>
                                <div className="flex items-center">
                                    {msg.sender !== auth?.id && (
                                        <img src={user?.avatar || "default-avatar.png"} alt={user?.fullName} className="w-8 h-8 rounded-full mr-2" />
                                    )}
                                    <div className="max-w-xs p-3 rounded-lg">
                                        {msg.imageUrl && <img src={msg.imageUrl} alt="Chat Image" className="mt-2 max-w-full h-auto rounded-lg" />}
                                        {msg.message && (
                                            <div className={`max-w-xs p-3 rounded-lg ${msg.sender === auth?.id ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}>
                                                {msg.message}
                                            </div>
                                        )}
                                        {showTimestamp && <div className="text-xs text-gray-500 mt-1">{formatMessageTime(msg.timestamp)}</div>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Nhập tin nhắn */}
                <div className="p-4 border-t border-gray-300 flex items-center relative">
                    <div
                        id="messageInput"
                        contentEditable
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type a message..."
                        onInput={(e) => setMessage(e.currentTarget.textContent)}
                        onPaste={handlePaste}
                    />
                  
                    <input
                        type="file"
                        id="imageInput"
                        style={{ display: "none" }}
                        onChange={handleImageChange}
                    />
                    <label htmlFor="imageInput" className="ml-3 cursor-pointer">
                        <FontAwesomeIcon icon={faImage} className="text-gray-500 hover:text-gray-700" />
                    </label>
             
                    <button className="ml-3 text-gray-500 hover:text-gray-700" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                        <FontAwesomeIcon icon={faSmile} />
                    </button>
                    {showEmojiPicker && (
                        <div className="absolute bottom-16 right-4">
                            <EmojiPicker onEmojiClick={(event, emojiObject) => setEmojiUrl(emojiObject.url)} />
                            
                        </div>
                    )}
                    <button className="ml-3 text-gray-500 hover:text-gray-700" onClick={handleSendMessage}>
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </div>
                {error && <div className="text-red-500 text-center p-2">{error}</div>}
            </div>
        </div>
    );
};

export default ChatContent;