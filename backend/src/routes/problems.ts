// backend/src/routes/problems.ts
import express, { type Request, type Response } from "express";
import { randomUUID } from "crypto";
import { z } from "zod";
import { authenticateUser } from "../middleware/auth.js";

import type {
  GenerateRequest,
  ExerciseSpec,
  ProblemInstance,
  Submission,
  GradeResult,
} from "@local/shared";
import {
  GenerateRequestSchema,
  GenerateResponseSchema,
  GradeRequestSchema,
  GradeResponseSchema,
  ProblemInstanceSchema,
  RenderBlockSchema,
} from "@local/shared";

// Import database services for progress tracking
import { ProblemService } from "../services/problemService.js";
import { DatabaseService } from "../services/database.js";
import { 
  buildProblemGenerationSystemPrompt, 
  buildProblemGenerationUserPrompt,
  buildGradingSystemPrompt,
  buildGradingUserPrompt
} from "../services/llm/prompts.js";

// Initialize database and services
const db = new DatabaseService();
const problemService = new ProblemService(db);

/**
 * LLM-driven, schema-validated problem generation & grading.
 * - No hardcoded problem content.
 * - We accept a loose "draft" shape from the LLM, normalize it, then validate strictly.
 */

// ---------- LLM wrapper (lazy import + export-shape adapter) ----------
type LlmClient = {
  json<T>(
    schema: z.ZodTypeAny,
    args: { system?: string; user: string }
  ): Promise<T>;
};

let _llmPromise: Promise<LlmClient> | null = null;
async function getLlm(): Promise<LlmClient> {
  if (_llmPromise) return _llmPromise;
  _llmPromise = (async () => {
    const mod: any = await import("../services/llm/index.js").catch((e) => {
      console.error("[problems] failed to import services/llm/index.js:", e);
      throw e;
    });

    const candidate = mod?.default ?? mod?.client ?? mod;

    if (typeof candidate?.json === "function") {
      return candidate as LlmClient;
    }
    if (typeof candidate?.structured === "function") {
      return { json: (schema, args) => candidate.structured(schema, args) };
    }
    if (typeof candidate?.callJson === "function") {
      return { json: (schema, args) => candidate.callJson(schema, args) };
    }

    throw new Error(
      "LLM service missing a compatible `json()` (or `structured`/`callJson`) method."
    );
  })();
  return _llmPromise;
}

// ---------- Loose draft + normalizers ----------
/**
 * The LLM may return blocks as strings, or objects with {type:"text"|"markdown"|"latex", value|text|content: string}.
 * We'll accept a *loose* draft and normalize to { type: "md" | "formula", value: string }.
 */
const LooseBlockSchema = z.union([
  z.string(),
  z
    .object({
      type: z.string().optional(),
      value: z.unknown().optional(),
      text: z.unknown().optional(),
      content: z.unknown().optional(),
    })
    .passthrough(),
]);

