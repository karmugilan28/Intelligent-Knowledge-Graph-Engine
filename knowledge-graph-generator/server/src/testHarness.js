import { runBFS, runDFS, runDijkstra, runTopologicalSort } from './algorithms/graph.algorithms.js';
import logger from './utils/logger.js';

const runTests = () => {
  logger.info('=== STARTING GRAPH ALGORITHM TESTS ===');

  // 1. Setup mock concepts (Nodes)
  const nodes = [
    { id: 'A', data: { difficulty: 2, importance: 9 } }, // Core Basic
    { id: 'B', data: { difficulty: 4, importance: 8 } }, // Intermediate
    { id: 'C', data: { difficulty: 7, importance: 6 } }, // Advanced
    { id: 'D', data: { difficulty: 5, importance: 7 } }, // Parallel Basic
  ];

  // 2. Setup mock relationships (Edges)
  // Prereqs: A -> B, B -> C, D -> C
  const edges = [
    { source: 'A', target: 'B', relation: 'prerequisite', confidence: 0.95 },
    { source: 'B', target: 'C', relation: 'prerequisite', confidence: 0.90 },
    { source: 'D', target: 'C', relation: 'prerequisite', confidence: 0.80 },
  ];

  // 3. Build directed Adjacency List for BFS/DFS/TopoSort
  const adjacencyList = {
    A: ['B'],
    B: ['C'],
    C: [],
    D: ['C'],
  };

  logger.info('Test 1: BFS Traversal starting at node [A]');
  const bfsResult = runBFS(adjacencyList, 'A');
  logger.info(`BFS Sequence: ${bfsResult.join(' -> ')}`);
  const bfsSuccess = JSON.stringify(bfsResult) === JSON.stringify(['A', 'B', 'C']);
  logger.info(`BFS Status: ${bfsSuccess ? 'PASSED' : 'FAILED'}`);

  logger.info('Test 2: DFS Traversal starting at node [A]');
  const dfsResult = runDFS(adjacencyList, 'A');
  logger.info(`DFS Sequence: ${dfsResult.join(' -> ')}`);
  const dfsSuccess = JSON.stringify(dfsResult) === JSON.stringify(['A', 'B', 'C']);
  logger.info(`DFS Status: ${dfsSuccess ? 'PASSED' : 'FAILED'}`);

  logger.info('Test 3: Topological Sorting');
  const topoResult = runTopologicalSort(adjacencyList);
  logger.info(`Topological Sequence: ${topoResult.join(' -> ')}`);
  // Assert: A comes before B, B comes before C, D comes before C
  const isTopoValid = 
    topoResult.indexOf('A') < topoResult.indexOf('B') &&
    topoResult.indexOf('B') < topoResult.indexOf('C') &&
    topoResult.indexOf('D') < topoResult.indexOf('C');
  logger.info(`Topological Sort Status: ${isTopoValid ? 'PASSED' : 'FAILED'}`);

  logger.info('Test 4: Dijkstra Shortest Weighted Path from [A] to [C]');
  // Node costs calculation: difficulty + (10 - importance)
  // Cost of B: 4 + (10 - 8) = 6
  // Cost of C: 7 + (10 - 6) = 11
  // Total path A -> B -> C cost: 6 + 11 = 17
  const dijkstraResult = runDijkstra(nodes, edges, 'A', 'C');
  logger.info(`Dijkstra Path: ${dijkstraResult.path.join(' -> ')} | Total cost: ${dijkstraResult.totalCost}`);
  const dijkstraSuccess = 
    JSON.stringify(dijkstraResult.path) === JSON.stringify(['A', 'B', 'C']) &&
    dijkstraResult.totalCost === 17;
  logger.info(`Dijkstra Status: ${dijkstraSuccess ? 'PASSED' : 'FAILED'}`);

  logger.info('=== ALL TESTS COMPLETED ===');
};

runTests();
