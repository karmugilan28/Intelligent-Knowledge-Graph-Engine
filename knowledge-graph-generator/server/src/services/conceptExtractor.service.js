import { getGeminiModel, checkMockMode } from './geminiClient.service.js';
import { CONCEPT_EXTRACTION_PROMPT } from '../prompts/concept.prompt.js';
import AIUsage from '../models/aiUsage.model.js';
import logger from '../utils/logger.js';

// Estimate cost for Gemini 1.5 Flash ($0.075 per 1M input, $0.30 per 1M output)
const calculateCost = (inputTokens, outputTokens) => {
  const inputCost = (inputTokens / 1000000) * 0.075;
  const outputCost = (outputTokens / 1000000) * 0.30;
  return inputCost + outputCost;
};

/**
 * Extracts educational concepts from a text chunk.
 * @param {string} text - Raw content chunk.
 * @param {string} userId - User identifier.
 * @param {string} documentId - Document identifier.
 * @returns {Promise<Array<{name: string, description: string, category: string, difficulty: number, importance: number}>>}
 */
export const extractConcepts = async (text, userId, documentId) => {
  const isMock = checkMockMode();

  if (isMock) {
    logger.info('Extracting concepts using Mock Extractor.');
    return generateMockConcepts(text, userId, documentId);
  }

  try {
    const model = getGeminiModel('gemini-1.5-flash');
    if (!model) {
      logger.warn('Gemini model could not be fetched. Swapped to Mock concept extraction.');
      return generateMockConcepts(text, userId, documentId);
    }

    const prompt = CONCEPT_EXTRACTION_PROMPT.replace('{text}', text);
    
    logger.info(`Sending chunk to Gemini for concept extraction. Text length: ${text.length}`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Clean JSON response from potential markdown wrapping
    let jsonText = responseText;
    if (responseText.includes('```')) {
      const match = responseText.match(/```(?:json)?([\s\S]*?)```/);
      if (match && match[1]) {
        jsonText = match[1].trim();
      }
    }
    
    const concepts = JSON.parse(jsonText.trim());

    // Compute token estimates
    const inputTokenCount = Math.ceil(prompt.length / 4);
    const outputTokenCount = Math.ceil(responseText.length / 4);
    const totalTokens = inputTokenCount + outputTokenCount;
    const cost = calculateCost(inputTokenCount, outputTokenCount);

    // Track AI Usage
    await AIUsage.create({
      userId,
      documentId,
      operationType: 'concept_extraction',
      tokensUsed: totalTokens,
      model: 'gemini-1.5-flash',
      cost,
    });

    logger.info(`Gemini extracted ${concepts.length} concepts. Cost estimated: $${cost.toFixed(6)}`);
    return concepts;
  } catch (error) {
    logger.error(`Error in conceptExtractor.service: ${error.message}. Swapping to mock fallback.`);
    return generateMockConcepts(text, userId, documentId);
  }
};

// Clever keyword-matching Mock concept extractor
const generateMockConcepts = async (text, userId, documentId) => {
  const lowerText = text.toLowerCase();
  const candidates = [
    { name: 'Linear Algebra', keywords: ['matrix', 'matrices', 'vector', 'eigenvalue', 'eigenvector', 'linear algebra'], description: 'The branch of mathematics concerning linear equations and linear maps.', category: 'Mathematics', difficulty: 4, importance: 9 },
    { name: 'Machine Learning', keywords: ['machine learning', 'supervised', 'unsupervised', 'model', 'dataset', 'training'], description: 'A field of study that gives computers the ability to learn without being explicitly programmed.', category: 'Computer Science', difficulty: 5, importance: 8 },
    { name: 'Neural Networks', keywords: ['neural network', 'neuron', 'layer', 'backpropagation', 'weights', 'bias'], description: 'Computing systems vaguely inspired by the biological neural networks that constitute animal brains.', category: 'Deep Learning', difficulty: 6, importance: 9 },
    { name: 'Deep Learning', keywords: ['deep learning', 'cnn', 'rnn', 'transformer', 'gpu', 'backprop'], description: 'A subset of machine learning based on artificial neural networks with representation learning.', category: 'Deep Learning', difficulty: 7, importance: 8 },
    { name: 'Binary Search Trees', keywords: ['tree', 'binary search', 'node', 'bst', 'root', 'leaf'], description: 'A node-based binary tree data structure where each node has at most two children.', category: 'Data Structures', difficulty: 3, importance: 7 },
    { name: 'Time Complexity', keywords: ['complexity', 'big o', 'o(n)', 'o(log n)', 'algorithm', 'runtime'], description: 'The computational complexity that describes the amount of computer time it takes to run an algorithm.', category: 'Algorithms', difficulty: 3, importance: 8 },
    { name: 'Recursion', keywords: ['recursion', 'recursive', 'base case', 'stack overflow'], description: 'A method of solving a computational problem where the solution depends on solutions to smaller instances of the same problem.', category: 'Algorithms', difficulty: 4, importance: 7 },
    { name: 'Database Indexing', keywords: ['database', 'index', 'b-tree', 'indexing', 'primary key', 'query'], description: 'A data structure technique used to quickly locate and access the data in a database table.', category: 'Database Systems', difficulty: 5, importance: 7 },
    { name: 'Web Development', keywords: ['web development', 'html', 'css', 'dom', 'responsive'], description: 'The tasks associated with developing websites for hosting via intranet or internet.', category: 'Web Development', difficulty: 2, importance: 8 },
    { name: 'React.js', keywords: ['react', 'virtual dom', 'hooks', 'frontend framework'], description: 'A popular open-source JavaScript library for building component-based user interfaces.', category: 'Frontend', difficulty: 4, importance: 9 },
    { name: 'Vite', keywords: ['vite', 'build tool', 'hmr', 'hot module replacement'], description: 'A modern frontend build tool that is extremely fast, serving code via native ES modules.', category: 'Frontend Tools', difficulty: 3, importance: 7 },
    { name: 'Node.js', keywords: ['node.js', 'runtime', 'asynchronous', 'server-side'], description: 'An open-source, cross-platform JavaScript runtime environment for server-side execution.', category: 'Backend', difficulty: 4, importance: 8 },
    { name: 'Express.js', keywords: ['express', 'routing', 'middleware', 'rest api'], description: 'A minimal and flexible Node.js web application framework for building APIs.', category: 'Backend', difficulty: 3, importance: 8 },
    { name: 'MongoDB', keywords: ['mongodb', 'nosql', 'mongoose', 'odm'], description: 'A source-available cross-platform document-oriented database program classified as NoSQL.', category: 'Database Systems', difficulty: 4, importance: 8 },
  ];

  const matched = [];
  candidates.forEach((cand) => {
    const hits = cand.keywords.some((kw) => lowerText.includes(kw));
    if (hits) {
      matched.push({
        name: cand.name,
        description: cand.description,
        category: cand.category,
        difficulty: cand.difficulty,
        importance: cand.importance,
      });
    }
  });

  // Default concepts if none matched
  if (matched.length === 0) {
    matched.push(
      { name: 'Data Visualization', description: 'The graphic representation of data and information.', category: 'Data Science', difficulty: 2, importance: 5 },
      { name: 'Statistical Inference', description: 'The process of using data analysis to deduce properties of an underlying probability distribution.', category: 'Mathematics', difficulty: 5, importance: 7 }
    );
  }

  // Log a tiny mock usage
  await AIUsage.create({
    userId,
    documentId,
    operationType: 'concept_extraction',
    tokensUsed: 150,
    model: 'mock-extractor',
    cost: 0.00,
  });

  return matched;
};
