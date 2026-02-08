/**
 * Global Error Handler Middleware
 * 
 * Catches all errors thrown in route handlers and sends appropriate responses.
 * Includes error stack trace in development mode for debugging.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Error handler middleware
 * 
 * Handles all errors thrown in the application:
 * - Logs error to console
 * - Returns appropriate status code
 * - Includes error message
 * - Includes stack trace in development mode
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err);

  // Use existing status code or default to 500
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    // Include stack trace in development for debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
