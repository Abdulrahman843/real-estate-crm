const User = require('../models/User');
const Activity = require('../models/Activity');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { sendEmail } = require('../utils/email');

// Send welcome email
const sendWelcomeEmail = async (user) => {
    await sendEmail({
      email: user.email,
      subject: 'Welcome to Real Estate CRM',
      message: `Welcome ${user.name}! Thank you for joining Real Estate CRM.`,
      html: `
        <div style="padding: 20px; background-color: #f5f5f5;">
          <h1>Welcome ${user.name}!</h1>
          <p>Thank you for joining Real Estate CRM.</p>
          <p>You can now:</p>
          <ul>
            <li>Browse properties</li>
            <li>Save favorites</li>
            <li>Contact agents</li>
          </ul>
        </div>
      `
    });
  };

// Register new user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'client' // Set default role if not provided
        });

        if (user) {
            try {
                await sendWelcomeEmail(user);
            } catch (emailError) {
                console.error('Welcome email failed:', emailError);
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update profile
// Update profile
const updateProfile = async (req, res) => {
    try {
        const rootFields = ['name', 'email'];
        const profileFields = [
            'phone',
            'address',
            'bio',
            'company',
            'website',
            'socialMedia'
        ];

        const rootUpdates = {};
        const profileUpdates = {};

        Object.entries(req.body).forEach(([key, value]) => {
            if (rootFields.includes(key)) {
                rootUpdates[key] = value;
            } else if (profileFields.includes(key)) {
                profileUpdates[key] = value;
            }
        });

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        Object.assign(user, rootUpdates);
        user.profile = {
            ...user.profile,
            ...profileUpdates
        };

        await user.save();

        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update password
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (!(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Upload avatar
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { avatar: req.file.path },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get activity log
const getActivityLog = async (req, res) => {
    try {
        const activities = await Activity.find({ user: req.user._id })
            .sort('-createdAt')
            .limit(50);
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update notification settings
const updateNotifications = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { notifications: req.body },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Reset password request
const resetPasswordRequest = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

        await user.save();

        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            message: `To reset your password, click here: ${resetUrl}`
        });

        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Get all users (admin only)
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user role (admin only)
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Admin cannot delete themselves' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search and filter users (admin only)
const searchUsers = async (req, res) => {
    try {
        const { name, email, role, startDate, 
            endDate, sort = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;
        const query = {};

        // Build query based on filters
        if (name) query.name = { $regex: name, $options: 'i' };
        if (email) query.email = { $regex: email, $options: 'i' };
        if (role) query.role = role;

        // Add date range filter with timezone handling
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gt = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lt = end;
            }
        }

        // Calculate skip for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build sort object
        const sortObj = {};
        sortObj[sort] = order;

        // Execute query with pagination
        const users = await User.find(query)
            .select('-password')
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit))
            .lean()
            .exec();

        // Get total count for pagination
        const total = await User.countDocuments(query);

        res.json({
            users,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export user data
const exportUserData = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        const activities = await Activity.find({ user: req.user._id }).sort('-createdAt');

        const userData = {
            profile: user,
            activities,
            exportDate: new Date()
        };

        res.json(userData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Setup 2FA
const setupTwoFactor = async (req, res) => {
    try {
        const secret = speakeasy.generateSecret();
        const user = await User.findById(req.user._id);

        user.twoFactorSecret = secret.base32;
        user.twoFactorEnabled = false;
        await user.save();

        const qrCode = await QRCode.toDataURL(secret.otpauth_url);
        res.json({ secret: secret.base32, qrCode });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Enable 2FA
const enableTwoFactor = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user._id);

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token
        });

        if (!verified) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        user.twoFactorEnabled = true;
        await user.save();

        res.json({ message: '2FA enabled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Verify email
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Refresh token
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = generateToken(user._id);
        res.json({ token });
    } catch (error) {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getProfile,
    getUsers,
    updateUserRole,
    deleteUser,
    searchUsers,
    updateProfile,
    updatePassword,
    uploadAvatar,
    getActivityLog,
    updateNotifications,
    resetPasswordRequest,
    resetPassword,
    exportUserData,
    setupTwoFactor,
    enableTwoFactor,
    verifyEmail,
    refreshToken
};