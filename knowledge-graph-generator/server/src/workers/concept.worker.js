import Document from '../models/document.model.js';
import Chunk from '../models/chunk.model.js';
import Concept from '../models/concept.model.js';
import ConceptReference from '../models/conceptReference.model.js';
import { extractConcepts } from '../services/conceptExtractor.service.js';
import { normalizeConceptName } from '../services/conceptNormalizer.service.js';
import { addDocumentJob } from '../services/queue.service.js';
import logger from '../utils/logger.js';

export const processConceptJob = async (data) => {
  const { documentId } = data;
  logger.info(`Concept Worker starting concept extraction for document: ${documentId}`);

  try {
    const document = await Document.findById(documentId);
    if (!document) {
      logger.error(`Document not found: ${documentId}`);
      return;
    }

    document.currentStage = 'concept_extracted';
    document.progress = 60;
    await document.save();

    const chunks = await Chunk.find({ documentId }).sort({ chunkNumber: 1 });
    logger.info(`Found ${chunks.length} chunks to process.`);

    for (const chunk of chunks) {
      logger.info(`Extracting concepts from chunk #${chunk.chunkNumber}/${chunks.length}`);
      
      const rawConcepts = await extractConcepts(
        chunk.content,
        document.userId.toString(),
        documentId
      );

      for (const item of rawConcepts) {
        // Normalize concept name using alias database
        const normalizedName = await normalizeConceptName(item.name, documentId);

        // Look up concept by name (case-insensitive check within this document)
        let concept = await Concept.findOne({
          documentId,
          name: { $regex: new RegExp(`^${normalizedName}$`, 'i') },
        });

        if (concept) {
          // Increment frequency
          concept.frequency += 1;
          // Update details if description was empty/default
          if (concept.description.length < item.description.length) {
            concept.description = item.description;
          }
          await concept.save();
        } else {
          // Create new concept
          concept = await Concept.create({
            documentId,
            name: normalizedName,
            description: item.description,
            category: item.category || 'General',
            difficulty: item.difficulty || 5,
            importance: item.importance || 5,
            frequency: 1,
          });
        }

        // Escape special characters in the concept name and create a robust regex for spacing/newlines
        const escapedConcept = concept.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const words = escapedConcept.split(/\s+/).filter(Boolean);
        const regexPattern = new RegExp(words.join('\\s+'), 'i');
        const match = chunk.content.match(regexPattern);
        
        let sourceSnippet = '';
        if (match) {
          const conceptIndex = match.index;
          const matchLength = match[0].length;
          // Extract a window of text around the matched term
          const start = Math.max(0, conceptIndex - 60);
          const end = Math.min(chunk.content.length, conceptIndex + matchLength + 60);
          sourceSnippet = chunk.content.substring(start, end).trim();
          if (start > 0) sourceSnippet = `...${sourceSnippet}`;
          if (end < chunk.content.length) sourceSnippet = `${sourceSnippet}...`;
        } else {
          // CRITICAL FALLBACK: Default to first 150 characters of chunk.content
          const fallbackEnd = Math.min(chunk.content.length, 150);
          sourceSnippet = chunk.content.substring(0, fallbackEnd).trim();
          if (chunk.content.length > 150) sourceSnippet = `${sourceSnippet}...`;
        }

        // Save reference for explainability with rich page and surrounding context
        await ConceptReference.create({
          conceptId: concept._id,
          chunkId: chunk._id,
          documentId,
          pageNumber: chunk.pageNumber || 1,
          sourceSnippet,
          surroundingContext: chunk.content,
        });
      }
    }

    logger.info(`Completed concept extraction stage for document: ${documentId}`);
    
    // Update progress
    document.progress = 70;
    await document.save();

    // Trigger next relationship extraction step
    await addDocumentJob('extract-relationships', { documentId });
  } catch (error) {
    logger.error(`Concept Worker failed for document ${documentId}: ${error.message}`);
    await Document.findByIdAndUpdate(documentId, {
      status: 'failed',
      currentStage: 'failed',
      errorMessage: error.message,
    });
  }
};
