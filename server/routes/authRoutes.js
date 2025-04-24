const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  getAllUsers,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);
router.get('/all', getAllUsers);

// ✅ Add these two routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
