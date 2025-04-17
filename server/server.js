const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const morgan = require('morgan');

const config = require('./config/config');
const { errorHandler } = require('./middleware/authMiddleware');
const { initializeWebSocket } = require('./utils/websocket');

// Import Routes
const testRoutes = require('./routes/testRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const userRoutes = require('./routes/userRoutes');
const cloudinaryRoutes = require('./routes/cloudinaryRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Initialize app and server
const app = express();
const server = http.createServer(app);

// Trust proxy if deployed behind a load balancer
if (config.server.trustProxy) {
  app.set('trust proxy', 1);
}

// Initialize WebSocket server
initializeWebSocket(server);

// ------------------------------------
// ✅ MIDDLEWARE SETUP
// ------------------------------------

const allowedOrigins = [
  'https://real-estate-crm-iota.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
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

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.logging.enableRequestLogging) {
  app.use(morgan(config.logging.format));
}

// ------------------------------------
// ✅ DATABASE CONNECTION
// ------------------------------------
mongoose.connect(config.mongodb.uri, config.mongodb.options)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// ------------------------------------
// ✅ ROUTES
// ------------------------------------

app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api', (req, res) => {
  res.send('✅ API is working');
});

// ------------------------------------
// ✅ STATIC FILES (PRODUCTION)
// ------------------------------------

if (config.server.env === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// ------------------------------------
// ✅ ERROR HANDLING
// ------------------------------------

app.use(errorHandler);

// ------------------------------------
// ✅ SERVER LISTENING
// ------------------------------------

server.listen(config.server.port, () => {
  console.log(`🚀 Server running in ${config.server.env} mode on port ${config.server.port}`);
  console.log(`🛰️ WebSocket ready at path ${config.websocket.path}`);
});

// ------------------------------------
// ✅ GRACEFUL SHUTDOWN
// ------------------------------------

process.on('SIGTERM', () => {
  console.log('⚠️ Graceful shutdown initiated...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('✅ Shutdown complete');
      process.exit(0);
    });
  });
});
