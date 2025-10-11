import type { Discipline } from '@shared/disciplines';
import { formatCategoryName, getCategoryColor } from '../../services/disciplineService';

interface DisciplineCardProps {
  discipline: Discipline;
  onClick?: () => void;
  showModuleCount?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export default function DisciplineCard({
  discipline,
  onClick,
  showModuleCount = true,
  variant = 'default',
  className = ''
}: DisciplineCardProps) {

  const cardClasses = {
    default: 'p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow',
    compact: 'p-3 sm:p-4 rounded-md hover:shadow-sm transition-shadow',
    featured: 'p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all'
  };

  const titleClasses = {
    default: 'text-base sm:text-lg font-semibold mb-2',
    compact: 'text-sm sm:text-base font-medium mb-1',
    featured: 'text-lg sm:text-xl font-bold mb-3'
  };

  const descriptionClasses = {
    default: 'text-xs sm:text-sm leading-relaxed mb-4',
    compact: 'text-xs leading-relaxed mb-2',
    featured: 'text-sm sm:text-base leading-relaxed mb-6'
  };

  return (
    <div
      className={`${cardClasses[variant]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={{
        backgroundColor: variant === 'featured' ? 'var(--surface)' : 'var(--surface)',
        border: variant === 'featured' ? '2px solid var(--warn)' : '1px solid var(--border)'
      }}
    >
      {/* Category badge */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(discipline.category)}`}>
          {formatCategoryName(discipline.category)}
        </span>
        {showModuleCount && (
          <span className="text-xs sm:text-sm" style={{ color: 'var(--muted-text)' }}>
            {discipline.moduleCount} modules
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className={titleClasses[variant]} style={{ color: 'var(--text)' }}>
        {discipline.name}
      </h3>

      {/* Description */}
      {discipline.description && (
        <p className={descriptionClasses[variant]} style={{ color: 'var(--muted-text)' }}>
          {variant === 'compact'
            ? discipline.description.length > 80
              ? `${discipline.description.substring(0, 80)}...`
              : discipline.description
            : discipline.description
          }
        </p>
      )}

      {/* Action indicator */}
      {onClick && (
        <div className="flex items-center text-xs sm:text-sm font-medium mt-auto" style={{ color: 'var(--primary)' }}>
          <span>Explore modules</span>
          <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}

      {/* Featured variant extra elements */}
      {variant === 'featured' && (
        <div className="mt-3 sm:mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--ok)' }}></div>
            <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--ok)' }}>Active</span>
          </div>
          <div className="text-xs sm:text-sm" style={{ color: 'var(--muted-text)' }}>
            Popular choice
          </div>
        </div>
      )}
    </div>
  );
}
