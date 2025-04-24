const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User'); 

dotenv.config(); // Loads .env variables like MONGO_URI

const resetUserPassword = async (email, newPlainPassword) => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: process.env.MONGODB_POOL_SIZE || 10,
    });

    const hashedPassword = await bcrypt.hash(newPlainPassword, 10);

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      console.log('❌ User not found');
    } else {
      console.log(`✅ Password updated for ${updatedUser.email}`);
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error resetting password:', error.message);
    mongoose.connection.close();
  }
};

//  Update these values
const userEmail = 'client123@example.com';
const newPassword = '456789';

resetUserPassword(userEmail, newPassword);
