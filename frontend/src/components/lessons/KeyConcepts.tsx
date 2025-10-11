import { useState } from 'react';
import type { TKeyConceptSpec } from '@local/shared';

interface KeyConceptsProps {
  concepts: TKeyConceptSpec[];
}

export default function KeyConcepts({ concepts }: KeyConceptsProps) {
  const [expandedConcept, setExpandedConcept] = useState<number | null>(null);

  return (
    <div className="mb-4">
      <h2 className="text-base sm:text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Key Concepts</h2>
      
      <div className="space-y-2">
        {concepts.map((concept, index) => (
          <div key={index} className="border-b" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => setExpandedConcept(expandedConcept === index ? null : index)}
              className="w-full py-2 text-left transition-colors duration-200 flex items-center justify-between hover:opacity-80"
              style={{ color: 'var(--text)' }}
            >
              <span className="font-medium text-sm">
                {concept.concept}
              </span>
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${
                  expandedConcept === index ? 'rotate-180' : ''
                }`}
                style={{ color: 'var(--muted-text)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedConcept === index && (
              <div className="pb-3">
                <p className="mb-2 text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                  {concept.explanation}
                </p>
                
                {concept.examples && concept.examples.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>
                      Examples:
                    </h4>
                    <ul className="space-y-1">
                      {concept.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex} className="text-xs flex items-start gap-2" style={{ color: 'var(--muted-text)' }}>
                          <span className="mt-1" style={{ color: 'var(--ok)' }}>•</span>
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
