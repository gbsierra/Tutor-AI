import type { TStructuredLessonContentSpec } from '@local/shared';
import LessonIntroduction from './LessonIntroduction';
import KeyConcepts from './KeyConcepts';
import StepByStepExamples from './StepByStepExamples';
import InteractiveButtons from './InteractiveButtons';
import LessonSummary from './LessonSummary';

interface StructuredLessonRendererProps {
  content: TStructuredLessonContentSpec;
  onVisualize?: () => void;
  visualizeLoading?: boolean;
  visualizeToggled?: boolean;
  youtubeSearchQuery?: string;
  lessonSlug?: string;
  moduleSlug?: string;
}

export default function StructuredLessonRenderer({ content, onVisualize, visualizeLoading, visualizeToggled, youtubeSearchQuery, lessonSlug, moduleSlug }: StructuredLessonRendererProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Introduction */}
      <LessonIntroduction content={content.introduction} />
      
      {/* Key Concepts */}
      <KeyConcepts concepts={content.keyConcepts} />
      
      {/* Step-by-Step Examples */}
      {content.stepByStepExamples && content.stepByStepExamples.length > 0 && (
        <StepByStepExamples examples={content.stepByStepExamples} />
      )}
      
      {/* Interactive Buttons (Applications & Pitfalls) */}
      {((content.realWorldApplications && content.realWorldApplications.length > 0) || 
        (content.commonPitfalls && content.commonPitfalls.length > 0) ||
        onVisualize) && (
        <InteractiveButtons 
          applications={content.realWorldApplications || []} 
          pitfalls={content.commonPitfalls || []} 
          onVisualize={onVisualize}
          visualizeLoading={visualizeLoading}
          visualizeToggled={visualizeToggled}
        />
      )}
      
      {/* Summary */}
      <LessonSummary 
        summary={content.summary} 
        youtubeVideo={undefined}
        youtubeSearchQuery={youtubeSearchQuery}
        lessonSlug={lessonSlug}
        moduleSlug={moduleSlug}
      />
    </div>
  );
}
