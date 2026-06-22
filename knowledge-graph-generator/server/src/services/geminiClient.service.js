import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger.js';

let genAI = null;
let isMockMode = false;

export const initGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY' || apiKey.trim() === '') {
    logger.warn('GEMINI_API_KEY is not configured or is the default placeholder. Swapped to Gemini MOCK mode.');
    isMockMode = true;
    return;
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    isMockMode = false;
    logger.info('Gemini API client initialized successfully.');
  } catch (error) {
    logger.error(`Error initializing Gemini client: ${error.message}. Defaulting to MOCK mode.`);
    isMockMode = true;
  }
};

export const getGeminiModel = (modelName = 'gemini-1.5-flash') => {
  if (isMockMode || !genAI) {
    return null;
  }
  return genAI.getGenerativeModel({ model: modelName });
};

export const checkMockMode = () => isMockMode;
export const setMockMode = (mode) => {
  isMockMode = mode;
};
