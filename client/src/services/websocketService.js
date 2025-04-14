import io from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(userId) {
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

    this.socket = io(wsUrl, {
      query: { userId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        setTimeout(() => this.connect(), 1000);
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Notifications
  subscribeToNotifications(callback) {
    if (!this.socket) return;
    this.socket.on('notification', callback);
  }

  // Messaging
  subscribeToMessages(callback) {
    if (!this.socket) return;
    this.socket.on('new_message', callback);
  }

  unsubscribeFromMessages() {
    if (!this.socket) return;
    this.socket.off('new_message');
  }

  sendMessage(messageData) {
    if (!this.socket) return;
    this.socket.emit('send_message', messageData);
  }

  // Typing Indicators
  emitTyping(conversationId) {
    if (!this.socket) return;
    this.socket.emit('typing', { conversationId });
  }

  subscribeToTyping(callback) {
    if (!this.socket) return;
    this.socket.on('user_typing', callback);
  }

  // Read Receipts
  markMessageRead(messageId, conversationId) {
    if (!this.socket) return;
    this.socket.emit('mark_read', { messageId, conversationId });
  }

  subscribeToReadReceipts(callback) {
    if (!this.socket) return;
    this.socket.on('message_read', callback);
  }

  // Inquiry replies (optional enhancement)
  subscribeToInquiryResponses(callback) {
    if (!this.socket) return;
    this.socket.on('inquiry_response', callback);
  }

  // Clean Disconnect
  disconnect() {
    if (this.socket) {
      this.unsubscribeFromMessages();
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new WebSocketService();
