import ChatHistory from '../models/chat.model.js';
import { executeRAGQuery } from '../services/rag.service.js';
import CustomError from '../utils/customError.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @desc    Send a question to the RAG pipeline
 * @route   POST /api/chat/:documentId
 * @access  Private
 */
export const sendChatMessage = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { question } = req.body;

    if (!question || question.trim() === '') {
      return next(new CustomError('Please provide a question string', 400));
    }

    const result = await executeRAGQuery(
      question,
      documentId,
      req.user._id
    );

    return sendSuccess(res, 'Answer generated successfully', {
      answer: result.answer,
      chunks: result.chunks,
      concepts: result.concepts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get chat session history for a document
 * @route   GET /api/chat/:documentId
 * @access  Private
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const chat = await ChatHistory.findOne({
      userId: req.user._id,
      documentId,
    });

    const messages = chat ? chat.messages : [];

    return sendSuccess(res, 'Chat history retrieved', { messages });
  } catch (error) {
    next(error);
  }
};
