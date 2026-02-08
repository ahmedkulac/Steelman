/**
 * Pre-dev Cleanup Script
 * 
 * Cleans the .next directory before starting the dev server.
 * This prevents Windows EINVAL errors from locked files.
 * 
 * This script:
 * - Checks if .next exists
 * - Attempts to delete it gracefully
 * - Handles errors silently (non-blocking)
 * - Works on Windows, Mac, and Linux
 */

const fs = require('fs');
const path = require('path');

const nextDir = path.join(__dirname, '..', '.next');

/**
 * Cleanup function
 * Attempts to remove the .next directory to prevent Windows file locking issues
 */
function cleanup() {
  try {
    if (fs.existsSync(nextDir)) {
      console.log('🧹 Cleaning .next directory...');
      
      // Try to delete recursively with retries for Windows file locking
      fs.rmSync(nextDir, { 
        recursive: true, 
        force: true, 
        maxRetries: 3, 
        retryDelay: 100 
      });
      
      console.log('✅ Cleaned .next directory');
    } else {
      // Directory doesn't exist - nothing to clean
      if (process.env.NODE_ENV !== 'test') {
        console.log('ℹ️  .next directory doesn\'t exist - nothing to clean');
      }
    }
  } catch (error) {
    // Non-blocking: if cleanup fails, Next.js will handle it
    // This is common on Windows when files are locked
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('⚠️  Could not clean .next directory:', errorMessage);
    console.warn('   If you see EINVAL errors, manually delete frontend/.next and restart');
  }
}

// Run cleanup
cleanup();
