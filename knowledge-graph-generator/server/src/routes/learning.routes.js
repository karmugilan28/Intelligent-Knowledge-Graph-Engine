import express from 'express';
import { 
  generateRoadmap, 
  updateRoadmapProgress, 
  getRoadmapRecommendations,
  getUserRoadmaps,
  getRoadmapById,
  deleteRoadmap,
  getPublicRoadmap
} from '../controllers/learning.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public route for sharing (must be before protect)
router.get('/share/:id', getPublicRoadmap);

router.use(protect); // Secure learning path route

router.post('/', generateRoadmap);
router.get('/', getUserRoadmaps);
router.get('/:id', getRoadmapById);
router.delete('/:id', deleteRoadmap);
router.put('/:roadmapId/progress', updateRoadmapProgress);
router.get('/:roadmapId/recommend', getRoadmapRecommendations);

export default router;
