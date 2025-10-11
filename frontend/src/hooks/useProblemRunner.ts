import { useCallback, useState, useMemo } from "react";
import type {
  ProblemInstance,
  GradeResult,
  ModuleContext,
  RenderBlock,
  Choice
} from "@shared/problem";
import type { TExerciseSpec as ExerciseSpec } from "@shared/module";
import { getApiClient } from "@shared/apiClient";

// Re-export for backward compatibility and convenience
export type { ProblemInstance, GradeResult, ExerciseSpec, RenderBlock, Choice };
export type ModuleCtx = ModuleContext;

function stemToText(stem: RenderBlock[]): string {
  return stem.map((b) => b.value).join("\n\n");
}

export function useProblemRunner(args: {
  moduleSlug: string;
  exerciseSlug: string;
  exerciseSpec: ExerciseSpec;          // <-- pass the spec from the module
}) {
  const { moduleSlug, exerciseSlug, exerciseSpec } = args;

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false); // Prevent double generation
  const [problem, setProblem] = useState<ProblemInstance | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GradeResult | null>(null);

  // Memoize moduleCtx to prevent recreation on every render
  const moduleCtx: ModuleCtx = useMemo(() => ({
    slug: moduleSlug,
    title: moduleSlug
  }), [moduleSlug]);

  const generate = useCallback(async () => {
    console.log("🔧 ===== GENERATE FUNCTION CALLED =====");

    // Prevent double generation
    if (generating) {
      console.log("🔧 Generation already in progress, skipping...");
      return;
    }

    console.log("🔧 Starting problem generation...");
    console.log("🔧 Exercise spec:", exerciseSpec);
    console.log("🔧 Module context:", moduleCtx);

    setGenerating(true);
    setLoading(true);
    setError(null);
    setResult(null);
    setProblem(null);

    try {
      const requestBody = { exercise: exerciseSpec, module: moduleCtx };
      console.log("🔧 Request body:", requestBody);

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/problems/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log("🔧 API Response status:", res.status);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("🔧 API Error response:", text);
        setLoading(false);
        throw new Error(text || `Generate failed (${res.status})`);
      }

      const data = (await res.json()) as { problem: ProblemInstance };
      console.log("🔧 Generated problem:", data.problem);

      // Save the generated problem to the database so it can be reused
      try {
        console.log("🔧 ===== SAVING GENERATED PROBLEM =====");
        console.log("🔧 Saving generated problem to database...");
        console.log("🔧 Problem ID:", data.problem.id);
        const saveResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/problems/save-generated`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problem: data.problem,
            exercise: exerciseSpec,
            module: moduleCtx,
          }),
        });

        if (!saveResponse.ok) {
          console.warn("🔧 Failed to save generated problem:", saveResponse.status);
        } else {
          console.log("🔧 Generated problem saved successfully!");
        }
      } catch (saveError) {
        console.warn("🔧 Error saving generated problem:", saveError);
        // Don't fail the generation if saving fails
      }

      setProblem(data.problem);
      setPrompt(stemToText(data.problem.stem));
      setLoading(false);
      setGenerating(false);
      console.log("🔧 Problem generation completed successfully!");
    } catch (err: any) {
      console.error("🔧 Problem generation failed:", err);
      setError(err.message);
      setLoading(false);
      setGenerating(false);
      throw err;
    }
  }, [exerciseSpec, moduleCtx]);

  const loadExistingProblem = useCallback(async (problemId: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setProblem(null);

    try {
      // Fetch all existing problems for this exercise
      const apiClient = getApiClient();
      const endpoint = `/api/problems/existing?moduleSlug=${encodeURIComponent(moduleSlug)}&exerciseSlug=${encodeURIComponent(exerciseSlug)}`;
      const data = await apiClient.get<{ problems: any[] }>(endpoint);
      const existingProblem = data.problems.find((p: any) => p.id === problemId);

      if (!existingProblem) {
        throw new Error(`Problem ${problemId} not found`);
      }

      setProblem(existingProblem.problem);
      setPrompt(stemToText(existingProblem.problem.stem));
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [moduleSlug, exerciseSlug]);

  const grade = useCallback(
    async (userAnswer: string | Record<string, string> | boolean | string[]) => {
      if (!problem) throw new Error("No problem to grade. Generate first.");
      setLoading(true);
      setError(null);
      setResult(null);

      const apiClient = getApiClient();
      const data = await apiClient.post<GradeResult>("/api/problems/grade", {
        engine: "llm",
        problem,
        submission: { answer: userAnswer },
        exercise: exerciseSpec,
        module: moduleCtx,
      });
      setResult(data);

      try {
        const raw = localStorage.getItem("stutor:recentAttempts");
        const arr = raw ? (JSON.parse(raw) as any[]) : [];
        arr.unshift({
          moduleSlug,
          exerciseSlug,
          correct: !!data.correct,
          timestamp: Date.now(),
        });
        localStorage.setItem("stutor:recentAttempts", JSON.stringify(arr.slice(0, 50)));
      } catch {}

      setLoading(false);
    },
    [exerciseSlug, exerciseSpec, moduleCtx, moduleSlug, problem]
  );

  return {
    loading,
    problem,
    prompt,
    error,
    result,
    setError,
    setResult,
    generate,
    loadExistingProblem,
    grade,
  };
}
