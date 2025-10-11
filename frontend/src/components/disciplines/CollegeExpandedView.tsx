import { Link } from 'react-router-dom';
import type { Discipline } from '@shared/disciplines';

interface CollegeExpandedViewProps {
  category: string;
  disciplines: Discipline[];
  isExpanded: boolean;
  className?: string;
}

export default function CollegeExpandedView({
  category,
  disciplines,
  isExpanded,
  className = ''
}: CollegeExpandedViewProps) {
  const formatCategoryName = (category: string) => {
    const specialCases: Record<string, string> = {
      'arts-letters': 'Arts & Letters',
      'business': 'Business',
      'engineering-computer-science': 'Engineering & Computer Science',
      'health-human-services': 'Health & Human Services',
      'natural-sciences-mathematics': 'Natural Sciences & Mathematics',
      'social-sciences-interdisciplinary': 'Social Sciences & Interdisciplinary Studies',
      'education': 'Education'
    };
    return specialCases[category] || category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!isExpanded) return null;

  return (
    <div 
      className={`overflow-hidden transition-all duration-500 ease-in-out ${className}`}
      style={{
        maxHeight: isExpanded ? '2000px' : '0px',
        opacity: isExpanded ? 1 : 0
      }}
    >
      <div className="mt-4 sm:mt-6 mb-6 sm:mb-8">
        <div className="flex items-center mb-4 sm:mb-6">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <h3 className="text-lg sm:text-xl font-semibold" style={{ color: 'var(--text)' }}>
                {formatCategoryName(category)} Disciplines
              </h3>
              <span className="hidden sm:inline" style={{ color: 'var(--muted-text)' }}>-</span>
              <p className="text-sm sm:text-base" style={{ color: 'var(--muted-text)' }}>
                Explore {disciplines.length} discipline{disciplines.length !== 1 ? 's' : ''} within this college
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {disciplines.map((discipline, index) => (
            <div
              key={discipline.id}
              className="transform transition-all duration-300 ease-out animate-fade-in-up"
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              <Link
                to={`/disciplines/${discipline.id}`}
                className="block"
              >
                <div 
                  className="rounded-lg p-3 sm:p-4 border transition-all duration-200 group"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold transition-colors duration-200 text-sm sm:text-base truncate" style={{ color: 'var(--text)' }}>
                        {discipline.name}
                      </h4>
                      <p className="text-xs sm:text-sm mt-1 line-clamp-2" style={{ color: 'var(--muted-text)' }}>
                        {discipline.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></div>
                      <span className="text-xs" style={{ color: 'var(--muted-text)' }}>
                        {discipline.moduleCount} module{discipline.moduleCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: 'var(--primary)' }}>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
