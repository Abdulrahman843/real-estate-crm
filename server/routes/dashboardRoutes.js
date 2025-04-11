const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    // TODO: Implement dashboard data aggregation
    const dashboardData = {
      stats: {
        totalProperties: 0,
        activeListings: 0,
        totalViews: 0,
        inquiries: 0
      },
      recentActivity: []
    };
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

module.exports = router;