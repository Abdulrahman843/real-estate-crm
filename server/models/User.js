const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  email: {
    type: String,
    required: true,
    unique: true,  // ✅ Creates unique index
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false  // ✅ Hide by default in queries
  },
  role: {
    type: String,
    enum: ['admin', 'agent', 'client'],
    default: 'client'
  },
  profile: {
    avatar: { type: String, default: '' },
    phone: { type: String },
    address: { type: String },
    bio: { type: String },
    company: { type: String },
    website: { type: String },
    socialMedia: {
      facebook: { type: String },
      twitter: { type: String },
      linkedin: { type: String }
    }
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  settings: {
    emailNotifications: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: true },
    twoFactorAuth: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastLogin: Date,
  emailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// ✅ Indexes (optimized - no duplication)
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

// 🔒 Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔐 Match raw password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🚫 Hide sensitive fields in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
