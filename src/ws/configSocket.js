class ChatService {
    constructor() {
        this.ws = null;
        this.messageListeners = [];
        this.sendListeners = [];
        this.userId = null;
    }

    connect(url, userId) {
        this.userId = userId;
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log('WebSocket connection opened');
            const identifyMessage = {
                type: 'identify',
                userId: this.userId,
            };
            console.log('Sending identify message:', identifyMessage);
            this.ws.send(JSON.stringify(identifyMessage));
        };

        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        this.ws.onmessage = (event) => {
            console.log('WebSocket message received:', event.data); // Log received message
            const message = JSON.parse(event.data);
            this.messageListeners.forEach((listener) => listener(message));
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }

    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
            this.sendListeners.forEach((listener) => listener(message));
        }
    }

    addMessageListener(listener) {
        console.log("Adding message listener...", listener);
        this.messageListeners.push(listener);
    }

    removeMessageListener(listener) {
        this.messageListeners = this.messageListeners.filter((l) => l !== listener);
    }

    addSendListener(listener) {
        this.sendListeners.push(listener);
    }

    removeSendListener(listener) {
        this.sendListeners = this.sendListeners.filter((l) => l !== listener);
    }
}

const chatService = new ChatService();
export default chatService;