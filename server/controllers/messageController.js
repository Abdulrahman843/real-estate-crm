const Message = require('../models/Message');
const User = require('../models/User');
const Property = require('../models/Property');

// @desc    Send a message to the agent of a property
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { propertyId, content } = req.body;

    if (!content || !propertyId) {
      return res.status(400).json({ message: 'Content and propertyId are required' });
    }

    const property = await Property.findById(propertyId).populate('agent');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const message = new Message({
      sender: req.user._id,
      receiver: property.agent._id,
      property: propertyId,
      content
    });

    await message.save();

    // Optional: populate sender and receiver
    await message.populate('sender', 'name email');
    await message.populate('receiver', 'name email');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get conversations for the logged-in user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      }
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversations
};
