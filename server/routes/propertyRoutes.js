const express = require('express');
const router = express.Router();
const Joi = require('joi');
const {
    getProperties,
    getAgentProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    updatePropertyStatus,
    uploadPropertyImage,
    uploadPropertyGallery,
    deletePropertyImage,
    toggleFavorite,
    getFavorites,
    addPropertyReview,
    getPropertyReviews,
    reportProperty,
    getPropertyAnalytics,
    trackPropertyView
} = require('../controllers/propertyController');
const { protect, authorize, validateRequest } = require('../middleware/authMiddleware');
const { uploadMiddleware, handleUploadError } = require('../middleware/uploadMiddleware');

// Validation schema
const propertySchema = {
    title: Joi.string().required().min(3).max(100),
    description: Joi.string().required().min(10),
    price: Joi.number().required().min(0),
    location: Joi.object({
        address: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        country: Joi.string().required(),
        zipCode: Joi.string().required(),
        coordinates: Joi.object({
            lat: Joi.number(),
            lng: Joi.number()
        })
    }),
    features: Joi.object({
        bedrooms: Joi.number().min(0),
        bathrooms: Joi.number().min(0),
        squareFeet: Joi.number().min(0),
        yearBuilt: Joi.number(),
        parking: Joi.number(),
        amenities: Joi.array().items(Joi.string())
    }),
    status: Joi.string().valid('available', 'sold', 'pending', 'reserved'),
    type: Joi.string().valid('apartment', 'house', 'condo', 'villa', 'office')
};

// PUBLIC ROUTES
router.get('/', getProperties);
router.get('/:id', getProperty);
router.get('/agent/:agentId', getAgentProperties);
router.get('/search', getProperties); // or custom handler if needed
router.get('/featured', getProperties); // or custom handler if needed
router.get('/:id/reviews', getPropertyReviews);

// Protected routes
router.use(protect);

// Property management
router.post('/', authorize('admin', 'agent'), validateRequest(propertySchema), createProperty);
router.put('/:id', authorize('admin', 'agent'), validateRequest(propertySchema), updateProperty);
router.delete('/:id', authorize('admin', 'agent'), deleteProperty);

// Status update
router.patch(
    '/:id/status',
    authorize('admin', 'agent'),
    validateRequest({ status: propertySchema.status }),
    updatePropertyStatus
);

// Favorites
router.post('/:id/favorite', toggleFavorite);
router.get('/favorites/me', getFavorites);

// Reviews & Reports
router.post('/:id/reviews', addPropertyReview);
router.post('/:id/report', reportProperty);

// Analytics & Views
router.get('/:id/analytics', authorize('admin', 'agent'), getPropertyAnalytics);
router.post('/:id/track', trackPropertyView);

// Image upload and gallery
router.post(
    '/:id/images',
    authorize('admin', 'agent'),
    uploadMiddleware.array('images', 10),
    handleUploadError,
    uploadPropertyGallery
);
router.post(
    '/:id/upload-image',
    authorize('admin', 'agent'),
    uploadMiddleware.single('image'),
    handleUploadError,
    uploadPropertyImage
  );

router.delete(
    '/:id/images/:imageId',
    authorize('admin', 'agent'),
    deletePropertyImage
);

module.exports = router;
