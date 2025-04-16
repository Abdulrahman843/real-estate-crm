const Property = require('../models/Property');
const User = require('../models/User');
const Message = require('../models/Message');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const sharp = require('sharp');
const getStreetViewImage = require('../utils/streetView');

const parseJSONBody = (body) => {
  try {
    return typeof body === 'string' ? JSON.parse(body) : body;
  } catch (err) {
    return {};
  }
};

const uploadImageToCloudinary = async (fileBuffer) => {
  const processedBuffer = await sharp(fileBuffer)
    .resize(1200, 800, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: 'properties',
      resource_type: 'image'
    }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    Readable.from(processedBuffer).pipe(stream);
  });
};

const createProperty = async (req, res) => {
  try {
    const data = parseJSONBody(req.body.data);
    const images = req.files || [];

    const uploadedImages = [];

    for (const file of images) {
      const result = await uploadImageToCloudinary(file.buffer);
      uploadedImages.push({
        url: result.secure_url,
        public_id: result.public_id,
        thumbnail: result.secure_url.replace('/upload/', '/upload/w_300,h_200,c_fill/'),
        label: uploadedImages.length === 0 ? 'cover' : 'gallery'
      });
    }

    if (!uploadedImages.length) {
      const fullAddress = `${data.location?.address || ''}, ${data.location?.city || ''}, ${data.location?.state || ''}, ${data.location?.zipCode || ''}, ${data.location?.country || ''}`;
      const streetImage = getStreetViewImage(fullAddress);
      uploadedImages.push({
        url: streetImage,
        public_id: 'street_view_placeholder',
        thumbnail: streetImage.replace('800x600', '300x200'),
        label: 'cover'
      });
    }

    const newProperty = new Property({
      title: data.title,
      description: data.description,
      price: parseFloat(data.price),
      type: data.propertyType || data.type,
      status: data.status || 'available',
      agent: req.user._id,
      location: {
        address: data.location?.address,
        city: data.location?.city,
        state: data.location?.state,
        zipCode: data.location?.zipCode,
        country: data.location?.country,
        coordinates: {
          lat: parseFloat(data.location?.lat || 0),
          lng: parseFloat(data.location?.lng || 0)
        }
      },
      features: {
        bedrooms: parseInt(data.features?.bedrooms || 0),
        bathrooms: parseInt(data.features?.bathrooms || 0),
        squareFeet: parseInt(data.features?.area || data.features?.squareFeet || 0),
        yearBuilt: parseInt(data.features?.yearBuilt || 0),
        amenities: Array.isArray(data.amenities) ? data.amenities : []
      },
      amenities: Array.isArray(data.amenities) ? data.amenities : [],
      images: uploadedImages
    });

    const saved = await newProperty.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('[Create Property Error]', error);
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

    const data = parseJSONBody(req.body.data);
    const images = req.files || [];

    const uploadedImages = [];

    for (const file of images) {
      const result = await uploadImageToCloudinary(file.buffer);
      uploadedImages.push({
        url: result.secure_url,
        public_id: result.public_id,
        thumbnail: result.secure_url.replace('/upload/', '/upload/w_300,h_200,c_fill/'),
        label: uploadedImages.length === 0 ? 'cover' : 'gallery'
      });
    }

    if (!uploadedImages.length && (!property.images || !property.images.length)) {
      const fullAddress = `${data.location?.address || ''}, ${data.location?.city || ''}, ${data.location?.state || ''}, ${data.location?.zipCode || ''}, ${data.location?.country || ''}`;
      const streetImage = getStreetViewImage(fullAddress);
      uploadedImages.push({
        url: streetImage,
        public_id: 'street_view_placeholder',
        thumbnail: streetImage.replace('800x600', '300x200'),
        label: 'cover'
      });
    }

    property.set({
      title: data.title,
      description: data.description,
      price: parseFloat(data.price),
      type: data.propertyType || data.type,
      status: data.status || 'available',
      location: {
        address: data.location?.address,
        city: data.location?.city,
        state: data.location?.state,
        zipCode: data.location?.zipCode,
        country: data.location?.country,
        coordinates: {
          lat: parseFloat(data.location?.lat || 0),
          lng: parseFloat(data.location?.lng || 0)
        }
      },
      features: {
        bedrooms: parseInt(data.features?.bedrooms || 0),
        bathrooms: parseInt(data.features?.bathrooms || 0),
        squareFeet: parseInt(data.features?.area || data.features?.squareFeet || 0),
        yearBuilt: parseInt(data.features?.yearBuilt || 0),
        amenities: Array.isArray(data.amenities) ? data.amenities : []
      },
      amenities: Array.isArray(data.amenities) ? data.amenities : [],
      images: uploadedImages.length > 0 ? uploadedImages : property.images,
      updatedAt: new Date()
    });

    await property.save();
    res.json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

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

    res.json({ properties, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('agent', 'name email');
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAgentProperties = async (req, res) => {
  try {
    const properties = await Property.find({ agent: req.params.agentId })
      .populate('agent', 'name email')
      .sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePropertyStatus = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    property.status = req.body.status;
    property.updatedAt = new Date();
    await property.save();
    res.json({ message: 'Status updated', property });
  } catch (err) {
    res.status(400).json({ message: err.message });
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
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const uploadPropertyImage = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await uploadImageToCloudinary(file.buffer);

    const image = {
      url: result.secure_url,
      public_id: result.public_id,
      thumbnail: result.secure_url.replace('/upload/', '/upload/w_300,h_200,c_fill/')
    };

    property.images.push(image);
    await property.save();
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: 'Image upload failed' });
  }
};

const uploadPropertyGallery = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const uploads = await Promise.all(req.files.map(file => uploadImageToCloudinary(file.buffer)));
    const gallery = uploads.map(result => ({
      url: result.secure_url,
      public_id: result.public_id,
      thumbnail: result.secure_url.replace('/upload/', '/upload/w_300,h_200,c_fill/')
    }));

    property.images.push(...gallery);
    await property.save();
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePropertyImage = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    await cloudinary.uploader.destroy(req.params.imageId);
    property.images = property.images.filter(img => img.public_id !== req.params.imageId);
    await property.save();

    res.json({ message: 'Image deleted', images: property.images });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addPropertyReview = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const review = {
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment,
      createdAt: new Date()
    };

    property.reviews.push(review);
    await property.save();

    res.status(201).json({ message: 'Review added', review });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getPropertyReviews = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('reviews.user', 'name');
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property.reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const index = user.favorites.indexOf(req.params.id);

    if (index === -1) user.favorites.push(req.params.id);
    else user.favorites.splice(index, 1);

    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: { path: 'agent', select: 'name email' }
    });
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const trackPropertyView = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    property.views = (property.views || 0) + 1;
    property.lastViewed = new Date();
    property.viewHistory = property.viewHistory || [];
    property.viewHistory.push({ timestamp: new Date(), user: req.user?._id || null });

    await property.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const reportProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const report = {
      user: req.user._id,
      reason: req.body.reason,
      status: 'pending',
      createdAt: new Date()
    };

    property.reports.push(report);
    await property.save();

    res.status(201).json({ message: 'Reported successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
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
