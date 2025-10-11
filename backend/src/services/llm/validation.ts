// backend/src/services/llm/validation.ts
// Validation functions and JSON helpers for LLM interactions

import { z } from "zod";
import { ModuleSpec } from "@local/shared";
import type { TModuleSpec } from "@local/shared";
import type {
  OpenAIJsonArgs,
  GeminiJsonArgs,
  JsonArgs,
  OpenAIChatResponse,
  GeminiResponse
} from "../../types/llm.js";

/** ---------- Validation helper ---------- */

export function validateModuleJson(jsonText: string): TModuleSpec {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    console.error(`🔍 [validateModuleJson] JSON parse error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`🔍 [validateModuleJson] Parse error at position: ${errorMessage.match(/position (\d+)/)?.[1] || 'unknown'}`);
    throw new Error("LLM did not return valid JSON");
  }

  try {
    // Ensure slug exists, generate from title if missing
    if (parsed && typeof parsed === 'object' && parsed !== null) {
      const obj = parsed as any;
      if (!obj.slug && obj.title) {
        obj.slug = generateSlugFromTitle(obj.title);
        console.log(`🔧 [validateModuleJson] Generated missing slug: ${obj.slug} from title: ${obj.title}`);
      }
    }

    const res = ModuleSpec.safeParse(parsed);
    if (!res.success) {
      throw new Error("Generated JSON failed schema validation: " + res.error.message);
    }
    return res.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Validation failed: " + String(error));
  }
}

function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/** ---------- Generic JSON helper for Problems API ---------- */

export async function json<T>(
  schema: z.ZodSchema,
  args: JsonArgs
): Promise<T> {
  const provider = (process.env.LLM_PROVIDER || "openai").toLowerCase();

  if (provider === "gemini") {
    return jsonGemini(schema, args);
  }

  if (provider !== "openai") {
    throw new Error(`json() not implemented for provider: ${provider}`);
  }

  return jsonOpenAI(schema, args);
}

/** ---------- Gemini implementation for JSON-mode calls ---------- */

async function jsonGemini<T>(
  schema: z.ZodSchema,
  args: GeminiJsonArgs
): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const model = process.env.GEMINI_JSON_MODEL || "gemini-2.0-flash"; // faster for text-only

  // Build Gemini request format
  const contents = [{
    parts: [{ text: args.system ? `${args.system}\n\n${args.user}` : args.user }]
  }];

  const requestBody = {
    contents,
    generationConfig: {
      temperature: 0.7,
      response_mime_type: "application/json",
      max_output_tokens: 4096
    }
  };

  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Gemini API error: ${resp.status} ${errText}`);
  }

  const data = await resp.json() as GeminiResponse;

  // Extract text from Gemini response
  const candidates = data.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error("Gemini did not return any candidates");
  }

  const firstCandidate = candidates[0];
  if (!firstCandidate) {
    throw new Error("Gemini did not return any candidates");
  }

  const parts = firstCandidate.content?.parts;
  if (!parts || parts.length === 0) {
    throw new Error("Gemini response missing content parts");
  }

  const firstPart = parts[0];
  if (!firstPart) {
    throw new Error("Gemini response missing content parts");
  }

  const rawText = firstPart.text;
  if (typeof rawText !== "string") {
    throw new Error("Gemini did not return text content");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("Gemini did not return valid JSON");
  }

  return schema.parse(parsed) as T;
}

/** ---------- OpenAI implementation for JSON-mode calls ---------- */

async function jsonOpenAI<T>(
  schema: z.ZodSchema,
  args: OpenAIJsonArgs
): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const model = process.env.OPENAI_JSON_MODEL || "gpt-4o-mini";

  const messages: Array<{ role: "system" | "user"; content: any }> = [];
  if (args.system) messages.push({ role: "system", content: args.system });
  messages.push({ role: "user", content: args.user });

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      messages,
      response_format: { type: "json_object" }
    })
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`OpenAI error: ${resp.status} ${errText}`);
  }

  const data = (await resp.json()) as OpenAIChatResponse;
  const raw = data.choices?.[0]?.message?.content;

  if (typeof raw !== "string") {
    throw new Error("LLM did not return JSON text content");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("LLM did not return valid JSON");
  }

  return schema.parse(parsed) as T;
}

/** Default export so routes can do: import llm from "../services/llm.js" */
const defaultExport = { json };
export default defaultExport;
