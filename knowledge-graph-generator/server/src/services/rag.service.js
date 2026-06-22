import { getGeminiModel, checkMockMode } from './geminiClient.service.js';
import { generateEmbedding } from './embedding.service.js';
import { VectorStore } from './vectorStore.service.js';
import { CHAT_PROMPT } from '../prompts/chat.prompt.js';
import Relationship from '../models/relationship.model.js';
import ChatHistory from '../models/chat.model.js';
import AIUsage from '../models/aiUsage.model.js';
import logger from '../utils/logger.js';

// Estimate cost for Gemini 1.5 Flash ($0.075 per 1M input, $0.30 per 1M output)
const calculateCost = (inputTokens, outputTokens) => {
  const inputCost = (inputTokens / 1000000) * 0.075;
  const outputCost = (outputTokens / 1000000) * 0.30;
  return inputCost + outputCost;
};

/**
 * Executes the graph-aware RAG pipeline to answer user questions.
 * @param {string} question - User question.
 * @param {string} documentId - Target document ID.
 * @param {string} userId - User ID.
 * @returns {Promise<{answer: string, chunks: Array<any>, concepts: Array<any>}>}
 */
export const executeRAGQuery = async (question, documentId, userId) => {
  const isMock = checkMockMode();

  try {
    logger.info(`Starting RAG Q&A query: "${question}"`);

    // 1. Generate Query Vector Embedding
    const queryVector = await generateEmbedding(question, userId, documentId);

    // 2. Vector Semantic Search on Chunks
    const matchingChunks = await VectorStore.searchSimilar('chunk', queryVector, [documentId], 3);

    // 3. Vector Semantic Search on Concepts
    const matchingConcepts = await VectorStore.searchSimilar('concept', queryVector, [documentId], 4);

    // 4. Retrieve Graph Neighbors (Prerequisites and dependencies)
    let graphContext = '';
    const conceptNames = matchingConcepts.map(c => c.name);

    if (conceptNames.length > 0) {
      const relationships = await Relationship.find({
        documentId,
        $or: [
          { source: { $in: conceptNames } },
          { target: { $in: conceptNames } },
        ],
      });

      graphContext = relationships.map(rel => {
        if (rel.relation === 'prerequisite') {
          return `- "${rel.source}" is a direct prerequisite to learn "${rel.target}" (confidence: ${rel.confidence})`;
        } else {
          return `- "${rel.source}" is "${rel.relation}" to "${rel.target}" (confidence: ${rel.confidence})`;
        }
      }).join('\n');
    }

    if (!graphContext) {
      graphContext = 'No direct prerequisite relationships identified in the graph for the matching concepts.';
    }

    // 5. Assemble Context Strings
    const docContextStr = matchingChunks.map((chunk, idx) => {
      return `[Chunk #${chunk.chunkNumber}] ${chunk.content}`;
    }).join('\n\n');

    // 6. Compile Chat Prompt
    const prompt = CHAT_PROMPT
      .replace('{documentContext}', docContextStr)
      .replace('{graphContext}', graphContext)
      .replace('{question}', question);

    let answer = '';
    let tokensUsed = 0;
    let cost = 0;

    // 7. Invoke LLM or Fallback to Mock
    if (isMock) {
      logger.info('Generating Mock QA answer.');
      answer = generateMockAnswer(question, matchingConcepts, matchingChunks);
      tokensUsed = 200;
      cost = 0.00;
    } else {
      const model = getGeminiModel('gemini-1.5-flash');
      if (!model) {
        logger.warn('Gemini model not initialized. Swapped to Mock answer.');
        answer = generateMockAnswer(question, matchingConcepts, matchingChunks);
      } else {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        answer = response.text();

        // Calculate token estimates
        const inputTokens = Math.ceil(prompt.length / 4);
        const outputTokens = Math.ceil(answer.length / 4);
        tokensUsed = inputTokens + outputTokens;
        cost = calculateCost(inputTokens, outputTokens);
      }
    }

    // 8. Track usage
    await AIUsage.create({
      userId,
      documentId,
      operationType: 'chat_qa',
      tokensUsed,
      model: isMock ? 'mock-qa' : 'gemini-1.5-flash',
      cost,
    });

    // 9. Store Chat in History
    let chat = await ChatHistory.findOne({ userId, documentId });
    if (!chat) {
      chat = new ChatHistory({ userId, documentId, messages: [] });
    }
    chat.messages.push({ role: 'user', content: question });
    chat.messages.push({ role: 'assistant', content: answer });
    await chat.save();

    logger.info(`RAG Answer generated successfully. User tokens: ${tokensUsed}`);
    return {
      answer,
      chunks: matchingChunks.map(c => ({ chunkNumber: c.chunkNumber, score: c.similarityScore })),
      concepts: matchingConcepts.map(c => ({ name: c.name, score: c.similarityScore, description: c.description, category: c.category })),
    };
  } catch (error) {
    logger.error(`Error executing RAG query: ${error.message}`);
    throw error;
  }
};

// Simulated Educational RAG QA Generator for Offline development
const generateMockAnswer = (question, concepts, chunks) => {
  const matchingNames = concepts.map(c => c.name).join(', ');
  return `Based on the uploaded document contents, here is an explanation for your question: "${question}".

Key concepts related to your query include: **${matchingNames || 'General Concepts'}**.

**Contextual Details:**
${chunks.map(c => `- ${c.content.slice(0, 150)}...`).join('\n')}

**Educational Advice & Prerequisites:**
To understand these principles fully, make sure you have reviewed their foundational prerequisites. For instance, if you are looking at Machine Learning, ensure you have basic concepts of Algorithms and Algebra covered.

*(Note: This response is generated in local Mock Mode. Check server logs to configure a valid GEMINI_API_KEY for live AI queries)*`;
};
