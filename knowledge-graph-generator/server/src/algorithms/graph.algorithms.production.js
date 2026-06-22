import logger from '../utils/logger.js';

// ============================================================================
// TASK 1 & 2: GRAPH STATISTICS ENGINE
// ============================================================================
export const calculateGraphStatistics = (adjacencyList) => {
  const nodes = Object.keys(adjacencyList);
  const nodeCount = nodes.length;
  let edgeCount = 0;
  let isolatedNodes = 0;
  let maxDegree = 0;
  let minDegree = Infinity;

  if (nodeCount === 0) return { nodeCount: 0, edgeCount: 0, density: 0 };

  nodes.forEach(node => {
    const degree = (adjacencyList[node] || []).length;
    edgeCount += degree;
    if (degree === 0) isolatedNodes++;
    if (degree > maxDegree) maxDegree = degree;
    if (degree < minDegree) minDegree = degree;
  });

  if (minDegree === Infinity) minDegree = 0;

  // Density = E / (V * (V - 1)) for directed graphs
  const density = nodeCount > 1 ? (edgeCount / (nodeCount * (nodeCount - 1))).toFixed(4) : 0;
  const averageDegree = (edgeCount / nodeCount).toFixed(2);

  return {
    nodeCount,
    edgeCount,
    averageDegree: parseFloat(averageDegree),
    maxDegree,
    minDegree,
    isolatedNodes,
    density: parseFloat(density)
  };
};

// ============================================================================
// TASK 3: BFS OPTIMIZATION - QUEUE POINTER TECHNIQUE
// ============================================================================
export const runBFS = (adjacencyList, startNode) => {
  if (!adjacencyList[startNode]) return [];

  const visited = new Set();
  const result = [];
  const queue = [startNode];
  let front = 0; // O(1) Queue Pointer
  
  visited.add(startNode);

  while (front < queue.length) {
    const node = queue[front++]; // O(1) dequeue
    result.push(node);

    const neighbors = adjacencyList[node] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor); // O(1) enqueue
      }
    }
  }

  return result;
};

// ============================================================================
// TASK 4: DFS OPTIMIZATIONS (DUAL IMPLEMENTATION)
// ============================================================================

/**
 * Iterative DFS - Production implementation preventing Maximum Call Stack Size Exceeded
 */
