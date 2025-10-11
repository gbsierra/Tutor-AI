import type { RenderBlock, FillBlankInstance } from "../../../../shared/problem";

interface FillBlankRendererProps {
  stem: RenderBlock[];
  blanks: FillBlankInstance[];
  onBlankChange: (blankId: string, value: string) => void;
  disabled?: boolean;
  // NEW: Add current answers to prevent duplicate rendering
  currentAnswers?: Record<string, string>;
}

export function FillBlankRenderer({
  stem,
  blanks,
  onBlankChange,
  disabled,
  currentAnswers = {}
}: FillBlankRendererProps) {
  // Parse text to find blank placeholders and create input fields
  const parseBlanksFromText = () => {
    const text = stem.map(block => block.value).join(' ');
    
    // Look for consistent blank placeholders (5 underscores or [BLANK])
    const blankMatches = text.match(/_{5,}|\[BLANK\]/g) || [];
    
    return blankMatches.map((placeholder, index) => ({
      id: `blank-${index + 1}`,
      placeholder: placeholder,
      position: index
    }));
  };

  // Use problem.blanks if available, otherwise fall back to parsing text
  const blanksToUse = blanks && blanks.length > 0 ? blanks : parseBlanksFromText();

  return (
    <div className="fill-blank-container space-y-6">
      {/* Input fields based on available blanks */}
      {blanksToUse.length > 0 ? (
        <div className="space-y-3">
          <p className="font-medium text-[var(--text)]">Fill in the blanks:</p>
          {blanksToUse.map((blank, index) => (
            <div key={blank.id} className="flex items-center space-x-3">
              <label className="text-sm font-medium text-[var(--text)] min-w-[60px]">
                Blank {index + 1}:
              </label>
              <input
                type="text"
                value={currentAnswers[blank.id] || ""}
                onChange={(e) => onBlankChange(blank.id, e.target.value)}
                disabled={disabled}
                className="flex-1 px-3 py-2 border-2 border-[var(--primary)] rounded-md bg-transparent text-[var(--text)] focus:outline-none focus:border-[var(--primary-700)]"
                placeholder={`Answer for blank ${index + 1}`}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-[var(--muted-text)]">
          <p>No blanks detected in this exercise.</p>
        </div>
      )}
    </div>
  );
}

// Add default export
export default FillBlankRenderer;
