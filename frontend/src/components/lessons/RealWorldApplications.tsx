
interface RealWorldApplicationsProps {
  applications: string[];
}

import { useState } from 'react';

export default function RealWorldApplications({ applications }: RealWorldApplicationsProps) {
  const [showApplications, setShowApplications] = useState(false);

  return (
    <div className="mb-3">
      <button
        onClick={() => setShowApplications(!showApplications)}
        className="flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-200 hover:scale-105"
        style={{ 
          backgroundColor: 'var(--bg)',
          borderColor: 'var(--border)',
          color: 'var(--text)'
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="text-sm font-medium">Real-World Applications</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${
            showApplications ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {showApplications && (
        <div className="mt-3 space-y-2">
          {applications.map((application, index) => (
            <div
              key={index}
              className="relative p-3 rounded-lg border-l-4"
              style={{ 
                backgroundColor: 'var(--bg)',
                borderLeftColor: 'var(--warn)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--warn)' }}></div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                  {application}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
