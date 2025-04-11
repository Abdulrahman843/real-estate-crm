const express = require('express');
const router = express.Router();
const Joi = require('joi');
const rateLimit = require('express-rate-limit');

const {
  registerUser,
  loginUser,
  getProfile,
  getUsers,
  updateUserRole,
  deleteUser,
  searchUsers,
  updateProfile,
  updatePassword,
  uploadAvatar,
  getActivityLog,
  updateNotifications,
  exportUserData,
  setupTwoFactor,
  enableTwoFactor,
  verifyEmail,
  resetPassword,
  refreshToken
} = require('../controllers/userController');

const {
  protect,
  authorize,
  validateRequest
} = require('../middleware/authMiddleware');

const uploadMiddleware = require('../middleware/uploadMiddleware');

// Rate limiters
const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many registration attempts, please try again later'
});

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later'
});

const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: 'Too many password reset attempts, please try again later'
});

const exportLimiter = rateLimit({
  windowMs: 3600 * 1000,
  max: 2,
  message: 'Too many export attempts, please try again later'
});

// Joi schemas
const registerSchema = {
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain letters, numbers, and special characters'
    }),
  role: Joi.string().valid('admin', 'agent', 'client').default('client'),
  phone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/).optional()
};

const loginSchema = {
  email: Joi.string().email().required(),
  password: Joi.string().required()
};

const profileUpdateSchema = {
  name: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/).optional(),
  preferences: Joi.object({
    darkMode: Joi.boolean(),
    emailNotifications: Joi.boolean(),
    pushNotifications: Joi.boolean()
  }).optional(),
  notifications: Joi.object({
    newListings: Joi.boolean(),
    priceChanges: Joi.boolean(),
    propertyUpdates: Joi.boolean()
  }).optional()
};

const passwordUpdateSchema = {
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
    .required()
};

// Fallback for unimplemented functions
const notImplemented = (req, res) => res.status(501).json({ message: 'Not implemented' });

// Public routes
router.post('/register', registerLimiter, validateRequest(registerSchema), registerUser || notImplemented);
router.post('/login', loginLimiter, validateRequest(loginSchema), loginUser || notImplemented);
router.post('/refresh-token', refreshToken || notImplemented);
router.post('/reset-password', resetPasswordLimiter, resetPassword || notImplemented);
router.get('/verify-email/:token', verifyEmail || notImplemented);

// Protected user routes
router.get('/profile', protect, getProfile || notImplemented);
router.put('/profile', protect, validateRequest(profileUpdateSchema), updateProfile || notImplemented);
router.put('/password', protect, validateRequest(passwordUpdateSchema), updatePassword || notImplemented);
router.post(
  '/avatar',
  protect,
  uploadMiddleware.single('avatar'),
  uploadMiddleware.handleUploadError,
  uploadAvatar || notImplemented
);
router.get('/activity', protect, getActivityLog || notImplemented);
router.put('/notifications', protect, updateNotifications || notImplemented);
router.get('/export-data', protect, exportLimiter, exportUserData || notImplemented);

// Two-Factor Auth routes
router.get('/2fa/setup', protect, setupTwoFactor || notImplemented);
router.post('/2fa/enable', protect, enableTwoFactor || notImplemented);

// Admin-only routes
router.get('/all', protect, authorize('admin'), getUsers || notImplemented);
router.patch('/role/:id', protect, authorize('admin'), updateUserRole || notImplemented);
router.delete('/delete/:id', protect, authorize('admin'), deleteUser || notImplemented);
router.get('/search', protect, authorize('admin'), searchUsers || notImplemented);

module.exports = router;
