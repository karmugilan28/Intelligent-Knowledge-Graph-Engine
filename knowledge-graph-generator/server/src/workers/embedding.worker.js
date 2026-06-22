import Document from '../models/document.model.js';
import Chunk from '../models/chunk.model.js';
import Concept from '../models/concept.model.js';
import { generateEmbedding } from '../services/embedding.service.js';
import { VectorStore } from '../services/vectorStore.service.js';
import logger from '../utils/logger.js';

export const processEmbeddingJob = async (data) => {
  const { documentId } = data;
  logger.info(`Embedding Worker starting embedding calculations for document: ${documentId}`);

  try {
    const document = await Document.findById(documentId);
    if (!document) {
      logger.error(`Document not found: ${documentId}`);
      return;
    }

    document.currentStage = 'embeddings_generated';
    document.progress = 95;
    await document.save();

    const chunks = await Chunk.find({ documentId });
    const concepts = await Concept.find({ documentId });

    // 1. Generate and save chunk embeddings
    logger.info(`Generating embeddings for ${chunks.length} chunks...`);
    for (const chunk of chunks) {
      const vector = await generateEmbedding(
        chunk.content,
        document.userId.toString(),
        documentId
      );
      await VectorStore.addEmbedding(chunk._id, 'chunk', vector);
    }

    // 2. Generate and save concept embeddings (helps with semantic search on concept nodes)
    logger.info(`Generating embeddings for ${concepts.length} concepts...`);
    for (const concept of concepts) {
      // Use concept name + description to create a comprehensive vector representation
      const textToEmbed = `${concept.name}: ${concept.description}`;
      const vector = await generateEmbedding(
        textToEmbed,
        document.userId.toString(),
        documentId
      );
      await VectorStore.addEmbedding(concept._id, 'concept', vector);
    }

    // Pipeline processing is fully completed!
    document.status = 'completed';
    document.currentStage = 'completed';
    document.progress = 100;
    await document.save();

    logger.info(`Embedding worker completed successfully. Document ${documentId} is now marked COMPLETED.`);
  } catch (error) {
    logger.error(`Embedding Worker failed for document ${documentId}: ${error.message}`);
    await Document.findByIdAndUpdate(documentId, {
      status: 'failed',
      currentStage: 'failed',
      errorMessage: error.message,
    });
  }
};
