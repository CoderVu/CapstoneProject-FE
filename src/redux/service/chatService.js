import axios from "../setup/axios";

const fetchAllChat = async (senderId, receiverId) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/public/chat/history`,
            params: {
                senderId: senderId,
                receiverId: receiverId,
            },
        });
        console.log("Response chat history:", response
        );
        return response.data; 

    } catch (error) {
        console.error("Error fetching chat history:", error);
        throw error;
    }
}
const fetchAllChatedWithMe = async (senderId) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/public/chat/users/chatted-with`,
            params: {
                senderId: senderId,
    
            },
        });
        console.log("Response chat dfdhistory:", response
        );
        return response.data; 

    } catch (error) {
        console.error("Error fetching chat history:", error);
        throw error;
    }
}

export {
    fetchAllChat,
    fetchAllChatedWithMe,
};