/**
 * EvidenceList Component
 * 
 * Displays a list of supporting evidence points for a counter-argument.
 * Each evidence item can have associated sources that are displayed inline.
 * Renders as a bulleted list with proper styling for dark mode.
 */

'use client';

import { EvidenceItem, Source } from '@/lib/api/claims';

interface EvidenceListProps {
  evidence: (string | EvidenceItem)[]; // Array of evidence point strings or objects with sources
}

/**
 * External link icon SVG component
 */
function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

/**
 * EvidenceList Component
 * 
 * Renders evidence points as a bulleted list with optional sources.
 * Returns null if no evidence is provided.
 */
export default function EvidenceList({ evidence }: EvidenceListProps) {
  // Don't render if no evidence
  if (!evidence || evidence.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-4">
      {evidence.map((item, index) => {
        // Handle both string and object evidence formats
        const evidenceText = typeof item === 'string' ? item : item.text;
        const evidenceSources = typeof item === 'string' ? undefined : item.sources;

        return (
          <li key={index} className="space-y-2">
            <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">•</span>
              <span className="flex-1 leading-relaxed">{evidenceText}</span>
            </div>
            
            {/* Display sources linked to this evidence item */}
            {evidenceSources && evidenceSources.length > 0 && (
              <div className="ml-6 space-y-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Sources for this evidence:
                </p>
                <div className="space-y-2">
                  {evidenceSources.map((source, sourceIndex) => (
                    <a
                      key={sourceIndex}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            <h6 className="text-xs font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                              {source.title}
                            </h6>
                            <ExternalLinkIcon className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                          </div>
                          {source.snippet && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                              {source.snippet}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
                            {source.url}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
