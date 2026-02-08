/**
 * Backend Server Entry Point
 * 
 * Express.js API server for the Fact Checker application.
 * Handles claim submissions, AI processing, and result retrieval.
 * 
 * Features:
 * - RESTful API endpoints
 * - Rate limiting
 * - Optional Redis caching
 * - Error handling
 * - CORS enabled
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import apiRoutes from './routes';
import { initRedis } from './utils/cache';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== Middleware ====================

// Security headers
app.use(helmet());

// Enable CORS for frontend
app.use(cors());

// Request logging
app.use(morgan('dev'));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== Routes ====================

/**
 * Root endpoint - API information
 * GET /
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Fact Checker API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      claims: '/api/claims',
    },
    frontend: 'http://localhost:3000',
  });
});

/**
 * Health check endpoint
 * GET /health
 */
app.get('/health', async (req, res) => {
  const { getCacheStats } = await import('./utils/cache');
  const cacheStats = getCacheStats();
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cache: cacheStats,
  });
});

// API routes (all under /api prefix)
app.use('/api', apiRoutes);

// ==================== Error Handling ====================

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ==================== Initialization ====================

/**
 * Initialize Redis (non-blocking, optional)
 * 
 * App works fine without Redis - caching will be disabled.
 * This is called asynchronously and won't block server startup.
 */
initRedis().catch((error) => {
  // Only log in development to reduce noise in production
  if (process.env.NODE_ENV === 'development') {
    console.warn('Redis initialization failed (optional):', error.message);
  }
});

// ==================== Start Server ====================

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
