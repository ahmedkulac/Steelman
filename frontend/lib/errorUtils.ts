/**
 * Error Utilities
 * 
 * Helper functions for consistent error handling across the application.
 */

/**
 * Extract error message from various error types
 * 
 * @param error - Error object of unknown type
 * @param defaultMessage - Default message if error cannot be parsed
 * @returns Extracted error message
 */
export function extractErrorMessage(
  error: unknown,
  defaultMessage = 'An error occurred'
): string {
  if (!error) {
    return defaultMessage;
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle objects with message property
  if (
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  // Handle axios-style errors with response.data.message
  if (
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message;
  }

  // Handle axios-style errors with response.data.error
  if (
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'error' in error.response.data &&
    typeof error.response.data.error === 'string'
  ) {
    return error.response.data.error;
  }

  return defaultMessage;
}

/**
 * Extract error details from error object
 * 
 * @param error - Error object of unknown type
 * @returns Object with message and optional details
 */
export function extractErrorDetails(error: unknown): {
  message: string;
  details?: string;
  suggestion?: string;
} {
  if (!error) {
    return { message: 'An error occurred' };
  }

  const message = extractErrorMessage(error);
  
  // Try to extract additional details
  let details: string | undefined;
  let suggestion: string | undefined;

  if (
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object'
  ) {
    const data = error.response.data as Record<string, unknown>;
    if (typeof data.details === 'string') {
      details = data.details;
    }
    if (typeof data.suggestion === 'string') {
      suggestion = data.suggestion;
    }
  }

  return { message, details, suggestion };
}
