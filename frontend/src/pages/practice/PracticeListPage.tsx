// frontend/src/pages/practice/PracticeListPage.tsx
import { Link, useOutletContext, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import type { ModuleOutletContext } from "../modules/ModulePage";
import { getRecentExercisesForModule } from "../../utils/recentExercises";
import type { RecentExercise } from "@shared/types";

export default function PracticeListPage() {
  const { module } = useOutletContext<ModuleOutletContext>();
  const { moduleSlug = "" } = useParams();
  const [recentExercises, setRecentExercises] = useState<RecentExercise[]>([]);

  const exercises = module.exercises ?? [];

  // Load recent exercises for this module
  useEffect(() => {
    const loadRecentExercises = async () => {
      try {
        const recent = await getRecentExercisesForModule(moduleSlug);
        setRecentExercises(recent);
      } catch (error) {
        console.warn('Failed to load recent exercises:', error);
        setRecentExercises([]);
      }
    };
    
    loadRecentExercises();
  }, [moduleSlug]);

  // Helper function to format relative time
  const formatRelativeTime = (isoDateString: string): string => {
    const now = Date.now();
    const timestamp = new Date(isoDateString).getTime();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <section>
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--text)]">Exercises</h2>
        <p className="text-sm text-[var(--muted-text)]">
          Pick an exercise to practice. Your results will appear in Review once grading is wired.
        </p>
      </header>

      {/* Recent Exercises Section */}
      {recentExercises.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-medium text-[var(--text)] mb-3">Recent Exercises</h3>
          <ul className="grid gap-2">
            {recentExercises.map((recent) => (
              <li key={`${recent.moduleSlug}-${recent.exerciseSlug}`}>
                <Link
                  to={`/modules/${recent.moduleSlug}/practice/${recent.exerciseSlug}`}
                  className={[
                    "block rounded-xl border border-[var(--primary-200)] bg-[var(--primary-bg)] p-3",
                    "hover:shadow-sm transition-shadow",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[var(--text)] font-medium text-sm">{recent.exerciseTitle}</h4>
                      <p className="text-xs text-[var(--muted-text)] mt-1">
                        Last visited {formatRelativeTime(recent.lastVisited)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Recent indicator */}
                      <span className="text-xs text-[var(--primary-700)] px-2 py-1 rounded-md bg-[var(--primary-100)]">
                        Recent
                      </span>
                      
                      {/* Continue button */}
                      <span className="inline-block rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--on-primary)] hover:bg-[var(--primary-700)] transition-colors">
                        Continue
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All Exercises Section */}
      <div className="mb-4">
        <h3 className="text-md font-medium text-[var(--text)] mb-3">All Exercises</h3>
      </div>

      {exercises.length === 0 ? (
        <div className="text-sm text-[var(--muted-text)]">No exercises yet for this module.</div>
      ) : (
        <ul className="grid gap-2">
          {exercises.map((ex: any) => (
            <li key={ex.slug}>
              <Link
                to={`/modules/${moduleSlug}/practice/${ex.slug}`}
                className={[
                  "block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3",
                  "hover:shadow-sm transition-shadow",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[var(--text)] font-medium text-sm">{ex.title}</h3>
                    {ex.description && (
                      <p className="text-xs text-[var(--muted-text)] mt-1 line-clamp-1">{ex.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Exercise type badge */}
                    <span className="text-xs text-[var(--muted-text)] px-2 py-1 rounded-md bg-[var(--muted-bg)]">
                      {ex.type}
                    </span>
                    
                    {/* Start button */}
                    <span className="inline-block rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--on-primary)] hover:bg-[var(--primary-700)] transition-colors">
                      Start
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
