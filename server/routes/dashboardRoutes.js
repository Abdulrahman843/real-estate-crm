// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getDashboardStats } = require('../controllers/dashboardController');

// Unified GET /api/dashboard for all roles
router.get('/', protect, authorize('admin', 'agent', 'client'), getDashboardStats);

router.get('/', (req, res) => {
    console.log('Dashboard route hit');
    res.json({ message: 'Dashboard OK' });
  });
  
module.exports = router;
