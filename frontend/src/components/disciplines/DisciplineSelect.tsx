import { useState } from 'react';
import type { Discipline } from '@shared/disciplines';
import { DISCIPLINE_SEED_DATA } from '@shared/disciplines';
import { formatCategoryName } from '../../services/disciplineService';

interface DisciplineSelectProps {
  selectedDiscipline?: string;
  onDisciplineChange: (disciplineId: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function DisciplineSelect({
  selectedDiscipline,
  onDisciplineChange,
  placeholder = "Select a discipline...",
  required = false,
  className = ""
}: DisciplineSelectProps) {
  const [disciplines] = useState<Discipline[]>(DISCIPLINE_SEED_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Group disciplines by category
  const groupedDisciplines = disciplines.reduce((acc, discipline) => {
    if (!acc[discipline.category]) {
      acc[discipline.category] = [];
    }
    acc[discipline.category].push(discipline);
    return acc;
  }, {} as Record<string, Discipline[]>);

  // Filter disciplines based on search
  const filteredGroupedDisciplines = Object.entries(groupedDisciplines).reduce((acc, [category, categoryDisciplines]) => {
    const filtered = categoryDisciplines.filter(discipline =>
      discipline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discipline.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered.length > 0) {
      acc[category] = filtered;
    }

    return acc;
  }, {} as Record<string, Discipline[]>);

  const selectedDisciplineData = disciplines.find(d => d.id === selectedDiscipline);

  const handleSelect = (disciplineId: string) => {
    onDisciplineChange(disciplineId);
    setIsOpen(false);
    setSearchTerm('');
  };



  return (
    <div className={`relative ${className}`}>
      {/* Selected value display */}
      <div
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedDisciplineData ? 'text-gray-900' : 'text-gray-500'}>
          {selectedDisciplineData ? selectedDisciplineData.name : placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search disciplines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Discipline options */}
          <div className="py-1">
            {Object.entries(filteredGroupedDisciplines).map(([category, categoryDisciplines]) => (
              <div key={category}>
                {/* Category header */}
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  {formatCategoryName(category)}
                </div>

                {/* Discipline options */}
                {categoryDisciplines.map((discipline) => (
                  <div
                    key={discipline.id}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                      selectedDiscipline === discipline.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                    onClick={() => handleSelect(discipline.id)}
                  >
                    <div className="font-medium">{discipline.name}</div>
                    {discipline.description && (
                      <div className="text-sm text-gray-500 truncate">
                        {discipline.description}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {discipline.moduleCount} modules
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {Object.keys(filteredGroupedDisciplines).length === 0 && (
              <div className="px-3 py-4 text-center text-gray-500">
                No disciplines found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden select for form validation */}
      {required && (
        <select
          required
          value={selectedDiscipline || ''}
          onChange={(e) => onDisciplineChange(e.target.value)}
          className="sr-only"
        >
          <option value="" disabled></option>
          {disciplines.map(discipline => (
            <option key={discipline.id} value={discipline.id}>
              {discipline.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