const ProblemDraftSchema = z.object({
  id: z.string().optional(),
  engine: z.string().optional(),
  kind: z.string().optional(),
  // NOTE: accept loose blocks here; we'll normalize before final validation
  stem: z.array(LooseBlockSchema).min(1),
  choices: z
    .array(
      z.object({
        id: z.string().optional(),
        label: z.string().optional(),
        text: z.string(),
      })
    )
    .optional(),
  // NEW: Add blanks field for fill-in-the-blank exercises
  blanks: z
    .array(
      z.object({
        id: z.string().optional(),
        label: z.string().optional(),
        position: z.number().optional(),
        userAnswer: z.string().optional(),
        isCorrect: z.boolean().optional(),
        feedback: z.string().optional(),
        hints: z.array(z.string()).optional(),
      })
    )
    .optional(),
  // NEW: Add matchingPairs field for matching exercises
  matchingPairs: z
    .array(
      z.object({
        id: z.string().optional(),
        leftItem: z.string().optional(),
        rightItem: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .optional(),
  // NEW: Add trueFalseData field for true-false exercises
  trueFalseData: z
    .object({
      statement: z.string().optional(),
      correctAnswer: z.boolean().optional(),
      explanation: z.string().optional(),
    })
    .optional(),
  // NEW: Add orderingItems field for ordering exercises
  orderingItems: z
    .array(
      z.object({
        id: z.string().optional(),
        text: z.string().optional(),
        correctPosition: z.number().optional(),
        category: z.string().optional(),
      })
    )
    .optional(),
  engineState: z.record(z.string(), z.unknown()).optional(),
  // optional loose hints
  hints: z.array(LooseBlockSchema).optional(),
});
type ProblemDraft = z.infer<typeof ProblemDraftSchema>;

// With exactOptionalPropertyTypes on, allow undefined explicitly in draft input
type ChoiceDraft = { id?: string | undefined; label?: string | undefined; text: string };

function normalizeChoices(choices: ReadonlyArray<ChoiceDraft>) {
  const alpha = (i: number) => String.fromCharCode(65 + i);
  return choices.map((c, i) => ({
    id: typeof c.id === "string" ? c.id : randomUUID(),
    label: typeof c.label === "string" ? c.label : alpha(i),
    text: c.text,
  }));
}

// NEW: Normalize blanks for fill-in-the-blank exercises
function normalizeBlanks(blanks: ReadonlyArray<any>) {
  return blanks.map((b, i) => ({
    id: typeof b.id === "string" ? b.id : `blank-${i + 1}`,
    label: typeof b.label === "string" ? b.label : "_____",
    position: typeof b.position === "number" ? b.position : i,
    userAnswer: b.userAnswer || "",
    isCorrect: b.isCorrect || false,
    feedback: b.feedback || "",
    hints: Array.isArray(b.hints) ? b.hints : [],
  }));
}

// NEW: Normalize matching pairs for matching exercises
function normalizeMatchingPairs(pairs: ReadonlyArray<any>) {
  return pairs.map((p, i) => ({
    id: typeof p.id === "string" ? p.id : `pair-${i + 1}`,
    leftItem: typeof p.leftItem === "string" ? p.leftItem : p.left || "",
    rightItem: typeof p.rightItem === "string" ? p.rightItem : p.right || "",
    category: typeof p.category === "string" ? p.category : undefined,
  }));
}

// NEW: Normalize true/false data for true-false exercises
function normalizeTrueFalseData(data: any) {
  return {
    statement: typeof data.statement === "string" ? data.statement : "",
    correctAnswer: typeof data.correctAnswer === "boolean" ? data.correctAnswer : false,
    explanation: typeof data.explanation === "string" ? data.explanation : "",
  };
}

// NEW: Normalize ordering items for ordering exercises
function normalizeOrderingItems(items: ReadonlyArray<any>) {
  return items.map((item, i) => ({
    id: typeof item.id === "string" ? item.id : `item-${i + 1}`,
    text: typeof item.text === "string" ? item.text : "",
    correctPosition: typeof item.correctPosition === "number" ? item.correctPosition : i,
    category: typeof item.category === "string" ? item.category : undefined,
  }));
}

type CanonBlock = { type: "md" | "formula"; value: string };

function coerceBlock(b: unknown): CanonBlock | null {
  if (b == null) return null;

  // Allow primitive string as a markdown block
  if (typeof b === "string") return { type: "md", value: b };

  if (typeof b === "object") {
    const obj = b as Record<string, unknown>;
    const rawType = typeof obj.type === "string" ? obj.type.toLowerCase() : "md";
    const rawVal = obj.value ?? obj.text ?? obj.content;

    const type: "md" | "formula" =
      rawType === "latex" || rawType === "formula" ? "formula" : "md"; // treat "text"/"markdown" as "md"

    if (typeof rawVal !== "string") return null;
    return { type, value: rawVal };
  }

  return null;
}

function coerceBlocks(arr: unknown): CanonBlock[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(coerceBlock).filter(Boolean) as CanonBlock[];
}

// ---------- Prompt builders ----------
function buildGenerationUserPrompt(spec: ExerciseSpec, moduleCtx?: unknown, generationCtx?: import("../../../shared/module").TGenerationContext, lessonContext?: any) {
  console.log("🔧 [buildGenerationUserPrompt] Called with generationCtx:", !!generationCtx, "lessonContext:", !!lessonContext);

  // Require generation context for meaningful problem variation
  if (!generationCtx) {
    console.log("🔧 [buildGenerationUserPrompt] ERROR: No generation context provided!");
    throw new Error("Generation context is required for creating contextual problems. This module may have been created before context capture was implemented.");
  }

  console.log("🔧 [buildGenerationUserPrompt] Generation context:", generationCtx);
  console.log("🔧 [buildGenerationUserPrompt] Lesson context:", lessonContext);

  return buildProblemGenerationUserPrompt(spec, moduleCtx, generationCtx, lessonContext);
}

function buildGradingUserPromptLocal(
  problem: ProblemInstance,
  submission: Submission,
  spec?: ExerciseSpec,
  moduleCtx?: unknown
) {
  return buildGradingUserPrompt(problem, submission, spec, moduleCtx);
}

export const problemsRouter = express.Router();

// TEMP sanity route (remove later if desired)
problemsRouter.get("/ping", (_req: Request, res: Response) => res.json({ ok: true }));

/**
 * POST /api/problems/generate
 * Body: { exercise, module? }
 * Resp: { problem }
 */
problemsRouter.post("/generate", async (req: Request, res: Response) => {
  try {
    console.log("🔧 API /generate called with body:", req.body);

    const parsed: GenerateRequest = GenerateRequestSchema.parse(req.body);
    const { exercise, module } = parsed;

    console.log("🔧 Parsed request - exercise:", exercise.slug, "module:", module?.slug);

    // Retrieve generation context, lesson context, and problem history for better problem variation
    let generationContext = undefined;
    let lessonContext = undefined;
    let problemHistory = undefined;
    if (module?.slug) {
      console.log("🔧 Looking for generation context for module:", module.slug);
      try {
        const { ModuleService } = await import("../services/moduleService.js");
        const moduleService = new ModuleService(db);

        // First check if module exists
        const existingModule = await moduleService.getModuleBySlug(module.slug);
        console.log("🔧 Module exists in database:", !!existingModule);

        if (existingModule) {
          generationContext = await moduleService.getModuleGenerationContext(module.slug) || undefined;
          console.log("🔧 Retrieved generation context:", !!generationContext);
          console.log("🔧 Generation context details:", generationContext);

          // Get lesson context for better problem variation
          if (existingModule.lessons && existingModule.lessons.length > 0) {
            // Use the first lesson's structured content if available, otherwise use contentMd
            const firstLesson = existingModule.lessons[0];
            if (firstLesson.structuredContent) {
              lessonContext = firstLesson.structuredContent;
              console.log("🔧 Retrieved structured lesson context:", !!lessonContext);
            } else if (firstLesson.contentMd) {
              // Fallback to simple content for backward compatibility
              lessonContext = {
                introduction: firstLesson.contentMd,
                keyConcepts: [],
                summary: firstLesson.contentMd
              };
              console.log("🔧 Using fallback lesson context from contentMd");
            }
          }

          // Get problem generation history for variation tracking
          // Note: We need a user ID for this, but the generate endpoint doesn't require authentication
          // For now, we'll skip problem history for unauthenticated requests
          // In a real implementation, you might want to make this endpoint require authentication
          // or use a different approach for variation tracking
        } else {
          console.log("🔧 Module does not exist in database!");
        }
      } catch (error) {
        console.warn("🔧 Failed to retrieve generation context:", error);
        console.warn("🔧 Error details:", error);
      }
    } else {
      console.log("🔧 No module slug provided for generation context lookup");
      console.log("🔧 Module object:", module);
    }

    const llm = await getLlm();
    console.log("🔧 LLM client obtained successfully");

    const isMultipleChoice = exercise.kind === "multiple-choice";
    const isFillInTheBlank = exercise.kind === "fill-in-the-blank";
    const isMatching = exercise.kind === "matching";
    const isTrueFalse = exercise.kind === "true-false";
    const isOrdering = exercise.kind === "ordering";

    const problemDraft = await llm.json<ProblemDraft>(ProblemDraftSchema, {
      system: buildProblemGenerationSystemPrompt(isMultipleChoice, isFillInTheBlank, isMatching, isTrueFalse, isOrdering),
      user: buildGenerationUserPrompt(exercise, module, generationContext, lessonContext),
    });

    console.log("🔧 DEBUG: LLM returned problemDraft:", JSON.stringify(problemDraft, null, 2));
    console.log("🔧 DEBUG: orderingItems in draft:", problemDraft.orderingItems);

    // Normalize loose blocks before strict validation
    const normalizedStem = coerceBlocks(problemDraft.stem);
    const normalizedHints = coerceBlocks(problemDraft.hints);

    // Validate final strict shape
    const normalized: ProblemInstance = ProblemInstanceSchema.parse({
      id: problemDraft.id ?? randomUUID(),
      engine: "llm",
      kind: exercise.kind,
      stem: normalizedStem, // strict array of RenderBlockSchema on final parse
      choices: problemDraft.choices ? normalizeChoices(problemDraft.choices) : undefined,
      // NEW: Include blanks for fill-in-the-blank exercises
      blanks: problemDraft.blanks ? normalizeBlanks(problemDraft.blanks) : undefined,
      // NEW: Include matching pairs for matching exercises
      matchingPairs: problemDraft.matchingPairs ? normalizeMatchingPairs(problemDraft.matchingPairs) : undefined,
      // NEW: Include true/false data for true-false exercises
      trueFalseData: problemDraft.trueFalseData ? normalizeTrueFalseData(problemDraft.trueFalseData) : undefined,
      // NEW: Include ordering items for ordering exercises
      orderingItems: problemDraft.orderingItems ? normalizeOrderingItems(problemDraft.orderingItems) : undefined,
      engineState: problemDraft.engineState ?? {},
      hints: normalizedHints.length ? normalizedHints : undefined,
    });

    console.log("🔧 Problem generated successfully:", normalized.id);
    res.json(GenerateResponseSchema.parse({ problem: normalized }));
  } catch (err: any) {
    console.error("🔧 [problems/generate] error:", err);
    console.error("🔧 Error stack:", err.stack);
    res.status(400).json({ ok: false, error: err?.message ?? "Invalid request" });
  }
});

/**
 * POST /api/problems/grade
 * Body: { engine, problem, submission, exercise?, module? }
 * Resp: GradeResult
 */
problemsRouter.post("/grade", authenticateUser, async (req: Request, res: Response) => {
  try {
    const parsed = GradeRequestSchema.parse(req.body);
    const { problem, submission, exercise, module } = parsed;

    const llm = await getLlm();

    const isMultipleChoice = problem.kind === "multiple-choice";
    const isFillInTheBlank = problem.kind === "fill-in-the-blank";
    const isMatching = problem.kind === "matching";
    const isTrueFalse = problem.kind === "true-false";
    const isOrdering = problem.kind === "ordering";
    const isFreeResponse = problem.kind === "free-response";

    console.log("🔍 DEBUG: Grading problem");
    console.log("🔍 DEBUG: Problem kind:", problem.kind);
    console.log("🔍 DEBUG: EngineState:", problem.engineState);
    console.log("🔍 DEBUG: Submission answer:", submission.answer);

    // Direct grading for ordering exercises (no LLM needed)
    if (isOrdering && problem.orderingItems && Array.isArray(submission.answer)) {
      console.log("🔍 DEBUG: Using direct grading for ordering exercise");
      
      // Check if the student's order matches the correctPosition sequence
      const studentOrder = submission.answer as string[];
      const correctOrder = problem.orderingItems
        .sort((a: any, b: any) => a.correctPosition - b.correctPosition)
        .map((item: any) => item.id);
      
      console.log("🔍 DEBUG: Student order:", studentOrder);
      console.log("🔍 DEBUG: Correct order:", correctOrder);
      
      const isCorrect = studentOrder.length === correctOrder.length && 
                       studentOrder.every((id, index) => id === correctOrder[index]);
      
      // Generate helpful feedback without revealing the answer
      let feedback = "";
      if (isCorrect) {
        feedback = "Excellent! You've arranged the items in the correct logical sequence.";
      } else {
        // Count how many are in correct position for partial credit
        const correctPositions = studentOrder.filter((id, index) => id === correctOrder[index]).length;
        const totalItems = correctOrder.length;
        
        if (correctPositions === 0) {
          feedback = "The items are not in the correct order. Consider the logical sequence - which step would come first?";
        } else if (correctPositions < totalItems) {
          feedback = `You have ${correctPositions} out of ${totalItems} items in the correct position. Think about the logical flow between the steps.`;
        }
      }
      
      const result: GradeResult = {
        correct: isCorrect,
        feedback: feedback,
        expected: undefined, // Don't reveal the answer
        details: {
          correctPositions: studentOrder.filter((id, index) => id === correctOrder[index]).length,
          totalItems: correctOrder.length
        }
      };
      
      console.log("🔍 DEBUG: Direct grading result:", result);
      
      // Save user's attempt to database for progress tracking
      try {
        const moduleSlug = module?.slug || 'unknown-module';
        const exerciseSlug = exercise?.slug || 'unknown-exercise';
        const userId = req.user!.id;

        console.log("💾 [problems/grade] Saving attempt with:", { moduleSlug, exerciseSlug, userId });

        await problemService.saveAttempt({
          userId,
          moduleSlug,
          exerciseSlug,
          problem,
          userAnswer: submission.answer,
          correct: result.correct,
          feedback: result.feedback || ""
        });

        console.log("✅ User attempt saved to database");
      } catch (dbError) {
        console.error("⚠️ Failed to save attempt to database:", dbError);
        // Don't fail the request if database save fails
      }
      
      return res.json(GradeResponseSchema.parse(result));
    }

    // Direct grading for true/false exercises (no LLM needed)
    if (isTrueFalse && problem.engineState && typeof problem.engineState === 'object' && 'trueFalseAnswer' in problem.engineState) {
      console.log("🔍 DEBUG: Using direct grading for true/false exercise");
      
      const correctAnswer = (problem.engineState as Record<string, unknown>).trueFalseAnswer as boolean;
      const studentAnswer = submission.answer as boolean;
      
      console.log("🔍 DEBUG: Correct answer:", correctAnswer);
      console.log("🔍 DEBUG: Student answer:", studentAnswer);
      
      const isCorrect = studentAnswer === correctAnswer;
      
      // Generate helpful feedback
      let feedback = "";
      if (isCorrect) {
        feedback = "Correct! Your answer is right.";
      } else {
        feedback = `Incorrect. The correct answer is ${correctAnswer ? 'True' : 'False'}.`;
      }
      
      const result: GradeResult = {
        correct: isCorrect,
        feedback: feedback,
        expected: correctAnswer,
        details: {
          studentAnswer: studentAnswer,
          correctAnswer: correctAnswer
        }
      };
      
      console.log("🔍 DEBUG: Direct grading result:", result);
      
      // Save user's attempt to database for progress tracking
      try {
        const moduleSlug = module?.slug || 'unknown-module';
        const exerciseSlug = exercise?.slug || 'unknown-exercise';
        const userId = req.user!.id;

        console.log("💾 [problems/grade] Saving attempt with:", { moduleSlug, exerciseSlug, userId });

        await problemService.saveAttempt({
          userId,
          moduleSlug,
          exerciseSlug,
          problem,
          userAnswer: submission.answer,
          correct: result.correct,
          feedback: result.feedback || ""
        });

        console.log("✅ User attempt saved to database");
      } catch (dbError) {
        console.error("⚠️ Failed to save attempt to database:", dbError);
        // Don't fail the request if database save fails
      }
      
      return res.json(GradeResponseSchema.parse(result));
    }

    // Direct grading for multiple choice exercises (no LLM needed)
    if (isMultipleChoice && problem.engineState && typeof problem.engineState === 'object' && 'correctChoiceId' in problem.engineState) {
      console.log("🔍 DEBUG: Using direct grading for multiple choice exercise");
      
      const correctChoiceId = (problem.engineState as Record<string, unknown>).correctChoiceId as string;
      const studentChoice = submission.answer as string;
      
      console.log("🔍 DEBUG: Correct choice ID:", correctChoiceId);
      console.log("🔍 DEBUG: Student choice:", studentChoice);
      
      const isCorrect = studentChoice === correctChoiceId;
      
      // Generate helpful feedback
      let feedback = "";
      if (isCorrect) {
        feedback = "Correct! You've selected the right answer.";
      } else {
        feedback = "Incorrect. Review the question and try again.";
      }
      
      const result: GradeResult = {
        correct: isCorrect,
        feedback: feedback,
        expected: correctChoiceId,
        details: {
          studentChoice: studentChoice,
          correctChoiceId: correctChoiceId
        }
      };
      
      console.log("🔍 DEBUG: Direct grading result:", result);
      
      // Save user's attempt to database for progress tracking
      try {
        const moduleSlug = module?.slug || 'unknown-module';
        const exerciseSlug = exercise?.slug || 'unknown-exercise';
        const userId = req.user!.id;

        console.log("💾 [problems/grade] Saving attempt with:", { moduleSlug, exerciseSlug, userId });

        await problemService.saveAttempt({
          userId,
          moduleSlug,
          exerciseSlug,
          problem,
          userAnswer: submission.answer,
          correct: result.correct,
          feedback: result.feedback || ""
        });

        console.log("✅ User attempt saved to database");
      } catch (dbError) {
        console.error("⚠️ Failed to save attempt to database:", dbError);
        // Don't fail the request if database save fails
      }
      
      return res.json(GradeResponseSchema.parse(result));
    }

    // Direct grading for fill-in-the-blank exercises (no LLM needed)
    if (isFillInTheBlank && problem.engineState && typeof problem.engineState === 'object' && 'fillBlankAnswers' in problem.engineState) {
      console.log("🔍 DEBUG: Using direct grading for fill-in-the-blank exercise");
      
      const expectedAnswers = (problem.engineState as Record<string, unknown>).fillBlankAnswers as Record<string, string>;
      const studentAnswers = submission.answer as Record<string, string>;
      
      console.log("🔍 DEBUG: Expected answers:", expectedAnswers);
      console.log("🔍 DEBUG: Student answers:", studentAnswers);
      
      // Check each blank individually
      const blankResults: Record<string, { correct: boolean; expected: string; student: string }> = {};
      let allCorrect = true;
      
      for (const [blankId, expectedAnswer] of Object.entries(expectedAnswers)) {
        const studentAnswer = studentAnswers[blankId] || "";
        const isBlankCorrect = studentAnswer.trim().toLowerCase() === expectedAnswer.trim().toLowerCase();
        blankResults[blankId] = {
          correct: isBlankCorrect,
          expected: expectedAnswer,
          student: studentAnswer
        };
        
        if (!isBlankCorrect) {
          allCorrect = false;
        }
      }
      
      // Generate helpful feedback
      let feedback = "";
      if (allCorrect) {
        feedback = "Excellent! All blanks are filled correctly.";
      } else {
        const incorrectBlanks = Object.entries(blankResults).filter(([_, result]) => !result.correct);
        feedback = `You have ${incorrectBlanks.length} incorrect answer(s). Review the concepts and try again.`;
      }
      
      const result: GradeResult = {
        correct: allCorrect,
        feedback: feedback,
        expected: expectedAnswers,
        details: {
          blankResults: blankResults,
          totalBlanks: Object.keys(expectedAnswers).length,
          correctBlanks: Object.values(blankResults).filter(r => r.correct).length
        }
      };
      
      console.log("🔍 DEBUG: Direct grading result:", result);
      
      // Save user's attempt to database for progress tracking
      try {
        const moduleSlug = module?.slug || 'unknown-module';
        const exerciseSlug = exercise?.slug || 'unknown-exercise';
        const userId = req.user!.id;

        console.log("💾 [problems/grade] Saving attempt with:", { moduleSlug, exerciseSlug, userId });

        await problemService.saveAttempt({
          userId,
          moduleSlug,
          exerciseSlug,
          problem,
          userAnswer: submission.answer,
          correct: result.correct,
          feedback: result.feedback || ""
        });

        console.log("✅ User attempt saved to database");
      } catch (dbError) {
        console.error("⚠️ Failed to save attempt to database:", dbError);
        // Don't fail the request if database save fails
      }
      
      return res.json(GradeResponseSchema.parse(result));
    }

    // Direct grading for matching exercises (no LLM needed)
    if (isMatching && problem.matchingPairs && Array.isArray(problem.matchingPairs)) {
      console.log("🔍 DEBUG: Using direct grading for matching exercise");
      
      const expectedMatches = problem.matchingPairs as Array<{ leftItem: string; rightItem: string }>;
      const studentMatches = submission.answer as Record<string, string>;
      
      console.log("🔍 DEBUG: Expected matches:", expectedMatches);
      console.log("🔍 DEBUG: Student matches:", studentMatches);
      
      // Check each match individually
      const matchResults: Array<{ leftItem: string; expectedRight: string; studentRight: string; correct: boolean }> = [];
      let allCorrect = true;
      
      for (const expectedMatch of expectedMatches) {
        const studentRightItem = studentMatches[expectedMatch.leftItem];
        const isMatchCorrect = studentRightItem === expectedMatch.rightItem;
        
        matchResults.push({
          leftItem: expectedMatch.leftItem,
          expectedRight: expectedMatch.rightItem,
          studentRight: studentRightItem || "No match",
          correct: isMatchCorrect
        });
        
        if (!isMatchCorrect) {
          allCorrect = false;
        }
        }
      
      // Generate helpful feedback
      let feedback = "";
      if (allCorrect) {
        feedback = "Perfect! All matches are correct.";
      } else {
        const incorrectMatches = matchResults.filter(result => !result.correct);
        feedback = `You have ${incorrectMatches.length} incorrect match(es). Review the concepts and try again.`;
      }
      
      const result: GradeResult = {
        correct: allCorrect,
        feedback: feedback,
        expected: expectedMatches,
        details: {
          matchResults: matchResults,
          totalMatches: expectedMatches.length,
          correctMatches: matchResults.filter(r => r.correct).length
        }
      };
      
      console.log("🔍 DEBUG: Direct grading result:", result);
      
      // Save user's attempt to database for progress tracking
      try {
        const moduleSlug = module?.slug || 'unknown-module';
        const exerciseSlug = exercise?.slug || 'unknown-exercise';
        const userId = req.user!.id;

        console.log("💾 [problems/grade] Saving attempt with:", { moduleSlug, exerciseSlug, userId });

        await problemService.saveAttempt({
          userId,
          moduleSlug,
          exerciseSlug,
          problem,
          userAnswer: submission.answer,
          correct: result.correct,
          feedback: result.feedback || ""
        });

        console.log("✅ User attempt saved to database");
      } catch (dbError) {
        console.error("⚠️ Failed to save attempt to database:", dbError);
        // Don't fail the request if database save fails
      }
      
      return res.json(GradeResponseSchema.parse(result));
    }

    // Only free response exercises use LLM grading
    if (!isFreeResponse) {
      console.log("🔍 DEBUG: No direct grading implemented for this exercise type, falling back to LLM");
    }

    console.log("🔍 DEBUG: Using LLM grading for free response exercise");

    // Build exercise-type-specific grading instructions for LLM (only free response now)
    const exerciseTypeInstructions = [
      isFreeResponse ? [
        `For free response: Evaluate the student's answer based on the grading rubric.`,
        `Grading rubric: "${exercise?.params?.gradingRubric || 'No specific rubric provided'}"`,
        `Student answer: ${JSON.stringify(submission.answer)}`,
        `Provide constructive feedback and grade based on completeness, accuracy, and understanding.`,
        `Set correct=true if the answer demonstrates good understanding of the concept.`
      ].join('\n') : null,
      
      // Note: All other exercise types are now graded directly for better accuracy and to avoid revealing answers
    ].filter(Boolean);

    // LLM grading logic (only for free response)
    const result = await llm.json<GradeResult>(GradeResponseSchema as any, {
      system: buildGradingSystemPrompt(),
      user: buildGradingUserPromptLocal(problem, submission, exercise, module),
    });

    console.log("🔍 DEBUG: LLM grading result:", result);
    console.log("🔍 DEBUG: result.correct type:", typeof result.correct);
    console.log("🔍 DEBUG: result.correct value:", result.correct);

    // Save user's attempt to database for progress tracking
    try {
      const moduleSlug = module?.slug || 'unknown-module';
      const exerciseSlug = exercise?.slug || 'unknown-exercise';
        const userId = req.user!.id;

        console.log("💾 [problems/grade] Saving attempt with:", { moduleSlug, exerciseSlug, userId });

        await problemService.saveAttempt({
          userId,
          moduleSlug,
          exerciseSlug,
          problem,
          userAnswer: submission.answer,
          correct: result.correct,
          feedback: result.feedback || ""
        });

        console.log("✅ User attempt saved to database");
      } catch (dbError) {
        console.error("⚠️ Failed to save attempt to database:", dbError);
        // Don't fail the request if database save fails
      }

      res.json(GradeResponseSchema.parse(result));
    } catch (err: any) {
      console.error("[problems/grade] error:", err);
      res.status(400).json({ ok: false, error: err?.message ?? "Invalid request" });
    }
  });

/**
 * GET /api/problems/existing
 * Get all existing problems for an exercise
 * Query params: moduleSlug, exerciseSlug
 * Response: { problems: Array<{id, problem, createdAt, attemptCount}> }
 */
problemsRouter.get("/existing", authenticateUser, async (req: Request, res: Response) => {
  try {
    const { moduleSlug, exerciseSlug } = req.query as { moduleSlug: string; exerciseSlug: string };
    console.log("🔍 API /existing called with:", { moduleSlug, exerciseSlug });

    if (!moduleSlug || !exerciseSlug) {
      console.log("🔍 Missing required parameters");
      return res.status(400).json({
        ok: false,
        error: "Missing required parameters: moduleSlug, exerciseSlug"
      });
    }

    const problems = await problemService.getExistingProblemsForExercise(req.user!.id, moduleSlug, exerciseSlug);
    console.log("🔍 Found existing problems:", problems.length);

    res.json({
      ok: true,
      problems
    });
  } catch (err: any) {
    console.error("🔍 [problems/existing] error:", err);
    console.error("🔍 Error stack:", err.stack);
    res.status(500).json({
      ok: false,
      error: err?.message ?? "Failed to fetch existing problems"
    });
  }
});

/**
 * POST /api/problems/save-generated
 * Save a generated problem to the database
 * Body: { problem, exercise, module }
 * Response: { success: true }
 */
problemsRouter.post("/save-generated", async (req: Request, res: Response) => {
  try {
    console.log("💾 ===== SAVE-GENERATED API CALLED =====");
    console.log("💾 Problem ID:", req.body?.problem?.id);
    const { problem, exercise, module } = req.body;

    if (!problem || !exercise || !module) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: problem, exercise, module"
      });
    }

    // Use existing saveAttempt method with special marker
    await problemService.saveAttempt({
      userId: 'system-generated', // Special user ID for generated problems
      moduleSlug: module.slug,
      exerciseSlug: exercise.slug,
      problem: problem,
      userAnswer: '__generated__', // Special marker
      correct: null, // Not applicable for generated problems
      feedback: 'Generated problem saved for practice'
    });

    console.log("💾 Generated problem saved successfully:", problem.id);

    res.json({
      ok: true,
      message: "Problem saved successfully"
    });
  } catch (err: any) {
    console.error("💾 [problems/save-generated] error:", err);
    res.status(500).json({
      ok: false,
      error: err?.message ?? "Failed to save generated problem"
    });
  }
});

/**
 * GET /api/problems/review/:moduleSlug
 * Get review data for a specific module
 * Response: ModuleReviewData with exercises and attempt statistics
 */
problemsRouter.get("/review/:moduleSlug", authenticateUser, async (req: Request, res: Response) => {
  try {
    const { moduleSlug } = req.params;
    const userId = req.user!.id;
    
    if (!moduleSlug) {
      return res.status(400).json({
        ok: false,
        error: "Module slug is required"
      });
    }
    
    console.log("📊 [problems/review] Getting review data for module:", moduleSlug);
    
    const reviewData = await problemService.getModuleReviewData(userId, moduleSlug);
    
    if (!reviewData) {
      return res.status(404).json({
        ok: false,
        error: "No review data found for this module"
      });
    }

    console.log("✅ [problems/review] Review data retrieved successfully");
    res.json(reviewData);
  } catch (err: any) {
    console.error("❌ [problems/review] error:", err);
    res.status(500).json({ 
      ok: false, 
      error: err?.message ?? "Failed to fetch review data" 
    });
  }
});

export default problemsRouter;
