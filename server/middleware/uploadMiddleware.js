const multer = require('multer');
const crypto = require('crypto');

// Use memory storage for direct uploads (no local disk)
const storage = multer.memoryStorage();

// Validate file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed'), false);
  }
};

// Create multer instance with memory storage
const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 5 // Max 5 files per request
  },
  fileFilter
});

// Handle multer errors gracefully
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Max size is 5MB' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Max is 5 per upload' });
    }
    return res.status(400).json({ message: 'File upload error: ' + error.message });
  }

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  next();
};

module.exports = {
  uploadMiddleware,
  handleUploadError,
  single: (fieldName) => uploadMiddleware.single(fieldName),
  array: (fieldName, maxCount) => uploadMiddleware.array(fieldName, maxCount),
  fields: (fields) => uploadMiddleware.fields(fields)
};
