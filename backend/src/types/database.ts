// Database-specific types for PostgreSQL operations
import type { LessonData, ExerciseData, GenerationMetadata, ProblemData, VisualizationData } from '@local/shared';

export interface DatabaseModuleRow {
  id: string;
  slug: string;
  title: string;
  description?: string;
  lessons: LessonData[]; // JSONB - now properly typed
  exercises: ExerciseData[]; // JSONB - now properly typed
  tags?: string[];
  course?: Record<string, unknown>; // JSONB - keeping flexible for now
  draft: boolean;
  version: string;
  discipline?: string; // New field
  concepts?: string[];
  prerequisites?: string[];
  learning_outcomes?: string[];
  estimated_time?: number;
  source_type?: string;
  source_institution?: string;
  contributor?: string;
  original_photos?: Record<string, unknown>; // JSONB - keeping flexible for now
  generation_context?: GenerationMetadata; // JSONB - now properly typed
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseDisciplineRow {
  id: string;
  name: string;
  category: string;
  description?: string;
  module_count: number;
}

export interface DatabaseConceptRow {
  id: number;
  name: string;
  description?: string;
  discipline_id: string;
  parent_concept_id?: number;
  created_at: Date;
}

export interface DatabaseModuleConceptRow {
  module_id: string;
  concept_id: number;
}

export interface DatabaseConceptPrerequisiteRow {
  concept_id: number;
  prerequisite_concept_id: number;
}

export interface DatabaseAttemptRow {
  id: string;
  user_id: string;
  module_slug: string;
  exercise_slug: string;
  problem_data: ProblemData; // JSONB - now properly typed
  user_answer: string | boolean | string[]; // JSONB - now properly typed based on exercise type
  correct: boolean;
  feedback?: string;
  attempt_number: number;
  created_at: Date;
}

export interface DatabaseSessionRow {
  id: string;
  session_id: string;
  created_at: Date;
}

export interface DatabaseVisualizationRow {
  id: string;
  module_slug: string;
  lesson_slug: string;
  lesson_title: string;
  visualization_type: string;
  visualization_data: VisualizationData; // JSONB - now properly typed
  user_session_id: string | null;
  created_at: Date;
  updated_at: Date;
}

// Query result types
export type ModuleQueryResult = DatabaseModuleRow[];
export type DisciplineQueryResult = DatabaseDisciplineRow[];
export type AttemptQueryResult = DatabaseAttemptRow[];
export type SessionQueryResult = DatabaseSessionRow[];
export type VisualizationQueryResult = DatabaseVisualizationRow[];
export type ConceptQueryResult = DatabaseConceptRow[];
export type ModuleConceptQueryResult = DatabaseModuleConceptRow[];
export type ConceptPrerequisiteQueryResult = DatabaseConceptPrerequisiteRow[];

// Health check result
export interface HealthCheckResult {
  database: boolean;
  timestamp: Date;
}
