// Common types shared between frontend and backend

/**
 * Local image interface for file uploads and processing
 */
export interface LocalImage {
  file: File;
  convertedFile: Blob; // Always present after successful processing
  mimeType: string;
  previewUrl: string;
  base64: string; // Always present after successful processing
}

/**
 * Recent exercise tracking interface
 */
export interface RecentExercise {
  moduleSlug: string;
  exerciseSlug: string;
  exerciseTitle: string;
  lastVisited: string; // ISO date string from API
}

/**
 * Module metadata for configuration
 */
export type ModuleMeta = {
  slug: string;
  title: string;
  unlocked: boolean;
  comingSoon?: boolean;
};

/**
 * Recent module interface for landing page carousel
 */
export interface RecentModule {
  slug: string;
  title: string;
  description: string | null;
  discipline: string | null;
  disciplineName: string | null;
  disciplineCategory: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Recent modules API response
 */
export interface RecentModulesResponse {
  modules: RecentModule[];
}

/**
 * Recent photo interface for landing page carousel
 */
export interface RecentPhoto {
  id: string;
  url: string;
  filename: string;
  moduleTitle: string | null;
  discipline: string | null;
  disciplineName: string | null;
  uploadedBy: string | null;
  uploadedAt: string; // ISO date string
}

/**
 * Recent photos API response
 */
export interface RecentPhotosResponse {
  photos: RecentPhoto[];
}

// ============================================================================
// Database JSONB Field Types (based on actual data inspection)
// ============================================================================

/**
 * YouTube video information for lessons
 */
export interface YouTubeVideo {
  title: string;
  videoId: string;
  thumbnail: string;
  channelName: string;
  description: string;
}

/**
 * Key concept within structured content
 */
export interface KeyConcept {
  concept: string;
  examples: string[];
  explanation: string;
}

/**
 * Step-by-step example within structured content
 */
export interface StepByStepExample {
  title: string;
  problem: string;
  solution: string;
  explanation: string;
}

/**
 * Structured content for lessons
 */
export interface StructuredContent {
  summary: string;
  keyConcepts: KeyConcept[];
  introduction: string;
  commonPitfalls: string[];
  stepByStepExamples: StepByStepExample[];
  realWorldApplications: string[];
}

/**
 * Lesson data structure (from modules.lessons JSONB)
 */
export interface LessonData {
  slug: string;
  title: string;
  contentMd: string;
  youtubeVideo: YouTubeVideo;
  structuredContent: StructuredContent;
  youtubeSearchQuery: string;
}

/**
 * Exercise choice for multiple choice questions
 */
export interface ExerciseChoice {
  id: string;
  text: string;
  label: string;
}

/**
 * Matching pair for matching exercises
 */
export interface MatchingPair {
  id: string;
  leftItem: string;
  rightItem: string;
}

/**
 * Ordering item for ordering exercises
 */
export interface OrderingItem {
  id: string;
  text: string;
  correctPosition: number;
}

/**
 * True/false configuration
 */
export interface TrueFalseConfig {
  explanationPrompt: string;
}

/**
 * UI configuration for exercises
 */
export interface ExerciseUI {
  placeholder?: string;
  katex?: boolean;
}

/**
 * Exercise parameters
 */
export interface ExerciseParams {
  vars: Record<string, unknown>;
  gradingRubric: string;
  promptTemplate: string;
}

/**
 * Exercise data structure (from modules.exercises JSONB)
 */
export interface ExerciseData {
  kind: 'multiple-choice' | 'free-response' | 'fill-in-the-blank' | 'matching' | 'true-false' | 'ordering';
  slug: string;
  title: string;
  engine: 'llm';
  params: ExerciseParams;
  ui?: ExerciseUI;
  choices?: ExerciseChoice[];
  matchingPairs?: MatchingPair[];
  orderingItems?: OrderingItem[];
  trueFalseConfig?: TrueFalseConfig;
}

/**
 * Generation metadata stored in database (from modules.generation_context JSONB)
 * This is different from TGenerationContext which is used for input
 */
export interface GenerationMetadata {
  goals: string[];
  userId: string;
  createdAt: string;
  imageCount: number;
  constraints: string[];
  temperature: number;
}

/**
 * Problem stem item
 */
export interface ProblemStemItem {
  type: 'md';
  value: string;
}

/**
 * Problem hint item
 */
export interface ProblemHintItem {
  type: 'md';
  value: string;
}

/**
 * Problem data structure (from user_attempts.problem_data JSONB)
 */
export interface ProblemData {
  id: string;
  kind: string;
  stem: ProblemStemItem[];
  hints: ProblemHintItem[];
  engine: 'llm';
  engineState: Record<string, unknown>;
  orderingItems?: OrderingItem[];
}

/**
 * Visualization configuration
 */
export interface VisualizationConfig {
  width: number;
  height: number;
  margin: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
}

/**
 * Visualization node for hierarchical data
 */
export interface VisualizationNode {
  name: string;
  children?: VisualizationNode[];
}

/**
 * Visualization data structure (from lesson_visualizations.visualization_data JSONB)
 */
export interface VisualizationData {
  data: VisualizationNode;
  d3Module: string;
  explanation: string;
  configuration: VisualizationConfig;
  selectedCapability: string;
  interactiveParameters: unknown[];
}