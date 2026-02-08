/**
 * API Routes Index
 * 
 * Main router that aggregates all API route modules.
 * All routes are prefixed with /api
 */

import { Router } from 'express';
import userRoutes from './users';
import claimRoutes from './claims';
import analyzeRoutes from './analyze';

const router = Router();

// Route modules
router.use('/users', userRoutes); // User-related routes (placeholder for future auth)
router.use('/claims', claimRoutes); // Claim fact-checking routes
router.use('/analyze', analyzeRoutes); // Article analysis routes

/**
 * GET /api
 * API information endpoint
 */
<<<<<<< Updated upstream
router.get('/', (_req, res) => {
=======
router.get('/', (req, res) => {
>>>>>>> Stashed changes
  res.json({
    message: 'Welcome to the Fact Checker API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/api/users',
      claims: '/api/claims',
      analyze: '/api/analyze'
    }
  });
});

export default router;
