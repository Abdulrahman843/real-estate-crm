// routes/propertyRoutes.js
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

const propertySchema = {
  title: Joi.string().min(3).max(100),
  description: Joi.string().min(10),
  price: Joi.number().min(1),
  type: Joi.string().valid('house', 'apartment', 'condo', 'villa', 'land'),
  propertyType: Joi.string().valid('house', 'apartment', 'condo', 'villa', 'land'),
  status: Joi.string().valid('available', 'sold', 'pending', 'reserved', 'rented'),
  location: Joi.object({
    address: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    zipCode: Joi.string(),
    lat: Joi.number(),
    lng: Joi.number()
  }),
  features: Joi.object({
    bedrooms: Joi.number().min(1),
    bathrooms: Joi.number().min(1),
    area: Joi.number().min(0),
    squareFeet: Joi.number().min(0),
    yearBuilt: Joi.number(),
    amenities: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string()
    )
  }),
  amenities: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  )
};

const createSchema = Joi.object(propertySchema).required();
const updateSchema = Joi.object(propertySchema).min(1);
const statusSchema = Joi.object({ status: propertySchema.status.required() });

// ------------------------
// Public Routes
// ------------------------

router.get('/search', getProperties);
router.get('/featured', getProperties);
router.get('/', getProperties);
router.get('/:id/reviews', getPropertyReviews);
router.get('/:id', getProperty);
router.get('/agent/:agentId', getAgentProperties);

// ------------------------
// Protected Routes
// ------------------------

router.use(protect);

// Property CRUD
router.post(
  '/',
  authorize('admin', 'agent'),
  uploadMiddleware.any(),
  handleUploadError,
  validateRequest(createSchema),
  createProperty
);

router.put(
  '/:id',
  authorize('admin', 'agent'),
  uploadMiddleware.any(),
  handleUploadError,
  validateRequest(updateSchema),
  updateProperty
);

router.delete(
  '/:id',
  authorize('admin', 'agent'),
  deleteProperty
);

// Property Status Update
router.patch(
  '/:id/status',
  authorize('admin', 'agent'),
  validateRequest(statusSchema),
  updatePropertyStatus
);

// Favorites
router.post('/:id/favorite', toggleFavorite);
router.get('/favorites/me', getFavorites);

// Reviews and Reports
router.post('/:id/reviews', addPropertyReview);
router.post('/:id/report', reportProperty);

// Analytics and Tracking
router.get('/:id/analytics', authorize('admin', 'agent'), getPropertyAnalytics);
router.post('/:id/track', trackPropertyView);

// Image Uploads
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
