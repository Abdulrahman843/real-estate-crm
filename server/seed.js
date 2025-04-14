// server/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Property = require('./models/Property');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const sampleProperties = [
    {
      title: 'Modern Apartment in Lagos',
      description: 'A newly built modern apartment in a secure estate.',
      price: 450000,
      location: {
        address: '15 Banana Island Rd',
        city: 'Ikoyi',
        state: 'Lagos',
        zipCode: '101233',
        coordinates: {
          lat: 6.4549,
          lng: 3.4246
        }
      },
      features: {
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1200,
        yearBuilt: 2022,
        parking: 2,
        amenities: ['Swimming Pool', 'Gym', 'Security']
      },
      type: 'apartment', // ✅ valid enum
      status: 'available',
      agent: new mongoose.Types.ObjectId(), // Temporary dummy ObjectId
      images: [{
        url: 'https://via.placeholder.com/600',
        public_id: 'demo123',
        thumbnail: 'https://via.placeholder.com/150'
      }],
      featured: true
    },
    {
      title: 'Spacious Villa in Abuja',
      description: 'A luxurious villa with beautiful garden space.',
      price: 950000,
      location: {
        address: '10 Asokoro Road',
        city: 'Abuja',
        state: 'FCT',
        zipCode: '900001',
        coordinates: {
          lat: 9.0579,
          lng: 7.4951
        }
      },
      features: {
        bedrooms: 5,
        bathrooms: 4,
        squareFeet: 3000,
        yearBuilt: 2020,
        parking: 3,
        amenities: ['CCTV', 'Backup Generator', 'Smart Home']
      },
      type: 'villa', // ✅ valid enum
      status: 'available',
      agent: new mongoose.Types.ObjectId(), // Temporary dummy ObjectId
      images: [{
        url: 'https://via.placeholder.com/600',
        public_id: 'demo456',
        thumbnail: 'https://via.placeholder.com/150'
      }],
      featured: false
    }
  ]; 

  const runSeed = async () => {
    try {
      await Property.deleteMany();
      await Property.insertMany(sampleProperties);
      console.log('✅ Properties seeded successfully!');
      process.exit();
    } catch (error) {
      console.error('❌ Seed error:', error);
      process.exit(1);
    }
  };
  
  runSeed();


  
