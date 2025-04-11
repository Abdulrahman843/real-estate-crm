const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

// Get all notifications for the current user
router.get('/', protect, async (req, res) => {
    try {
      const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .populate('relatedProperty', 'title imageUrl');
  
      const unreadCount = await Notification.countDocuments({
        user: req.user._id,
        read: false
      });
  
      res.json({ notifications, unreadCount });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Error fetching notifications' });
    }
  });

// Mark a notification as read
router.put('/:id/read', protect, async (req, res) => {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { read: true },
        { new: true }
      );
  
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
  
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: 'Error updating notification' });
    }
  });

/// Mark all notifications as read
router.put('/read-all', protect, async (req, res) => {
    try {
      await Notification.updateMany(
        { user: req.user._id, read: false },
        { read: true }
      );
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating notifications' });
    }
  });

// Delete a notification
router.delete('/:id', protect, async (req, res) => {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
      });
  
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
  
      res.json({ message: 'Notification deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting notification' });
    }
  });
  
module.exports = router;