import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchDiscipline, fetchDisciplineModules, fetchDisciplineConcepts, formatCategoryName } from '../../services/disciplineService';
import type { Discipline } from '@shared/disciplines';
import type { ConceptGroup } from '@local/shared';

export default function DisciplinePage() {
  const { disciplineId } = useParams<{ disciplineId: string }>();
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [concepts, setConcepts] = useState<ConceptGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (disciplineId) {
      loadDisciplineData();
    }
  }, [disciplineId]);

  const loadDisciplineData = async () => {
    if (!disciplineId) return;

    try {
      setLoading(true);
      setError(null);

      // Load discipline, modules, and concepts in parallel
      const [disciplineData, modulesData, conceptsData] = await Promise.all([
        fetchDiscipline(disciplineId),
        fetchDisciplineModules(disciplineId),
        fetchDisciplineConcepts(disciplineId)
      ]);

      if (!disciplineData) {
        setError('Discipline not found');
        return;
      }

      setDiscipline(disciplineData);
      setModules(modulesData);
      setConcepts(conceptsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load discipline data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 rounded w-1/4 mb-4" style={{ backgroundColor: 'var(--muted-text)', opacity: 0.3 }}></div>
            <div className="h-4 rounded w-1/2 mb-8" style={{ backgroundColor: 'var(--muted-text)', opacity: 0.3 }}></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 rounded-lg" style={{ backgroundColor: 'var(--muted-text)', opacity: 0.3 }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !discipline) {
    return (
      <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <h2 className="text-red-800 font-semibold text-xl mb-2">
                {error || 'Discipline Not Found'}
              </h2>
              <p className="text-red-600 mb-6">
                The discipline you're looking for doesn't exist or has been removed.
              </p>
              <Link
                to="/disciplines"
                className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors inline-block"
              >
                Browse All Disciplines
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="hover:underline" style={{ color: 'var(--muted-text)' }}>
                Home
              </Link>
            </li>
            <li>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--muted-text)' }}>
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <Link to="/disciplines" className="hover:underline" style={{ color: 'var(--muted-text)' }}>
                Disciplines
              </Link>
            </li>
            <li>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--muted-text)' }}>
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <span className="font-medium" style={{ color: 'var(--text)' }}>{discipline.name}</span>
            </li>
          </ol>
        </nav>

        {/* Discipline Header */}
        <div className="rounded-xl p-8 mb-8" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div>
                  <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>{discipline.name}</h1>
                  <div className="flex items-center mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}>
                      {formatCategoryName(discipline.category)}
                    </span>
                  </div>
                </div>
              </div>

              {discipline.description && (
                <p className="text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--muted-text)' }}>
                  {discipline.description}
                </p>
              )}
            </div>

            <div className="ml-8">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>{discipline.moduleCount}</div>
                <div className="text-sm" style={{ color: 'var(--muted-text)' }}>Learning Modules</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link
            to={`/disciplines/${discipline.id}/create`}
            className="px-6 py-3 rounded-lg transition-colors font-medium"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}
          >
            📸 Upload Lecture Photos
          </Link>
          <button className="px-6 py-3 rounded-lg transition-colors font-medium" style={{ backgroundColor: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}>
            📚 View All Modules
          </button>
          <button className="px-6 py-3 rounded-lg transition-colors font-medium" style={{ backgroundColor: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}>
            📖 Study Guide
          </button>
        </div>

        {/* Concepts Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>
            Learning Concepts
          </h2>

          {concepts.length > 0 ? (
            <div className="space-y-6">
              {concepts.map((concept) => (
                <div key={concept.name} className="rounded-lg p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
                    {concept.name}
                  </h3>
                  {concept.description && (
                    <p className="text-sm mb-4" style={{ color: 'var(--muted-text)' }}>
                      {concept.description}
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {concept.modules.map((module) => (
                      <div key={module.slug} className="rounded-lg p-4 hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
                        <h4 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>{module.title}</h4>
                        {module.description && (
                          <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--muted-text)' }}>
                            {module.description}
                          </p>
                        )}
                        {module.tags && module.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {module.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="px-2 py-1 text-xs rounded" style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <Link
                          to={`/modules/${module.slug}`}
                          className="text-sm font-medium"
                          style={{ color: 'var(--primary)' }}
                        >
                          Start Learning →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : modules.length > 0 ? (
            // Fallback to flat module list for disciplines without concepts yet
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => (
                <div key={module.id} className="rounded-lg p-6 hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>{module.title}</h3>
                  {module.description && (
                    <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--muted-text)' }}>
                      {module.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm" style={{ color: 'var(--muted-text)' }}>
                    <span>{module.exercises?.length || 0} exercises</span>
                    <span>{new Date(module.created_at).toLocaleDateString()}</span>
                  </div>
                  <Link
                    to={`/modules/${module.slug}`}
                    className="mt-4 inline-block font-medium"
                    style={{ color: 'var(--primary)' }}
                  >
                    Start Learning →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
                No modules yet
              </h3>
              <p className="mb-6 max-w-md mx-auto" style={{ color: 'var(--muted-text)' }}>
                Be the first to create a learning module for {discipline.name}!
                Share your knowledge and help others learn.
              </p>
              <Link
                to={`/disciplines/${discipline.id}/create`}
                className="px-8 py-3 rounded-lg transition-colors font-medium inline-block"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}
              >
                Create First Module
              </Link>
            </div>
          )}
        </div>

        {/* Related Disciplines */}
        <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Related Disciplines
          </h3>
          <p style={{ color: 'var(--muted-text)' }}>
            Explore other disciplines in {formatCategoryName(discipline.category)} or
            discover interdisciplinary connections.
          </p>
          <div className="mt-4">
            <Link
              to="/disciplines"
              className="font-medium"
              style={{ color: 'var(--primary)' }}
            >
              Browse all disciplines →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
