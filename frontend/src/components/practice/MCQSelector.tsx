
export type MCQProps = {
  choices: Array<{ id: string; label: string; text: string }>;
  selectedChoice: string;
  onSelect: (choiceId: string) => void;
  disabled?: boolean;
};

export function MCQSelector({ choices, selectedChoice, onSelect, disabled }: MCQProps) {
  return (
    <div className="mt-4">
      <label className="text-sm text-[var(--muted-text)] mb-3 block">
        Choose your answer
      </label>
      <div className="space-y-2">
        {choices.map((choice) => (
          <label
            key={choice.id}
            className={[
              "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition",
              selectedChoice === choice.id
                ? "border-[var(--primary)] bg-[var(--primary)]/5"
                : "border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface)]",
              disabled ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}
          >
            <input
              type="radio"
              name="mcq-choice"
              value={choice.id}
              checked={selectedChoice === choice.id}
              onChange={(e) => onSelect(e.target.value)}
              disabled={disabled}
              className="mt-0.5 text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <div className="flex-1">
              <span className="inline-block w-6 h-6 rounded-full bg-[var(--primary)] text-[var(--on-primary)] text-xs font-medium text-center leading-6 mr-2">
                {choice.label}
              </span>
              <span className="text-[var(--text)]">{choice.text}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
