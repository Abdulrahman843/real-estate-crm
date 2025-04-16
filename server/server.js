const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const helmet = require('helmet');
const compression = require('compression');
const { errorHandler } = require('./middleware/authMiddleware');
const morgan = require('morgan');
const config = require('./config/config');
const { initializeWebSocket } = require('./utils/websocket');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// Route imports
const testRoutes = require('./routes/testRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const userRoutes = require('./routes/userRoutes');
const cloudinaryRoutes = require('./routes/cloudinaryRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Initialize express app and HTTP server
const app = express();
const server = http.createServer(app);

// Trust proxy for secure cookies and HTTPS handling
if (config.server.trustProxy) {
  app.set('trust proxy', 1);
}

// Initialize WebSocket
initializeWebSocket(server);

// ✅ ALLOWED ORIGINS (add more if needed)
const allowedOrigins = [
  'https://real-estate-crm-iota.vercel.app',
  'http://localhost:5173', 'http://localhost:3000'
];

// ✅ Dynamic CORS middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.logging.enableRequestLogging) {
  app.use(morgan(config.logging.format));
}

// MongoDB Connection
mongoose.connect(config.mongodb.uri, config.mongodb.options)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/messages', messageRoutes);

// Serve static frontend in production
if (config.server.env === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Error Handler
app.use(errorHandler);

// Start server
server.listen(config.server.port, () => {
  console.log(`Server running in ${config.server.env} mode on port ${config.server.port}`);
  console.log(`WebSocket server ready at path ${config.websocket.path}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Starting graceful shutdown...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('Server shutdown complete');
      process.exit(0);
    });
  });
});
