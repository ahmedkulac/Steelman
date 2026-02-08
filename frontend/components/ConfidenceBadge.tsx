/**
 * ConfidenceBadge Component
 * 
 * Displays the AI's confidence score for the generated counter-arguments.
 * Shows a visual progress bar with color coding:
 * - Green (80-100%): High confidence
 * - Blue (60-79%): Good confidence
 * - Yellow (40-59%): Moderate confidence
 * - Orange (0-39%): Low confidence
 */

'use client';

interface ConfidenceBadgeProps {
  score: number; // Confidence score from 0-1
}

/**
 * ConfidenceBadge Component
 * 
 * Renders a progress bar showing the confidence score with color-coded visualization.
 */
export default function ConfidenceBadge({ score }: ConfidenceBadgeProps) {
  // Convert 0-1 score to percentage
  const percentage = Math.round(score * 100);

  /**
   * Get color class based on confidence level
   */
  const getColor = () => {
    if (percentage >= 80) return 'bg-green-500'; // High confidence
    if (percentage >= 60) return 'bg-blue-500'; // Good confidence
    if (percentage >= 40) return 'bg-yellow-500'; // Moderate confidence
    return 'bg-orange-500'; // Low confidence
  };

  /**
   * Get text color class based on confidence level
   */
  const getTextColor = () => {
    if (percentage >= 80) return 'text-green-700 dark:text-green-300';
    if (percentage >= 60) return 'text-blue-700 dark:text-blue-300';
    if (percentage >= 40) return 'text-yellow-700 dark:text-yellow-300';
    return 'text-orange-700 dark:text-orange-300';
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
        Confidence Score
      </div>
      <div className="flex items-center space-x-3">
        {/* Progress Bar */}
        <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full ${getColor()} transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Percentage Display */}
        <span
          className={`text-lg font-bold ${getTextColor()} min-w-[3rem] text-right`}
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
}
