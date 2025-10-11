
interface TrueFalseRendererProps {
  statement: string;
  onAnswerChange: (answer: boolean) => void;
  disabled?: boolean;
  currentAnswer?: boolean;
}

export default function TrueFalseRenderer({
  statement,
  onAnswerChange,
  disabled = false,
  currentAnswer,
}: TrueFalseRendererProps) {
  return (
    <div className="true-false-container space-y-4">
      {/* Statement */}
      <div className="text-lg leading-relaxed p-4 bg-[var(--bg)] rounded-lg border border-[var(--border)]">
        {statement}
      </div>
      
      {/* True/False Radio Buttons */}
      <div className="flex gap-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="true-false"
            value="true"
            checked={currentAnswer === true}
            onChange={() => onAnswerChange(true)}
            disabled={disabled}
            className="w-4 h-4 text-[var(--primary)] border-[var(--border)] focus:ring-[var(--primary)]"
          />
          <span className="text-lg font-medium">True</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="true-false"
            value="false"
            checked={currentAnswer === false}
            onChange={() => onAnswerChange(false)}
            disabled={disabled}
            className="w-4 h-4 text-[var(--primary)] border-[var(--border)] focus:ring-[var(--primary)]"
          />
          <span className="text-lg font-medium">False</span>
        </label>
      </div>
    </div>
  );
}
