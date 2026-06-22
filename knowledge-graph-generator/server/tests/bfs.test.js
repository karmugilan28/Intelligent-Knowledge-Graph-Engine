import { runBFS } from '../src/algorithms/graph.algorithms.production.js';

describe('BFS Traversal', () => {
  it('should traverse the graph using Breadth-First Search starting from the root', () => {
    const adjList = {
      'A': ['B', 'C'],
      'B': ['D', 'E'],
      'C': ['F'],
      'D': [],
      'E': ['F'],
      'F': []
    };

    const sequence = runBFS(adjList, 'A');
    
    // BFS visits neighbors level by level
    // Expected order: A -> B, C -> D, E, F
    expect(sequence).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
  });

  it('should handle disconnected components correctly', () => {
    const adjList = {
      'A': ['B'],
      'B': [],
      'C': ['D'],
      'D': []
    };

    const sequence = runBFS(adjList, 'A');
    expect(sequence).toEqual(['A', 'B']);
    expect(sequence).not.toContain('C');
  });

  it('should handle cycles without infinite looping', () => {
    const adjList = {
      'A': ['B'],
      'B': ['C'],
      'C': ['A'] // cycle
    };

    const sequence = runBFS(adjList, 'A');
    expect(sequence).toEqual(['A', 'B', 'C']);
  });
});
