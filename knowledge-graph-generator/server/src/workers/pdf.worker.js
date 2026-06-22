import Document from '../models/document.model.js';
import DocumentText from '../models/documentText.model.js';
import Chunk from '../models/chunk.model.js';
import { extractTextFromPDF } from '../services/pdf.service.js';
import { splitPagesIntoChunks } from '../services/chunk.service.js';
import { addDocumentJob } from '../services/queue.service.js';
import logger from '../utils/logger.js';

export const processPDFJob = async (data) => {
  const { documentId } = data;
  logger.info(`PDF Worker starting work on document: ${documentId}`);

  try {
    const document = await Document.findById(documentId);
    if (!document) {
      logger.error(`Document not found: ${documentId}`);
      return;
    }

    // Update Stage: text_extracted
    document.status = 'processing';
    document.currentStage = 'text_extracted';
    document.progress = 20;
    await document.save();

    // 1. Extract raw text and pages from PDF
    const { text, pageCount, pages } = await extractTextFromPDF(document.filePath);
    
    // Save raw text in collection
    await DocumentText.findOneAndUpdate(
      { documentId },
      { text, pageCount },
      { upsert: true }
    );

    document.pageCount = pageCount;
    document.currentStage = 'chunked';
    document.progress = 40;
    await document.save();

    // 2. Perform Page-by-Page Chunking
    const chunks = splitPagesIntoChunks(pages);
    
    // Write chunks to DB
    const chunkPromises = chunks.map((c) => {
      return Chunk.create({
        documentId,
        chunkNumber: c.chunkNumber,
        pageNumber: c.pageNumber,
        content: c.content,
        tokenCount: c.tokenCount,
      });
    });

    await Promise.all(chunkPromises);
    logger.info(`Saved ${chunks.length} chunks for document: ${documentId}`);

    // Update progress
    document.progress = 50;
    await document.save();

    // 3. Chain to next extraction job
    await addDocumentJob('extract-concepts', { documentId });
  } catch (error) {
    logger.error(`PDF Worker failed for document ${documentId}: ${error.message}`);
    await Document.findByIdAndUpdate(documentId, {
      status: 'failed',
      currentStage: 'failed',
      errorMessage: error.message,
    });
  }
};
