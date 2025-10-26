// server/config/db.js
const mongoose = require('mongoose');

// MONGODB_URI ត្រូវបានកំណត់នៅក្នុង .env
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected Successfully.');
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;