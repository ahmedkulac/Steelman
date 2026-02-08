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
    <ul className="space-y-2">
      {evidence.map((item, index) => (
        <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
          <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">•</span>
          <span className="flex-1 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}
