import { Router } from 'express';
import userRoutes from './users';

const router = Router();

// Route modules
router.use('/users', userRoutes);

// Example route
router.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the Hackathon API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/api/users'
    }
  });
});

export default router;
