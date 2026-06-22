import { getGeminiModel, checkMockMode } from './geminiClient.service.js';
import AIUsage from '../models/aiUsage.model.js';
import logger from '../utils/logger.js';

// Estimate cost for Gemini Embeddings ($0.02 per 1M input tokens)
const calculateEmbeddingCost = (tokens) => {
  return (tokens / 1000000) * 0.02;
};

/**
 * Generates a high-dimensional vector representation of text.
 * @param {string} text - Raw input string.
 * @param {string} userId - User ID.
 * @param {string} documentId - Document ID.
 * @returns {Promise<Array<number>>}
 */
export const generateEmbedding = async (text, userId, documentId) => {
  const isMock = checkMockMode();

  if (isMock) {
    return generateMockVector(text);
  }

  try {
    const model = getGeminiModel('text-embedding-004');
    if (!model) {
      logger.warn('Embedding model not available. Swapping to Mock vector generation.');
      return generateMockVector(text);
    }

    logger.debug(`Generating embedding for text block of size: ${text.length}`);
    const result = await model.embedContent(text);
    const embedding = result.embedding.values;

    // Estimate tokens
    const tokens = Math.ceil(text.length / 4);
    const cost = calculateEmbeddingCost(tokens);

    // Track embedding cost
    await AIUsage.create({
      userId,
      documentId,
      operationType: 'embedding',
      tokensUsed: tokens,
      model: 'text-embedding-004',
      cost,
    });

    return embedding;
  } catch (error) {
    logger.error(`Error generating embedding: ${error.message}. Swapping to mock vector.`);
    return generateMockVector(text);
  }
};

/**
 * Generates a deterministic normalized mock vector for offline testing.
 */
const generateMockVector = (text, dimensions = 768) => {
  const vec = [];
  
  // Calculate a basic string hash to seed the pseudo-random generator
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate deterministic float coordinates
  for (let d = 0; d < dimensions; d++) {
    const val = Math.sin(hash + d) * 10000;
    vec.push(val - Math.floor(val));
  }

  // Normalize the vector (so that cosine similarity corresponds to dot product)
  const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  return vec.map((v) => v / (magnitude || 1));
};
