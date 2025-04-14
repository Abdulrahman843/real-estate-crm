const express = require('express');
const router = express.Router();
const { sendMessage, getConversations } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Fetch user's message conversations
router.get('/conversations', protect, getConversations);

// Send a new message to a property agent
router.post('/', protect, sendMessage);

module.exports = router;
