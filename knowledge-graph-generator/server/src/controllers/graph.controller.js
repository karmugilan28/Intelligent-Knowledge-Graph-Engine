import LearningGraph from '../models/learningGraph.model.js';
import Concept from '../models/concept.model.js';
import ConceptReference from '../models/conceptReference.model.js';
import Relationship from '../models/relationship.model.js';
import { 
  runBFS, 
  runDFS, 
  runDijkstra, 
  detectCycleDFS,
  findStronglyConnectedComponents,
  calculateGraphStatistics,
  calculatePageRank,
  detectBottlenecks,
  recommendNextConcepts,
  calculatePropagatedDifficulty
} from '../algorithms/graph.algorithms.production.js';
import CustomError from '../utils/customError.js';
import { sendSuccess } from '../utils/response.js';

// Helper to build adj list
const buildAdjList = (graph) => {
  const adj = {};
  graph.nodes.forEach(n => { adj[n.id] = []; });
  graph.edges.forEach(e => {
    if (adj[e.source]) adj[e.source].push(e.target);
  });
  return adj;
};

/**
 * @desc    Get visual graph snapshot
 * @route   GET /api/graph/:documentId
 * @access  Private
 */
export const getGraph = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const graph = await LearningGraph.findOne({ documentId });

    if (!graph) {
      return next(new CustomError('Knowledge Graph not found. Ensure document is processed.', 404));
    }

    return sendSuccess(res, 'Graph snapshot retrieved successfully', { graph });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Traverse graph using BFS
 * @route   GET /api/graph/:documentId/bfs
 * @access  Private
 */
export const traverseBFS = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { startNode } = req.query;

    if (!startNode) {
      return next(new CustomError('Please specify a startNode parameter', 400));
    }

    const graph = await LearningGraph.findOne({ documentId });
    if (!graph) {
      return next(new CustomError('Graph snapshot not found.', 404));
    }

    // Build directed adjacency list from visual edges
    const adj = {};
    graph.nodes.forEach(n => { adj[n.id] = []; });
    graph.edges.forEach(e => {
      if (adj[e.source]) adj[e.source].push(e.target);
    });

    const sequence = runBFS(adj, startNode);

    return sendSuccess(res, 'BFS traversal completed', { sequence });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Traverse graph using DFS
 * @route   GET /api/graph/:documentId/dfs
 * @access  Private
 */
export const traverseDFS = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { startNode } = req.query;

    if (!startNode) {
      return next(new CustomError('Please specify a startNode parameter', 400));
    }

    const graph = await LearningGraph.findOne({ documentId });
    if (!graph) {
      return next(new CustomError('Graph snapshot not found.', 404));
    }

    const adj = {};
    graph.nodes.forEach(n => { adj[n.id] = []; });
    graph.edges.forEach(e => {
      if (adj[e.source]) adj[e.source].push(e.target);
    });

    const sequence = runDFS(adj, startNode);

    return sendSuccess(res, 'DFS traversal completed', { sequence });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Find optimal path between two concepts using Dijkstra
 * @route   GET /api/graph/:documentId/dijkstra
 * @access  Private
 */
