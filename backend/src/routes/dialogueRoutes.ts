import { Router } from 'express';
import { createDialogue } from '../controllers/dialogueController';

const router = Router();

router.post('/api/dialogue', createDialogue);

export default router;