/**
 * Frontend Health Check API Route
 * 
 * Next.js API route that checks both frontend and backend health.
 * Useful for monitoring and debugging.
 */

import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * 
 * Returns health status of both frontend and backend.
 * Frontend is always healthy if this route responds.
 * Backend health is checked by calling backend /health endpoint.
 */
export async function GET() {
  try {
    // Check backend health by calling backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/health`, {
      cache: 'no-store', // Always check fresh
    });
    
    const backendHealth = await response.json();
    
    return NextResponse.json({
      status: 'ok',
      frontend: 'healthy',
      backend: backendHealth,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Frontend is healthy, but backend is unreachable
    return NextResponse.json(
      {
        status: 'ok',
        frontend: 'healthy',
        backend: 'unreachable',
        timestamp: new Date().toISOString(),
      },
      { status: 200 } // Frontend is still healthy
    );
  }
}
