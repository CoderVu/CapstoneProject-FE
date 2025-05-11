class OrderNotificationService {
    constructor() {
        this.ws = null;
        this.messageListeners = [];
        this.userId = null;
    }

    connect(url, userId) {
        this.userId = userId;
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log('Order notification WebSocket connection opened');
            const identifyMessage = {
                type: 'identify',
                userId: this.userId,
            };
            console.log('Sending identify message:', identifyMessage);
            this.ws.send(JSON.stringify(identifyMessage));
        };

        this.ws.onclose = () => {
            console.log('Order notification WebSocket connection closed');
        };

        this.ws.onmessage = (event) => {
            console.log('Order notification received:', event.data);
            const message = JSON.parse(event.data);
            this.messageListeners.forEach((listener) => listener(message));
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }

    addMessageListener(listener) {
        console.log("Adding order notification listener...", listener);
        this.messageListeners.push(listener);
    }

    removeMessageListener(listener) {
        this.messageListeners = this.messageListeners.filter((l) => l !== listener);
    }
}

const orderNotificationService = new OrderNotificationService();
export default orderNotificationService; 