import Concept from '../models/concept.model.js';
import { generateEmbedding } from '../services/embedding.service.js';
import { VectorStore } from '../services/vectorStore.service.js';
import CustomError from '../utils/customError.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @desc    Execute search across concepts using exact, fuzzy, or semantic strategies
 * @route   GET /api/search
 * @access  Private
 */
export const searchConcepts = async (req, res, next) => {
  try {
    const { documentId, query, type = 'semantic' } = req.query;

    if (!documentId) {
      return next(new CustomError('Please specify a documentId parameter', 400));
    }
    if (!query || query.trim() === '') {
      return next(new CustomError('Please specify a query string parameter', 400));
    }

    let results = [];

    if (type === 'exact') {
      // Exact string match (case insensitive)
      results = await Concept.find({
        documentId,
        name: { $regex: new RegExp(`^${query.trim()}$`, 'i') },
      });
    } else if (type === 'fuzzy') {
      // Fuzzy match using regex substring containment
      results = await Concept.find({
        documentId,
        $or: [
          { name: { $regex: query.trim(), $options: 'i' } },
          { description: { $regex: query.trim(), $options: 'i' } },
        ],
      });
    } else if (type === 'semantic') {
      // Semantic vector search
      const queryVector = await generateEmbedding(query, req.user._id, documentId);
      const matches = await VectorStore.searchSimilar('concept', queryVector, [documentId], 5);
      results = matches;
    } else {
      return next(new CustomError('Invalid search type. Use "exact", "fuzzy", or "semantic".', 400));
    }

    return sendSuccess(res, `Search of type "${type}" completed successfully`, { results });
  } catch (error) {
    next(error);
  }
};
