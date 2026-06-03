// config/db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB Connection
const connectDB = async () => {
  // const uri = mo
  
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      family: 4, // Force IPv4 to avoid ECONNREFUSED on some networks with SRV records
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error: ', err);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
