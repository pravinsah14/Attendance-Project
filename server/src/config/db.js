'use strict';

const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    console.error('\n❌ Could not connect to MongoDB at: ' + process.env.MONGODB_URI);
    console.error('👉 If using local MongoDB: start it with `brew services start mongodb-community` or `docker run -d -p 27017:27017 mongo`');
    console.error('👉 If using MongoDB Atlas: paste your Atlas URI into `server/.env` (MONGODB_URI=mongodb+srv://...)\n');
    process.exit(1);
  }
};

module.exports = connectDB;
