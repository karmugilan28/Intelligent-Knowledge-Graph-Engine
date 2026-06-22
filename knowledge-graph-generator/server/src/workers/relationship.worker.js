import Document from '../models/document.model.js';
import Concept from '../models/concept.model.js';
import Chunk from '../models/chunk.model.js';
import Relationship from '../models/relationship.model.js';
import { extractRelationships } from '../services/relationshipExtractor.service.js';
import { buildAndStoreGraph } from '../services/graph.service.js';
import { addDocumentJob } from '../services/queue.service.js';
import logger from '../utils/logger.js';

export const processRelationshipJob = async (data) => {
  const { documentId } = data;
  logger.info(`Relationship Worker starting relationship extraction for document: ${documentId}`);

  try {
    const document = await Document.findById(documentId);
    if (!document) {
      logger.error(`Document not found: ${documentId}`);
      return;
    }

    document.currentStage = 'relationships_extracted';
    document.progress = 80;
    await document.save();

    const concepts = await Concept.find({ documentId });
    const chunks = await Chunk.find({ documentId }).sort({ chunkNumber: 1 });

    const conceptNames = concepts.map((c) => c.name);

    if (conceptNames.length < 2) {
      logger.warn('Fewer than 2 concepts extracted. Skipping relationship analysis.');
    } else {
      // Analyze relationships in chunks
      for (const chunk of chunks) {
        // Find which concepts are mentioned in this chunk to limit context size
        const lowerChunkContent = chunk.content.toLowerCase();
        const mentionedConcepts = conceptNames.filter((name) =>
          lowerChunkContent.includes(name.toLowerCase())
        );

        if (mentionedConcepts.length >= 2) {
          logger.info(`Extracting relationships from chunk #${chunk.chunkNumber} for concepts: ${mentionedConcepts}`);
          
          const relationships = await extractRelationships(
            mentionedConcepts,
            chunk.content,
            document.userId.toString(),
            documentId
          );

          for (const rel of relationships) {
            // Enforce confidence threshold to reduce noisy edges (keep confidence >= 0.7)
            if (rel.confidence < 0.7) {
              logger.debug(`Skipping low-confidence relationship [${rel.source} -> ${rel.target}] (${rel.confidence})`);
              continue;
            }

            // Find concept objects to verify exact names from DB
            const sourceConcept = concepts.find(c => c.name.toLowerCase() === rel.source.toLowerCase());
            const targetConcept = concepts.find(c => c.name.toLowerCase() === rel.target.toLowerCase());

            if (!sourceConcept || !targetConcept) {
              logger.debug(`Skipping relationship [${rel.source} -> ${rel.target}] as concept names are unverified in DB.`);
              continue;
            }

            // Upsert directed relationship
            await Relationship.findOneAndUpdate(
              {
                documentId,
                source: sourceConcept.name,
                target: targetConcept.name,
              },
              {
                relation: rel.relation,
                confidence: rel.confidence,
              },
              { upsert: true, new: true }
            );
          }
        }
      }
    }

    // 2. Build the visual React Flow Graph snapshot cache
    logger.info('Compiling React Flow graph snapshot...');
    await buildAndStoreGraph(documentId);

    document.currentStage = 'graph_built';
    document.progress = 90;
    await document.save();

    // 3. Chain next embedding step
    await addDocumentJob('generate-embeddings', { documentId });
  } catch (error) {
    logger.error(`Relationship Worker failed for document ${documentId}: ${error.message}`);
    await Document.findByIdAndUpdate(documentId, {
      status: 'failed',
      currentStage: 'failed',
      errorMessage: error.message,
    });
  }
};
