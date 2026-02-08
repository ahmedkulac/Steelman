/**
 * 404 Not Found Handler Middleware
 * 
 * Handles requests to routes that don't exist.
 * Must be placed after all route definitions.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * 404 handler middleware
 * 
 * Returns 404 status for any route that doesn't match defined routes.
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
  });
};
