import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useModulesList } from '../../hooks/useModules';
import DisciplineCard from '../../components/disciplines/DisciplineCard';
import { fetchDiscipline } from '../../services/disciplineService';
import type { Discipline } from '@shared/disciplines';

export default function DisciplineDashboard() {
  const { disciplineId } = useParams<{ disciplineId: string }>();
  const navigate = useNavigate();
  const { data: allModules, loading: modulesLoading, error: modulesError } = useModulesList();

  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastVisited, setLastVisited] = useState<string | null>(null);
  const [mastery, setMastery] = useState<number>(12);

  useEffect(() => {
    if (disciplineId) {
      loadDiscipline();
    }
  }, [disciplineId]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("stutor:lastVisitedPath");
      if (saved) setLastVisited(saved);
      const masteryValue = localStorage.getItem("stutor:module1:mastery");
      const m = masteryValue ? Number(masteryValue) : 12;
      if (!Number.isNaN(m) && Number.isFinite(m)) {
        setMastery(Math.max(0, Math.min(100, m)));
      } else {
        setMastery(12); // Default fallback
      }
    } catch {
      // ignore
    }
  }, []);

  const loadDiscipline = async () => {
    if (!disciplineId) return;

    try {
      setLoading(true);
      const disciplineData = await fetchDiscipline(disciplineId);
      setDiscipline(disciplineData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load discipline');
    } finally {
      setLoading(false);
    }
  };

  // Filter modules for this discipline
  const disciplineModules = allModules?.filter(module =>
    module.discipline?.toLowerCase() === disciplineId?.toLowerCase()
  ) || [];

  const continueHref = lastVisited ?? (disciplineModules.length > 0 ? `/modules/${disciplineModules[0].slug}/practice` : "/create");

  if (loading) {
    return (
      <div className="min-h-screen py-6 sm:py-8" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 mx-auto" style={{ border: '2px solid var(--border)', borderTop: '2px solid var(--primary)' }}></div>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base" style={{ color: 'var(--muted-text)' }}>Loading discipline...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !discipline) {
    return (
      <div className="min-h-screen py-6 sm:py-8" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
              <h2 className="text-red-800 font-semibold text-lg sm:text-xl">
                {error ? 'Error Loading Discipline' : 'Discipline Not Found'}
              </h2>
              <p className="text-red-600 mt-2 text-sm sm:text-base">
                {error || 'The requested discipline could not be found.'}
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-3 sm:mt-4 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-8" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-6">
          <ol className="flex items-center space-x-2 text-xs sm:text-sm" style={{ color: 'var(--muted-text)' }}>
            <li>
              <Link to="/dashboard" className="hover:underline" style={{ color: 'var(--muted-text)' }}>
                Dashboard
              </Link>
            </li>
            <li>/</li>
            <li className="font-medium truncate" style={{ color: 'var(--text)' }}>{discipline.name}</li>
          </ol>
        </nav>

        {/* Discipline Header */}
        <div className="rounded-lg p-4 sm:p-8 mb-6 sm:mb-8" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex flex-col md:flex-row md:items-center mb-4">
            <div className="flex-1 md:order-2">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                {discipline.name}
              </h1>
              <p className="text-base sm:text-lg mb-4" style={{ color: 'var(--muted-text)' }}>
                {discipline.description}
              </p>
              {/* Quick Actions - hidden on small screens */}
              <div className="hidden md:flex flex-wrap items-center gap-3">
                {disciplineModules.length > 0 && (
                  <Link
                    to={continueHref}
                    className="px-4 py-2 rounded-md transition-colors text-sm sm:text-base"
                    style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}
                  >
                    Continue Learning
                  </Link>
                )}
                <Link
                  to={`/disciplines/${disciplineId}/create`}
                  className="px-4 py-2 rounded-md transition-colors text-sm sm:text-base"
                  style={{ backgroundColor: 'var(--ok)', color: 'var(--on-primary)' }}
                >
                  Upload Lecture Photos
                </Link>
                <Link
                  to="/modules"
                  className="px-4 py-2 rounded-md transition-colors text-sm sm:text-base"
                  style={{ backgroundColor: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}
                >
                  Browse All Modules
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-4 md:order-1">
              <DisciplineCard discipline={discipline} variant="compact" />
            </div>
          </div>
          
          {/* Quick Actions - shown on small screens, under the card */}
          <div className="flex md:hidden flex-wrap items-center gap-2 sm:gap-3">
            {disciplineModules.length > 0 && (
              <Link
                to={continueHref}
                className="px-3 sm:px-4 py-2 rounded-md transition-colors text-sm"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}
              >
                Continue Learning
              </Link>
            )}
            <Link
              to={`/disciplines/${disciplineId}/create`}
              className="px-3 sm:px-4 py-2 rounded-md transition-colors text-sm"
              style={{ backgroundColor: 'var(--ok)', color: 'var(--on-primary)' }}
            >
              Upload Photos
            </Link>
            <Link
              to="/modules"
              className="px-3 sm:px-4 py-2 rounded-md transition-colors text-sm"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              Browse Modules
            </Link>
          </div>
        </div>

        {/* Modules Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Modules ({disciplineModules.length})
            </h2>
            {disciplineModules.length === 0 && (
              <div className="text-xs sm:text-sm" style={{ color: 'var(--muted-text)' }}>
                No modules yet — be the first to create one!
              </div>
            )}
          </div>

          {modulesLoading && (
            <div className="text-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 mx-auto" style={{ border: '2px solid var(--border)', borderTop: '2px solid var(--primary)' }}></div>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base" style={{ color: 'var(--muted-text)' }}>Loading modules...</p>
            </div>
          )}

          {modulesError && (
            <div className="rounded-lg p-3 sm:p-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--danger)' }}>
              <p className="text-sm sm:text-base" style={{ color: 'var(--danger)' }}>Error loading modules: {modulesError}</p>
            </div>
          )}

          {!modulesLoading && !modulesError && disciplineModules.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {disciplineModules.map((module) => (
                <ModuleCard
                  key={module.slug}
                  title={module.title}
                  description={module.description ?? "—"}
                  to={`/modules/${module.slug}`}
                  status="unlocked"
                  progress={module.slug === "module1" ? mastery : 0}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!modulesLoading && !modulesError && disciplineModules.length === 0 && (
            <div className="rounded-lg p-8 sm:p-12 text-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📚</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
                No modules yet
              </h3>
              <p className="mb-4 sm:mb-6 text-sm sm:text-base" style={{ color: 'var(--muted-text)' }}>
                Be the first to create a learning module for {discipline.name}!
                Share your knowledge and help others learn.
              </p>
              <Link
                to={`/disciplines/${disciplineId}/create`}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-md transition-colors inline-block text-sm sm:text-base"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}
              >
                Create First Module
              </Link>
            </div>
          )}
        </div>

        {/* Progress Stats */}
        {disciplineModules.length > 0 && (
          <div className="rounded-lg p-4 sm:p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: 'var(--text)' }}>Your Progress</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <StatCard label="Modules Completed" value="0" />
              <StatCard label="Average Score" value="—" />
              <StatCard label="Study Streak" value="0 days" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function ModuleCard({
  title,
  description,
  to,
  status,
  progress = 0,
}: {
  title: string;
  description: string;
  to: string;
  status: "unlocked" | "locked";
  progress?: number;
}) {
  const navigate = useNavigate();

  return (
    <div
      className="rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(to)}
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold mb-1 truncate" style={{ color: 'var(--text)' }}>{title}</h3>
          <p className="text-xs sm:text-sm line-clamp-2" style={{ color: 'var(--muted-text)' }}>{description}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
          status === "locked"
            ? ""
            : ""
        }`} style={{
          backgroundColor: status === "locked" ? 'var(--muted-text)' : 'var(--ok)',
          color: status === "locked" ? 'var(--text)' : 'var(--on-primary)',
          opacity: status === "locked" ? 0.6 : 1
        }}>
          {status === "locked" ? "Locked" : "Unlocked"}
        </div>
      </div>

      {status === "unlocked" && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ProgressRing value={progress} />
            <span className="text-xs sm:text-sm" style={{ color: 'var(--muted-text)' }}>{progress}% complete</span>
          </div>
          <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--primary)' }}>Open →</span>
        </div>
      )}
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const angle = (clamped / 100) * 360;
  return (
    <span className="inline-grid size-6 place-items-center rounded-full" aria-label={`Progress ${clamped}%`}>
      <span
        className="relative size-6 rounded-full"
        style={{ background: `conic-gradient(var(--primary) ${angle}deg, var(--border) 0)` }}
      />
      <span className="absolute size-4 rounded-full shadow-inner" style={{ backgroundColor: 'var(--surface)' }} />
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text)' }}>{value}</div>
      <div className="text-xs sm:text-sm" style={{ color: 'var(--muted-text)' }}>{label}</div>
    </div>
  );
}
