const express = require('express');
const router = express.Router();
const Joi = require('joi');

// Controller functions
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

// Middleware
const {
  protect,
  authorize,
  validateRequest
} = require('../middleware/authMiddleware');

const {
  uploadMiddleware,
  handleUploadError
} = require('../middleware/uploadMiddleware');


// ------------------------
// Joi Validation Schemas
// ------------------------

const basePropertySchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).required(),
  price: Joi.number().min(1).required(),
  propertyType: Joi.string().valid('house', 'apartment', 'condo', 'villa', 'land').required(),
  status: Joi.string().valid('available', 'sold', 'pending', 'reserved', 'rented').required(),
  location: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().allow('', null),
    zipCode: Joi.string().required(),
    lat: Joi.number().allow(null),
    lng: Joi.number().allow(null)
  }).required(),
  features: Joi.object({
    bedrooms: Joi.number().min(0).required(),
    bathrooms: Joi.number().min(0).required(),
    area: Joi.number().min(0).allow(null),
    squareFeet: Joi.number().min(0).allow(null),
    yearBuilt: Joi.number().allow(null),
    amenities: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string()
    ).optional()
  }).required(),
  amenities: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional()
});

const createSchema = basePropertySchema;

const updateSchema = basePropertySchema.fork(
  Object.keys(basePropertySchema.describe().keys),
  schema => schema.optional()
);

const statusSchema = Joi.object({
  status: basePropertySchema.extract('status').required()
});


// ------------------------
// Public Routes
// ------------------------

router.get('/search', getProperties);         // Advanced search
router.get('/featured', getProperties);       // Featured properties
router.get('/agent/:agentId', getAgentProperties); // Agent's listings
router.get('/favorites/me', protect, getFavorites);
router.get('/:id/reviews', getPropertyReviews);
router.get('/:id', getProperty);              // Get one
router.get('/', getProperties);               // All properties


// ------------------------
// Protected Routes
// ------------------------

router.use(protect);

// Create property
router.post(
  '/',
  authorize('admin', 'agent'),
  uploadMiddleware.any(),
  handleUploadError,
  validateRequest(createSchema, 'data'),
  createProperty
);

// Update property
router.put(
  '/:id',
  authorize('admin', 'agent'),
  uploadMiddleware.any(),
  handleUploadError,
  validateRequest(updateSchema, 'data'),
  updateProperty
);

// Delete property
router.delete(
  '/:id',
  authorize('admin', 'agent'),
  deleteProperty
);

// Update status (e.g. sold, pending)
router.patch(
  '/:id/status',
  authorize('admin', 'agent'),
  validateRequest(statusSchema),
  updatePropertyStatus
);


// ------------------------
// Favorites & Reviews
// ------------------------

router.post('/:id/favorite', toggleFavorite);         // Add/remove from favorites
router.post('/:id/reviews', addPropertyReview);       // Add review
router.post('/:id/report', reportProperty);           // Report listing


// ------------------------
// Analytics & Tracking
// ------------------------

router.get('/:id/analytics', authorize('admin', 'agent'), getPropertyAnalytics);
router.post('/:id/track', trackPropertyView);


// ------------------------
// Image Uploads
// ------------------------

router.post(
  '/:id/upload-image',
  authorize('admin', 'agent'),
  uploadMiddleware.single('image'),
  handleUploadError,
  uploadPropertyImage
);

router.post(
  '/:id/images',
  authorize('admin', 'agent'),
  uploadMiddleware.array('images', 10),
  handleUploadError,
  uploadPropertyGallery
);

router.delete(
  '/:id/images/:imageId',
  authorize('admin', 'agent'),
  deletePropertyImage
);


module.exports = router;
