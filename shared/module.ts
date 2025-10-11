// backend/src/schemas/module.ts
import * as z from "zod";

/** ----- Input (what we ask the LLM for) ----- */
export type TModuleBuildInput = {
  topic: string;
  audience?: string;
  goals?: string[];
  constraints?: string[];
  course?: {
    name?: string;
    week?: string | number; // LLMs sometimes give a number — we'll coerce later
  };
};

/** ----- Structured Lesson Content ----- */
const KeyConceptSpec = z.object({
  concept: z.string(),
  explanation: z.string(),
  examples: z.array(z.string()).optional(),
});

const StepByStepExampleSpec = z.object({
  title: z.string(),
  problem: z.string(),
  solution: z.string(),
  explanation: z.string(),
});

// YouTube Video specification (for API responses)
const YouTubeVideoSpec = z.object({
  videoId: z.string(), // YouTube video ID (e.g., "dQw4w9WgXcQ")
  title: z.string(),
  description: z.string().optional(),
  channelName: z.string().optional(),
  startTime: z.number().optional(), // Start time in seconds
  endTime: z.number().optional(), // End time in seconds
  thumbnail: z.string().optional(), // YouTube thumbnail URL
});

const StructuredLessonContentSpec = z.object({
  introduction: z.string(),
  keyConcepts: z.array(KeyConceptSpec),
  stepByStepExamples: z.array(StepByStepExampleSpec).optional(),
  realWorldApplications: z.array(z.string()).optional().default([]),
  commonPitfalls: z.array(z.string()).optional().default([]),
  summary: z.string(),
});

/** ----- Lessons ----- */
const LessonSpec = z.object({
  slug: z.string(),
  title: z.string(),
  contentMd: z.string().default(""), // Keep for backward compatibility
  structuredContent: StructuredLessonContentSpec.optional(), // New structured content
  youtubeSearchQuery: z.string().optional(), // YouTube search query for video discovery
  youtubeVideo: YouTubeVideoSpec.optional(), // YouTube video data (attached after search)
});

/** ----- Exercises ----- */
const ExerciseUISpec = z
  .object({
    expectedFormat: z.union([z.string(), z.null()]).optional().transform(val => val === null ? undefined : val),
    placeholder: z.union([z.string(), z.null()]).optional().transform(val => val === null ? undefined : val),
    katex: z.union([z.boolean(), z.null()]).optional().transform(val => val === null ? undefined : val),
  })
  .partial()
  .optional()
  .nullable()
  .transform((val) => {
    // Transform null values to undefined for the entire object
    if (val === null) return undefined;
    if (val && typeof val === 'object') {
      const transformed: any = {};
      if (val.expectedFormat !== undefined) transformed.expectedFormat = val.expectedFormat;
      if (val.placeholder !== undefined) transformed.placeholder = val.placeholder;
      if (val.katex !== undefined) transformed.katex = val.katex;
      return Object.keys(transformed).length > 0 ? transformed : undefined;
    }
    return val;
  });

const VarsSchema = z.object({}).catchall(z.any()).default({});

const ExerciseParamsSpec = z.object({
  promptTemplate: z.string(),
  gradingRubric: z.string(),
  formatHints: z.string().optional().nullable(),
  vars: VarsSchema,
});

const ExerciseChoiceSpec = z.object({
  id: z.string(),
  label: z.string(),
  text: z.string(),
});

// NEW: Fill-in-the-blank specification
const FillBlankSpec = z.object({
  id: z.string(),           // "blank-1", "blank-2", etc.
  label: z.string(),        // "_____" or custom placeholder
  position: z.number(),     // Index in the sentence
  expectedAnswer: z.string(), // Correct answer for this blank
  caseSensitive: z.boolean().default(false),
  hints: z.array(z.string()).optional(),
  alternatives: z.array(z.string()).optional(), // Acceptable variations
});

// NEW: Matching pair specification
const MatchingPairSpec = z.object({
  id: z.string(),
  leftItem: z.string(),      // Left column item
  rightItem: z.string(),     // Right column item
  category: z.string().optional().nullable(), // Optional grouping
});

// NEW: True/False configuration
const TrueFalseConfigSpec = z.object({
  explanationPrompt: z.string().optional(),
});

// NEW: Ordering item specification
const OrderingItemSpec = z.object({
  id: z.string(),
  text: z.string(),
  correctPosition: z.number(),
  category: z.string().optional().nullable(),
});

