import { useState } from 'react';
import type { TStepByStepExampleSpec } from '@local/shared';

interface StepByStepExamplesProps {
  examples: TStepByStepExampleSpec[];
}

export default function StepByStepExamples({ examples }: StepByStepExamplesProps) {
  const [expandedExample, setExpandedExample] = useState<number | null>(null);

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Step-by-Step Examples</h2>
      
      <div className="space-y-2">
        {examples.map((example, index) => (
          <div key={index} className="border-b" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => setExpandedExample(expandedExample === index ? null : index)}
              className="w-full py-2 text-left transition-colors duration-200 flex items-center justify-between hover:opacity-80"
              style={{ color: 'var(--text)' }}
            >
              <span className="font-medium text-sm">
                {example.title}
              </span>
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${
                  expandedExample === index ? 'rotate-180' : ''
                }`}
                style={{ color: 'var(--muted-text)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedExample === index && (
              <div className="pb-3 space-y-3">
                {/* Problem */}
                <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg)' }}>
                  <h4 className="text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>
                    Problem
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text)' }}>{example.problem}</p>
                </div>
                
                {/* Solution */}
                <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg)' }}>
                  <h4 className="text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>
                    Solution
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text)' }}>{example.solution}</p>
                </div>
                
                {/* Explanation */}
                <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg)' }}>
                  <h4 className="text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>
                    Explanation
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text)' }}>{example.explanation}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
