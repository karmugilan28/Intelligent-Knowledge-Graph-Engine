import logger from '../utils/logger.js';

/**
 * Splits text into logical chunks of words with overlapping margins.
 * @param {string} text - Raw input text.
 * @param {number} chunkSize - Number of words per chunk (default 600).
 * @param {number} overlap - Overlapping word count (default 100).
 * @returns {Array<{chunkNumber: number, content: string, tokenCount: number}>}
 */
export const splitTextIntoChunks = (text, chunkSize = 600, overlap = 100) => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  logger.info(`Starting text chunking. Text size: ${text.length} characters.`);

  // Clean text and split by whitespace
  const words = text.trim().replace(/\s+/g, ' ').split(' ');
  const totalWords = words.length;

  logger.info(`Total word count in document: ${totalWords}`);

  const chunks = [];
  let chunkNumber = 1;
  let i = 0;

  if (totalWords <= chunkSize) {
    const content = words.join(' ');
    const tokenCount = Math.ceil(words.length * 1.3);
    chunks.push({
      chunkNumber,
      content,
      tokenCount,
    });
  } else {
    while (i < totalWords) {
      const chunkWords = words.slice(i, i + chunkSize);
      if (chunkWords.length === 0) break;

      const content = chunkWords.join(' ');
      const tokenCount = Math.ceil(chunkWords.length * 1.3);

      chunks.push({
        chunkNumber,
        content,
        tokenCount,
      });

      chunkNumber++;
      i += chunkSize - overlap;
    }
  }

  logger.info(`Generated ${chunks.length} chunks from document.`);
  return chunks;
};

/**
 * Splits structured pages into chunks, keeping page references.
 * If page text is within limits, it becomes a single chunk.
 * @param {Array<{pageNumber: number, text: string}>} pages - Extracted pages.
 * @param {number} chunkSize - Word size limit.
 * @param {number} overlap - Overlapping word margin.
 * @returns {Array<{chunkNumber: number, pageNumber: number, content: string, tokenCount: number}>}
 */
export const splitPagesIntoChunks = (pages, chunkSize = 600, overlap = 100) => {
  if (!pages || !Array.isArray(pages)) return [];

  logger.info(`Starting page-by-page chunking for ${pages.length} pages.`);

  const chunks = [];
  let chunkNumber = 1;

  pages.forEach((page) => {
    const text = page.text.trim();
    if (!text || text.length < 50) return; // Skip very small empty/footer blocks

    const words = text.replace(/\s+/g, ' ').split(' ');
    const totalWords = words.length;

    if (totalWords <= chunkSize) {
      const content = words.join(' ');
      const tokenCount = Math.ceil(words.length * 1.3);
      chunks.push({
        chunkNumber,
        pageNumber: page.pageNumber,
        content,
        tokenCount,
      });
      chunkNumber++;
    } else {
      // If a single page is abnormally long, slice it with overlap
      let i = 0;
      while (i < totalWords) {
        const chunkWords = words.slice(i, i + chunkSize);
        if (chunkWords.length === 0) break;

        const content = chunkWords.join(' ');
        const tokenCount = Math.ceil(chunkWords.length * 1.3);

        chunks.push({
          chunkNumber,
          pageNumber: page.pageNumber,
          content,
          tokenCount,
        });

        chunkNumber++;
        i += chunkSize - overlap;
      }
    }
  });

  logger.info(`Generated ${chunks.length} chunks from ${pages.length} pages.`);
  return chunks;
};
