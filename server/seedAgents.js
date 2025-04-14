// seedAgents.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/realestate_crm').then(() => {
  console.log('MongoDB connected');
  seedAgent();
}).catch(err => console.error('MongoDB connection error:', err));

// Seed function
async function seedAgent() {
  try {
    const existing = await User.findOne({ email: 'agent@example.com' });
    if (existing) {
      console.log('ℹAgent already exists');
      return process.exit();
    }

    const hashedPassword = await bcrypt.hash('secret123', 10);

    const agent = new User({
      name: 'Agent One',
      email: 'agent@example.com',
      password: hashedPassword,
      role: 'agent'
    });

    await agent.save();
    console.log('Agent user created: agent@example.com / secret123');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}
