const express = require('express');
const crypto = require('crypto');
const config = require('../config/config');

const router = express.Router();

// GET /api/cloudinary/signature
router.get('/signature', (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const signature = crypto
    .createHash('sha1')
    .update(`timestamp=${timestamp}${config.cloudinary.apiSecret}`)
    .digest('hex');

  res.json({
    timestamp,
    signature,
    cloudName: config.cloudinary.cloudName,
    apiKey: config.cloudinary.apiKey,
  });
});

module.exports = router;