export const runDFSIterative = (adjacencyList, startNode) => {
  if (!adjacencyList[startNode]) return [];

  const visited = new Set();
  const result = [];
  const stack = [startNode]; // Explicit Stack

  while (stack.length > 0) {
    const node = stack.pop(); // O(1) pop
    
    if (!visited.has(node)) {
      visited.add(node);
      result.push(node);

      // Push neighbors in reverse to maintain left-to-right topological traversal
      const neighbors = adjacencyList[node] || [];
      for (let i = neighbors.length - 1; i >= 0; i--) {
        const neighbor = neighbors[i];
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }
  }

  return result;
};

// Defaults to Iterative for production
export const runDFS = runDFSIterative;


// ============================================================================
// TASK 5: DIJKSTRA OPTIMIZATION - MIN BINARY HEAP
// ============================================================================
class MinPriorityQueue {
  constructor() {
    this.heap = [];
  }
  enqueue(node, priority) {
    this.heap.push({ node, priority });
    this.bubbleUp(this.heap.length - 1);
  }
  dequeue() {
    if (this.heap.length === 1) return this.heap.pop();
    if (this.heap.length === 0) return null;
    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.sinkDown(0);
    return min;
  }
  isEmpty() { return this.heap.length === 0; }
  bubbleUp(idx) {
    const element = this.heap[idx];
    while (idx > 0) {
      let parentIdx = Math.floor((idx - 1) / 2);
      let parent = this.heap[parentIdx];
      if (element.priority >= parent.priority) break;
      this.heap[parentIdx] = element;
      this.heap[idx] = parent;
      idx = parentIdx;
    }
  }
  sinkDown(idx) {
    const length = this.heap.length;
    const element = this.heap[idx];
    while (true) {
      let leftChildIdx = 2 * idx + 1;
      let rightChildIdx = 2 * idx + 2;
      let leftChild, rightChild;
      let swap = null;

      if (leftChildIdx < length) {
        leftChild = this.heap[leftChildIdx];
        if (leftChild.priority < element.priority) swap = leftChildIdx;
      }
      if (rightChildIdx < length) {
        rightChild = this.heap[rightChildIdx];
        if ((swap === null && rightChild.priority < element.priority) || 
            (swap !== null && rightChild.priority < leftChild.priority)) {
          swap = rightChildIdx;
        }
      }

      if (swap === null) break;
      this.heap[idx] = this.heap[swap];
      this.heap[swap] = element;
      idx = swap;
    }
  }
}

export const runDijkstra = (nodes, edges, startNode, endNode) => {
  const nodeMetadata = {};
  nodes.forEach(n => {
    nodeMetadata[n.id] = { difficulty: n.data?.difficulty || 5, importance: n.data?.importance || 5 };
  });

  const adj = {};
  nodes.forEach(n => { adj[n.id] = []; });
  
  edges.forEach(e => {
    if (adj[e.source] && adj[e.target]) {
      const targetMeta = nodeMetadata[e.target];
      const cost = Math.max(1, targetMeta.difficulty + (10 - targetMeta.importance));
      adj[e.source].push({ node: e.target, cost });
    }
  });

  const distances = {};
  const previous = {};
  const pq = new MinPriorityQueue();

  nodes.forEach(n => {
    distances[n.id] = Infinity;
    previous[n.id] = null;
  });

  distances[startNode] = 0;
  pq.enqueue(startNode, 0);

  while (!pq.isEmpty()) {
    const current = pq.dequeue();
    const minNode = current.node;
    
    if (current.priority > distances[minNode]) continue;
    if (minNode === endNode) break;

    const neighbors = adj[minNode] || [];
    for (const neighbor of neighbors) {
      const alt = distances[minNode] + neighbor.cost;
      if (alt < distances[neighbor.node]) {
        distances[neighbor.node] = alt;
        previous[neighbor.node] = minNode;
        pq.enqueue(neighbor.node, alt);
      }
    }
  }

  const path = [];
  let curr = endNode;
  if (distances[endNode] !== Infinity || startNode === endNode) {
    while (curr !== null) {
      path.unshift(curr);
      curr = previous[curr];
    }
  }

  return {
    path: path[0] === startNode ? path : [],
    totalCost: distances[endNode] === Infinity ? 0 : distances[endNode],
  };
};

// ============================================================================
// TASK 6: TOPOLOGICAL SORT & EXPLICIT CYCLE DETECTION
// ============================================================================

/**
 * Dedicated Cycle Detection via DFS
 * Useful for validating prerequisite chains (e.g. A -> B -> C -> A)
 */
export const detectCycleDFS = (adjacencyList) => {
  const visited = {}; // 'unvisited', 'visiting', 'visited'
  let cyclePath = null;

  for (const node in adjacencyList) {
    visited[node] = 'unvisited';
  }

  const visit = (node, pathStack) => {
    if (cyclePath) return; // Stop if cycle already found

    if (visited[node] === 'visiting') {
      // Cycle detected, extract the path
      const cycleStartIndex = pathStack.indexOf(node);
      cyclePath = pathStack.slice(cycleStartIndex);
      cyclePath.push(node);
      return;
    }
    if (visited[node] === 'visited') return;

    visited[node] = 'visiting';
    pathStack.push(node);

    const neighbors = adjacencyList[node] || [];
    for (const neighbor of neighbors) {
      visit(neighbor, pathStack);
    }

    visited[node] = 'visited';
    pathStack.pop();
  };

  for (const node in adjacencyList) {
    if (visited[node] === 'unvisited' && !cyclePath) {
      visit(node, []);
    }
  }

  return { hasCycle: !!cyclePath, cyclePath };
};

/**
 * Topological Sort via Kahn's Algorithm (Production Implementation)
 */
export const runTopologicalSortKahn = (adjacencyList) => {
  const inDegree = {};
  for (const node in adjacencyList) inDegree[node] = 0;

  for (const node in adjacencyList) {
    const neighbors = adjacencyList[node] || [];
    for (const neighbor of neighbors) {
      if (inDegree[neighbor] !== undefined) inDegree[neighbor]++;
    }
  }

  const queue = [];
  let front = 0;
  for (const node in inDegree) {
    if (inDegree[node] === 0) queue.push(node);
  }

  const result = [];
  let visitedCount = 0;

  while (front < queue.length) {
    const current = queue[front++];
    result.push(current);
    visitedCount++;

    const neighbors = adjacencyList[current] || [];
    for (const neighbor of neighbors) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  if (visitedCount !== Object.keys(adjacencyList).length) {
    logger.warn('Cycle detected during Kahn topological sorting! Returning partial stable sort.');
  }
  return result;
};

export const runTopologicalSort = runTopologicalSortKahn; // Default to Kahn's

// ============================================================================
// TASK 7: STRONGLY CONNECTED COMPONENTS (TARJAN) & DSU
// ============================================================================

/**
 * Tarjan's Algorithm for Strongly Connected Components (SCC)
 * Identifies isolated tight learning clusters (e.g., A <-> B <-> C)
 */
export const findStronglyConnectedComponents = (adjacencyList) => {
  let index = 0;
  const indices = {};
  const lowlinks = {};
  const onStack = {};
  const stack = [];
  const sccs = [];

  const strongConnect = (v) => {
    indices[v] = index;
    lowlinks[v] = index;
    index++;
    stack.push(v);
    onStack[v] = true;

    const neighbors = adjacencyList[v] || [];
    for (const w of neighbors) {
      if (indices[w] === undefined) {
        strongConnect(w);
        lowlinks[v] = Math.min(lowlinks[v], lowlinks[w]);
      } else if (onStack[w]) {
        lowlinks[v] = Math.min(lowlinks[v], indices[w]);
      }
    }

    if (lowlinks[v] === indices[v]) {
      const scc = [];
      let w;
      do {
        w = stack.pop();
        onStack[w] = false;
        scc.push(w);
      } while (w !== v);
      sccs.push(scc);
    }
  };

  for (const node in adjacencyList) {
    if (indices[node] === undefined) {
      strongConnect(node);
    }
  }

  return sccs;
};

class DSU {
  constructor() { this.parent = {}; this.rank = {}; }
  find(i) {
    if (this.parent[i] === undefined) { this.parent[i] = i; this.rank[i] = 0; }
    if (this.parent[i] === i) return i;
    return this.parent[i] = this.find(this.parent[i]);
  }
  union(i, j) {
    let root_i = this.find(i); let root_j = this.find(j);
    if (root_i !== root_j) {
      if (this.rank[root_i] < this.rank[root_j]) this.parent[root_i] = root_j;
      else if (this.rank[root_i] > this.rank[root_j]) this.parent[root_j] = root_i;
      else { this.parent[root_j] = root_i; this.rank[root_i]++; }
    }
  }
}

export const findConnectedComponentsDSU = (adjacencyList) => {
  const dsu = new DSU();
  for (const node in adjacencyList) dsu.find(node);
  for (const node in adjacencyList) {
    const neighbors = adjacencyList[node] || [];
    for (const neighbor of neighbors) dsu.union(node, neighbor);
  }
  const componentsMap = {};
  for (const node in adjacencyList) {
    const root = dsu.find(node);
    if (!componentsMap[root]) componentsMap[root] = [];
    componentsMap[root].push(node);
  }
  return Object.values(componentsMap);
};

// ============================================================================
// TASK 10: LEARNING ANALYTICS ENGINE
// ============================================================================

/**
 * Calculates PageRank (Concept Importance)
 * High PageRank = Universally required prerequisite
 */
export const calculatePageRank = (adjacencyList, iterations = 20, dampingFactor = 0.85) => {
  const nodes = Object.keys(adjacencyList);
  const n = nodes.length;
  if (n === 0) return {};

  let ranks = {};
  nodes.forEach(node => ranks[node] = 1 / n);

  // For PR, we actually need the reverse adjacency (who points TO this node)
  const incoming = {};
  const outDegree = {};
  nodes.forEach(node => { incoming[node] = []; outDegree[node] = 0; });
  
  nodes.forEach(u => {
    const neighbors = adjacencyList[u] || [];
    outDegree[u] = neighbors.length;
    neighbors.forEach(v => {
      if (incoming[v]) incoming[v].push(u);
    });
  });

  for (let i = 0; i < iterations; i++) {
    const newRanks = {};
    nodes.forEach(node => {
      let rankSum = 0;
      incoming[node].forEach(inNode => {
        rankSum += ranks[inNode] / outDegree[inNode];
      });
      newRanks[node] = ((1 - dampingFactor) / n) + (dampingFactor * rankSum);
    });
    ranks = newRanks;
  }

  // Sort and return object
  const sortedRanks = Object.entries(ranks).sort((a, b) => b[1] - a[1]);
  return Object.fromEntries(sortedRanks);
};

/**
 * Detects Learning Bottlenecks (Nodes with highest Out-Degree)
 * i.e., "You must learn this before you can learn 10 other things"
 */
export const detectBottlenecks = (adjacencyList, topN = 5) => {
  const bottlenecks = Object.keys(adjacencyList).map(node => {
    return { node, outDegree: (adjacencyList[node] || []).length };
  });

  return bottlenecks
    .sort((a, b) => b.outDegree - a.outDegree)
    .slice(0, topN)
    .filter(b => b.outDegree > 0);
};

// ============================================================================
// RECOMMENDATION & DIFFICULTY PROPAGATION
// ============================================================================

/**
 * Recommendation Engine
 * Finds the immediate next logical concepts to learn given a mastered set.
 * Returns neighbors of mastered nodes that are NOT yet mastered.
 */
export const recommendNextConcepts = (adjacencyList, masteredConcepts) => {
  const masteredSet = new Set(masteredConcepts);
  const recommendations = new Set();

  masteredSet.forEach(node => {
    const neighbors = adjacencyList[node] || [];
    neighbors.forEach(neighbor => {
      if (!masteredSet.has(neighbor)) {
        recommendations.add(neighbor);
      }
    });
  });

  return Array.from(recommendations);
};

/**
 * Difficulty Propagation
 * Dynamically scales node difficulty based on dependency depth and centrality.
 * Formula: Base + (InDegree * 0.5)
 */
export const calculatePropagatedDifficulty = (nodes, adjacencyList) => {
  const incomingCounts = {};
  nodes.forEach(n => incomingCounts[n.id] = 0);

  // Calculate InDegree (How many concepts rely on this)
  Object.keys(adjacencyList).forEach(u => {
    (adjacencyList[u] || []).forEach(v => {
      if (incomingCounts[v] !== undefined) incomingCounts[v]++;
    });
  });

  // Calculate PageRank for Centrality weight
  const pageRanks = calculatePageRank(adjacencyList, 10);
  const maxRank = Math.max(...Object.values(pageRanks), 0.0001); // avoid / 0

  return nodes.map(n => {
    const baseDifficulty = n.data?.difficulty || 5;
    const inDegreeScore = (incomingCounts[n.id] || 0) * 0.5;
    
    // Normalize rank to 0-2 bump
    const centralityScore = ((pageRanks[n.id] || 0) / maxRank) * 2; 

    // Cap at 10
    const finalDifficulty = Math.min(10, Math.round((baseDifficulty + inDegreeScore + centralityScore) * 10) / 10);

    return {
      ...n,
      data: {
        ...n.data,
        derivedDifficulty: finalDifficulty,
        baseDifficulty
      }
    };
  });
};
