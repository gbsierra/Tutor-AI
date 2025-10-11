// backend/src/schemas/problem.ts
import { z } from "zod";

/**
 * Provider-neutral schemas for LLM-driven exercise generation & grading.
 * These are input-agnostic and work with any module draft.
 */

// Optional high-level context you may pass from a module
export const ModuleContextSchema = z.object({
  slug: z.string().optional(),
  title: z.string().optional(),
  lessons: z.array(
    z.object({
      title: z.string().optional(),
      contentMd: z.string().optional(),
    })
  ).optional(),
}).partial();

export type ModuleContext = z.infer<typeof ModuleContextSchema>;

// ---- Exercise / Problem spec coming from a module draft ----
export const ExerciseSpecSchema = z.object({
  kind: z.string().min(1),                 // e.g., "multiple-choice", "free-response"
  engine: z.string().min(1),               // should be "llm" (generic)
  params: z.object({
    /**
     * Prompt the LLM should follow to create a problem instance.
     * Keep this generic & module-agnostic; include any variables in `vars`.
     */
    promptTemplate: z.string().min(1),

    /**
     * A canonical rubric/solution description the LLM must use when grading.
     * You can also embed solution keys the generator will produce into engineState.
     */
    gradingRubric: z.string().min(1),

    /**
     * Optional JSON schema hints for the LLM (natural language).
     * This lets exercise authors steer formats without changing code.
     */
    formatHints: z.string().optional(),

    /**
     * Variables the prompt can interpolate (e.g., difficulty, topic, seed).
     */
    vars: z.record(z.string(), z.unknown()).default({}),
  }),
  seed: z.number().int().optional(),
  difficulty: z.enum(["intro", "easy", "medium", "hard"]).optional(),
  title: z.string().optional(),
  slug: z.string().optional(),
});
export type ExerciseSpec = z.infer<typeof ExerciseSpecSchema>;

// ---- Renderable problem instance (LLM output, validated) ----
export const ChoiceSchema = z.object({
  id: z.string(),         // stable per-instance (router can backfill UUIDs)
  label: z.string(),      // "A", "B", ...
  text: z.string(),
});
export type Choice = z.infer<typeof ChoiceSchema>;

export const RenderBlockSchema = z.union([
  z.object({ type: z.literal("md"), value: z.string() }),
  z.object({ type: z.literal("text"), value: z.string() }),
  z.object({ type: z.literal("formula"), value: z.string() }),
]);
export type RenderBlock = z.infer<typeof RenderBlockSchema>;

// NEW: Fill-in-the-blank instance schema
export const FillBlankInstanceSchema = z.object({
  id: z.string(),
  label: z.string(),
  position: z.number(),
  userAnswer: z.string().optional(), // Filled at runtime
  isCorrect: z.boolean().optional(), // Graded at runtime
  feedback: z.string().optional(),
  hints: z.array(z.string()).optional(), // NEW: Add hints field to match module schema
});
export type FillBlankInstance = z.infer<typeof FillBlankInstanceSchema>;

// NEW: Matching pair instance schema
export const MatchingPairInstanceSchema = z.object({
  id: z.string(),
  leftItem: z.string(),
  rightItem: z.string(),
  category: z.string().optional(),
  userMatch: z.string().optional(), // ID of matched right item
  isCorrect: z.boolean().optional(),
});
export type MatchingPairInstance = z.infer<typeof MatchingPairInstanceSchema>;

// NEW: True/False instance schema
export const TrueFalseInstanceSchema = z.object({
  statement: z.string(),
  correctAnswer: z.boolean(),
  userAnswer: z.boolean().optional(),
  explanation: z.string().optional(),
  isCorrect: z.boolean().optional(),
});
export type TrueFalseInstance = z.infer<typeof TrueFalseInstanceSchema>;

// NEW: Ordering item instance schema
export const OrderingItemInstanceSchema = z.object({
  id: z.string(),
  text: z.string(),
  correctPosition: z.number(),
  userPosition: z.number().optional(),
  isCorrect: z.boolean().optional(),
});
export type OrderingItemInstance = z.infer<typeof OrderingItemInstanceSchema>;

