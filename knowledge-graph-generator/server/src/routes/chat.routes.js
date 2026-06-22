import express from 'express';
import { sendChatMessage, getChatHistory } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // Secure all chat routes

router.post('/:documentId', sendChatMessage);
router.get('/:documentId', getChatHistory);

export default router;
