const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
        // Generate unique filename with original extension
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Validate file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed'), false);
    }
};

// Create multer instance with configuration
const uploadMiddleware = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 5 // Maximum 5 files per request
    },
    fileFilter: fileFilter
});

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File too large. Maximum size is 5MB'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                message: 'Too many files. Maximum is 5 files per upload'
            });
        }
        return res.status(400).json({
            message: 'File upload error: ' + error.message
        });
    }
    
    if (error) {
        return res.status(400).json({
            message: error.message
        });
    }
    next();
};

module.exports = {
    uploadMiddleware,
    handleUploadError,
    // Helper methods for different upload scenarios
    single: (fieldName) => uploadMiddleware.single(fieldName),
    array: (fieldName, maxCount) => uploadMiddleware.array(fieldName, maxCount),
    fields: (fields) => uploadMiddleware.fields(fields)
};