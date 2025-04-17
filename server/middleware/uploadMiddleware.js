const multer = require('multer');

// Use in-memory storage for buffer upload (Cloudinary, Sharp, etc.)
const storage = multer.memoryStorage();

// Acceptable file types (extendable)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/jpg',
    'image/svg+xml'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed types: JPEG, PNG, WebP, GIF, SVG'), false);
  }
};

// Multer instance config
const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
    files: 5                   // Max 5 files per request
  }
});

// Friendly Multer error formatter
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ message: 'File too large. Max size is 5MB.' });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ message: 'Too many files. Max allowed is 5.' });
      default:
        return res.status(400).json({ message: 'Upload error: ' + err.message });
    }
  }

  if (err) {
    return res.status(400).json({ message: err.message });
  }

  next();
};

// Export helpers
module.exports = {
  uploadMiddleware,
  handleUploadError,
  single: (fieldName) => uploadMiddleware.single(fieldName),
  array: (fieldName, maxCount = 5) => uploadMiddleware.array(fieldName, maxCount),
  fields: (fields) => uploadMiddleware.fields(fields)
};
