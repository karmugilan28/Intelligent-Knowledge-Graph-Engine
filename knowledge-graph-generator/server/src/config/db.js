import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import logger from '../utils/logger.js';

let mongod = null;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment.');
    }
    
    logger.info('Connecting to primary MongoDB Database...');
    // We set a short connection timeout for serverSelectionTimeoutMS (5 seconds) so it falls back quickly if blocked/offline
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.warn(`Primary MongoDB Connection failed: ${error.message}`);
    logger.info('Initializing fallback local In-Memory MongoDB Server (version 4.0.25)...');
    
    try {
      mongod = await MongoMemoryServer.create({
        binary: {
          version: '4.4.29'
        }
      });
      const fallbackUri = mongod.getUri();
      logger.info(`In-Memory MongoDB Server started on: ${fallbackUri}`);
      
      const conn = await mongoose.connect(fallbackUri);
      logger.info(`MongoDB Connected (Fallback in-memory): ${conn.connection.host}`);
    } catch (fallbackError) {
      logger.error(`Fallback MongoDB connection failed: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

// Log disconnection and reconnection events
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected!');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected!');
});

export const isInMemoryDB = () => mongod !== null;
export default connectDB;
