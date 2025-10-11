import { useState } from 'react';

interface InteractiveButtonsProps {
  applications: string[];
  pitfalls: string[];
  onVisualize?: () => void;
  visualizeLoading?: boolean;
  visualizeToggled?: boolean;
}

export default function InteractiveButtons({ applications, pitfalls, onVisualize, visualizeLoading, visualizeToggled }: InteractiveButtonsProps) {
  const [showApplications, setShowApplications] = useState(false);
  const [showPitfalls, setShowPitfalls] = useState(false);

  return (
    <div className="mb-2 sm:mb-3">
      {/* Interactive Buttons Row */}
      <div className="flex flex-col sm:flex-row gap-2 mb-2 sm:mb-3">
        <button
          onClick={() => setShowApplications(!showApplications)}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-full border transition-all duration-200 hover:scale-[1.02] w-full sm:flex-1"
          style={{ 
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border)',
            color: 'var(--text)'
          }}
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-xs sm:text-sm font-medium">Real-World Applications</span>
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

        <button
          onClick={() => setShowPitfalls(!showPitfalls)}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-full border transition-all duration-200 hover:scale-[1.02] w-full sm:flex-1"
          style={{ 
            backgroundColor: 'var(--bg)',
            borderColor: '#B91C1C',
            color: 'var(--text)'
          }}
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-xs sm:text-sm font-medium">Common Pitfalls</span>
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

        {/* Visualize Button */}
        {onVisualize && (
          <button
            onClick={onVisualize}
            disabled={visualizeLoading}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-full border transition-all duration-200 hover:scale-105 w-full sm:w-auto group"
            style={{ 
              backgroundColor: 'var(--primary)',
              borderColor: 'var(--primary)',
              color: 'var(--on-primary)'
            }}
            title={visualizeToggled ? 'Hide visualization options' : 'Show visualization options'}
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-xs sm:text-sm font-medium">
              {visualizeLoading ? 'Generating...' : (visualizeToggled ? 'Hide' : 'Visualize')}
            </span>
          </button>
        )}
      </div>

      {/* Applications Content */}
      {showApplications && (
        <div className="mb-2 sm:mb-3 space-y-2">
          {applications.map((application, index) => (
            <div
              key={index}
              className="relative p-2 sm:p-3 rounded-lg border-l-4"
              style={{ 
                backgroundColor: 'var(--bg)',
                borderLeftColor: 'var(--warn)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--warn)' }}></div>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                  {application}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pitfalls Content */}
      {showPitfalls && (
        <div className="mb-2 sm:mb-3 space-y-2">
          {pitfalls.map((pitfall, index) => (
            <div
              key={index}
              className="relative p-2 sm:p-3 rounded-lg border-l-4"
              style={{ 
                backgroundColor: 'var(--bg)',
                borderLeftColor: 'var(--danger)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--danger)' }}></div>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
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
