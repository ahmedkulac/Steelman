import { Router } from 'express';

const router = Router();

// GET /api/users
router.get('/', (req, res) => {
  res.json({ 
    message: 'Users endpoint',
    users: []
  });
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
  res.json({ 
    message: 'Get user by ID',
    id: req.params.id
  });
});

// POST /api/users
router.post('/', (req, res) => {
  res.json({ 
    message: 'Create user',
    body: req.body
  });
});

export default router;
