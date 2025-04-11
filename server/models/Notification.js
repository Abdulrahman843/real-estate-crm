const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['inquiry', 'property_view', 'system', 'alert'],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedProperty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);