import { Router } from 'express';
import { streamChat } from '../controllers/chatController';
import { summarizeSession } from '../controllers/summaryController';

const router = Router();

router.post('/api/chat/stream', streamChat);
router.post('/api/session/summary', summarizeSession);

export default router;
