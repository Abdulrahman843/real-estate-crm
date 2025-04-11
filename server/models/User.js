const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'agent', 'client'],
        default: 'client'
    },
    profile: {
        avatar: String,
        phone: String,
        address: String,
        bio: String,
        company: String,
        website: String,
        socialMedia: {
            facebook: String,
            twitter: String,
            linkedin: String
        }
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }],
    // notifications: [{
    //     type: String,
    //     message: String,
    //     read: { type: Boolean, default: false },
    //     createdAt: { type: Date, default: Date.now }
    // }],
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

// Add indexes for better query performance
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

module.exports = mongoose.model('User', userSchema);