import { useState, useEffect } from 'react';
import CollegeCard from '../components/disciplines/CollegeCard';
import CollegeExpandedView from '../components/disciplines/CollegeExpandedView';
import { fetchDisciplines } from '../services/disciplineService';
import type { Discipline } from '@shared/disciplines';

export default function Dashboard() {
  const [disciplines, setDisciplines] = useState<Record<string, Discipline[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedColleges, setExpandedColleges] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadDisciplines();
  }, []);

  const loadDisciplines = async () => {
    try {
      setLoading(true);
      const data = await fetchDisciplines();
      setDisciplines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load disciplines');
    } finally {
      setLoading(false);
    }
  };

  // Filter disciplines based on search and category
  const filteredDisciplines = Object.entries(disciplines).reduce((acc, [category, categoryDisciplines]) => {
    if (selectedCategory && category !== selectedCategory) {
      return acc;
    }

    const filtered = categoryDisciplines.filter(discipline =>
      discipline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discipline.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered.length > 0) {
      acc[category] = filtered;
    }

    return acc;
  }, {} as Record<string, Discipline[]>);

  const categories = Object.keys(disciplines);
  const totalDisciplines = Object.values(disciplines).flat().length;
  const filteredCount = Object.values(filteredDisciplines).flat().length;

  const toggleCollege = (category: string) => {
    const newExpanded = new Set(expandedColleges);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedColleges(newExpanded);
  };

  const expandAllColleges = () => {
    setExpandedColleges(new Set(categories));
  };

  const collapseAllColleges = () => {
    setExpandedColleges(new Set());
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 mx-auto border-2" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }}></div>
            <p className="mt-4" style={{ color: 'var(--muted-text)' }}>Loading academic disciplines...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--danger)' }}>
              <h2 className="font-semibold" style={{ color: 'var(--danger)' }}>Error Loading Disciplines</h2>
              <p className="mt-2" style={{ color: 'var(--muted-text)' }}>{error}</p>
              <button
                onClick={loadDisciplines}
                className="mt-4 px-4 py-2 rounded-md transition-colors"
                style={{ backgroundColor: 'var(--danger)', color: 'var(--on-primary)' }}
              >
                Try Again
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
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4" style={{ color: 'var(--text)' }}>
            Academic Disciplines
          </h1>
          <p className="text-base sm:text-xl max-w-4xl mx-auto leading-relaxed" style={{ color: 'var(--muted-text)' }}>
            Explore our comprehensive collection of academic disciplines organized by college. 
            Click on any college to discover its disciplines and learning modules.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="rounded-xl shadow-sm border p-4 sm:p-6 mb-6 sm:mb-8" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                Search Disciplines
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by discipline name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border transition-colors text-sm sm:text-base"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)'
                }}
              />
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <label htmlFor="category" className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                Filter by College
              </label>
              <select
                id="category"
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border transition-colors text-sm sm:text-base"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)'
                }}
              >
                <option value="">All Colleges</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results summary and actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="text-xs sm:text-sm mb-2 sm:mb-0" style={{ color: 'var(--muted-text)' }}>
              Showing {filteredCount} of {totalDisciplines} disciplines
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory(null);
                  }}
                  className="ml-2 underline transition-colors"
                  style={{ color: 'var(--primary)' }}
                >
                  Clear filters
                </button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={expandAllColleges}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-colors"
                style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
              >
                Expand All
              </button>
              <button
                onClick={collapseAllColleges}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-colors"
                style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* College Grid */}
        <div className="space-y-4 sm:space-y-6">
          {Object.entries(filteredDisciplines).map(([category, categoryDisciplines]) => (
            <div key={category} className="space-y-0">
              <CollegeCard
                category={category}
                disciplines={categoryDisciplines}
                isExpanded={expandedColleges.has(category)}
                onToggle={() => toggleCollege(category)}
              />
              
              <CollegeExpandedView
                category={category}
                disciplines={categoryDisciplines}
                isExpanded={expandedColleges.has(category)}
              />
            </div>
          ))}
        </div>

        {/* Empty state */}
        {Object.keys(filteredDisciplines).length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--surface)' }}>
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--muted-text)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
              No disciplines found
            </h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base" style={{ color: 'var(--muted-text)' }}>
              Try adjusting your search terms or clearing the filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory(null);
              }}
              className="px-3 sm:px-4 py-2 rounded-md transition-colors text-sm sm:text-base"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Footer stats */}
        <div className="mt-12 sm:mt-16 rounded-xl shadow-sm border p-4 sm:p-8" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--ok)' }}>{totalDisciplines}</div>
              <div className="text-sm sm:text-base" style={{ color: 'var(--muted-text)' }}>Total Disciplines</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--warn)' }}>{categories.length}</div>
              <div className="text-sm sm:text-base" style={{ color: 'var(--muted-text)' }}>Academic Colleges</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--primary)' }}>
                {Object.values(disciplines).flat().reduce((sum, d) => sum + d.moduleCount, 0)}
              </div>
              <div className="text-sm sm:text-base" style={{ color: 'var(--muted-text)' }}>Learning Modules</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


