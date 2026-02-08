/**
 * SourcesList Component
 * 
 * Displays a list of online sources with titles, URLs, and snippets.
 * Each source is clickable and opens in a new tab.
 */

import { Source } from '@/lib/api/claims';

interface SourcesListProps {
  sources: Source[];
  title?: string;
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

export default function SourcesList({ sources, title = 'Sources' }: SourcesListProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        {title}
      </h4>
      <div className="space-y-3">
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {source.title}
                  </h5>
                  <ExternalLinkIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
                {source.snippet && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                    {source.snippet}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 truncate">
                  {source.url}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
