import React, { createContext, useState } from 'react';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
    const [showChat, setShowChat] = useState(false);
    const [selectedUser, setSelectedUser] = useState('');
    const [owner, setOwner] = useState([]);

    return (
        <ChatContext.Provider value={{ showChat, setShowChat, selectedUser, setSelectedUser, owner, setOwner }}>
            {children}
        </ChatContext.Provider>
    );
};

export { ChatContext, ChatProvider };