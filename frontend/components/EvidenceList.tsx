/**
 * EvidenceList Component
 * 
 * Displays a list of supporting evidence points for a counter-argument.
 * Renders as a bulleted list with proper styling for dark mode.
 */

'use client';

interface EvidenceListProps {
  evidence: string[]; // Array of evidence point strings
}

/**
 * EvidenceList Component
 * 
 * Renders evidence points as a bulleted list.
 * Returns null if no evidence is provided.
 */
export default function EvidenceList({ evidence }: EvidenceListProps) {
  // Don't render if no evidence
  if (!evidence || evidence.length === 0) {
    return null;
  }

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Supporting Evidence
      </h4>
      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
        {evidence.map((item, index) => (
          <li key={index} className="text-sm">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
