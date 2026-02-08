'use client';

interface EvidenceListProps {
  evidence: string[];
}

export default function EvidenceList({ evidence }: EvidenceListProps) {
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
