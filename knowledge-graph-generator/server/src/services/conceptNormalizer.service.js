import ConceptAlias from '../models/conceptAlias.model.js';
import logger from '../utils/logger.js';

// Predefined global academic acronym mappings
const GLOBAL_ALIASES = {
  ml: 'Machine Learning',
  ai: 'Artificial Intelligence',
  nlp: 'Natural Language Processing',
  cnn: 'Convolutional Neural Networks',
  rnn: 'Recurrent Neural Networks',
  svm: 'Support Vector Machines',
  pca: 'Principal Component Analysis',
  bst: 'Binary Search Trees',
  dfs: 'Depth First Search',
  bfs: 'Breadth First Search',
  oop: 'Object Oriented Programming',
  api: 'Application Programming Interface',
  dsa: 'Data Structures and Algorithms',
};

/**
 * Normalizes an extracted concept name to its canonical version.
 * @param {string} rawName - The extracted concept name.
 * @param {string} documentId - The active document context.
 * @returns {Promise<string>} The canonicalized concept name.
 */
export const normalizeConceptName = async (rawName, documentId) => {
  if (!rawName) return '';
  const trimmed = rawName.trim();
  const lower = trimmed.toLowerCase();

  // 1. Resolve against pre-seeded global acronym dictionary
  if (lower in GLOBAL_ALIASES) {
    logger.debug(`Normalized acronym [${trimmed}] to [${GLOBAL_ALIASES[lower]}]`);
    return GLOBAL_ALIASES[lower];
  }
  
  // If the term is a full name matching a global alias value (e.g. "machine learning")
  for (const key in GLOBAL_ALIASES) {
    if (GLOBAL_ALIASES[key].toLowerCase() === lower) {
      return GLOBAL_ALIASES[key];
    }
  }

  try {
    // 2. Query DB Document alias configurations
    // Check if name is already an alias or canonical name
    let aliasDoc = await ConceptAlias.findOne({
      documentId,
      $or: [
        { canonicalName: { $regex: new RegExp(`^${trimmed}$`, 'i') } },
        { aliases: { $regex: new RegExp(`^${trimmed}$`, 'i') } },
      ],
    });

    if (aliasDoc) {
      logger.debug(`Normalized alias [${trimmed}] to canonical [${aliasDoc.canonicalName}]`);
      return aliasDoc.canonicalName;
    }

    // 3. Fallback: Check if there's a substring overlap to auto-link (e.g., "Machine Learning Basics" -> "Machine Learning")
    const existingAliases = await ConceptAlias.find({ documentId });
    for (const item of existingAliases) {
      const canonical = item.canonicalName.toLowerCase();
      // Auto-link if one is a subphrase of another (and at least 5 characters)
      if (canonical.length > 5 && (canonical.includes(lower) || lower.includes(canonical))) {
        item.aliases.push(trimmed);
        await item.save();
        logger.info(`Auto-linked near-match [${trimmed}] to canonical [${item.canonicalName}]`);
        return item.canonicalName;
      }
    }

    // 4. Create new canonical alias document mapping
    await ConceptAlias.create({
      documentId,
      canonicalName: trimmed,
      aliases: [trimmed],
    });

    return trimmed;
  } catch (err) {
    logger.error(`Error in conceptNormalizer: ${err.message}`);
    return trimmed; // Return raw name on DB failure
  }
};
