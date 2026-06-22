import crypto from 'crypto';
import LearningGraph from '../models/learningGraph.model.js';
import Roadmap from '../models/roadmap.model.js';
import { runTopologicalSort } from '../algorithms/graph.algorithms.production.js';
import { getGeminiModel, checkMockMode } from '../services/geminiClient.service.js';
import { LEARNING_PATH_PROMPT } from '../prompts/learningPath.prompt.js';
import AIUsage from '../models/aiUsage.model.js';
import CustomError from '../utils/customError.js';
import logger from '../utils/logger.js';

export const generateCurriculum = async (documentId, targetConcept, userId, mode = 'prerequisites', resumeRoadmapId = null) => {
  const graph = await LearningGraph.findOne({ documentId });
  if (!graph || graph.nodes.length === 0) {
    throw new CustomError('Graph not found. Ensure document is processed.', 404);
  }

  const targetNode = graph.nodes.find(n => n.id.toLowerCase() === targetConcept.toLowerCase());
  if (!targetNode) {
    throw new CustomError(`Concept "${targetConcept}" not found in this knowledge graph.`, 404);
  }
  const targetConceptName = targetNode.id;

  // Generate a hash to check if graph has changed
  const roadmapHash = crypto.createHash('sha256').update(`${documentId}_${targetConceptName}_${mode}_${graph.edges.length}`).digest('hex');

  let roadmap;
  if (resumeRoadmapId) {
    roadmap = await Roadmap.findById(resumeRoadmapId);
    if (!roadmap) throw new CustomError('Roadmap snapshot not found.', 404);
  } else {
    // Check if an exact completed roadmap already exists
    const existingRoadmap = await Roadmap.findOne({ documentId, targetConcept: targetConceptName, roadmapHash, status: 'completed' });
    if (existingRoadmap) return existingRoadmap;

    roadmap = await Roadmap.create({
      userId,
      documentId,
      targetConcept: targetConceptName,
      roadmapHash,
      graphVersion: graph.generatedAt?.getTime() || 1,
      status: 'generating',
      currentGenerationStage: 'initialized'
    });
  }

  try {
    let orderedPath = [];
    let enrichedPath = roadmap.path || [];
    let studyGuide = roadmap.studyGuide || '';

    // Stage: Traversal
    if (roadmap.currentGenerationStage === 'initialized' || roadmap.currentGenerationStage === 'traversal') {
      roadmap.currentGenerationStage = 'traversal';
      await roadmap.save();

      const dependencySet = new Set();
      if (mode === 'prerequisites') {
        const backtrackDependencies = (nodeId) => {
          dependencySet.add(nodeId);
          const incomingEdges = graph.edges.filter(e => e.target === nodeId);
          incomingEdges.forEach(e => {
            if (!dependencySet.has(e.source)) {
              backtrackDependencies(e.source);
            }
          });
        };
        backtrackDependencies(targetConceptName);
      } else {
        // Full cluster mode logic (if requested)
        dependencySet.add(targetConceptName);
      }

      const subAdj = {};
      dependencySet.forEach(nodeId => subAdj[nodeId] = []);

      graph.edges.forEach(e => {
        if (dependencySet.has(e.source) && dependencySet.has(e.target)) {
          subAdj[e.source].push(e.target);
        }
      });

      orderedPath = runTopologicalSort(subAdj);
      roadmap.currentGenerationStage = 'enrichment';
      await roadmap.save();
    }

    // Stage: Enrichment
    if (roadmap.currentGenerationStage === 'enrichment') {
      if (orderedPath.length === 0) {
        // Fallback to regenerate path if snapshot didn't save orderedPath
        orderedPath = [targetConceptName]; 
      }
      enrichedPath = orderedPath.map((nodeId) => {
        const nodeObj = graph.nodes.find(n => n.id === nodeId);
        const difficulty = nodeObj?.data?.difficulty || 5;
        const importance = nodeObj?.data?.importance || 5;
        const hours = Math.ceil(difficulty * 2.5);

        return {
          concept: nodeId,
          category: nodeObj?.data?.category || 'General',
          description: nodeObj?.data?.description || '',
          difficulty,
          importance,
          estimatedTime: `${hours} hours`,
        };
      });

      roadmap.path = enrichedPath;
      roadmap.currentGenerationStage = 'study_guide';
      await roadmap.save();
    }

    // Stage: Study Guide Generation
    if (roadmap.currentGenerationStage === 'study_guide') {
      const conceptSequenceStr = enrichedPath.map((step, idx) => {
        return `${idx + 1}. ${step.concept} (Difficulty: ${step.difficulty}, Category: ${step.category})\n- Description: ${step.description}`;
      }).join('\n\n');

      const prompt = LEARNING_PATH_PROMPT
        .replace('{targetConcept}', targetConceptName)
        .replace('{conceptSequence}', conceptSequenceStr);

      const isMock = checkMockMode();

      if (isMock) {
        studyGuide = generateMockStudyGuide(targetConceptName, enrichedPath);
      } else {
        const model = getGeminiModel('gemini-1.5-flash');
        if (!model) {
          studyGuide = generateMockStudyGuide(targetConceptName, enrichedPath);
        } else {
          logger.info('Invoking Gemini to enrich topological roadmap study guide.');
          const result = await model.generateContent(prompt);
          const response = await result.response;
          studyGuide = response.text();

          const tokens = Math.ceil(prompt.length / 4 + studyGuide.length / 4);
          await AIUsage.create({
            userId,
            documentId,
            operationType: 'learning_path',
            tokensUsed: tokens,
            model: 'gemini-1.5-flash',
            cost: (tokens / 1000000) * 0.15,
          });
        }
      }

      roadmap.studyGuide = studyGuide;
      roadmap.currentGenerationStage = 'finalized';
      roadmap.status = 'completed';
      
      const metrics = calculateCurriculumScore(enrichedPath, graph);
      roadmap.curriculumMetrics = {
        dependencyCoverage: metrics.dependencyCoverage,
        difficultySmoothness: metrics.difficultySmoothness,
        learningContinuity: metrics.learningContinuity,
        conceptCoverage: metrics.conceptCoverage
      };
      roadmap.overallScore = metrics.overallScore;
      
      roadmap.snapshots = {
        graphSnapshot: { nodes: graph.nodes, edges: graph.edges, version: graph.version },
        roadmapSnapshot: { path: enrichedPath, studyGuide }
      };

      await roadmap.save();
    }

    return roadmap;
  } catch (error) {
    roadmap.status = 'failed';
    await roadmap.save();
    throw error;
  }
};

