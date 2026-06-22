import CustomError from '../utils/customError.js';
import { sendSuccess } from '../utils/response.js';
import { generateCurriculum } from '../services/curriculum.service.js';

/**
 * @desc    Generate personalized learning roadmap for a target concept
 * @route   POST /api/learning-path
 * @access  Private
 */
export const generateRoadmap = async (req, res, next) => {
  try {
    const { documentId, targetConcept, mode, resumeRoadmapId } = req.body;

    if (!documentId || !targetConcept) {
      return next(new CustomError('Please provide documentId and targetConcept', 400));
    }

    const curriculum = await generateCurriculum(documentId, targetConcept, req.user._id, mode, resumeRoadmapId);

    return sendSuccess(res, 'Roadmap path generated successfully', curriculum);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update progress for a specific roadmap
 * @route   PUT /api/learning-path/:roadmapId/progress
 * @access  Private
 */
export const updateRoadmapProgress = async (req, res, next) => {
  try {
    const { roadmapId } = req.params;
    const { completedSteps } = req.body;

    if (!Array.isArray(completedSteps)) {
      return next(new CustomError('completedSteps must be an array', 400));
    }

    const { updateProgress } = await import('../services/curriculum.service.js');
    const updatedRoadmap = await updateProgress(roadmapId, req.user._id, completedSteps);

    return sendSuccess(res, 'Roadmap progress updated successfully', updatedRoadmap);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get smart recommendations for user based on roadmap progress
 * @route   GET /api/learning-path/:roadmapId/recommend
 * @access  Private
 */
export const getRoadmapRecommendations = async (req, res, next) => {
  try {
    const { roadmapId } = req.params;
    
    const { getRecommendations } = await import('../services/curriculum.service.js');
    const recommendations = await getRecommendations(roadmapId, req.user._id);

    return sendSuccess(res, 'Recommendations retrieved successfully', recommendations);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all roadmaps for a user
 * @route   GET /api/learning-path
 * @access  Private
 */
export const getUserRoadmaps = async (req, res, next) => {
  try {
    const Roadmap = (await import('../models/roadmap.model.js')).default;
    const roadmaps = await Roadmap.find({ userId: req.user._id })
      .populate('documentId', 'title')
      .sort({ generatedAt: -1 });

    return sendSuccess(res, 'Roadmaps retrieved successfully', roadmaps);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a specific roadmap by ID
 * @route   GET /api/learning-path/:id
 * @access  Private
 */
export const getRoadmapById = async (req, res, next) => {
  try {
    const Roadmap = (await import('../models/roadmap.model.js')).default;
    const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('documentId', 'title');

    if (!roadmap) {
      return next(new CustomError('Roadmap not found', 404));
    }

    return sendSuccess(res, 'Roadmap retrieved successfully', roadmap);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a roadmap
 * @route   DELETE /api/learning-path/:id
 * @access  Private
 */
export const deleteRoadmap = async (req, res, next) => {
  try {
    const Roadmap = (await import('../models/roadmap.model.js')).default;
    const roadmap = await Roadmap.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!roadmap) {
      return next(new CustomError('Roadmap not found or already deleted', 404));
    }

    return sendSuccess(res, 'Roadmap deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a public roadmap by ID
 * @route   GET /api/learning-path/share/:id
 * @access  Public
 */
export const getPublicRoadmap = async (req, res, next) => {
  try {
    const Roadmap = (await import('../models/roadmap.model.js')).default;
    const roadmap = await Roadmap.findOne({ _id: req.params.id, isPublic: true })
      .populate('documentId', 'title');

    if (!roadmap) {
      return next(new CustomError('Roadmap not found or is not public', 404));
    }

    return sendSuccess(res, 'Public roadmap retrieved successfully', roadmap);
  } catch (error) {
    next(error);
  }
};

