import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Optionally check backend health
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/health`, {
      cache: 'no-store',
    });
    
    const backendHealth = await response.json();
    
    return NextResponse.json({
      status: 'ok',
      frontend: 'healthy',
      backend: backendHealth,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'ok',
        frontend: 'healthy',
        backend: 'unreachable',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
