import { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from "react-redux";
import ChatContent from './ChatContent';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ChatContext } from '../context/showChat'; // Correct import

const ChatButton = (props) => {
    const { product } = props;
    const [newMessagesCount, setNewMessagesCount] = useState(0);
    const [unreadUsers, setUnreadUsers] = useState([]);
    const dispatch = useDispatch();
    const { showChat, setShowChat, selectedUser, setSelectedUser, setOwner } = useContext(ChatContext);

    return (
        <div>
            {/* Nút chat */}
            <div className={`fixed bottom-4 right-4 ${showChat ? 'hidden' : 'block'}`} onClick={() => setShowChat(!showChat)}>
                <button className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-blue-700">
                    Chat
                    {newMessagesCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                            {newMessagesCount}
                        </span>
                    )}
                </button>
            </div>

            {/* ChatContent luôn tồn tại trong DOM nhưng được ẩn */}
            <div className={`fixed bottom-4 right-4 ${showChat ? 'block' : 'hidden'}`}>
                <ChatContent
                    showChat={showChat}
                    setShowChat={setShowChat}
                    setNewMessagesCount={setNewMessagesCount}
                    newMessagesCount={newMessagesCount}
                    product={product}
                    unreadUsers={unreadUsers}
                    setUnreadUsers={setUnreadUsers}
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                />
            </div>
        </div>
    )
};

export default ChatButton;