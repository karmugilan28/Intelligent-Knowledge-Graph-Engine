import { runTopologicalSort } from '../src/algorithms/graph.algorithms.production.js';

describe('Kahn Topological Sort', () => {
  it('should return a valid topological ordering for a DAG', () => {
    const adjList = {
      'HTML': ['CSS', 'JavaScript'],
      'CSS': ['React'],
      'JavaScript': ['React', 'Node.js'],
      'React': [],
      'Node.js': []
    };

    const sorted = runTopologicalSort(adjList);
    
    // HTML must come before CSS and JavaScript
    expect(sorted.indexOf('HTML')).toBeLessThan(sorted.indexOf('CSS'));
    expect(sorted.indexOf('HTML')).toBeLessThan(sorted.indexOf('JavaScript'));
    
    // JavaScript must come before React and Node.js
    expect(sorted.indexOf('JavaScript')).toBeLessThan(sorted.indexOf('React'));
    expect(sorted.indexOf('JavaScript')).toBeLessThan(sorted.indexOf('Node.js'));
    
    // CSS must come before React
    expect(sorted.indexOf('CSS')).toBeLessThan(sorted.indexOf('React'));
    
    expect(sorted.length).toBe(5);
  });

  it('should return null or throw if a cycle is detected', () => {
    const adjList = {
      'A': ['B'],
      'B': ['C'],
      'C': ['A']
    };

    const sorted = runTopologicalSort(adjList);
    // Kahn's algorithm returns incomplete sort if cycle exists, 
    // or throws an error. We check if length is mismatched.
    expect(sorted.length).toBeLessThan(3);
  });
});
