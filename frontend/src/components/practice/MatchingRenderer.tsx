import { useState, useCallback, useEffect } from "react";

interface MatchingRendererProps {
  leftItems: string[];
  rightItems: string[];
  onMatchChange: (matches: Record<string, string>) => void;
  disabled?: boolean;
  currentMatches?: Record<string, string>;
}

export function MatchingRenderer({
  leftItems,
  rightItems,
  onMatchChange,
  disabled,
  currentMatches = {}
}: MatchingRendererProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  // Automatically create match when both items are selected
  useEffect(() => {
    if (selectedLeft && selectedRight) {
      const newMatches = { ...currentMatches };
      newMatches[selectedLeft] = selectedRight;
      onMatchChange(newMatches);
      
      // Clear selections after creating match
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  }, [selectedLeft, selectedRight, currentMatches, onMatchChange]);

  const handleLeftClick = useCallback((item: string) => {
    if (disabled) return;
    
    if (selectedLeft === item) {
      // Deselect if clicking the same item
      setSelectedLeft(null);
    } else {
      setSelectedLeft(item);
      setSelectedRight(null); // Clear right selection when changing left
    }
  }, [selectedLeft, disabled]);

  const handleRightClick = useCallback((item: string) => {
    if (disabled) return;
    
    if (selectedRight === item) {
      // Deselect if clicking the same item
      setSelectedRight(null);
    } else {
      setSelectedRight(item);
    }
  }, [selectedRight, disabled]);

  const removeMatch = useCallback((leftItem: string) => {
    const newMatches = { ...currentMatches };
    delete newMatches[leftItem];
    onMatchChange(newMatches);
  }, [currentMatches, onMatchChange]);

  const isMatched = (leftItem: string) => currentMatches[leftItem];
  const isRightMatched = (rightItem: string) => Object.values(currentMatches).includes(rightItem);

  return (
    <div className="matching-container space-y-6">
      <div className="text-center">
        <p className="text-sm text-[var(--muted-text)] mt-2 flex items-center justify-center gap-2">
          Click an item from each column to automatically create a match
          <span 
            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[var(--muted-text)]/20 text-[var(--muted-text)] text-xs cursor-help relative group"
            title="Match the items in the left column with the correct items in the right column"
          >
            ?
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Match the items in the left column with the correct items in the right column
            </span>
          </span>
        </p>
      </div>

      {/* Matching Interface */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[var(--text)] text-center">Left Items</h3>
          <div className="space-y-2">
            {leftItems.map((item, index) => {
              const isSelected = selectedLeft === item;
              const isMatchedWith = isMatched(item);
              const matchedRightItem = isMatchedWith;
              
              return (
                <div
                  key={`left-${index}`}
                  className={[
                    "p-3 rounded-lg border-2 cursor-pointer transition-all",
                    isSelected && !isMatchedWith
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : isMatchedWith
                      ? "border-[var(--success)] bg-[var(--success)]/10 cursor-default"
                      : "border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface)]",
                    disabled ? "opacity-60 cursor-not-allowed" : ""
                  ].join(" ")}
                  onClick={() => !isMatchedWith && handleLeftClick(item)}
                >
                  <div className="text-[var(--text)] font-medium">{item}</div>
                  {isMatchedWith && (
                    <div className="text-sm text-[var(--success)] mt-1">
                      ✓ Matched with: {matchedRightItem}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[var(--text)] text-center">Right Items</h3>
          <div className="space-y-2">
            {rightItems.map((item, index) => {
              const isSelected = selectedRight === item;
              const isMatchedWith = isRightMatched(item);
              
              return (
                <div
                  key={`right-${index}`}
                  className={[
                    "p-3 rounded-lg border-2 cursor-pointer transition-all",
                    isSelected && !isMatchedWith
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : isMatchedWith
                      ? "border-[var(--success)] bg-[var(--success)]/10 cursor-default"
                      : "border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface)]",
                    disabled ? "opacity-60 cursor-not-allowed" : ""
                  ].join(" ")}
                  onClick={() => !isMatchedWith && handleRightClick(item)}
                >
                  <div className="text-[var(--text)] font-medium">{item}</div>
                  {isMatchedWith && (
                    <div className="text-sm text-[var(--success)] mt-1">
                      ✓ Matched
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Matches Display */}
      {Object.keys(currentMatches).length > 0 && (
        <div className="flex flex-col items-center space-y-4">
          <div className="w-full max-w-md">
            <h4 className="text-md font-medium text-[var(--text)] mb-3 text-center">Current Matches</h4>
            <div className="space-y-2">
              {Object.entries(currentMatches).map(([left, right]) => (
                <div
                  key={left}
                  className="flex items-center justify-between p-2 bg-[var(--success)]/10 border border-[var(--success)] rounded-md"
                >
                  <span className="text-sm text-[var(--text)]">
                    {left} → {right}
                  </span>
                  <button
                    onClick={() => removeMatch(left)}
                    disabled={disabled}
                    className="text-[var(--error)] hover:text-[var(--error-700)] text-sm font-medium disabled:opacity-50"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MatchingRenderer;
