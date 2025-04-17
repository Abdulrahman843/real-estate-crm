const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    minlength: 10
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  features: {
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    squareFeet: { type: Number, required: true, min: 0 },
    yearBuilt: { type: Number },
    parking: { type: Number, min: 0 },
    amenities: [{ type: String }]
  },
  type: {
    type: String,
    enum: ['apartment', 'house', 'condo', 'villa', 'office'],
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'rented', 'pending'],
    default: 'available'
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    url: String,
    public_id: String,
    thumbnail: String,
    label: {
      type: String,
      enum: ['cover', 'gallery'],
      default: 'gallery'
    }
  }],
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  lastViewed: Date,
  viewHistory: [{
    timestamp: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  }],
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
propertySchema.index({ 'location.city': 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ agent: 1 });
propertySchema.index({ featured: 1 });

// Virtual for average rating
propertySchema.virtual('averageRating').get(function () {
  if (!this.reviews.length) return 0;
  const sum = this.reviews.reduce((total, r) => total + r.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10; // rounded to 1 decimal
});

module.exports = mongoose.model('Property', propertySchema);
