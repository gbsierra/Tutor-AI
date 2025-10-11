// frontend/src/services/problemService.ts
// API helpers for problem generation and grading endpoints

import type {
  GenerateRequest,
  GenerateResponse,
  GradeRequest,
  GradeResponse,
  Submission,
  ExerciseSpec,
  ModuleContext
} from "@shared/problem";
import { getApiClient } from "@shared/apiClient";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if ((body as any)?.error) msg = (body as any).error as string;
    } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

/**
 * Generate a new problem instance from an exercise specification
 */
export async function generateProblem(
  exercise: ExerciseSpec,
  module?: ModuleContext,
  signal?: AbortSignal
): Promise<GenerateResponse> {
  const request: GenerateRequest = {
    exercise,
    module
  };

  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/problems/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal
  });

  return json<GenerateResponse>(res);
}

/**
 * Grade a submission against a problem instance
 */
export async function gradeSubmission(
  engine: string,
  problem: GenerateResponse["problem"],
  submission: Submission,
  exercise?: ExerciseSpec,
  module?: ModuleContext,
  signal?: AbortSignal
): Promise<GradeResponse> {
  const request: GradeRequest = {
    engine,
    problem,
    submission,
    exercise,
    module
  };

  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/problems/grade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal
  });

  return json<GradeResponse>(res);
}

/**
 * Test endpoint to verify problems API is working
 */
export async function pingProblems(): Promise<{ ok: true }> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/problems/ping`);
  return json<{ ok: true }>(res);
}

/**
 * Get review data for a specific module
 * Returns comprehensive attempt data organized by exercises
 * Returns null if no review data exists (404 response)
 */
export async function getModuleReviewData(moduleSlug: string): Promise<any> {
  try {
    const apiClient = getApiClient();
    return await apiClient.get<any>(`/api/problems/review/${encodeURIComponent(moduleSlug)}`);
  } catch (error: any) {
    // Handle 404 as empty state (no review data) rather than error
    if (error.message.includes('404') || error.message.includes('No review data found')) {
      return null;
    }
    throw error;
  }
}
