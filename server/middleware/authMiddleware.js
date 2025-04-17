const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');

// ✅ Protect routes with JWT
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // ✅ Add this log to check role and ID
    console.log("🧪 Logged-in user:", {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    });

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// ✅ Role-based route restriction
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }
    next();
  };
};

// ✅ Custom global error handler
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// ✅ Joi validation middleware
const validateRequest = (schema, jsonField = null) => {
  return (req, res, next) => {
    let data = req.body;

    // If jsonField is specified (e.g., 'data'), parse req.body[jsonField]
    if (jsonField && req.body[jsonField]) {
      try {
        data = typeof req.body[jsonField] === 'string'
          ? JSON.parse(req.body[jsonField])
          : req.body[jsonField];
      } catch (e) {
        return res.status(400).json({ message: 'Invalid JSON in request body' });
      }
    }

    const { error } = schema.validate(data, { abortEarly: false });

    if (error) {
      const message = error.details.map(d => d.message).join(', ');
      return res.status(400).json({ message });
    }

    // Replace body with parsed object if needed
    if (jsonField) req.body[jsonField] = data;
    else req.body = data;

    next();
  };
};

module.exports = {
  protect,
  authorize,
  errorHandler,
  validateRequest
};
