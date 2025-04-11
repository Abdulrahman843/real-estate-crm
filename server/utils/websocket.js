const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

let wss;

const initializeWebSocket = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', async (ws, req) => {
    try {
      // Extract token and handle authentication
      const token = req.url.split('token=')[1];
      if (!token) {
        ws.close(4001, 'Authentication required');
        return;
      }

      // Verify token and set user info
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ws.userId = decoded.id;
      ws.userRole = decoded.role;
      ws.isAlive = true;

      // Send initial connection success message
      handleMessage(ws, { 
        type: 'connection',
        userId: ws.userId
      });

      // Setup ping-pong
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          handleMessage(ws, message);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        ws.close(4000, 'Internal server error');
      });

      // Handle close
      ws.on('close', () => {
        ws.isAlive = false;
      });

    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close(4003, 'Invalid token');
    }
  });

  // Setup heartbeat
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });
};

const handleMessage = (ws, message) => {
  switch (message.type) {
    case 'connection':
      ws.send(JSON.stringify({
        type: 'connection',
        status: 'success',
        userId: message.userId,
        timestamp: new Date().toISOString()
      }));
      break;

    case 'ping':
      ws.send(JSON.stringify({ 
        type: 'pong',
        timestamp: new Date().toISOString()
      }));
      break;

    case 'heartbeat':
      ws.isAlive = true;
      ws.send(JSON.stringify({ 
        type: 'heartbeat',
        status: 'alive',
        timestamp: new Date().toISOString()
      }));
      break;

    default:
      console.warn('Unknown message type:', message.type);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Unknown message type',
        timestamp: new Date().toISOString()
      }));
  }
};

const notifyUser = (userId, notification) => {
  if (!wss) return;

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.userId === userId) {
      try {
        client.send(JSON.stringify({
          type: 'notification',
          data: notification,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  });
};

const broadcastMessage = (message, filter = () => true) => {
  if (!wss) return;

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && filter(client)) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error broadcasting message:', error);
      }
    }
  });
};

// Add reconnection handling
const handleReconnect = (ws, userId) => {
    wss.clients.forEach(client => {
      if (client.userId === userId && client !== ws) {
        client.close(4000, 'New connection established');
      }
    });
  };

  module.exports = { 
    initializeWebSocket, 
    notifyUser,
    broadcastMessage,
    handleReconnect
  };