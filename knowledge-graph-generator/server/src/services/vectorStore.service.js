import Chunk from '../models/chunk.model.js';
import Concept from '../models/concept.model.js';
import logger from '../utils/logger.js';

// Cosine similarity between two vectors
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const magA = Math.sqrt(normA);
  const magB = Math.sqrt(normB);

  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (magA * magB);
};

/**
 * Interface VectorStore.
 * Abstracts vector storage operations.
 */
export const VectorStore = {
  /**
   * Add / Save embedding to a chunk or concept.
   * @param {string} id - Database ObjectId.
   * @param {'chunk'|'concept'} type - Collection target.
   * @param {Array<number>} embedding - Float vector array.
   */
  async addEmbedding(id, type, embedding) {
    try {
      if (type === 'chunk') {
        await Chunk.findByIdAndUpdate(id, { embedding });
      } else if (type === 'concept') {
        await Concept.findByIdAndUpdate(id, { embedding });
      }
      logger.debug(`Stored vector embedding for ${type} [${id}]`);
    } catch (err) {
      logger.error(`VectorStore failed to save embedding: ${err.message}`);
    }
  },

  /**
   * Perform semantic nearest-neighbor search.
   * @param {'chunk'|'concept'} type - Collection target.
   * @param {Array<number>} queryVector - Query vector array.
   * @param {Array<string>} documentIds - List of target documents.
   * @param {number} limit - Max results to return.
   * @returns {Promise<Array<any>>}
   */
  async searchSimilar(type, queryVector, documentIds, limit = 5) {
    try {
      if (!queryVector || queryVector.length === 0) return [];

      logger.info(`VectorStore executing semantic search for ${type} across documents: ${documentIds}`);

      let items = [];
      if (type === 'chunk') {
        items = await Chunk.find({ documentId: { $in: documentIds }, embedding: { $exists: true } });
      } else if (type === 'concept') {
        items = await Concept.find({ documentId: { $in: documentIds }, embedding: { $exists: true } });
      }

      // Calculate similarities in-memory
      const scoredItems = items.map((item) => {
        const similarity = cosineSimilarity(queryVector, item.embedding);
        return {
          item,
          score: similarity,
        };
      });

      // Sort descending and return top matches
      scoredItems.sort((a, b) => b.score - a.score);
      const topMatches = scoredItems.slice(0, limit).map((m) => ({
        ...m.item.toObject(),
        similarityScore: m.score,
      }));

      logger.info(`VectorStore returned ${topMatches.length} matches. Best similarity score: ${topMatches[0]?.similarityScore || 0}`);
      return topMatches;
    } catch (err) {
      logger.error(`VectorStore query error: ${err.message}`);
      return [];
    }
  },

  /**
   * Deletes embeddings for a document (implicitly handled by mongoose cascade, but defined).
   */
  async deleteEmbedding(id, type) {
    try {
      if (type === 'chunk') {
        await Chunk.findByIdAndUpdate(id, { $unset: { embedding: 1 } });
      } else if (type === 'concept') {
        await Concept.findByIdAndUpdate(id, { $unset: { embedding: 1 } });
      }
    } catch (err) {
      logger.error(`VectorStore delete embedding error: ${err.message}`);
    }
  },
};
