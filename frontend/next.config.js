/**
 * Next.js Configuration
 * 
 * Configuration for the Next.js frontend application.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enable React strict mode for better development experience
  images: {
    domains: [], // Add image domains here if needed for next/image
  },
}

module.exports = nextConfig
