type Props = { error?: string | null; ok?: boolean; feedback?: string };
export default function ResultBanner({ error, ok, feedback }: Props) {
  if (error) {
    return (
      <div className="mt-4 rounded-xl border border-red-400 bg-red-50 p-3 text-sm text-red-700">
        {error}
      </div>
    );
  }
  if (ok != null) {
    const good = ok === true;
    return (
      <div
        className={[
          "mt-4 rounded-xl border p-3 text-sm",
          good
            ? "border-[var(--ok)] bg-[var(--ok)]/10 text-[var(--ok)]"
            : "border-[var(--primary-700)] bg-[var(--primary)]/10 text-[var(--primary-700)]",
        ].join(" ")}
      >
        {feedback || (good ? "Correct!" : "Try again.")}
      </div>
    );
  }
  return null;
}
