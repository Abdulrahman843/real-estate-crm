require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1'
  },

  mongodb: {
    uri: process.env.MONGO_URI,
    options: {
      maxPoolSize: parseInt(process.env.MONGODB_POOL_SIZE) || 10
    }
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '30d',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
    cookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE) || 30
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  },

  // ✅ You can safely ignore this if rate limiting is disabled
  rateLimits: {
    window: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5
  },

  websocket: {
    path: process.env.WS_PATH || '/ws',
    heartbeat: parseInt(process.env.WS_HEARTBEAT_INTERVAL) || 30000,
    maxPayload: process.env.WS_MAX_PAYLOAD || '10mb'
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'real-estate-crm'
  },

  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    username: process.env.EMAIL_USERNAME,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM,
    retryAttempts: parseInt(process.env.EMAIL_RETRY_ATTEMPTS) || 3,
    retryDelay: parseInt(process.env.EMAIL_RETRY_DELAY) || 5000
  },

  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    format: process.env.LOG_FORMAT || 'combined',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true'
  },

  cache: {
    enabled: process.env.ENABLE_RESPONSE_CACHE === 'true',
    duration: parseInt(process.env.CACHE_DURATION) || 3600
  }
};

module.exports = config;
