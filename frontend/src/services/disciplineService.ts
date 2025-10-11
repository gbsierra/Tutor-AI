import type { Discipline } from '@shared/disciplines';
import { DISCIPLINE_SEED_DATA } from '@shared/disciplines';
import type { ConceptGroup } from '@local/shared';

/**
 * Raw discipline data from API (before processing)
 */
interface DisciplineApiResponse {
  id: string;
  name: string;
  category: string;
  description: string;
  module_count: number;
}

/**
 * Frontend service for discipline-related operations
 */

// API base URL
const API_BASE = `${import.meta.env.VITE_API_BASE_URL || ''}`;

/**
 * Fetch all disciplines from the API
 */
export async function fetchDisciplines(): Promise<Record<string, Discipline[]>> {
  try {
    const response = await fetch(`${API_BASE}/api/disciplines`);

    if (!response.ok) {
      throw new Error(`Failed to fetch disciplines: ${response.status}`);
    }

    const data = await response.json();
    // Ensure moduleCount is a number and handle null/undefined values
    const processedDisciplines = Object.keys(data.disciplines || {}).reduce((acc, category) => {
      acc[category] = (data.disciplines[category] || []).map((discipline: DisciplineApiResponse) => ({
        id: discipline.id,
        name: discipline.name,
        category: discipline.category,
        description: discipline.description,
        moduleCount: typeof discipline.module_count === 'number' ? discipline.module_count : 0
      }));
      return acc;
    }, {} as Record<string, Discipline[]>);

    return processedDisciplines;
  } catch (error) {
    console.error('Error fetching disciplines:', error);
    // Fallback to seed data if API fails
    return groupDisciplinesByCategory(DISCIPLINE_SEED_DATA);
  }
}

/**
 * Fetch a specific discipline by ID
 */
export async function fetchDiscipline(id: string): Promise<Discipline | null> {
  try {
    const response = await fetch(`${API_BASE}/api/disciplines/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch discipline: ${response.status}`);
    }

    const data = await response.json();
    const discipline = data.discipline;
    if (discipline) {
      // Ensure moduleCount is a number
      discipline.moduleCount = typeof discipline.module_count === 'number' ? discipline.module_count : 0;
    }
    return discipline || null;
  } catch (error) {
    console.error('Error fetching discipline:', error);
    // Fallback to seed data
    return DISCIPLINE_SEED_DATA.find(d => d.id === id) || null;
  }
}

/**
 * Fetch modules for a specific discipline
 */