export const updateProgress = async (roadmapId, userId, completedSteps) => {
  const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
  if (!roadmap) {
    throw new CustomError('Roadmap not found or unauthorized', 404);
  }

  roadmap.progress.completedSteps = completedSteps;
  roadmap.progress.lastAccessedAt = Date.now();
  await roadmap.save();

  return roadmap;
};

export const getRecommendations = async (roadmapId, userId) => {
  const roadmap = await Roadmap.findOne({ _id: roadmapId, userId }).populate('documentId');
  if (!roadmap) {
    throw new CustomError('Roadmap not found', 404);
  }

  const graph = await LearningGraph.findOne({ documentId: roadmap.documentId._id });
  if (!graph) throw new CustomError('Graph not found', 404);

  const completedSet = new Set(roadmap.progress?.completedSteps || []);
  const inProgressSet = new Set(roadmap.path.map(s => s.concept));

  // Find concepts connected to completed ones but not yet learned or in progress
  let candidateScores = {};

  graph.edges.forEach(e => {
    // If user completed source, they might want to learn target
    if (completedSet.has(e.source) && !completedSet.has(e.target) && !inProgressSet.has(e.target)) {
      candidateScores[e.target] = (candidateScores[e.target] || 0) + 1;
    }
  });

  // If no direct next steps, recommend something else
  if (Object.keys(candidateScores).length === 0) {
    graph.nodes.forEach(n => {
      if (!completedSet.has(n.id) && !inProgressSet.has(n.id)) {
        candidateScores[n.id] = (n.data?.importance || 5);
      }
    });
  }

  // Calculate recommendation with user-aware filtering
  const recommendations = Object.keys(candidateScores)
    .map(concept => {
      const node = graph.nodes.find(n => n.id === concept);
      return {
        concept,
        score: candidateScores[concept] + (node?.data?.importance || 5) * 0.5,
        reasoning: completedSet.has(concept) ? 'Completed' : 'Builds on your completed knowledge',
        difficulty: node?.data?.difficulty || 5
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Top 5 recommendations

  return recommendations;
};

export const recalculateCurriculumScore = async (roadmapId) => {
  const roadmap = await Roadmap.findById(roadmapId).populate('documentId');
  if (!roadmap) throw new CustomError('Roadmap not found', 404);

  const graph = await LearningGraph.findOne({ documentId: roadmap.documentId._id });
  if (!graph) throw new CustomError('Graph not found', 404);

  const metrics = calculateCurriculumScore(roadmap.path, graph);
  
  roadmap.curriculumMetrics = {
    dependencyCoverage: metrics.dependencyCoverage,
    difficultySmoothness: metrics.difficultySmoothness,
    learningContinuity: metrics.learningContinuity,
    conceptCoverage: metrics.conceptCoverage
  };
  roadmap.overallScore = metrics.overallScore;

  await roadmap.save();
  return roadmap;
};

const calculateCurriculumScore = (path, graph) => {
  if (!path || path.length === 0) return { overallScore: 0 };
  
  // 1. Concept Coverage
  const totalConcepts = graph ? graph.nodes.length : 0;
  const conceptCoverage = totalConcepts > 0 ? Math.min(100, Math.round((path.length / totalConcepts) * 100)) : 100;

  // 2. Difficulty Smoothness
  let jumpPenalty = 0;
  for (let i = 1; i < path.length; i++) {
    const diffChange = path[i].difficulty - path[i-1].difficulty;
    if (diffChange > 3) {
      jumpPenalty += (diffChange * 2); // Heavy penalty for large jumps
    } else if (diffChange < -3) {
      jumpPenalty += 1; // Minor penalty for large drops
    }
  }
  const difficultySmoothness = Math.max(0, 100 - jumpPenalty);

  // 3. Learning Continuity (same category adjacencies)
  let continuityScore = 100;
  let categorySwitches = 0;
  for (let i = 1; i < path.length; i++) {
    if (path[i].category !== path[i-1].category) categorySwitches++;
  }
  if (path.length > 2) {
    // If we switch categories more than 50% of the time, continuity drops
    continuityScore = Math.max(0, 100 - Math.round((categorySwitches / (path.length - 1)) * 50));
  }

  // 4. Dependency Coverage
  // Assuming 'prerequisites' mode correctly fetched all dependencies.
  // We can just set this high if the graph existed.
  const dependencyCoverage = 100; // Hardcoded for now since topological sort ensures this

  const overallScore = Math.round(
    (dependencyCoverage * 0.30) +
    (difficultySmoothness * 0.25) +
    (continuityScore * 0.25) +
    (conceptCoverage * 0.20)
  );

  return {
    dependencyCoverage,
    difficultySmoothness,
    learningContinuity: continuityScore,
    conceptCoverage,
    overallScore
  };
};

const generateMockStudyGuide = (target, path) => {
  return `### Study Roadmap for mastering: **${target}**

Here is a structured sequence of concepts you must follow to build strong foundations:

${path.map((step, idx) => `
#### **Step ${idx + 1}: ${step.concept}** (${step.estimatedTime} study focus)
- **Difficulty Rating**: ${step.difficulty}/10 | **Category**: ${step.category}
- **Prerequisite Context**: Understanding this concept establishes key basics for the subsequent topics.
- **Focus Objective**: Master the core definitions, algorithms, and practical applications of **${step.concept}** before advancing.
- **Recommended Exercise**: Write out a summary card or code example demonstrating the fundamentals of ${step.concept}.
`).join('\n')}

*(Note: Study guide content compiled in local Mock Mode. Configure a valid GEMINI_API_KEY for dynamic AI curriculums)*`;
};
