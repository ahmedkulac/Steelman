'use client';

import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * CopyButton Component
 * 
 * A button that copies text to the clipboard with visual feedback.
 * Shows a checkmark icon when copy is successful.
 */
export default function CopyButton({ 
  text, 
  className = '', 
  size = 'md',
  showLabel = false 
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
    }
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        inline-flex items-center gap-2
        ${sizeClasses[size]}
        text-gray-600 dark:text-gray-400
        hover:text-gray-900 dark:hover:text-gray-100
        hover:bg-gray-100 dark:hover:bg-gray-800
        rounded-lg
        transition-all duration-200
        active:scale-95
        touch-manipulation
        ${className}
      `}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <>
          <svg
            className={`${iconSizes[size]} text-green-600 dark:text-green-400`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          {showLabel && (
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Copied!
            </span>
          )}
        </>
      ) : (
        <>
          <svg
            className={iconSizes[size]}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {showLabel && (
            <span className="text-sm font-medium">Copy</span>
          )}
        </>
      )}
    </button>
  );
}
