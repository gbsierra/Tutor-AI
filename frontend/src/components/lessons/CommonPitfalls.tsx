
interface CommonPitfallsProps {
  pitfalls: string[];
}

import { useState } from 'react';

export default function CommonPitfalls({ pitfalls }: CommonPitfallsProps) {
  const [showPitfalls, setShowPitfalls] = useState(false);

  return (
    <div className="mb-3">
      <button
        onClick={() => setShowPitfalls(!showPitfalls)}
        className="flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-200 hover:scale-105"
        style={{ 
          backgroundColor: 'var(--bg)',
          borderColor: 'var(--danger)',
          color: 'var(--text)'
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span className="text-sm font-medium">Common Pitfalls</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${
            showPitfalls ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {showPitfalls && (
        <div className="mt-3 space-y-2">
          {pitfalls.map((pitfall, index) => (
            <div
              key={index}
              className="relative p-3 rounded-lg border-l-4"
              style={{ 
                backgroundColor: 'var(--bg)',
                borderLeftColor: 'var(--danger)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--danger)' }}></div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                  {pitfall}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
