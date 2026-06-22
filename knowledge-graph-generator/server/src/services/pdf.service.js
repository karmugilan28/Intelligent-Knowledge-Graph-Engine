import fs from 'fs';
import pdf from 'pdf-parse';
import logger from '../utils/logger.js';
import CustomError from '../utils/customError.js';

/**
 * Extracts text and metadata from a PDF file.
 * @param {string} filePath - Absolute path to the PDF file.
 * @returns {Promise<{text: string, pageCount: number}>}
 */
export const extractTextFromPDF = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new CustomError(`PDF file not found at path: ${filePath}`, 404);
    }

    const dataBuffer = fs.readFileSync(filePath);
    const pages = [];
    
    // Custom page render function based on pdf-parse defaults
    const render_page = (pageData) => {
      return pageData.getTextContent()
        .then(function(textContent) {
          let lastY, text = '';
          for (let item of textContent.items) {
            if (lastY == item.transform[5] || !lastY) {
              text += item.str;
            } else {
              text += '\n' + item.str;
            }
            lastY = item.transform[5];
          }
          
          const pageNum = pageData.pageIndex !== undefined ? pageData.pageIndex + 1 : pages.length + 1;
          
          pages.push({
            pageNumber: pageNum,
            text: text,
          });
          
          return text;
        });
    };

    logger.info(`Starting PDF text extraction for: ${filePath}`);
    const data = await pdf(dataBuffer, { pagerender: render_page });

    logger.info(`PDF text extraction completed. Pages: ${data.numpages}`);
    return {
      text: data.text,
      pageCount: data.numpages,
      pages,
    };
  } catch (error) {
    logger.error(`Error in pdf.service: ${error.message}`);
    throw new CustomError(`Failed to parse PDF file: ${error.message}`, 500);
  }
};
