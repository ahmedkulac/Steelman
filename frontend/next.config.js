/**
 * Next.js Configuration
 * 
 * Configuration for the Next.js frontend application.
 * Optimized for Vercel deployment.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enable React strict mode for better development experience
  images: {
    domains: [], // Add image domains here if needed for next/image
  },
  // Output configuration for Vercel
  output: 'standalone', // Optimized for Vercel deployment
  // Environment variables validation
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
}

module.exports = nextConfig
