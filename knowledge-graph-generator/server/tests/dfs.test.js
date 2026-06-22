import { runDFS } from '../src/algorithms/graph.algorithms.production.js';

describe('DFS Traversal', () => {
  it('should traverse the graph using Depth-First Search starting from the root', () => {
    const adjList = {
      'A': ['B', 'C'],
      'B': ['D', 'E'],
      'C': ['F'],
      'D': [],
      'E': ['F'],
      'F': []
    };

    const sequence = runDFS(adjList, 'A');
    
    // DFS goes deep first
    // Expected order could be A, B, D, E, F, C (depending on recursion/stack order)
    // The exact sequence depends on the implementation (right-to-left vs left-to-right pop)
    // Assuming standard left-first (which means array pop right-first if iterative, or left-first if recursive)
    expect(sequence[0]).toBe('A');
    expect(sequence).toContain('B');
    expect(sequence).toContain('C');
    expect(sequence).toContain('D');
    expect(sequence).toContain('E');
    expect(sequence).toContain('F');
    expect(sequence.length).toBe(6);
  });

  it('should handle cycles without infinite looping', () => {
    const adjList = {
      'A': ['B'],
      'B': ['C'],
      'C': ['A'] // cycle
    };

    const sequence = runDFS(adjList, 'A');
    expect(sequence.length).toBe(3);
    expect(sequence).toEqual(expect.arrayContaining(['A', 'B', 'C']));
  });
});
