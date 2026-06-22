import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import logger from '../utils/logger.js';

let isRedisAvailable = false;
let redisClient = null;
let documentQueue = null;

// Simple in-memory queue fallback implementation
class InMemoryQueue {
  constructor() {
    this.handlers = new Map();
    this.queue = [];
    this.processing = false;
  }

  registerWorker(jobName, handler) {
    this.handlers.set(jobName, handler);
    logger.info(`In-Memory Worker registered for job: ${jobName}`);
  }

  async addJob(jobName, data, retries = 3) {
    this.queue.push({ jobName, data, retries });
    logger.info(`Job [${jobName}] queued in-memory for document: ${data.documentId} (retries remaining: ${retries})`);
    // Start processing if not already processing
    if (!this.processing) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const { jobName, data, retries } = this.queue.shift();
    const handler = this.handlers.get(jobName);

    if (handler) {
      try {
        logger.info(`Starting In-Memory processing of job [${jobName}] for document: ${data.documentId}`);
        await handler(data);
        logger.info(`Completed In-Memory processing of job [${jobName}] for document: ${data.documentId}`);
      } catch (err) {
        logger.error(`Error processing In-Memory job [${jobName}] for document ${data.documentId}: ${err.message}`);
        
        if (retries > 0) {
          logger.warn(`Retrying job [${jobName}] for document ${data.documentId}. Retries remaining: ${retries - 1}`);
          // Put the job back in queue with decremented retries
          this.queue.push({ jobName, data, retries: retries - 1 });
        } else {
          logger.error(`Job [${jobName}] for document ${data.documentId} has failed after all retries.`);
        }
      }
    } else {
      logger.warn(`No handler registered for job [${jobName}]`);
    }

    // Process next job
    setTimeout(() => this.processQueue(), 500);
  }
}

const inMemoryQueue = new InMemoryQueue();

// Initialize BullMQ Queue if Redis is available
export const initQueue = () => {
  return new Promise((resolve) => {
    const host = process.env.REDIS_HOST || '127.0.0.1';
    const port = process.env.REDIS_PORT || 6379;

    try {
      // Attempt Redis connection with short timeout to avoid hanging
      redisClient = new IORedis({
        host,
        port,
        maxRetriesPerRequest: null,
        connectTimeout: 2000, // 2 seconds
      });

      let resolved = false;

      redisClient.on('connect', () => {
        isRedisAvailable = true;
        logger.info('Connected to Redis server successfully. Using BullMQ for queuing.');
        documentQueue = new Queue('DocumentQueue', { connection: redisClient });
        if (!resolved) {
          resolved = true;
          resolve(true);
        }
      });

      redisClient.on('error', (err) => {
        if (!isRedisAvailable) {
          logger.warn(`Redis connection failed (${err.message}). Falling back to In-Memory Queue.`);
          // Disconnect to stop retrying continuously
          redisClient.disconnect();
          if (!resolved) {
            resolved = true;
            resolve(false);
          }
        }
      });
    } catch (error) {
      logger.warn(`Failed to initialize Redis client: ${error.message}. Using In-Memory queue instead.`);
      resolve(false);
    }
  });
};

export const checkRedisStatus = () => isRedisAvailable;

// Queue helper API
export const addDocumentJob = async (jobName, data) => {
  if (isRedisAvailable && documentQueue) {
    try {
      await documentQueue.add(jobName, data, {
        removeOnComplete: true,
        removeOnFail: false,
      });
      logger.info(`BullMQ Job [${jobName}] added successfully for document: ${data.documentId}`);
    } catch (err) {
      logger.error(`Failed to add BullMQ job, falling back to In-Memory Queue: ${err.message}`);
      await inMemoryQueue.addJob(jobName, data);
    }
  } else {
    await inMemoryQueue.addJob(jobName, data);
  }
};

// Worker registration helper
export const registerWorker = (jobName, handler) => {
  // Always register in memory queue in case of fallback
  inMemoryQueue.registerWorker(jobName, handler);

  // If Redis becomes available, initialize a BullMQ Worker
  if (isRedisAvailable && redisClient) {
    new Worker(
      'DocumentQueue',
      async (job) => {
        if (job.name === jobName) {
          logger.info(`BullMQ Worker executing job [${jobName}] for document: ${job.data.documentId}`);
          await handler(job.data);
        }
      },
      { connection: redisClient }
    );
    logger.info(`BullMQ Worker registered for job: ${jobName}`);
  }
};
