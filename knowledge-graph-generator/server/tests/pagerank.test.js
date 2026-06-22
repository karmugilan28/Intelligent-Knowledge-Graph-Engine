import { calculatePageRank } from '../src/algorithms/graph.algorithms.production.js';

describe('PageRank Algorithm', () => {
  it('should assign higher rank to nodes with more incoming links', () => {
    const adjList = {
      'A': ['C'],
      'B': ['C'],
      'C': ['D'],
      'D': []
    };

    const ranks = calculatePageRank(adjList);
    
    // C is pointed to by A and B, so it should have a higher rank than A or B.
    expect(ranks['C']).toBeGreaterThan(ranks['A']);
    expect(ranks['C']).toBeGreaterThan(ranks['B']);
    
    // D is pointed to by C (which has high rank), so D should also be relatively high.
    expect(ranks['D']).toBeGreaterThan(ranks['A']);
  });

  it('should converge and return all nodes', () => {
    const adjList = {
      'A': ['B'],
      'B': ['A']
    };

    const ranks = calculatePageRank(adjList);
    expect(ranks['A']).toBeDefined();
    expect(ranks['B']).toBeDefined();
    
    // Symmetric graph should have symmetric ranks
    expect(Math.abs(ranks['A'] - ranks['B'])).toBeLessThan(0.01);
  });
});
