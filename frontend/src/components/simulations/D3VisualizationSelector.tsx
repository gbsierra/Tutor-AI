// frontend/src/components/simulations/D3VisualizationSelector.tsx
// Component for selecting visualization type before generation

import { useState } from 'react';
// Import visualization types from shared registry
import { getImplementedVisualizationTypes } from '@shared/index.ts';

interface D3VisualizationSelectorProps {
  onSelectType: (typeId: string) => void;
  onAISelect: () => void;
  loading?: boolean;
  className?: string;
}

// Get only implemented visualization types from shared registry
const VISUALIZATION_TYPES = getImplementedVisualizationTypes();

export default function D3VisualizationSelector({
  onSelectType,
  onAISelect,
  loading = false,
  className = ''
}: D3VisualizationSelectorProps) {
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Find AI choice option
  const aiChoice = VISUALIZATION_TYPES.find(type => type.id === 'ai-choice');
  const otherTypes = VISUALIZATION_TYPES.filter(type => type.id !== 'ai-choice');

  return (
    <div className={`d3-visualization-selector ${className}`}>
      <div className="space-y-3">
        {/* AI Choose - Main Option */}
        {aiChoice && (
          <button
            onClick={onAISelect}
            disabled={loading}
            className="group relative w-full p-3 sm:p-4 rounded-xl border transition-all duration-500 text-left overflow-hidden"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text)'
            }}
          >
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
            

            {/* Content */}
            <div className="relative z-10 flex items-center gap-2 sm:gap-3">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" style={{ backgroundColor: 'var(--primary)' }}>
                {/* Rotating Brain Icon */}
                <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-500 group-hover:rotate-180" style={{ color: 'var(--on-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                
                {/* Pulsing Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-base sm:text-lg transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400">
                  Generate Visualization
                </h4>
                <p className="text-xs sm:text-sm opacity-75 transition-all duration-300 group-hover:opacity-100">
                  AI will analyze your content and create the best visualization
                </p>
              </div>
              
              {/* Animated Arrow */}
              <svg className="w-4 h-4 sm:w-5 sm:h-5 opacity-50 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-1 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Shimmer Effect */}
            <div className="absolute -top-4 -left-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] bg-gradient-to-r from-transparent via-white/8 to-transparent transform -skew-x-12 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-1000 ease-out"></div>
          </button>
        )}

        {/* More Options - Subtle Text Link */}
        <div className="text-center">
          <button
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            disabled={loading}
            className="text-sm transition-colors duration-200 hover:opacity-80"
            style={{ color: 'var(--muted-text)' }}
          >
            {showMoreOptions ? 'Hide options' : 'More options'}
          </button>
        </div>

        {/* Other Visualization Types - Collapsible */}
        {showMoreOptions && (
          <div className="space-y-2">
            {otherTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onSelectType(type.id)}
                disabled={loading}
                className="w-full p-2 rounded-lg border transition-all duration-200 text-left hover:opacity-80"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">
                      {type.name}
                    </h4>
                    <p className="text-xs opacity-75">
                      {type.description}
                    </p>
                  </div>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
