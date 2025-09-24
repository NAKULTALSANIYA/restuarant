const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI)
    console.log('MongoDB Connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB };
