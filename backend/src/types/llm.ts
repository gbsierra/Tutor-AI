// backend/src/types/llm.ts
// Shared types for LLM providers (OpenAI, Gemini, Anthropic, etc.)

import { z } from "zod";
import type { DisciplineContext } from "@local/shared";

/** ---------- Shared Types ---------- */

export type VisionImage = {
  bytes: Buffer;          // raw image bytes
  mimeType: string;       // e.g., "image/png"
  filename?: string;      // include only when present (no undefined)
};

export type BuildModuleParams = {
  input: {
    topic: string;
    goals?: string[];
    audience?: string;
    constraints?: string[];
    course?: {
      name?: string;
      week?: string;
    };
  };
  images: VisionImage[];  // one or more photos
  temperature?: number;
  model?: string;         // provider-specific model name
  disciplineContext?: DisciplineContext; // New: discipline context for concept analysis
  allDisciplinesContext?: any; // New: all disciplines context when no specific discipline provided
};

export interface LLMProvider {
  name(): string;
  buildModuleFromImages(params: BuildModuleParams): Promise<unknown>;
}

/** ---------- OpenAI Types ---------- */

export type OpenAIMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: Array<{ type: string; [k: string]: unknown }> };

export type OpenAIChatResponse = {
  choices?: Array<{ message?: { content?: string | unknown } }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

export type OpenAIJsonArgs = { system?: string; user: string };

/** ---------- Gemini Types ---------- */

export type GeminiPart =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } };

export type GeminiContent = {
  parts: GeminiPart[];
};

export type GeminiRequestBody = {
  contents: GeminiContent[];
  generationConfig: {
    temperature: number;
    response_mime_type: string;
    max_output_tokens: number;
  };
};

export type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
};

export type GeminiJsonArgs = { system?: string; user: string };

/** ---------- Generic JSON Helper Types ---------- */

export type JsonArgs = { system?: string; user: string };