export const ProblemInstanceSchema = z.object({
  id: z.string(),
  engine: z.string(),
  kind: z.string(),
  stem: z.array(RenderBlockSchema).min(1),
  choices: z.array(ChoiceSchema).optional(),   // MC if present
  
  // NEW: Exercise-type-specific fields (all optional)
  blanks: z.array(FillBlankInstanceSchema).optional(), // For fill-in-the-blank
  matchingPairs: z.array(MatchingPairInstanceSchema).optional(), // For matching
  trueFalseData: TrueFalseInstanceSchema.optional(), // For true-false
  orderingItems: z.array(OrderingItemInstanceSchema).optional(), // For ordering
  
  // Opaque, engine-specific state (e.g., canonical answer, randomization)
  engineState: z.union([
    z.record(z.string(), z.unknown()),
    z.string()
  ]).default({}),
  hints: z.array(RenderBlockSchema).optional(),
  // UI hints for rendering the problem
  ui: z.object({
    expectedFormat: z.string().optional(),
    placeholder: z.string().optional(),
    katex: z.boolean().optional(),
  }).optional(),
});
export type ProblemInstance = z.infer<typeof ProblemInstanceSchema>;

// ---- Submissions from the client ----
export const SubmissionSchema = z.object({
  answer: z.union([
    z.string(), 
    z.number(), 
    z.boolean(), 
    z.array(z.string()), 
    z.record(z.string(), z.string()),
    z.record(z.string(), z.unknown()) // For true/false: { answer: boolean, explanation: string }
  ]),
  raw: z.unknown().optional(),
});
export type Submission = z.infer<typeof SubmissionSchema>;

// ---- Grade results returned to the client ----
export const GradeResultSchema = z.object({
  correct: z.boolean(),
  feedback: z.string().optional(),
  expected: z.unknown().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});
export type GradeResult = z.infer<typeof GradeResultSchema>;

// ---- Request/Response envelopes ----
export const GenerateRequestSchema = z.object({
  exercise: ExerciseSpecSchema,
  module: ModuleContextSchema.optional(),   // optional extra context for the LLM
});
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

export const GenerateResponseSchema = z.object({
  problem: ProblemInstanceSchema,
});
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;

export const GradeRequestSchema = z.object({
  // always "llm" in this design; kept for forward compatibility
  engine: z.string(),
  problem: ProblemInstanceSchema,
  submission: SubmissionSchema,
  // pass the original spec so the LLM can use the same rubric
  exercise: ExerciseSpecSchema.optional(),
  module: ModuleContextSchema.optional(),
});
export type GradeRequest = z.infer<typeof GradeRequestSchema>;

export const GradeResponseSchema = GradeResultSchema;
export type GradeResponse = z.infer<typeof GradeResponseSchema>;

// ---- Review data for displaying user progress ----
export const UserAttemptSchema = z.object({
  timestamp: z.date(),
  correct: z.boolean(),
  userAnswer: z.unknown(),
  feedback: z.string().optional(),
});

export const ExerciseReviewDataSchema = z.object({
  title: z.string(),
  attempts: z.number(),
  correct: z.number(),
  accuracy: z.number(),
  lastAttempt: z.date().nullable(),
  recentAttempts: z.array(UserAttemptSchema),
});

export const ModuleReviewDataSchema = z.object({
  moduleSlug: z.string(),
  moduleTitle: z.string(),
  exercises: z.record(z.string(), ExerciseReviewDataSchema),
  totalModuleAttempts: z.number(),
  overallModuleAccuracy: z.number(),
});

export type UserAttempt = z.infer<typeof UserAttemptSchema>;
export type ExerciseReviewData = z.infer<typeof ExerciseReviewDataSchema>;
export type ModuleReviewData = z.infer<typeof ModuleReviewDataSchema>;
