const mongoose = require('mongoose');
const Property = require('./models/Property');
const User = require('./models/User'); // Needed to fetch real agent
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const seed = async () => {
  try {
    await Property.deleteMany(); // Optional: clear existing properties

    // ✅ Find an agent user
    const agent = await User.findOne({ role: 'agent' });
    if (!agent) throw new Error('❌ No agent found in the database. Please create one first.');

    const sampleProperties = [
      {
        title: 'Luxury Flat in London',
        description: 'A beautiful luxury flat with a city view.',
        price: 650000,
        type: 'apartment',
        status: 'available',
        agent: agent._id, // ✅ Use actual agent
        location: {
          address: '123 Baker Street',
          city: 'London',
          state: 'England',
          zipCode: 'NW1 6XE',
          country: 'United Kingdom',
        },
        features: {
          bedrooms: 2,
          bathrooms: 2,
          squareFeet: 1000
        },
        images: [
          {
            url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            public_id: 'sample_public_id',
            thumbnail: 'https://res.cloudinary.com/demo/image/upload/w_300,h_200,c_fill/sample.jpg'
          }
        ]
      },
      {
        title: 'Countryside Villa in York',
        description: 'Spacious villa surrounded by nature.',
        price: 950000,
        type: 'villa',
        status: 'available',
        agent: agent._id, // ✅ Use same agent or find another if needed
        location: {
          address: '10 Greenfield Lane',
          city: 'York',
          state: 'Yorkshire',
          zipCode: 'YO1 7EX',
          country: 'United Kingdom',
        },
        features: {
          bedrooms: 4,
          bathrooms: 3,
          squareFeet: 2400
        },
        images: [
          {
            url: 'https://res.cloudinary.com/demo/image/upload/v1627835474/sample.jpg',
            public_id: 'sample2_public_id',
            thumbnail: 'https://res.cloudinary.com/demo/image/upload/w_300,h_200,c_fill/v1627835474/sample.jpg'
          }
        ]
      }
    ];

    await Property.insertMany(sampleProperties);
    console.log('✅ Properties seeded successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding properties:', err.message || err);
    process.exit(1);
  }
};

seed();
