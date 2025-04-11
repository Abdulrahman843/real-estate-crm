const Property = require('../models/Property');
const User = require('../models/User');
const Message = require('../models/Message');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const sharp = require('sharp');

// Get all properties with filtering and pagination
const getProperties = async (req, res) => {
  try {
    const { type, status, minPrice, maxPrice, city, bedrooms, page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (bedrooms) query['features.bedrooms'] = parseInt(bedrooms);
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sort]: order };

    const properties = await Property.find(query)
      .populate('agent', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Property.countDocuments(query);

    res.json({
      properties,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchProperties = async (req, res) => {
  try {
    const { keyword, priceRange, propertyType, amenities } = req.query;
    const query = {};

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { 'location.address': { $regex: keyword, $options: 'i' } }
      ];
    }

    const properties = await Property.find(query)
      .populate('agent', 'name email')
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ featured: true })
      .populate('agent', 'name email')
      .limit(6);
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('agent', 'name email');
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProperty = async (req, res) => {
  try {
    const property = new Property({ ...req.body, agent: req.user._id, status: req.body.status || 'available' });
    const savedProperty = await property.save();
    res.status(201).json(savedProperty);
  } catch (error) {
    res.status(400).json({ message: 'Error creating property', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedProperty = await Property.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: Date.now() }, { new: true, runValidators: true }).populate('agent', 'name email');
    res.json(updatedProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAgentProperties = async (req, res) => {
  try {
    const properties = await Property.find({ agent: req.params.agentId })
      .populate('agent', 'name email')
      .sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePropertyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    property.status = status;
    property.updatedAt = Date.now();
    await property.save();
    res.json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const uploadPropertyImages = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const uploadPromises = req.files.map(file => {
      return new Promise(async (resolve, reject) => {
        try {
          const processedBuffer = await sharp(file.buffer)
            .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();

          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({
              folder: 'properties',
              resource_type: 'auto',
              transformation: [
                { width: 1200, height: 800, crop: 'limit' },
                { quality: 'auto:good' },
              ],
            }, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            });

            Readable.from(processedBuffer).pipe(stream);
          });

          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            thumbnail: result.secure_url.replace('/upload/', '/upload/w_300,h_200,c_fill/')
          });
        } catch (err) {
          reject(err);
        }
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);
    const images = uploadedImages.map(img => ({
      url: img.url,
      public_id: img.public_id,
      thumbnail: img.thumbnail
    }));

    property.images.push(...images);
    await property.save();

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadPropertyGallery = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (req.files.featured) {
      property.featuredImage = req.files.featured[0].path;
    }

    if (req.files.gallery) {
      const galleryPaths = req.files.gallery.map(file => file.path);
      property.images.push(...galleryPaths);
    }

    await property.save();
    res.json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deletePropertyImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await cloudinary.uploader.destroy(imageId);
    property.images = property.images.filter(img => img.public_id !== imageId);
    await property.save();

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const propertyId = req.params.id;

    const index = user.favorites.indexOf(propertyId);
    if (index === -1) {
      user.favorites.push(propertyId);
    } else {
      user.favorites.splice(index, 1);
    }

    await user.save();
    res.json({ favorites: user.favorites });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({ path: 'favorites', populate: { path: 'agent', select: 'name email' } });
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPropertyAnalytics = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const analytics = {
      views: property.views || 0,
      favorites: await User.countDocuments({ favorites: property._id }),
      inquiries: await Message.countDocuments({ property: property._id }),
      lastViewed: property.lastViewed,
      viewHistory: property.viewHistory || []
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const trackPropertyView = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    property.views = (property.views || 0) + 1;
    property.lastViewed = new Date();
    property.viewHistory = property.viewHistory || [];
    property.viewHistory.push({
      timestamp: new Date(),
      user: req.user ? req.user._id : null
    });

    await property.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addPropertyReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) return res.status(404).json({ message: 'Property not found' });

    const review = {
      user: req.user._id,
      rating,
      comment,
      createdAt: Date.now()
    };

    property.reviews.push(review);
    await property.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPropertyReviews = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('reviews.user', 'name');
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property.reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reportProperty = async (req, res) => {
  try {
    const { reason } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) return res.status(404).json({ message: 'Property not found' });

    const report = {
      user: req.user._id,
      reason,
      status: 'pending',
      createdAt: Date.now()
    };

    property.reports.push(report);
    await property.save();
    res.status(201).json({ message: 'Property reported successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getAgentProperties,
  updatePropertyStatus,
  uploadPropertyImages,
  uploadPropertyGallery,
  deletePropertyImage,
  searchProperties,
  getFeaturedProperties,
  toggleFavorite,
  getFavorites,
  getPropertyAnalytics,
  trackPropertyView,
  addPropertyReview,
  getPropertyReviews,
  reportProperty
};
