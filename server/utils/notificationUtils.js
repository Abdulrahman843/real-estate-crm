const Notification = require('../models/Notification');

const createNotification = async (userId, message, type, relatedProperty = null) => {
  try {
    const notification = await Notification.create({
      user: userId,
      message,
      type,
      relatedProperty
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

const createAndSendNotification = async (userId, message, type, relatedProperty = null) => {
  const notification = await createNotification(userId, message, type, relatedProperty);
  notifyUser(userId, notification);
};

module.exports = { createNotification };