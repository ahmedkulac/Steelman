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
  const { content, steelmanArguments, processingStatus } = claim;

  return (
    <div className="w-full space-y-6">
      {/* Original Claim Display - Always visible */}
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

      {/* Loading State - Inline */}
      {(processingStatus === 'pending' || processingStatus === 'processing') && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      )}

      {/* Error state if processing failed */}
      {processingStatus === 'failed' && (
        <div className="w-full space-y-4">
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">
              Failed to process claim: {claim.errorMessage || 'Unknown error'}
            </p>
          </div>
        </div>
      )}

      {/* Message if no counter-arguments generated */}
      {processingStatus === 'completed' && (!steelmanArguments || steelmanArguments.length === 0) && (
        <div className="w-full space-y-4">
          <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200">
              No counter-arguments generated. Please try again.
            </p>
          </div>
        </div>
      )}

      {/* Successful Results */}
      {processingStatus === 'completed' && steelmanArguments && steelmanArguments.length > 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Counter-Arguments
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Strong opposing viewpoints to help you critically evaluate this claim.
            </p>
          </div>

          {/* Render each counter-argument */}
          {steelmanArguments.map((arg: CounterArgument, index: number) => (
            <div
              key={index}
              className="relative p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Counter-argument Number Badge */}
              <div className="absolute -top-3 -left-3 w-10 h-10 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                {index + 1}
              </div>

              {/* Copy Button - Top Right */}
              <div className="absolute top-4 right-4">
                <CopyButton text={arg.argument} size="sm" />
              </div>

              {/* Main Argument - Prominent and Easy to Read */}
              <div className="pr-12 mb-4">
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
                  {arg.argument}
                </p>
              </div>

              {/* Reasoning - Simplified, Less Prominent */}
              {arg.reasoning && (
                <div className="mb-4 pl-4 border-l-4 border-blue-300 dark:border-blue-600">
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    {arg.reasoning}
                  </p>
                </div>
              )}

              {/* Evidence and Sources - Collapsible or Simplified */}
              <div className="space-y-3 mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                {/* Evidence List (if provided) */}
                {arg.evidence && arg.evidence.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Key Evidence
                    </h4>
                    <EvidenceList evidence={arg.evidence} />
                  </div>
                )}

                {/* Sources List (if provided) */}
                {arg.sources && arg.sources.length > 0 && (
                  <div>
                    <SourcesList sources={arg.sources} title="Sources" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
