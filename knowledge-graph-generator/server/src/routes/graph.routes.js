import express from 'express';
import { 
  getGraph, 
  traverseBFS, 
  traverseDFS, 
  findPathDijkstra, 
  getConceptReferences,
  detectCycle,
  getSCC,
  getGraphStatistics,
  getPageRank,
  getCriticalConcepts,
  getRecommendations,
  runBenchmarks
} from '../controllers/graph.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All graph routes require authentication

// Snapshot & basic fetching
router.get('/:documentId', getGraph);
router.get('/:documentId/references/:conceptName', getConceptReferences);

// Phase 2: DSA Visual Traversal Routes
router.get('/:documentId/bfs', traverseBFS);
router.get('/:documentId/dfs', traverseDFS);
router.get('/:documentId/dijkstra', findPathDijkstra);

// Phase 3: Analytics Routes
router.get('/:documentId/analytics/cycle', detectCycle);
router.get('/:documentId/analytics/scc', getSCC);
router.get('/:documentId/analytics/statistics', getGraphStatistics);
router.get('/:documentId/analytics/pagerank', getPageRank);
router.get('/:documentId/analytics/bottlenecks', getCriticalConcepts);

// Phase 4: Recommendation System
router.post('/:documentId/recommend', getRecommendations);

// Benchmark System
router.post('/:documentId/benchmark', runBenchmarks);

export default router;
