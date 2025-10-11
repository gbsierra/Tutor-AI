// frontend/src/components/simulations/D3SimulationHub.tsx
// Main orchestrator for D3.js simulation generation and display

import { useState, useCallback, useEffect } from 'react';
import { d3SimulationService } from '../../services/d3SimulationService';
import D3VisualizationSelector from './D3VisualizationSelector';
// Import types from shared directory
import type {
  D3VisualizationSpec,
  D3GenerationResponse
} from '@shared/index.ts';
import D3Renderer from './D3Renderer';

interface D3SimulationHubProps {
  content: string;           // Lesson content to analyze
  context?: any;            // Module/lesson context
  subject?: string;         // Subject area
  learningObjectives?: string[]; // Learning goals
  structuredContent?: any;  // Structured lesson content for better visualization
  className?: string;
  triggerVisualization?: boolean; // Trigger visualization when this becomes true
}

export default function D3SimulationHub({
  content,
  context = {},
  subject = '',
  learningObjectives = [],
  structuredContent,
  className = '',
  triggerVisualization = false
}: D3SimulationHubProps) {
  const [visualizations, setVisualizations] = useState<D3VisualizationSpec[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVisualization, setSelectedVisualization] = useState<D3VisualizationSpec | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [showSelector, setShowSelector] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);



  // Load existing visualization on component mount
  const loadExistingVisualization = useCallback(async () => {
    if (!content.trim()) {
      setInitialLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || ''}/api/visualizations/${context.moduleSlug}/${context.lessonSlug}`
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          console.log('📥 Loaded existing visualization from database');
          setVisualizations([result.data.visualizationData]);
          setSelectedVisualization(result.data.visualizationData);
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load existing visualization:', error);
      // Continue without existing visualization - not a critical error
    } finally {
      setInitialLoading(false);
    }
  }, [content, context]);

  // Save visualization to database
  const saveVisualization = useCallback(async (visualization: D3VisualizationSpec, vizType: string) => {
    if (!content.trim()) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/visualizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleSlug: context.moduleSlug,
          lessonSlug: context.lessonSlug,
          lessonTitle: context.lessonTitle,
          visualizationType: vizType,
          visualizationData: visualization,
        }),
      });

      if (response.ok) {
        console.log('💾 Visualization saved to database');
      } else {
        console.warn('⚠️ Failed to save visualization to database');
      }
    } catch (error) {
      console.warn('⚠️ Failed to save visualization:', error);
      // Continue without saving - not a critical error
    }
  }, [content, context]);

  const generateVisualization = useCallback(async (vizType?: string) => {
    if (!content.trim()) {
      setError('No content provided for visualization generation');
      return;
    }

    setLoading(true);
    setError(null);
    setVisualizations([]);

    try {
      console.log('🎯 Generating D3.js visualization:', {
        content,
        subject,
        learningObjectives,
        requestedType: vizType
      });

      const response: D3GenerationResponse = await d3SimulationService.generateD3Visualizations(
        content,
        context,
        subject,
        learningObjectives,
        vizType, // Pass the requested visualization type
        structuredContent // Pass structured content for better visualization
      );

      console.log('✅ Generated visualization:', response);

      if (response.visualizations && response.visualizations.length > 0) {
        const visualization = response.visualizations[0];
        setVisualizations([visualization]);
        setSelectedVisualization(visualization);



        // Save to database
        await saveVisualization(visualization, vizType || 'unknown');
      } else {
        setError('No visualization was generated for this content');
      }
    } catch (err: any) {
      console.error('❌ Error generating visualization:', err);
      setError(err.message || 'Failed to generate visualization');
    } finally {
      setLoading(false);
    }
  }, [content, context, subject, learningObjectives, saveVisualization]);


  const handleSelectVizType = useCallback((vizType: string) => {
    setShowSelector(false);
    generateVisualization(vizType);
  }, [generateVisualization]);

  const handleAISelect = useCallback(() => {
    setShowSelector(false);
    generateVisualization(); // No type specified = let AI choose
  }, [generateVisualization]);

  // Reset state when component mounts or triggerVisualization changes
  useEffect(() => {
    setVisualizations([]);
    setSelectedVisualization(null);
    setShowSelector(false);
    setIsFading(false);
    setError(null);
    setInitialLoading(true);
  }, [triggerVisualization]);

  // Load existing visualization when component mounts or content changes
  useEffect(() => {
    loadExistingVisualization();
  }, [loadExistingVisualization]);

  // Trigger visualization when triggerVisualization becomes true
  useEffect(() => {
    if (triggerVisualization && !loading && !initialLoading && visualizations.length === 0) {
      setShowSelector(true);
    }
  }, [triggerVisualization, loading, initialLoading, visualizations.length]);

  // Handle fade when visualizations load
  useEffect(() => {
    if (visualizations.length > 0 && showSelector) {
      setIsFading(true);
      const timer = setTimeout(() => {
        setShowSelector(false);
        setIsFading(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [visualizations.length, showSelector]);





  // Show selector if user clicked visualize and no visualization exists yet
  if (showSelector && !loading && visualizations.length === 0 && !error) {
    return (
      <div className={`d3-simulation-hub ${className}`}>
        <div className={`transition-all duration-200 ease-in-out ${isFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <D3VisualizationSelector
            onSelectType={handleSelectVizType}
            onAISelect={handleAISelect}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  // Show selector if user clicked visualize and no visualization exists yet
  if (!loading && visualizations.length === 0 && !error && !showSelector) {
    // Don't show the initial button - it's now integrated into the lesson content
    return null;
  }

  return (
    <div className={`d3-simulation-hub ${className}`}>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-4 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-md">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--text)]"></div>
            <p className="text-sm text-[var(--text)]">
              AI is analyzing your content and generating visualizations...
            </p>
          </div>
        </div>
      )}

      {/* Visualization Display */}
      {visualizations.length > 0 && selectedVisualization && (
        <div className="selected-visualization bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)] animate-in fade-in duration-300">
          <div className="flex flex-col gap-4">
            {/* Visualization Display */}
            <div className="w-full max-w-md lg:max-w-full mx-auto">
              <D3Renderer
                spec={selectedVisualization}
                width={window.innerWidth >= 1024 ? Math.min(600, window.innerWidth - 200) : Math.min(350, window.innerWidth - 80)} // Responsive width
                height={250} // Smaller default height
                className="cursor-pointer hover:opacity-90 transition-opacity border border-[var(--border)] rounded-lg p-2 mx-auto"
                onClick={() => setShowFullscreen(true)}
              />
              <p className="text-xs text-[var(--muted-text)] mt-2 text-center">
                Click to view fullscreen
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {showFullscreen && selectedVisualization && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <div 
            className="bg-[var(--surface)] rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[var(--text)]">
                {selectedVisualization.selectedCapability.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
              <button
                onClick={() => setShowFullscreen(false)}
                className="text-[var(--muted-text)] hover:text-[var(--text)] transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="w-full flex justify-center">
              <D3Renderer
                spec={selectedVisualization}
                width={Math.min(800, window.innerWidth - 100)}
                height={Math.min(600, window.innerHeight - 200)}
                className="border border-[var(--border)] rounded-lg p-2"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