export async function fetchDisciplineModules(disciplineId: string): Promise<unknown[]> {
  try {
    console.log(`[Frontend] Fetching modules for discipline: ${disciplineId}`);
    const response = await fetch(`${API_BASE}/api/disciplines/${disciplineId}/modules`);

    if (!response.ok) {
      throw new Error(`Failed to fetch discipline modules: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Frontend] Received ${data.modules?.length || 0} modules for discipline ${disciplineId}:`, data.modules);
    return data.modules || [];
  } catch (error) {
    console.error('Error fetching discipline modules:', error);
    return [];
  }
}

/**
 * Fetch concepts for a specific discipline
 */
export async function fetchDisciplineConcepts(disciplineId: string): Promise<ConceptGroup[]> {
  try {
    console.log(`[Frontend] Fetching concepts for discipline: ${disciplineId}`);
    const response = await fetch(`${API_BASE}/api/disciplines/${disciplineId}/concepts`);

    if (!response.ok) {
      throw new Error(`Failed to fetch discipline concepts: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Frontend] Received ${data.concepts?.length || 0} concepts for discipline ${disciplineId}:`, data.concepts);
    
    // Type assertion with runtime validation
    const concepts = data.concepts || [];
    if (!Array.isArray(concepts)) {
      console.warn('Expected concepts to be an array, got:', typeof concepts);
      return [];
    }
    
    return concepts as ConceptGroup[];
  } catch (error) {
    console.error('Error fetching discipline concepts:', error);
    return [];
  }
}

/**
 * Search disciplines and modules by query
 */
export async function searchDisciplinesAndModules(query: string, limit: number = 10): Promise<{
  results: Array<{
    type: 'discipline' | 'module';
    id?: string;
    slug?: string;
    name?: string;
    title?: string;
    description?: string;
    category?: string;
    moduleCount?: number;
    discipline?: string;
    disciplineName?: string;
    disciplineCategory?: string;
  }>;
  total: number;
  query: string;
  disciplines: number;
  modules: number;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching disciplines and modules:', error);
    // Fallback to local search for disciplines only
    const lowerQuery = query.toLowerCase();
    const localResults = DISCIPLINE_SEED_DATA.filter(discipline =>
      discipline.name.toLowerCase().includes(lowerQuery) ||
      discipline.description?.toLowerCase().includes(lowerQuery) ||
      discipline.category.toLowerCase().includes(lowerQuery)
    ).slice(0, limit);
    
    return {
      results: localResults.map(d => ({
        type: 'discipline' as const,
        id: d.id,
        name: d.name,
        description: d.description,
        category: d.category,
        moduleCount: d.moduleCount
      })),
      total: localResults.length,
      query,
      disciplines: localResults.length,
      modules: 0
    };
  }
}

/**
 * Search disciplines by query (legacy function for backward compatibility)
 */
export async function searchDisciplines(query: string): Promise<Discipline[]> {
  try {
    const searchResult = await searchDisciplinesAndModules(query, 50);
    return searchResult.results
      .filter(r => r.type === 'discipline')
      .map(r => ({
        id: r.id!,
        name: r.name!,
        category: r.category!,
        description: r.description || '',
        moduleCount: r.moduleCount || 0
      }));
  } catch (error) {
    console.error('Error searching disciplines:', error);
    return [];
  }
}

/**
 * Get disciplines grouped by category
 */
export function groupDisciplinesByCategory(disciplines: Discipline[]): Record<string, Discipline[]> {
  return disciplines.reduce((acc, discipline) => {
    if (!acc[discipline.category]) {
      acc[discipline.category] = [];
    }
    acc[discipline.category].push(discipline);
    return acc;
  }, {} as Record<string, Discipline[]>);
}

/**
 * Get all unique categories
 */
export function getAllCategories(disciplines: Discipline[]): string[] {
  return [...new Set(disciplines.map(d => d.category))];
}

/**
 * Get disciplines by category
 */
export function getDisciplinesByCategory(disciplines: Discipline[], category: string): Discipline[] {
  return disciplines.filter(d => d.category === category);
}

/**
 * Sort disciplines by module count (most popular first)
 */
export function sortDisciplinesByPopularity(disciplines: Discipline[]): Discipline[] {
  return [...disciplines].sort((a, b) => b.moduleCount - a.moduleCount);
}

/**
 * Get featured disciplines (those with modules)
 */
export function getFeaturedDisciplines(disciplines: Discipline[]): Discipline[] {
  return disciplines.filter(d => d.moduleCount > 0);
}

/**
 * Format category name for display
 */
export function formatCategoryName(category: string): string {
  // Special cases for categories with '&' in the name
  const specialCases: Record<string, string> = {
    'arts-letters': 'Arts & Letters',
    'business': 'Business',
    'engineering-computer-science': 'Engineering & Computer Science',
    'health-human-services': 'Health & Human Services',
    'natural-sciences-mathematics': 'Natural Sciences & Mathematics',
    'social-sciences-interdisciplinary': 'Social Sciences & Interdisciplinary Studies',
    'education': 'Education'
  };

  if (specialCases[category]) {
    return specialCases[category];
  }

  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get category color classes for UI theming
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'arts-letters': 'bg-pink-100 text-pink-800 border-pink-200',
    'business': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'engineering-computer-science': 'bg-purple-100 text-purple-800 border-purple-200',
    'health-human-services': 'bg-red-100 text-red-800 border-red-200',
    'natural-sciences-mathematics': 'bg-green-100 text-green-800 border-green-200',
    'social-sciences-interdisciplinary-studies': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'education': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    // Legacy categories for backward compatibility
    'natural-sciences': 'bg-green-100 text-green-800 border-green-200',
    'mathematics': 'bg-blue-100 text-blue-800 border-blue-200',
    'computer-science': 'bg-purple-100 text-purple-800 border-purple-200',
    'engineering': 'bg-red-100 text-red-800 border-red-200',
    'health-sciences': 'bg-pink-100 text-pink-800 border-pink-200',
    'social-sciences': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'humanities': 'bg-indigo-100 text-indigo-800 border-indigo-200'
  };
  return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Initialize disciplines (for development/fallback)
 */
export function initializeDisciplines(): Discipline[] {
  return DISCIPLINE_SEED_DATA;
}
