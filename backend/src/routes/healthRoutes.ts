import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    service: 'SpeakMentor AI Backend',
    timestamp: new Date().toISOString(),
  });
});

export default router;