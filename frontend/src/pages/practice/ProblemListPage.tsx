import { useParams, Link, useOutletContext, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { ModuleOutletContext } from "../modules/ModulePage";
import type { ProblemInstance, RenderBlock } from "@shared/problem";
import type { TExerciseSpec as ExerciseSpec } from "@shared/module";
import { addRecentExercise } from "../../utils/recentExercises";
import { getApiClient } from "@shared/apiClient";

interface ExistingProblem {
  id: string;
  problem: ProblemInstance;
  createdAt: string;
  attemptCount: number;
  isAttempted: boolean;
  lastCorrect: boolean | null;
}

export default function ProblemListPage() {
  const { exerciseSlug, moduleSlug = "" } = useParams();
  const { module } = useOutletContext<ModuleOutletContext>();
  const navigate = useNavigate();
  const [problems, setProblems] = useState<ExistingProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Find the exercise spec
  const exerciseSpec = module.exercises?.find((ex: ExerciseSpec) => ex.slug === exerciseSlug);

  // Track this exercise visit
  useEffect(() => {
    const trackExerciseVisit = async () => {
      if (exerciseSpec && moduleSlug && exerciseSlug) {
        try {
          await addRecentExercise(moduleSlug, exerciseSlug, exerciseSpec.title);
        } catch (error) {
          console.warn('Failed to track exercise visit:', error);
        }
      }
    };
    
    trackExerciseVisit();
  }, [exerciseSpec, moduleSlug, exerciseSlug]);

  useEffect(() => {
    if (!exerciseSlug || !moduleSlug) return;

    const fetchExistingProblems = async () => {
      try {
        console.log("🔍 Fetching existing problems for:", { moduleSlug, exerciseSlug });
        setLoading(true);
        
        const apiClient = getApiClient();
        const endpoint = `/api/problems/existing?moduleSlug=${encodeURIComponent(moduleSlug)}&exerciseSlug=${encodeURIComponent(exerciseSlug)}`;
        console.log("🔍 API endpoint:", endpoint);

        const data = await apiClient.get<{ problems: ExistingProblem[] }>(endpoint);
        console.log("🔍 API Response data:", data);
        setProblems(data.problems || []);
      } catch (err: any) {
        console.error("🔍 Error fetching existing problems:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingProblems();
  }, [exerciseSlug, moduleSlug]);

  if (!module || !exerciseSlug || !exerciseSpec) {
    return <Navigate to="/modules" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
          <p className="text-[var(--muted-text)]">Loading problems...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[var(--primary)] text-[var(--on-primary)] rounded-lg hover:bg-[var(--primary-700)]"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section>
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link
            to={`/modules/${moduleSlug}/practice`}
            className="text-[var(--muted-text)] hover:text-[var(--text)] text-sm"
          >
            ← Back to Exercises
          </Link>
        </div>
        <h2 className="text-lg font-semibold text-[var(--text)]">{exerciseSpec.title}</h2>
        <p className="text-sm text-[var(--muted-text)]">
          Practice this exercise
        </p>
      </header>

      {problems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--muted-text)] mb-6">
            No problems have been generated for this exercise yet.
          </p>
          <button
            onClick={() => {
              console.log("🔘 Generate First Problem clicked");
              const path = `/modules/${moduleSlug}/practice/${exerciseSlug}/new`;
              console.log("🔘 Navigating to:", path);
              navigate(path);
            }}
            className="inline-block px-6 py-3 bg-[var(--primary)] text-[var(--on-primary)] rounded-xl font-medium hover:bg-[var(--primary-700)] transition cursor-pointer"
          >
            Generate First Problem
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[var(--muted-text)]">
              {problems.length} problem{problems.length !== 1 ? 's' : ''} available
            </p>
          </div>

          <div className="grid gap-2">
            {/* Generate New Problem Card */}
            <div
              onClick={() => {
                console.log("🔘 Generate New Problem clicked");
                const path = `/modules/${moduleSlug}/practice/${exerciseSlug}/new`;
                console.log("🔘 Navigating to:", path);
                navigate(path);
              }}
              className="block rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)] p-6 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition cursor-pointer"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">➕</div>
                <h3 className="font-medium text-[var(--text)] mb-1">Generate New Problem</h3>
                <p className="text-sm text-[var(--muted-text)]">Create a fresh problem for this exercise</p>
              </div>
            </div>

            {/* Existing Problems */}
            {problems.map((item) => (
              <Link
                key={item.id}
                to={`/modules/${moduleSlug}/practice/${exerciseSlug}/${item.id}`}
                className={`block rounded-xl border p-3 hover:shadow-sm transition-shadow ${
                  item.lastCorrect === true
                    ? 'border-[var(--ok)] bg-[var(--ok-bg)]' 
                    : 'border-[var(--border)] bg-[var(--surface)]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xs font-medium text-[var(--text)]">
                        Problem {item.problem.id.split('-').pop()}
                      </h3>
                      {item.lastCorrect === true && (
                        <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium bg-[var(--ok)] text-[var(--on-primary)]">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted-text)] line-clamp-1">
                      {getProblemPreview(item.problem)}
                    </p>
                  </div>
                  <div className="text-right text-xs text-[var(--muted-text)] flex-shrink-0">
                    <div>{formatDate(item.createdAt)}</div>
                    <div>{item.attemptCount} attempt{item.attemptCount !== 1 ? 's' : ''}</div>
                    {item.lastCorrect !== null && (
                      <div className={`text-xs ${item.lastCorrect ? 'text-[var(--ok)]' : 'text-[var(--primary-700)]'}`}>
                        {item.lastCorrect ? 'Last: Correct' : 'Last: Incorrect'}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// Helper function to get a preview of the problem
function getProblemPreview(problem: ProblemInstance): string {
  if (!problem.stem || problem.stem.length === 0) return "Problem preview unavailable";

  // Get the first text block
  const firstBlock = problem.stem.find((block: RenderBlock) => block.type === 'md' || block.type === 'text');
  if (firstBlock) {
    // Truncate to first 100 characters
    const text = firstBlock.value;
    return text.length > 100 ? text.substring(0, 100) + "..." : text;
  }

  return "Problem preview unavailable";
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Today";
  if (diffDays === 2) return "Yesterday";
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString();
}
