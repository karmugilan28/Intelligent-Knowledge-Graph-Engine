import { findStronglyConnectedComponents } from '../src/algorithms/graph.algorithms.production.js';

describe('Tarjan SCC Algorithm', () => {
  it('should find strongly connected components in a directed graph', () => {
    const adjList = {
      'A': ['B'],
      'B': ['C'],
      'C': ['A', 'D'], // A-B-C form a cycle
      'D': ['E'],
      'E': ['F'],
      'F': ['D'] // D-E-F form a cycle
    };

    const sccs = findStronglyConnectedComponents(adjList);
    
    // Should detect two main SCCs of size 3
    expect(sccs.length).toBe(2);
    
    const sizes = sccs.map(scc => scc.length).sort();
    expect(sizes).toEqual([3, 3]);
    
    // One component should be A, B, C
    const hasABC = sccs.some(scc => scc.includes('A') && scc.includes('B') && scc.includes('C'));
    expect(hasABC).toBe(true);
    
    // Other component should be D, E, F
    const hasDEF = sccs.some(scc => scc.includes('D') && scc.includes('E') && scc.includes('F'));
    expect(hasDEF).toBe(true);
  });

  it('should return individual nodes if there are no cycles', () => {
    const adjList = {
      'A': ['B'],
      'B': ['C'],
      'C': []
    };

    const sccs = findStronglyConnectedComponents(adjList);
    // 3 components, each of size 1
    expect(sccs.length).toBe(3);
  });
});
