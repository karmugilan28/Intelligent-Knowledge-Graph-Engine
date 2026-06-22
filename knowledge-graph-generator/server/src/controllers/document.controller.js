import fs from 'fs';
import path from 'path';
import Document from '../models/document.model.js';
import Chunk from '../models/chunk.model.js';
import Concept from '../models/concept.model.js';
import ConceptReference from '../models/conceptReference.model.js';
import Relationship from '../models/relationship.model.js';
import LearningGraph from '../models/learningGraph.model.js';
import AIUsage from '../models/aiUsage.model.js';
import CustomError from '../utils/customError.js';
import { sendSuccess } from '../utils/response.js';
import { addDocumentJob } from '../services/queue.service.js';
import logger from '../utils/logger.js';

/**
 * @desc    Upload PDF Document
 * @route   POST /api/documents/upload
 * @access  Private
 */
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new CustomError('No file uploaded. Please upload a PDF file.', 400));
    }

    const { title } = req.body;
    const documentTitle = title || path.parse(req.file.originalname).name;

    // Save document details
    const document = await Document.create({
      userId: req.user._id,
      title: documentTitle,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      status: 'pending',
      currentStage: 'uploaded',
      progress: 10,
    });

    logger.info(`Document uploaded: ${document._id} for user ${req.user._id}. Queueing processing...`);

    // Queue processing pipeline
    await addDocumentJob('process-document', { documentId: document._id.toString() });

    return sendSuccess(res, 'Document uploaded and queued for analysis', { document }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all documents for logged-in user
 * @route   GET /api/documents
 * @access  Private
 */
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ userId: req.user._id }).sort({ uploadDate: -1 });
    return sendSuccess(res, 'Documents retrieved successfully', { documents });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregate workspace statistics
 * @route   GET /api/documents/stats
 * @access  Private
 */
export const getDocumentStats = async (req, res, next) => {
  try {
    const userDocs = await Document.find({ userId: req.user._id });
    const userDocIds = userDocs.map(d => d._id);

    const docCount = userDocs.length;
    const completedDocs = userDocs.filter(d => d.status === 'completed').length;
    const totalPages = userDocs.reduce((sum, d) => sum + (d.pageCount || 0), 0);

    const conceptCount = await Concept.countDocuments({ documentId: { $in: userDocIds } });
    const relationshipCount = await Relationship.countDocuments({ documentId: { $in: userDocIds } });

    // Aggregate AI Usage
    const aiUsageStats = await AIUsage.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalTokens: { $sum: '$tokensUsed' },
          totalCost: { $sum: '$cost' },
        }
      }
    ]);

    const totalTokens = aiUsageStats[0]?.totalTokens || 0;
    const totalCost = aiUsageStats[0]?.totalCost || 0;

    // Category distribution of concepts
    const categoryStats = await Concept.aggregate([
      { $match: { documentId: { $in: userDocIds } } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Top Concepts by frequency across the workspace
    const topConcepts = await Concept.find({ documentId: { $in: userDocIds } })
      .sort({ frequency: -1 })
      .limit(5)
      .select('name frequency category');

    return sendSuccess(res, 'Workspace stats aggregated successfully', {
      statistics: {
        docCount,
        completedDocs,
        totalPages,
        conceptCount,
        relationshipCount,
        totalTokens,
        totalCost,
        categories: categoryStats.map(c => ({ name: c._id || 'General', count: c.count })),
        topConcepts,
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get document details
 * @route   GET /api/documents/:id
 * @access  Private
 */
export const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return next(new CustomError('Document not found or unauthorized access', 404));
    }

    return sendSuccess(res, 'Document details retrieved', { document });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete document and all cascaded knowledge graph objects
 * @route   DELETE /api/documents/:id
 * @access  Private
 */
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return next(new CustomError('Document not found or unauthorized access', 404));
    }

    // Remove file from disk
    if (fs.existsSync(document.filePath)) {
      try {
        fs.unlinkSync(document.filePath);
        logger.info(`Deleted physical file: ${document.filePath}`);
      } catch (err) {
        logger.error(`Error deleting physical file ${document.filePath}: ${err.message}`);
      }
    }

    // Cascade deletions in database
    const documentId = document._id;
    await Chunk.deleteMany({ documentId });
    await Concept.deleteMany({ documentId });
    await ConceptReference.deleteMany({ documentId });
    await Relationship.deleteMany({ documentId });
    await LearningGraph.deleteMany({ documentId });
    
    // Finally delete document record
    await document.deleteOne();

    logger.info(`Cascaded deletion complete for document: ${documentId}`);

    return sendSuccess(res, 'Document and all generated knowledge graph elements deleted successfully');
  } catch (error) {
    next(error);
  }
};
