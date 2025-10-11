import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { Discipline } from '@shared/disciplines';

interface CollegeCardProps {
  category: string;
  disciplines: Discipline[];
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
}

export default function CollegeCard({
  category,
  disciplines,
  isExpanded,
  onToggle,
  className = ''
}: CollegeCardProps) {
  const totalModules = disciplines.reduce((sum, d) => sum + d.moduleCount, 0);

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

  return (
    <div className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <div
        className="cursor-pointer p-4 sm:p-6 rounded-xl border-2 transition-all duration-200"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text)'
        }}
        onClick={onToggle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg)';
          e.currentTarget.style.borderColor = 'var(--primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--surface)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold mb-1 truncate" style={{ color: 'var(--text)' }}>
              {formatCategoryName(category)}
            </h3>
            <p className="text-sm sm:text-base" style={{ color: 'var(--muted-text)' }}>
              {disciplines.length} discipline{disciplines.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text)' }}>{totalModules}</div>
              <div className="text-xs sm:text-sm" style={{ color: 'var(--muted-text)' }}>modules</div>
            </div>
            <div className="ml-1 sm:ml-2">
              {isExpanded ? (
                <ChevronDownIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200" style={{ color: 'var(--muted-text)' }} />
              ) : (
                <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200" style={{ color: 'var(--muted-text)' }} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
