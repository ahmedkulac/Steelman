import { Router } from 'express';
import userRoutes from './users';
import claimRoutes from './claims';

const router = Router();

// Route modules
router.use('/users', userRoutes);
router.use('/claims', claimRoutes);

// Example route
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
