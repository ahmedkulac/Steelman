/**
 * Date Utility Functions
 * 
 * Provides consistent date formatting across the application.
 * Ensures all history components display dates in the same format.
 */

/**
 * Format a timestamp as a relative date (e.g., "3h ago", "2d ago") for recent items,
 * or as an absolute date for older items.
 * 
 * @param timestamp - Unix timestamp in milliseconds
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatRelativeDate(
  timestamp: number,
  options: {
    showTime?: boolean; // Show time for recent items (< 24h)
    showYear?: boolean; // Show year for older items
  } = {}
): string {
  const { showTime = false, showYear = false } = options;
  const date = new Date(timestamp);
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  // Just now (< 1 minute)
  if (seconds < 60) {
    return 'Just now';
  }

  // Minutes ago (< 1 hour)
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  // Hours ago (< 24 hours)
  if (hours < 24) {
    if (showTime) {
      // Show time for very recent items
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
    return `${hours}h ago`;
  }

  // Days ago (< 7 days)
  if (days < 7) {
    return `${days}d ago`;
  }

  // Weeks ago (< 1 month)
  if (weeks < 4) {
    return `${weeks}w ago`;
  }

  // Months ago (< 1 year)
  if (months < 12) {
    return `${months}mo ago`;
  }

  // Years ago
  if (years >= 1) {
    return `${years}y ago`;
  }

  // For older dates, show absolute date
  const formatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };

  if (showYear || years >= 1) {
    formatOptions.year = 'numeric';
  }

  return date.toLocaleDateString('en-US', formatOptions);
}

/**
 * Format a timestamp as an absolute date with time.
 * Used for detailed history views where exact time matters.
 * 
 * @param timestamp - Unix timestamp in milliseconds
 * @param options - Formatting options
 * @returns Formatted date string with time
 */
export function formatAbsoluteDate(
  timestamp: number,
  options: {
    includeYear?: boolean; // Include year in the date
    includeTime?: boolean; // Include time (hour:minute)
    timeFormat?: '12h' | '24h'; // Time format
  } = {}
): string {
  const { includeYear = true, includeTime = true, timeFormat = '12h' } = options;
  const date = new Date(timestamp);

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };

  if (includeYear) {
    formatOptions.year = 'numeric';
  }

  if (includeTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
    formatOptions.hour12 = timeFormat === '12h';
  }

  return date.toLocaleDateString('en-US', formatOptions);
}

/**
 * Format a timestamp for display in history lists.
 * Uses relative format for recent items, absolute format for older items.
 * 
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string
 */
export function formatHistoryDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  // For items less than 7 days old, use relative format
  if (days < 7) {
    return formatRelativeDate(timestamp);
  }

  // For older items, use absolute format with year
  return formatAbsoluteDate(timestamp, { includeYear: true, includeTime: false });
}

/**
 * Get time until expiry as human-readable string.
 * 
 * @param expiresAt - Expiry timestamp in milliseconds
 * @returns Human-readable expiry string
 */
export function getTimeUntilExpiry(expiresAt: number): string {
  const now = Date.now();
  const diff = expiresAt - now;
  
  // Already expired
  if (diff <= 0) {
    return 'Expired';
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (days < 1) {
    if (hours < 1) {
      if (minutes < 1) {
        return 'Expiring soon';
      }
      return `${minutes}m left`;
    }
    return `${hours}h left`;
  }

  if (days < 7) {
    return `${days}d left`;
  }

  if (weeks < 4) {
    return `${weeks}w left`;
  }

  if (months < 12) {
    return `${months}mo left`;
  }

  return `${Math.floor(months / 12)}y left`;
}
