import { getGeminiModel, checkMockMode } from './geminiClient.service.js';
import { RELATIONSHIP_EXTRACTION_PROMPT } from '../prompts/relationship.prompt.js';
import AIUsage from '../models/aiUsage.model.js';
import logger from '../utils/logger.js';

// Estimate cost for Gemini 1.5 Flash ($0.075 per 1M input, $0.30 per 1M output)
const calculateCost = (inputTokens, outputTokens) => {
  const inputCost = (inputTokens / 1000000) * 0.075;
  const outputCost = (outputTokens / 1000000) * 0.30;
  return inputCost + outputCost;
};

/**
 * Identifies relationships between a list of concepts within a text context.
 * @param {Array<string>} conceptNames - Names of the concepts to analyze.
 * @param {string} text - Supporting text.
 * @param {string} userId - User ID.
 * @param {string} documentId - Document ID.
 * @returns {Promise<Array<{source: string, target: string, relation: string, confidence: number}>>}
 */
export const extractRelationships = async (conceptNames, text, userId, documentId) => {
  if (conceptNames.length < 2) {
    logger.info('Fewer than 2 concepts to correlate. Skipping relationship extraction.');
    return [];
  }

  const isMock = checkMockMode();

  if (isMock) {
    logger.info('Extracting relationships using Mock Extractor.');
    return generateMockRelationships(conceptNames, userId, documentId);
  }

  try {
    const model = getGeminiModel('gemini-1.5-flash');
    if (!model) {
      logger.warn('Gemini model could not be fetched. Swapped to Mock relationship extraction.');
      return generateMockRelationships(conceptNames, userId, documentId);
    }

    const conceptsStr = JSON.stringify(conceptNames);
    const prompt = RELATIONSHIP_EXTRACTION_PROMPT
      .replace('{concepts}', conceptsStr)
      .replace('{text}', text);

    logger.info(`Sending concepts and chunk to Gemini for relationship extraction.`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Clean markdown wrapping
    let jsonText = responseText;
    if (responseText.includes('```')) {
      const match = responseText.match(/```(?:json)?([\s\S]*?)```/);
      if (match && match[1]) {
        jsonText = match[1].trim();
      }
    }

    const relationships = JSON.parse(jsonText.trim());

    // Compute token estimates
    const inputTokenCount = Math.ceil(prompt.length / 4);
    const outputTokenCount = Math.ceil(responseText.length / 4);
    const totalTokens = inputTokenCount + outputTokenCount;
    const cost = calculateCost(inputTokenCount, outputTokenCount);

    // Track AI Usage
    await AIUsage.create({
      userId,
      documentId,
      operationType: 'relationship_extraction',
      tokensUsed: totalTokens,
      model: 'gemini-1.5-flash',
      cost,
    });

    logger.info(`Gemini extracted ${relationships.length} relationships. Cost estimated: $${cost.toFixed(6)}`);
    
    // Normalize casing for matches
    return relationships.map(rel => ({
      source: rel.source,
      target: rel.target,
      relation: rel.relation.toLowerCase(),
      confidence: Number(rel.confidence) || 1.0,
    }));
  } catch (error) {
    logger.error(`Error in relationshipExtractor.service: ${error.message}. Swapping to mock fallback.`);
    return generateMockRelationships(conceptNames, userId, documentId);
  }
};

// Logical pre-coded rule-based relationship builder for Mock Mode
const generateMockRelationships = async (conceptNames, userId, documentId) => {
  const rels = [];
  const rules = [
    { source: 'Linear Algebra', target: 'Machine Learning', relation: 'prerequisite', confidence: 0.95 },
    { source: 'Machine Learning', target: 'Neural Networks', relation: 'prerequisite', confidence: 0.90 },
    { source: 'Neural Networks', target: 'Deep Learning', relation: 'prerequisite', confidence: 0.95 },
    { source: 'Recursion', target: 'Binary Search Trees', relation: 'prerequisite', confidence: 0.80 },
    { source: 'Time Complexity', target: 'Recursion', relation: 'related_to', confidence: 0.75 },
    { source: 'Time Complexity', target: 'Binary Search Trees', relation: 'used_in', confidence: 0.85 },
    { source: 'Web Development', target: 'React.js', relation: 'prerequisite', confidence: 0.95 },
    { source: 'Web Development', target: 'Node.js', relation: 'prerequisite', confidence: 0.90 },
    { source: 'React.js', target: 'Vite', relation: 'used_in', confidence: 0.85 },
    { source: 'Node.js', target: 'Express.js', relation: 'prerequisite', confidence: 0.95 },
    { source: 'Express.js', target: 'MongoDB', relation: 'related_to', confidence: 0.90 },
    { source: 'Node.js', target: 'MongoDB', relation: 'related_to', confidence: 0.85 },
  ];

  // Look for pairings that fit rules
  for (let i = 0; i < conceptNames.length; i++) {
    for (let j = 0; j < conceptNames.length; j++) {
      if (i === j) continue;
      const sName = conceptNames[i];
      const tName = conceptNames[j];
      
      const foundRule = rules.find(
        (r) => r.source.toLowerCase() === sName.toLowerCase() && r.target.toLowerCase() === tName.toLowerCase()
      );
      if (foundRule) {
        rels.push({
          source: sName,
          target: tName,
          relation: foundRule.relation,
          confidence: foundRule.confidence,
        });
      }
    }
  }

  // Create an arbitrary "part_of" relation if no relationships matched to make a connected graph
  if (rels.length === 0 && conceptNames.length >= 2) {
    rels.push({
      source: conceptNames[0],
      target: conceptNames[1],
      relation: 'related_to',
      confidence: 0.50,
    });
  }

  // Log a tiny mock usage
  await AIUsage.create({
    userId,
    documentId,
    operationType: 'relationship_extraction',
    tokensUsed: 100,
    model: 'mock-relationship-extractor',
    cost: 0.00,
  });

  return rels;
};
