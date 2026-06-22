import { registerWorker, initQueue } from '../services/queue.service.js';
import { processPDFJob } from './pdf.worker.js';
import { processConceptJob } from './concept.worker.js';
import { processRelationshipJob } from './relationship.worker.js';
import { processEmbeddingJob } from './embedding.worker.js';
import logger from '../utils/logger.js';

/**
 * Initializes all background worker listeners and registers jobs.
 */
export const initWorkers = async () => {
  logger.info('Initializing background queue systems and worker threads...');
  
  // Connect/check Redis
  await initQueue();

  // Register worker callbacks
  registerWorker('process-document', processPDFJob);
  registerWorker('extract-concepts', processConceptJob);
  registerWorker('extract-relationships', processRelationshipJob);
  registerWorker('generate-embeddings', processEmbeddingJob);

  logger.info('Background workers are listening and ready.');
};
export default initWorkers;
