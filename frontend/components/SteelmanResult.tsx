'use client';

import { CounterArgument, Claim } from '@/lib/api/claims';
import ConfidenceBadge from './ConfidenceBadge';
import EvidenceList from './EvidenceList';

interface SteelmanResultProps {
  claim: Claim;
}

export default function SteelmanResult({ claim }: SteelmanResultProps) {
  const { content, steelmanArguments, confidenceScore, processingStatus } =
    claim;

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

  return (
    <div className="w-full space-y-6">
      {/* Original Claim */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Original Claim
        </h3>
        <p className="text-gray-900 dark:text-gray-100">{content}</p>
      </div>

      {/* Confidence Score */}
      {confidenceScore !== undefined && (
        <div className="flex items-center justify-center">
          <ConfidenceBadge score={confidenceScore} />
        </div>
      )}

      {/* Counter Arguments */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Steelman Counter-Arguments
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The strongest possible opposing viewpoints to help you critically
          evaluate this claim.
        </p>

        {steelmanArguments.map((arg: CounterArgument, index: number) => (
          <div
            key={index}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Counter-Argument {index + 1}
              </h3>
              {arg.strength && (
                <span className="px-3 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                  Strength: {arg.strength}/10
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Argument
                </h4>
                <p className="text-gray-900 dark:text-gray-100">
                  {arg.argument}
                </p>
              </div>

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

              {arg.evidence && arg.evidence.length > 0 && (
                <EvidenceList evidence={arg.evidence} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
