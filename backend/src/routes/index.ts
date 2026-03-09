import { Router } from 'express';
import systemsRouter from './systems.js';
import hierarchyRouter from './hierarchy.js';
import dasRouter from './designAlternatives.js';
import ratingsRouter from './ratings.js';
import compatibilityRouter from './compatibility.js';
import solutionsRouter from './solutions.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Systems routes
router.use('/systems', systemsRouter);

// Nested routes under systems
router.use('/systems/:systemId/hierarchy', hierarchyRouter);
router.use('/systems/:systemId/das', dasRouter);
router.use('/systems/:systemId/ratings', ratingsRouter);
router.use('/systems/:systemId/compatibility', compatibilityRouter);
router.use('/systems/:systemId/solutions', solutionsRouter);

export default router;