export const findPathDijkstra = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { startNode, endNode } = req.query;

    if (!startNode || !endNode) {
      return next(new CustomError('Please specify both startNode and endNode parameters', 400));
    }

    const graph = await LearningGraph.findOne({ documentId });
    if (!graph) {
      return next(new CustomError('Graph snapshot not found.', 404));
    }

    const result = runDijkstra(graph.nodes, graph.edges, startNode, endNode);

    return sendSuccess(res, 'Dijkstra optimal path calculated', {
      path: result.path,
      totalCost: result.totalCost,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get concept chunk references
 * @route   GET /api/graph/:documentId/references/:conceptName
 * @access  Private
 */
export const getConceptReferences = async (req, res, next) => {
  try {
    const { documentId, conceptName } = req.params;

    const concept = await Concept.findOne({
      documentId,
      name: { $regex: new RegExp(`^${conceptName.trim()}$`, 'i') },
    });

    if (!concept) {
      return next(new CustomError('Concept not found in document', 404));
    }

    const references = await ConceptReference.find({
      conceptId: concept._id,
      documentId,
    })
      .select('conceptId chunkId documentId pageNumber sourceSnippet surroundingContext')
      .populate({
        path: 'chunkId',
        select: 'chunkNumber content tokenCount',
      });

    return sendSuccess(res, 'Concept chunk references fetched successfully', {
      concept,
      references,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// PHASE 3: ANALYTICS & RECOMMENDATION ENDPOINTS
// ============================================================================

export const detectCycle = async (req, res, next) => {
  try {
    const graph = await LearningGraph.findOne({ documentId: req.params.documentId });
    if (!graph) return next(new CustomError('Graph not found', 404));
    
    const cycleData = detectCycleDFS(buildAdjList(graph));
    return sendSuccess(res, 'Cycle detection complete', cycleData);
  } catch (error) { next(error); }
};

export const getSCC = async (req, res, next) => {
  try {
    const graph = await LearningGraph.findOne({ documentId: req.params.documentId });
    if (!graph) return next(new CustomError('Graph not found', 404));
    
    const scc = findStronglyConnectedComponents(buildAdjList(graph));
    return sendSuccess(res, 'Strongly Connected Components calculated', { scc });
  } catch (error) { next(error); }
};

export const getGraphStatistics = async (req, res, next) => {
  try {
    const graph = await LearningGraph.findOne({ documentId: req.params.documentId });
    if (!graph) return next(new CustomError('Graph not found', 404));
    
    const stats = calculateGraphStatistics(buildAdjList(graph));
    return sendSuccess(res, 'Graph statistics calculated', { statistics: stats });
  } catch (error) { next(error); }
};

export const getPageRank = async (req, res, next) => {
  try {
    const graph = await LearningGraph.findOne({ documentId: req.params.documentId });
    if (!graph) return next(new CustomError('Graph not found', 404));
    
    const ranks = calculatePageRank(buildAdjList(graph));
    return sendSuccess(res, 'PageRank importance calculated', { ranks });
  } catch (error) { next(error); }
};

export const getCriticalConcepts = async (req, res, next) => {
  try {
    const graph = await LearningGraph.findOne({ documentId: req.params.documentId });
    if (!graph) return next(new CustomError('Graph not found', 404));
    
    const bottlenecks = detectBottlenecks(buildAdjList(graph));
    return sendSuccess(res, 'Critical learning bottlenecks detected', { bottlenecks });
  } catch (error) { next(error); }
};

export const getRecommendations = async (req, res, next) => {
  try {
    const { masteredConcepts } = req.body;
    if (!masteredConcepts || !Array.isArray(masteredConcepts)) {
      return next(new CustomError('Provide an array of masteredConcepts in body', 400));
    }

    const graph = await LearningGraph.findOne({ documentId: req.params.documentId });
    if (!graph) return next(new CustomError('Graph not found', 404));
    
    const recommendations = recommendNextConcepts(buildAdjList(graph), masteredConcepts);
    return sendSuccess(res, 'Recommendations generated', { recommendations });
  } catch (error) { next(error); }
};

/**
 * @desc    Run benchmarks on graph algorithms
 * @route   POST /api/graph/:documentId/benchmark
 * @access  Private
 */
export const runBenchmarks = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const graph = await LearningGraph.findOne({ documentId });
    
    if (!graph) return next(new CustomError('Graph not found', 404));

    const { runBFS, runDFS, topologicalSort, calculatePageRank } = await import('../algorithms/graph.algorithms.production.js');

    const startNode = graph.nodes.length > 0 ? graph.nodes[0].id : null;
    
    const results = { bfs: 0, dfs: 0, kahn: 0, pagerank: 0 };
    
    const adjList = buildAdjList(graph);

    if (startNode) {
      const t0 = performance.now();
      runBFS(adjList, startNode);
      const t1 = performance.now();
      results.bfs = Math.round((t1 - t0) * 100) / 100;
      
      const t2 = performance.now();
      runDFS(adjList, startNode);
      const t3 = performance.now();
      results.dfs = Math.round((t3 - t2) * 100) / 100;
    }
    
    const t4 = performance.now();
    topologicalSort(adjList);
    const t5 = performance.now();
    results.kahn = Math.round((t5 - t4) * 100) / 100;
    
    const t6 = performance.now();
    calculatePageRank(adjList);
    const t7 = performance.now();
    results.pagerank = Math.round((t7 - t6) * 100) / 100;

    return sendSuccess(res, 'Benchmarks completed', { benchmarks: results });
  } catch (error) {
    next(error);
  }
};
