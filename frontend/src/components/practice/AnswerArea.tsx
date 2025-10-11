type Props = {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
};
export default function AnswerArea({ value, onChange, disabled, placeholder }: Props) {
  return (
    <div className="mt-4">
      <label className="text-sm text-[var(--muted-text)]" htmlFor="answer">
        Your answer
      </label>
      <textarea
        id="answer"
        rows={4}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          "mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3",
          "text-[var(--text)] placeholder:text-[var(--muted-text)]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
          disabled ? "opacity-60 cursor-not-allowed" : "",
        ].join(" ")}
      />
    </div>
  );
}