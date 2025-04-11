const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const { uploadMiddleware, handleUploadError } = require('../middleware/uploadMiddleware');

router.post('/test-upload', uploadMiddleware.single('image'), handleUploadError, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'test' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            stream.end(req.file.buffer);
        });

        res.json({
            message: 'Upload successful',
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

module.exports = router;