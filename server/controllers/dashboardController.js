// ✅ Full updated backend controller (controllers/dashboardController.js)
const Property = require('../models/Property');
const User = require('../models/User');
const Message = require('../models/Message');

const getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user._id;

    if (role === 'admin') {
      const totalUsers = await User.countDocuments();
      const totalProperties = await Property.countDocuments();
      const activeListings = await Property.countDocuments({ status: 'available' });
      const totalTransactions = await Property.countDocuments({ status: { $in: ['sold', 'rented'] } });
      const recentListings = await Property.find().sort({ createdAt: -1 }).limit(5);
      const propertyTypes = await Property.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $project: { type: '$_id', count: 1, _id: 0 } }
      ]);
      const monthlyPerformance = [
        { month: 'Jan', views: 100, inquiries: 20 },
        { month: 'Feb', views: 120, inquiries: 25 },
        { month: 'Mar', views: 150, inquiries: 30 },
      ];

      return res.json({
        dashboardType: 'admin',
        adminStats: {
          totalUsers,
          totalProperties,
          activeListings,
          totalTransactions,
          recentListings,
          propertyTypes,
          monthlyPerformance
        }
      });
    }

    if (role === 'agent') {
      const properties = await Property.find({ agent: userId });
      const activeListings = await Property.find({ agent: userId, status: 'available' });
      const recentProperties = await Property.find({ agent: userId }).sort({ createdAt: -1 }).limit(5);

      return res.json({
        dashboardType: 'agent',
        propertyStats: {
          totalProperties: properties.length,
          totalViews: properties.reduce((acc, p) => acc + (p.views || 0), 0),
          totalInquiries: 12, // demo
          activeListings: activeListings.length,
        },
        recentProperties
      });
    }

    if (role === 'client') {
      const client = await User.findById(userId).populate({
        path: 'favorites',
        populate: { path: 'agent', select: 'name email' }
      });

      return res.json({
        dashboardType: 'client',
        favorites: client.favorites,
        recentMessages: [], // optional
        topAgents: [] // optional
      });
    }

    return res.status(403).json({ message: 'Unauthorized' });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
};

module.exports = {
  getDashboardStats
};
