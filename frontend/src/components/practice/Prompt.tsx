type Props = { prompt?: string; exampleHint?: string };
export default function Prompt({ prompt, exampleHint }: Props) {
  return (
    <div className="mt-4">
      <div className="text-sm text-[var(--muted-text)]">Prompt</div>
      <div className="mt-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-[var(--text)]">
        {prompt ? (
          <>
            <p>{prompt}</p>
            {exampleHint && (
              <p className="mt-1 text-sm text-[var(--muted-text)]">{exampleHint}</p>
            )}
          </>
        ) : (
          <p className="italic text-[var(--muted-text)]">Click “Generate” to start.</p>
        )}
      </div>
    </div>
  );
}
