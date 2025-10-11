import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Discipline } from '@shared/disciplines';
import { 
  fetchDisciplines,
  formatCategoryName
} from '../../services/disciplineService';

interface CategoryCardProps {
  category: string;
  disciplines: Discipline[];
  onExpand: (category: string) => void;
  isExpanded: boolean;
}

function CategoryCard({ category, disciplines, onExpand, isExpanded }: CategoryCardProps) {
  const navigate = useNavigate();
  const categoryName = formatCategoryName(category);
  
  const handleCardClick = () => {
    if (isExpanded) {
      onExpand(''); // Collapse
    } else {
      onExpand(category); // Expand
    }
  };

  const handleDisciplineClick = (disciplineId: string) => {
    navigate(`/disciplines/${disciplineId}`);
  };

  return (
    <div 
      className="p-4 sm:p-8 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: isExpanded ? 'var(--primary)' : 'var(--border)',
        borderWidth: isExpanded ? '2px' : '1px'
      }}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h3 
              className="text-lg sm:text-2xl font-semibold mb-1"
              style={{ 
                color: 'var(--text)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              {categoryName}
            </h3>
            <p 
              className="text-xs sm:text-sm font-medium"
              style={{ color: 'var(--muted-text)' }}
            >
              {disciplines.length} subjects available
            </p>
          </div>
        </div>
        
        {/* Expand/collapse indicator */}
        <div 
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold transition-all duration-300 group-hover:scale-110"
          style={{ 
            color: isExpanded ? 'var(--on-primary)' : 'var(--primary)',
            backgroundColor: isExpanded ? 'var(--primary)' : 'color-mix(in srgb, var(--primary) 10%, transparent)'
          }}
        >
          {isExpanded ? '−' : '+'}
        </div>
      </div>

      {/* Discipline list (when expanded) */}
      {isExpanded && (
        <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
          {disciplines.slice(0, 6).map((discipline) => (
            <div
              key={discipline.id}
              className="flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all duration-300 hover:shadow-md cursor-pointer group"
              style={{ 
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)'
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleDisciplineClick(discipline.id);
              }}
            >
              <span 
                className="font-semibold text-sm sm:text-base truncate flex-1 mr-2 sm:mr-3"
                style={{ color: 'var(--text)' }}
                title={discipline.name}
              >
                {discipline.name}
              </span>
              <span 
                className="text-xs px-2 sm:px-3 py-1 rounded-full font-medium whitespace-nowrap flex-shrink-0"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--on-primary)'
                }}
              >
                {discipline.moduleCount} modules
              </span>
            </div>
          ))}
          
          {disciplines.length > 6 && (
            <div 
              className="text-center text-xs sm:text-sm font-medium py-2 sm:py-3 px-3 sm:px-4 rounded-lg"
              style={{ 
                color: 'var(--muted-text)',
                backgroundColor: 'color-mix(in srgb, var(--border) 20%, transparent)'
              }}
            >
              +{disciplines.length - 6} more subjects
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DisciplineGrid() {
  const [expandedCategory, setExpandedCategory] = useState<string>('');
  const [disciplinesByCategory, setDisciplinesByCategory] = useState<Record<string, Discipline[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDisciplines();
  }, []);

  const loadDisciplines = async () => {
    try {
      setLoading(true);
      const data = await fetchDisciplines();
      setDisciplinesByCategory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load disciplines');
    } finally {
      setLoading(false);
    }
  };

  const categories = Object.keys(disciplinesByCategory);

  const handleCategoryExpand = (category: string) => {
    setExpandedCategory(expandedCategory === category ? '' : category);
  };

  if (loading) {
    return (
      <section id="disciplines-section" className="py-20 px-12" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 mx-auto border-2" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }}></div>
            <p className="mt-4" style={{ color: 'var(--muted-text)' }}>Loading academic disciplines...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="disciplines-section" className="py-20 px-12" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-5xl mx-auto">
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
      </section>
    );
  }

  return (
    <section id="disciplines-section" className="py-16 sm:py-20 px-4 sm:px-12" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-20">
          <h2 
            className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6"
            style={{ 
              color: 'var(--text)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            Explore Academic Disciplines
          </h2>
          <p 
            className="text-base sm:text-xl leading-relaxed max-w-4xl mx-auto"
            style={{ 
              color: 'var(--muted-text)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            From arts to engineering, discover interactive learning materials across all major academic fields
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category}
              category={category}
              disciplines={disciplinesByCategory[category] || []}
              onExpand={handleCategoryExpand}
              isExpanded={expandedCategory === category}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
