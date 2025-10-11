
interface LessonIntroductionProps {
  content: string;
}

export default function LessonIntroduction({ content }: LessonIntroductionProps) {
  return (
    <div className="mb-3 sm:mb-4">
      <div className="prose max-w-none">
        <p className="text-sm sm:text-lg leading-relaxed" style={{ color: 'var(--text)' }}>
          {content}
        </p>
      </div>
    </div>
  );
}
