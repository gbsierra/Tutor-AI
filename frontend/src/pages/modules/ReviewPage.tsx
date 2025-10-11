import { useParams, Link } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { useModuleReview } from "../../hooks/useModules";
import type { ModuleOutletContext } from "./ModulePage";

export default function ReviewPage() {
  const { moduleSlug = "" } = useParams();
  const { module } = useOutletContext<ModuleOutletContext>();
  const { data: reviewData, loading, error } = useModuleReview(moduleSlug);

  if (loading) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-[var(--text)]">Review</h2>
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="text-sm text-[var(--muted-text)]">Loading review data…</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-[var(--text)]">Review</h2>
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="text-sm text-red-600">Error loading review data: {error}</div>
        </div>
      </section>
    );
  }

  if (!reviewData) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-[var(--text)]">Review</h2>
        <p className="mt-1 text-sm text-[var(--muted-text)]">
          Review your practice attempts for this module.
        </p>
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <EmptyState moduleSlug={moduleSlug} />
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-[var(--text)]">Review</h2>
      <p className="mt-1 text-sm text-[var(--muted-text)]">
        Review your practice attempts for {module?.title || moduleSlug}.
      </p>

      {/* Module Summary */}
      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-md font-medium text-[var(--text)]">Module Summary</h3>
          <div className="text-sm text-[var(--muted-text)]">
            {reviewData.totalModuleAttempts} total attempts
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[var(--muted-text)]">Overall Accuracy:</span>
            <span className="font-medium text-[var(--text)]">{reviewData.overallModuleAccuracy}%</span>
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className="mt-6 space-y-4">
        {Object.entries(reviewData.exercises).map(([exerciseSlug, exercise]: [string, any]) => (
          <div key={exerciseSlug} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-medium text-[var(--text)]">{exercise.title}</h4>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-[var(--muted-text)]">
                  {exercise.attempts} attempts
                </span>
                <span className="text-[var(--muted-text)]">
                  {exercise.correct} correct
                </span>
                <span className="font-medium text-[var(--text)]">
                  {exercise.accuracy}% accuracy
                </span>
              </div>
            </div>

            {exercise.recentAttempts.length > 0 ? (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-[var(--muted-text)]">Recent Attempts</h5>
                <div className="space-y-2">
                  {exercise.recentAttempts.map((attempt: any, index: number) => (
                    <div key={index} className="flex items-center justify-between rounded-lg bg-[var(--bg)] p-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            attempt.correct
                              ? "bg-[var(--ok)]/10 text-[var(--ok)] border border-[var(--ok)]"
                              : "bg-[var(--primary)]/10 text-[var(--primary-700)] border border-[var(--primary-700)]",
                          ].join(" ")}
                        >
                          {attempt.correct ? "Correct" : "Review needed"}
                        </span>
                        <span className="text-sm text-[var(--muted-text)]">
                          {new Date(attempt.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {attempt.feedback && (
                        <span className="text-sm text-[var(--muted-text)] max-w-xs truncate">
                          {attempt.feedback}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-[var(--muted-text)]">No attempts yet for this exercise.</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function EmptyState({ moduleSlug }: { moduleSlug: string }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--surface)' }}>
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--muted-text)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
        No practice attempts yet
      </h3>
      <p className="text-sm mb-6" style={{ color: 'var(--muted-text)' }}>
        Go practice to see your progress here!
      </p>
      <Link
        to={`/modules/${moduleSlug}/practice`}
        className="inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors"
        style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}
      >
        Start Practicing
      </Link>
    </div>
  );
}
