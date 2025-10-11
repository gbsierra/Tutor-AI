import { useOutletContext } from "react-router-dom";
import { useState, useCallback } from "react";
import type { ModuleOutletContext } from "./ModulePage";
import D3SimulationHub from "../../components/simulations/D3SimulationHub";
import StructuredLessonRenderer from "../../components/lessons/StructuredLessonRenderer";

export default function LearnPage() {
  const { module } = useOutletContext<ModuleOutletContext>();
  const lessons = module.lessons ?? [];
  const [visualizationStates, setVisualizationStates] = useState<Record<string, { loading: boolean; showVisualization: boolean; isToggled: boolean }>>({});

  const handleVisualize = useCallback((lessonSlug: string) => {
    setVisualizationStates(prev => {
      const currentState = prev[lessonSlug];
      const isCurrentlyToggled = currentState?.isToggled || false;
      const isCurrentlyShowing = currentState?.showVisualization || false;
      
      if (isCurrentlyToggled && isCurrentlyShowing) {
        // Hide the visualization options
        return {
          ...prev,
          [lessonSlug]: { loading: false, showVisualization: false, isToggled: false }
        };
      } else {
        // Show the visualization options
        return {
          ...prev,
          [lessonSlug]: { loading: false, showVisualization: true, isToggled: true }
        };
      }
    });
  }, []);


  if (lessons.length === 0) {
    return (
      <div className="text-xs sm:text-sm text-[var(--muted-text)]">
        No lessons yet for <span className="text-[var(--text)] font-medium">{module.title}</span>.
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {lessons.map((ls: any) => (
        <article key={ls.slug} className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 sm:p-6">
          {/* Lesson Header */}
          <div className="mb-3 sm:mb-4">
            <h2 className="text-base sm:text-xl font-semibold text-[var(--text)]">{ls.title}</h2>
          </div>

          {/* Lesson Content */}
          <div className="mb-4 sm:mb-6">
            {ls.structuredContent ? (
              <StructuredLessonRenderer 
                content={ls.structuredContent} 
                onVisualize={() => handleVisualize(ls.slug)}
                visualizeLoading={visualizationStates[ls.slug]?.loading || false}
                visualizeToggled={visualizationStates[ls.slug]?.isToggled || false}
                youtubeSearchQuery={ls.youtubeSearchQuery}
                lessonSlug={ls.slug}
                moduleSlug={module.slug}
              />
            ) : (
              <div className="prose prose-invert max-w-none">
                <div className="text-[var(--text)] whitespace-pre-wrap text-sm sm:text-base">
                  {ls.contentMd}
                </div>
              </div>
            )}
          </div>

          {/* D3.js Visualization Generation - Only show if visualize was clicked */}
          <div className={`overflow-hidden ${visualizationStates[ls.slug]?.showVisualization ? 'transition-all duration-300 ease-in-out max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="border-t border-[var(--border)] pt-3 sm:pt-4">
              <D3SimulationHub
                content={ls.structuredContent 
                  ? `${ls.title} - ${ls.structuredContent.introduction}`
                  : `${ls.title} - ${ls.contentMd}`
                }
                context={{
                  moduleSlug: module.slug,
                  lessonSlug: ls.slug,
                  moduleTitle: module.title,
                  lessonTitle: ls.title
                }}
                subject={module.title || 'Mathematics'}
                learningObjectives={[ls.title]} // Use lesson title as learning objective
                structuredContent={ls.structuredContent} // Pass structured content for better visualization
                triggerVisualization={visualizationStates[ls.slug]?.showVisualization || false}
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
