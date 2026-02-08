/**
 * SteelmanResult Component
 * 
 * Displays the results of fact-checking a claim, including:
 * - Original claim
 * - Steelman counter-arguments with reasoning and evidence
 * - Processing status (pending, processing, completed, failed)
 * 
 * Handles all states gracefully with appropriate UI feedback.
 */

'use client';

import { CounterArgument, Claim } from '@/lib/api/claims';
import EvidenceList from './EvidenceList';
import SourcesList from './SourcesList';
import CopyButton from './CopyButton';

interface SteelmanResultProps {
  claim: Claim;
}

/**
 * SteelmanResult Component
 * 
 * Renders the fact-checking results with:
 * - Loading states during processing
 * - Error states if processing failed
 * - Success state with counter-arguments
 */
export default function SteelmanResult({ claim }: SteelmanResultProps) {
  const { content, steelmanArguments, processingStatus } =
    claim;

  // Show loading state while processing
  if (processingStatus === 'pending' || processingStatus === 'processing') {
    return (
      <div className="w-full space-y-4">
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-blue-800 dark:text-blue-200">
              Processing your claim and generating steelman counter-arguments...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if processing failed
  if (processingStatus === 'failed') {
    return (
      <div className="w-full space-y-4">
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">
            Failed to process claim: {claim.errorMessage || 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  // Show message if no counter-arguments generated
  if (!steelmanArguments || steelmanArguments.length === 0) {
    return (
      <div className="w-full space-y-4">
        <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200">
            No counter-arguments generated. Please try again.
          </p>
        </div>
      </div>
    );
  }

  // Render successful results
  return (
    <div className="w-full space-y-6">
      {/* Original Claim Display */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Original Claim
          </h3>
          <CopyButton text={content} size="sm" />
        </div>
        <p className="text-gray-900 dark:text-gray-100">{content}</p>
        {/* Sources supporting the claim */}
        {claim.claimSources && claim.claimSources.length > 0 && (
          <SourcesList sources={claim.claimSources} title="Sources Supporting This Claim" />
        )}
      </div>

      {/* Counter Arguments Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Steelman Counter-Arguments
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The strongest possible opposing viewpoints to help you critically
          evaluate this claim.
        </p>

        {/* Render each counter-argument */}
        {steelmanArguments.map((arg: CounterArgument, index: number) => (
          <div
            key={index}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            {/* Counter-argument Header */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Counter-Argument {index + 1}
              </h3>
              {/* Strength Badge */}
              {arg.strength && (
                <span className="px-3 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                  Strength: {arg.strength}/10
                </span>
              )}
            </div>

            {/* Counter-argument Content */}
            <div className="space-y-4">
              {/* Main Argument */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Argument
                  </h4>
                  <CopyButton text={arg.argument} size="sm" />
                </div>
                <p className="text-gray-900 dark:text-gray-100">
                  {arg.argument}
                </p>
              </div>

              {/* Reasoning (if provided) */}
              {arg.reasoning && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reasoning
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {arg.reasoning}
                  </p>
                </div>
              )}

              {/* Evidence List (if provided) */}
              {arg.evidence && arg.evidence.length > 0 && (
                <EvidenceList evidence={arg.evidence} />
              )}

              {/* Sources List (if provided) */}
              {arg.sources && arg.sources.length > 0 && (
                <SourcesList sources={arg.sources} title="Sources Supporting This Counter-Argument" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