const ExerciseSpec = z.object({
  slug: z.string(),
  title: z.string(),
  kind: z.enum([
    "multiple-choice", 
    "free-response", 
    "fill-in-the-blank",  // NEW
    "matching",           // NEW
    "true-false",         // NEW
    "ordering"            // NEW
  ]),
  engine: z.string(), // should be "llm"
  params: ExerciseParamsSpec,
  ui: ExerciseUISpec,
  hints: z.array(z.string()).optional(),
  choices: z.array(ExerciseChoiceSpec).optional(), // ONLY for multiple-choice
  
  // NEW: Exercise-type-specific fields (all optional)
  blanks: z.array(FillBlankSpec).optional(), // Only for fill-in-the-blank
  matchingPairs: z.array(MatchingPairSpec).optional(), // Only for matching
  trueFalseConfig: TrueFalseConfigSpec.optional(), // Only for true-false
  orderingItems: z.array(OrderingItemSpec).optional(), // Only for ordering
});

/** ----- Course meta (coerce week to string) ----- */
const CourseMeta = z
  .object({
    name: z.string().optional(),
    week: z.union([z.string(), z.number()]).optional(),
  })
  .transform((c: any) =>
    c.week === undefined ? c : { ...c, week: String(c.week) }
  );

/** ----- Discipline Selection ----- */
export const DisciplineSelectionSchema = z.object({
  selectedDisciplineId: z.string(),
  confidence: z.number(),
  reasoning: z.string(),
});

export type TDisciplineSelection = z.infer<typeof DisciplineSelectionSchema>;

/** ----- Module Spec ----- */
export const ModuleSpec = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  unlocked: z.boolean().optional().default(true),
  tags: z.array(z.string()).optional(),
  course: CourseMeta.optional().nullable(),
  discipline: z.string().optional(), // New field: links to discipline.id
  disciplineSelection: DisciplineSelectionSchema.optional(), // New field: discipline selection info
  concepts: z.array(z.string()).optional().default([]), // Key concepts covered
  prerequisites: z.array(z.string()).optional().default([]), // Concept names or module IDs required
  learningOutcomes: z.array(z.string()).optional().default([]), // What students will learn
  estimatedTime: z.number().optional(), // Minutes to complete
  source: z.object({
    type: z.enum(['course-material', 'user-upload']).optional().default('user-upload'),
    institution: z.string().optional(),
    contributor: z.string().optional(),
  }).optional().default({ type: 'user-upload' }),
  originalPhotos: z.array(z.object({
    id: z.string(),
    photoUrl: z.string(),
    filename: z.string(),
    size: z.number(),
    uploadedAt: z.string(),
  })).optional(),
  consolidation: z.object({
    action: z.enum(['create-new', 'append-to']).optional().default('create-new'),
    targetModuleSlug: z.string().nullable().optional(),
    reason: z.string().optional(),
  }).optional().default({ action: 'create-new' }),
  lessons: z.array(LessonSpec).optional().default([]),
  exercises: z.array(ExerciseSpec).default([]),
  draft: z.boolean().optional().default(true),
  version: z.string().optional().default("v1"),
});

/** ----- Generation Context ----- */
export const GenerationContextSchema = z.object({
  topic: z.string(),
  audience: z.string().optional(),
  goals: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  imageCount: z.number(),
  temperature: z.number(),
  model: z.string(),
  createdAt: z.string(),
});

export type TGenerationContext = z.infer<typeof GenerationContextSchema>;

/** ----- Module Build Response ----- */
export const ModuleBuildResponseSchema = z.object({
  module: ModuleSpec,
  generationContext: GenerationContextSchema.nullable(),
});

export type TModuleBuildResponse = z.infer<typeof ModuleBuildResponseSchema>;

export type TLessonSpec = z.infer<typeof LessonSpec>;
export type TExerciseSpec = z.infer<typeof ExerciseSpec>;
export type TModuleSpec = z.infer<typeof ModuleSpec>;

// NEW: Export structured lesson content types
export type TKeyConceptSpec = z.infer<typeof KeyConceptSpec>;
export type TStepByStepExampleSpec = z.infer<typeof StepByStepExampleSpec>;
export type TStructuredLessonContentSpec = z.infer<typeof StructuredLessonContentSpec>;
export type TYouTubeVideoSpec = z.infer<typeof YouTubeVideoSpec>;

// NEW: Export new exercise type schemas
export type TFillBlankSpec = z.infer<typeof FillBlankSpec>;
export type TMatchingPairSpec = z.infer<typeof MatchingPairSpec>;
export type TTrueFalseConfigSpec = z.infer<typeof TrueFalseConfigSpec>;
export type TOrderingItemSpec = z.infer<typeof OrderingItemSpec>;
