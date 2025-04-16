const Property = require('../models/Property');
const User = require('../models/User');
const Message = require('../models/Message');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const sharp = require('sharp');
const getStreetViewImage = require('../utils/streetView');

const getProperties = async (req, res) => {
  try {
    const {
      type, status, minPrice, maxPrice, city, country,
      bedrooms, amenities, lat, lng, radius,
      page = 1, limit = 10, sort = 'createdAt', order = 'desc'
    } = req.query;

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (country) query['location.country'] = { $regex: country, $options: 'i' };
    if (bedrooms) query['features.bedrooms'] = parseInt(bedrooms);
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (amenities) query['features.amenities'] = { $in: amenities.split(',') };
    if (lat && lng && radius) {
      query['location.coordinates'] = {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], parseFloat(radius) / 6378.1]
        }
      };
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
    const data = req.body;

    const fullAddress = `${data['location.address'] || ''}, ${data['location.city'] || ''}, ${data['location.state'] || ''}, ${data['location.zipCode'] || ''}, ${data['location.country'] || ''}`;
    const imageUrl = getStreetViewImage(fullAddress);

    const newProperty = new Property({
      title: data.title,
      description: data.description,
      price: parseFloat(data.price),
      type: data.type,
      status: data.status || 'available',
      agent: req.user._id,
      location: {
        address: data['location.address'],
        city: data['location.city'],
        state: data['location.state'],
        zipCode: data['location.zipCode'],
        country: data['location.country'],
        lat: parseFloat(data['location.lat'] || 0),
        lng: parseFloat(data['location.lng'] || 0)
      },
      features: {
        bedrooms: parseInt(data['features.bedrooms']),
        bathrooms: parseInt(data['features.bathrooms']),
        squareFeet: parseInt(data['features.squareFeet']),
        amenities: Array.isArray(data['features.amenities'])
          ? data['features.amenities']
          : typeof data['features.amenities'] === 'string'
          ? data['features.amenities'].split(',')
          : []
      },
      images: [
        {
          url: imageUrl,
          public_id: 'google_street_view',
          thumbnail: imageUrl.replace('800x600', '300x200')
        }
      ]
    });

    const saved = await newProperty.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('[Create Property Error]', error);
    res.status(400).json({ message: error.message });
  }
};

const getAgentProperties = async (req, res) => {
  try {
    const agentId = req.params.agentId;
    const properties = await Property.find({ agent: agentId })
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
    property.updatedAt = new Date();
    await property.save();
    res.json({ message: 'Property status updated', property });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const data = req.body;
    const fullAddress = `${data['location.address'] || ''}, ${data['location.city'] || ''}, ${data['location.state'] || ''}, ${data['location.zipCode'] || ''}, ${data['location.country'] || ''}`;
    const imageUrl = getStreetViewImage(fullAddress);

    property.set({
      title: data.title,
      description: data.description,
      price: parseFloat(data.price),
      type: data.type,
      status: data.status || 'available',
      location: {
        address: data['location.address'],
        city: data['location.city'],
        state: data['location.state'],
        zipCode: data['location.zipCode'],
        country: data['location.country'],
        lat: parseFloat(data['location.lat'] || 0),
        lng: parseFloat(data['location.lng'] || 0),
      },
      features: {
        bedrooms: parseInt(data['features.bedrooms']),
        bathrooms: parseInt(data['features.bathrooms']),
        squareFeet: parseInt(data['features.squareFeet']),
        amenities: Array.isArray(data['features.amenities']) ? data['features.amenities'] : typeof data['features.amenities'] === 'string' ? data['features.amenities'].split(',') : []
      },
      images: [
        {
          url: imageUrl,
          public_id: 'google_street_view',
          thumbnail: imageUrl.replace('800x600', '300x200')
        }
      ],
      updatedAt: new Date()
    });

    await property.save();
    res.json(property);
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
    await property.remove();
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadPropertyImage = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const processedBuffer = await sharp(file.buffer)
      .resize(1200, 800, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({
        folder: 'properties',
        resource_type: 'image'
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
      Readable.from(processedBuffer).pipe(stream);
    });

    const image = {
      url: result.secure_url,
      public_id: result.public_id,
      thumbnail: result.secure_url.replace('/upload/', '/upload/w_300,h_200,c_fill/')
    };

    property.images.push(image);
    await property.save();

    res.json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Image upload failed' });
  }
};

const uploadPropertyGallery = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

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
              resource_type: 'auto'
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
    property.images.push(...uploadedImages);
    await property.save();

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePropertyImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    await cloudinary.uploader.destroy(imageId);
    property.images = property.images.filter(img => img.public_id !== imageId);
    await property.save();

    res.json({ message: 'Image deleted', images: property.images });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Add review ---
const addPropertyReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const review = {
      user: req.user._id,
      rating,
      comment,
      createdAt: new Date()
    };

    property.reviews.push(review);
    await property.save();

    res.status(201).json({ message: 'Review added', review });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- Get property reviews ---
const getPropertyReviews = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('reviews.user', 'name');
    if (!property) return res.status(404).json({ message: 'Property not found' });

    res.json(property.reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Toggle favorite ---
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

// --- Get user favorites ---
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: { path: 'agent', select: 'name email' }
    });

    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Track property views ---
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

// --- Property analytics ---
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

// --- Report property ---
const reportProperty = async (req, res) => {
  try {
    const { reason } = req.body;
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const report = {
      user: req.user._id,
      reason,
      status: 'pending',
      createdAt: new Date()
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
  getAgentProperties,
  updatePropertyStatus,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImage,
  uploadPropertyGallery,
  deletePropertyImage,
  addPropertyReview,
  getPropertyReviews,
  toggleFavorite,
  getFavorites,
  trackPropertyView,
  getPropertyAnalytics,
  reportProperty
};
