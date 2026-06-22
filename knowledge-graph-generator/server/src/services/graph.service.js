import Concept from '../models/concept.model.js';
import Relationship from '../models/relationship.model.js';
import LearningGraph from '../models/learningGraph.model.js';
import { findConnectedComponentsDSU as findConnectedComponents } from '../algorithms/graph.algorithms.production.js';
import logger from '../utils/logger.js';

/**
 * Builds a visual snapshot graph from concepts and relationships database records.
 * @param {string} documentId - Target document identifier.
 * @returns {Promise<any>} The saved LearningGraph document.
 */
export const buildAndStoreGraph = async (documentId) => {
  try {
    logger.info(`Building knowledge graph snapshot for document: ${documentId}`);

    const concepts = await Concept.find({ documentId });
    const relationships = await Relationship.find({ documentId });

    if (concepts.length === 0) {
      logger.warn(`No concepts found for document: ${documentId}. Skipping graph construction.`);
      return null;
    }

    // Graph representation helpers
    const nodes = [];
    const edges = [];

    // Position layout configuration (grid by category and difficulty)
    const categoryYTracker = {};
    let categoryIndex = 0;

    concepts.forEach((concept) => {
      const cat = concept.category || 'General';
      if (!(cat in categoryYTracker)) {
        categoryYTracker[cat] = categoryIndex * 220;
        categoryIndex++;
      }

      // Visual alignment: lower difficulty to the left, higher to the right
      const x = (concept.difficulty || 5) * 160 + (Math.random() * 20 - 10);
      const y = categoryYTracker[cat] + (Math.random() * 40 - 20);

      nodes.push({
        id: concept.name,
        type: 'default',
        position: { x, y },
        data: {
          label: concept.name,
          description: concept.description,
          category: concept.category,
          difficulty: concept.difficulty,
          importance: concept.importance,
          frequency: concept.frequency,
        },
        style: {
          background: '#334155', // slate-700
          color: '#F8FAFC',
          border: '1px solid #64748B', // slate-500
          borderRadius: '24px', // pill shape
          padding: '12px 16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          width: 'auto',
          minWidth: 150,
          fontSize: '12px',
          fontWeight: '600',
          textAlign: 'center',
        },
      });
    });

    relationships.forEach((rel) => {
      const isPrereq = rel.relation === 'prerequisite';
      edges.push({
        id: `e-${rel.source}-${rel.target}`,
        source: rel.source,
        target: rel.target,
        type: 'smoothstep',
        label: rel.relation,
        animated: isPrereq,
        style: {
          stroke: '#64748B', // slate-500
          strokeWidth: 1.5,
        },
        labelStyle: {
          fill: '#F8FAFC', // slate-50
          fontSize: 10,
          fontWeight: 600,
          fontFamily: 'Inter, sans-serif',
        },
        labelBgStyle: {
          fill: '#1E293B', // slate-800
          stroke: '#475569', // slate-600
          strokeWidth: 1,
          fillOpacity: 1,
        },
        labelBgPadding: [6, 4],
        labelBgBorderRadius: 12,
        data: {
          relation: rel.relation,
          confidence: rel.confidence,
        },
      });
    });

    // Calculate graph-theoretic statistics
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    
    // Density: E / (V * (V-1))
    const possibleEdges = nodeCount * (nodeCount - 1);
    const density = possibleEdges > 0 ? Number((edgeCount / possibleEdges).toFixed(4)) : 0;

    // Build Adjacency List for Connected Components detection
    const adjacencyList = {};
    concepts.forEach(c => { adjacencyList[c.name] = []; });
    relationships.forEach(r => {
      if (adjacencyList[r.source] && adjacencyList[r.target]) {
        // Undirected graph representation for simple connected components
        adjacencyList[r.source].push(r.target);
        adjacencyList[r.target].push(r.source);
      }
    });

    // Detect clusters/connected components count
    const clustersList = findConnectedComponents(adjacencyList);
    const clusterCount = clustersList.length;

    // Calculate node degrees for averageDegree and isolatedNodes checks
    const degrees = {};
    nodes.forEach(n => { degrees[n.id] = 0; });
    edges.forEach(e => {
      if (degrees[e.source] !== undefined) degrees[e.source]++;
      if (degrees[e.target] !== undefined) degrees[e.target]++;
    });

    let isolatedNodes = 0;
    nodes.forEach(n => {
      if (degrees[n.id] === 0) isolatedNodes++;
    });

    const averageDegree = nodeCount > 0 ? Number(((2 * edgeCount) / nodeCount).toFixed(2)) : 0;

    const statistics = {
      nodeCount,
      edgeCount,
      clusters: clusterCount,
      density,
      averageDegree,
      isolatedNodes,
    };

    // Save or update snapshot
    const learningGraph = await LearningGraph.findOneAndUpdate(
      { documentId },
      {
        nodes,
        edges,
        statistics,
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    logger.info(`Saved LearningGraph snapshot. Nodes: ${nodeCount}, Edges: ${edgeCount}, Clusters: ${clusterCount}`);
    return learningGraph;
  } catch (error) {
    logger.error(`Error building knowledge graph: ${error.message}`);
    throw error;
  }
};

// Color palettes for UI styling categories
const getCategoryColor = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('math') || cat.includes('algebra') || cat.includes('stat')) return '#6366f1'; // Indigo
  if (cat.includes('deep') || cat.includes('network') || cat.includes('neural')) return '#ec4899'; // Pink
  if (cat.includes('machine') || cat.includes('learn')) return '#10b981'; // Green
  if (cat.includes('algorithm') || cat.includes('struct')) return '#f59e0b'; // Orange
  if (cat.includes('code') || cat.includes('software') || cat.includes('program')) return '#3b82f6'; // Blue
  return '#8b5cf6'; // Purple default
};
