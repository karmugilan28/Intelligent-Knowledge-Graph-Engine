import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import connectDB, { isInMemoryDB } from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import initWorkers from './workers/index.js';
import { initGeminiClient, checkMockMode } from './services/geminiClient.service.js';
import { checkRedisStatus } from './services/queue.service.js';

// Import route stubs
import authRoutes from './routes/auth.routes.js';
import documentRoutes from './routes/document.routes.js';
import graphRoutes from './routes/graph.routes.js';
import chatRoutes from './routes/chat.routes.js';
import learningRoutes from './routes/learning.routes.js';
import searchRoutes from './routes/search.routes.js';

// Load env variables
dotenv.config();

// Connect database
connectDB();

// Initialize Gemini Client and background queue workers
initGeminiClient();
initWorkers();

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: '*', // We can restrict this to frontend URL later
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Development request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Limit requests from same API (Rate Limiting)
const limiter = rateLimit({
  max: 200, // Limit each IP to 200 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes.'
});
app.use('/api/', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/learning-path', learningRoutes);
app.use('/api/search', searchRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date() });
});

// Detailed API Diagnostic health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = isInMemoryDB() ? 'memory' : 'connected';
  const queueStatus = checkRedisStatus() ? 'running' : 'memory';
  const aiModeStatus = checkMockMode() ? 'mock' : 'gemini';
  
  res.status(200).json({
    status: 'healthy',
    database: dbStatus,
    queue: queueStatus,
    aiMode: aiModeStatus,
    time: new Date()
  });
});

// Centralized error handling
app.use(errorHandler);

// Port setup
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
