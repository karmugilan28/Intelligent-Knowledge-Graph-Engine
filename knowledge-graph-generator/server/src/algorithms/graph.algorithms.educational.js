/**
 * EDUCATIONAL ALGORITHMS
 * This file contains alternative implementations of graph algorithms for academic and benchmarking purposes.
 * These are not used in the core production pipeline but are valuable for project reports, vivas, and documentation.
 */

/**
 * Recursive DFS - Educational implementation for benchmarking and documentation
 * Useful for demonstrating recursion tree but risks Maximum Call Stack Size Exceeded on very large graphs.
 */
export const runDFSRecursive = (adjacencyList, startNode) => {
  if (!adjacencyList[startNode]) return [];

  const visited = new Set();
  const result = [];

  const dfsHelper = (node) => {
    visited.add(node);
    result.push(node);

    const neighbors = adjacencyList[node] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfsHelper(neighbor);
      }
    }
  };

  dfsHelper(startNode);
  return result;
};

/**
 * Topological Sort via DFS (Educational/Benchmarking)
 * An alternative to Kahn's algorithm that uses recursion and a stack.
 */
export const runTopologicalSortDFS = (adjacencyList) => {
  const visited = {};
  const stack = [];
  
  for (const node in adjacencyList) visited[node] = 'unvisited';

  const visit = (node) => {
    if (visited[node] === 'visiting') return; // Cycle
    if (visited[node] === 'visited') return;

    visited[node] = 'visiting';
    const neighbors = adjacencyList[node] || [];
    for (const neighbor of neighbors) visit(neighbor);

    visited[node] = 'visited';
    stack.push(node);
  };

  for (const node in adjacencyList) {
    if (visited[node] === 'unvisited') visit(node);
  }
  return stack.reverse();
};
