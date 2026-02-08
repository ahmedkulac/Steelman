/**
 * API Routes Index
 * 
 * Main router that aggregates all API route modules.
 * All routes are prefixed with /api
 */

import { Router } from 'express';
import userRoutes from './users';
import claimRoutes from './claims';

const router = Router();

// Route modules
router.use('/users', userRoutes); // User-related routes (placeholder for future auth)
router.use('/claims', claimRoutes); // Claim fact-checking routes

/**
 * GET /api
 * API information endpoint
 */
router.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the Fact Checker API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/api/users',
      claims: '/api/claims'
    }
  });
});

export default router;
