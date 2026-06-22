import express from 'express';
import { searchConcepts } from '../controllers/search.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // Secure search endpoint

router.get('/', searchConcepts);

export default router;
