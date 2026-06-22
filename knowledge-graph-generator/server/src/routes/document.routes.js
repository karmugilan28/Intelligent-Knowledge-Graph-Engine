import express from 'express';
import {
   uploadDocument,
   getDocuments,
   getDocumentStats,
   getDocumentById,
   deleteDocument,
} from '../controllers/document.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

router.use(protect); // Secure all document routes

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/stats', getDocumentStats);
router.get('/:id', getDocumentById);
router.delete('/:id', deleteDocument);

export default router;
