// backend/src/services/llm/providers.ts
// LLM provider implementations (OpenAI, Gemini, Anthropic)

import type {
  VisionImage,
  BuildModuleParams,
  LLMProvider,
  OpenAIMessage,
  OpenAIChatResponse,
  GeminiPart,
  GeminiContent,
  GeminiRequestBody,
  GeminiResponse
} from "../../types/llm.js";
import type { TModuleSpec } from "@local/shared";
import { validateModuleJson } from "./validation.js";
import { buildSystemPrompt, buildUserPrompt } from "./prompts.js";

/** ---------- Provider dispatcher (for builder flow) ---------- */

export function getProvider(): LLMProvider {
  const provider = (process.env.LLM_PROVIDER || "openai").toLowerCase();
  if (provider === "openai") return new OpenAIProvider();
  if (provider === "gemini") return new GeminiProvider();
  // TODO: Add AnthropicProvider when implemented
  if (provider === "anthropic") {
    throw new Error("Anthropic provider not implemented yet. Set LLM_PROVIDER=openai or LLM_PROVIDER=gemini.");
  }
  return new OpenAIProvider();
}

/** ---------- OpenAI (default) ---------- */

export class OpenAIProvider implements LLMProvider {
  name() { return "openai"; }

  async buildModuleFromImages(params: BuildModuleParams): Promise<TModuleSpec> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not set");
    const model = params.model || "gpt-4o-mini"; // vision-capable & cost-effective

    // Enhanced debug logging for development
    console.log(`🔍 [OpenAI] ===== MODULE BUILD REQUEST =====`);
    console.log(`🔍 [OpenAI] Model: ${model}`);
    console.log(`🔍 [OpenAI] Temperature: ${params.temperature || 'default'}`);
    console.log(`🔍 [OpenAI] Image count: ${params.images.length}`);
    console.log(`🔍 [OpenAI] Input topic: "${params.input.topic || 'none'}"`);
    console.log(`🔍 [OpenAI] Input audience: "${params.input.audience || 'default'}"`);
    console.log(`🔍 [OpenAI] Discipline context provided:`, !!params.disciplineContext);
    console.log(`🔍 [OpenAI] All disciplines context provided:`, !!params.allDisciplinesContext);
    
    if (params.disciplineContext) {
      console.log(`🔍 [OpenAI] Discipline: ${params.disciplineContext.discipline.name} (${params.disciplineContext.discipline.id})`);
      console.log(`🔍 [OpenAI] Discipline category: ${params.disciplineContext.discipline.category}`);
      console.log(`🔍 [OpenAI] Existing modules: ${params.disciplineContext.existingModules.length}`);
      console.log(`🔍 [OpenAI] Existing concepts: ${params.disciplineContext.existingConcepts.length}`);
      
      if (params.disciplineContext.existingModules.length > 0) {
        console.log(`🔍 [OpenAI] Existing module details:`);
        params.disciplineContext.existingModules.forEach((module, index) => {
          console.log(`🔍 [OpenAI]   ${index + 1}. "${module.title}" (slug: "${module.slug}")`);
          console.log(`🔍 [OpenAI]      Concepts: [${module.concepts?.join(', ') || 'none'}]`);
          console.log(`🔍 [OpenAI]      Tags: [${module.tags?.join(', ') || 'none'}]`);
        });
      } else {
        console.log(`🔍 [OpenAI] No existing modules - will force create-new`);
      }
      
      if (params.disciplineContext.existingConcepts.length > 0) {
        console.log(`🔍 [OpenAI] Existing concepts: [${params.disciplineContext.existingConcepts.join(', ')}]`);
      }
    } else if (params.allDisciplinesContext) {
      console.log(`🔍 [OpenAI] Using allDisciplinesContext - total modules: ${params.allDisciplinesContext.allModules?.length || 0}`);
      if (params.allDisciplinesContext.allModules?.length > 0) {
        console.log(`🔍 [OpenAI] Modules by discipline:`);
        const modulesByDiscipline = params.allDisciplinesContext.allModules.reduce((acc: any, m: any) => {
          acc[m.discipline] = (acc[m.discipline] || 0) + 1;
          return acc;
        }, {});
        Object.entries(modulesByDiscipline).forEach(([discipline, count]) => {
          console.log(`🔍 [OpenAI]   ${discipline}: ${count} modules`);
        });
      }
    }

    const system = buildSystemPrompt();
    
    // Build user prompt with discipline context if available
    const userText = params.disciplineContext 
      ? buildUserPrompt(params.input, params.disciplineContext)
      : params.allDisciplinesContext
      ? buildUserPrompt(params.input, undefined, params.allDisciplinesContext)
      : buildUserPrompt(params.input);

    // Enhanced prompt analysis logging
    console.log(`🔍 [OpenAI] ===== PROMPT ANALYSIS =====`);
    console.log(`🔍 [OpenAI] System prompt length: ${system.length} characters`);
    console.log(`🔍 [OpenAI] User prompt length: ${userText.length} characters`);
    console.log(`🔍 [OpenAI] Total prompt size: ${(system.length + userText.length) / 1000}KB`);
    
    if (params.disciplineContext) {
      console.log(`🔍 [OpenAI] User prompt contains discipline context:`, userText.includes('=== DISCIPLINE CONTEXT ==='));
      console.log(`🔍 [OpenAI] User prompt contains existing modules:`, userText.includes('Existing Modules:'));
      console.log(`🔍 [OpenAI] User prompt contains ALLOWED_MODULE_SLUGS:`, userText.includes('ALLOWED_MODULE_SLUGS'));
      
      // Log the actual existing modules section for debugging
      const existingModulesMatch = userText.match(/Existing Modules:([\s\S]*?)(?=\n\n|$)/);
      if (existingModulesMatch) {
        console.log(`🔍 [OpenAI] Existing modules section:`, existingModulesMatch[1].trim());
      }
      
      // Log ALLOWED_MODULE_SLUGS section
      const allowedSlugsMatch = userText.match(/ALLOWED_MODULE_SLUGS: (\[.*?\])/);
      if (allowedSlugsMatch) {
        console.log(`🔍 [OpenAI] ALLOWED_MODULE_SLUGS: ${allowedSlugsMatch[1]}`);
      }
      
      // Log decision tree section
      const decisionTreeMatch = userText.match(/=== DECISION TREE.*?===([\s\S]*?)(?=\n===|$)/);
      if (decisionTreeMatch) {
        console.log(`🔍 [OpenAI] Decision tree section:`, decisionTreeMatch[1].trim());
      }
    }

    const content: Array<{ type: string; [k: string]: unknown }> = [
      { type: "text", text: userText }
    ];
    for (const img of params.images) {
      const b64 = img.bytes.toString("base64");
      content.push({
        type: "image_url",
        image_url: { url: `data:${img.mimeType};base64,${b64}` }
      });
    }

    const messages: OpenAIMessage[] = [
      { role: "system", content: system },
      { role: "user", content }
    ];

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: params.temperature ?? 0.2,
        messages,
        response_format: { type: "json_object" } // force JSON
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`OpenAI error: ${resp.status} ${errText}`);
    }

    const data = (await resp.json()) as OpenAIChatResponse;
    const raw = data.choices?.[0]?.message?.content;
    
    // Enhanced response logging
    console.log(`🔍 [OpenAI] ===== LLM RESPONSE =====`);
    console.log(`🔍 [OpenAI] Response status: ${resp.status}`);
    console.log(`🔍 [OpenAI] Response length: ${typeof raw === 'string' ? raw.length : 0} characters`);
    console.log(`🔍 [OpenAI] Usage: ${JSON.stringify(data.usage || {})}`);
    console.log(`🔍 [OpenAI] Raw response preview: ${typeof raw === 'string' ? raw.substring(0, 200) : 'N/A'}...`);

    if (typeof raw !== "string") {
      throw new Error("OpenAI did not return JSON text content");
    }

    // Parse and validate the response
    console.log(`🔍 [OpenAI] ===== PARSING RESPONSE =====`);
    try {
      const parsed = validateModuleJson(raw);
      console.log(`🔍 [OpenAI] ✅ Successfully parsed module spec`);
      console.log(`🔍 [OpenAI] Module title: "${parsed.title}"`);
      console.log(`🔍 [OpenAI] Module slug: "${parsed.slug}"`);
      console.log(`🔍 [OpenAI] Discipline: "${parsed.discipline}"`);
      console.log(`🔍 [OpenAI] Consolidation action: "${parsed.consolidation?.action}"`);
      if (parsed.consolidation?.action === 'append-to') {
        console.log(`🔍 [OpenAI] Target module slug: "${parsed.consolidation.targetModuleSlug}"`);
        console.log(`🔍 [OpenAI] Consolidation reason: "${parsed.consolidation.reason}"`);
      }
      console.log(`🔍 [OpenAI] Concepts: [${parsed.concepts?.join(', ') || 'none'}]`);
      console.log(`🔍 [OpenAI] Exercise count: ${parsed.exercises?.length || 0}`);
      console.log(`🔍 [OpenAI] Lesson count: ${parsed.lessons?.length || 0}`);
      console.log(`🔍 [OpenAI] ===== MODULE BUILD COMPLETE =====`);
      return parsed;
    } catch (error) {
      console.error(`🔍 [OpenAI] ❌ Failed to parse module spec:`, error);
      console.error(`🔍 [OpenAI] Raw response:`, raw);
      throw error;
    }
  }
}

/** ---------- Future providers to consider ---------- */

/**
 * TODO: Consider implementing AnthropicProvider for Claude models
 * - Claude has excellent reasoning capabilities
 * - May have different pricing model than OpenAI/Gemini
 * - Could provide alternative when other providers have issues
 * - Would need: ANTHROPIC_API_KEY environment variable
 * - Models to consider: claude-3-5-sonnet, claude-3-haiku
 */

export class GeminiProvider implements LLMProvider {
  name() { return "gemini"; }

  async buildModuleFromImages(params: BuildModuleParams): Promise<TModuleSpec> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set");

    const model = params.model || "gemini-2.5-pro"; // vision-capable model
    const temperature = params.temperature ?? 0.2;

    // Enhanced debug logging for development
    console.log(`🔍 [Gemini] ===== MODULE BUILD REQUEST =====`);
    console.log(`🔍 [Gemini] Model: ${model}`);
    console.log(`🔍 [Gemini] Temperature: ${temperature}`);
    console.log(`🔍 [Gemini] Image count: ${params.images.length}`);
    console.log(`🔍 [Gemini] Input topic: "${params.input.topic || 'none'}"`);
    console.log(`🔍 [Gemini] Input audience: "${params.input.audience || 'default'}"`);
    console.log(`🔍 [Gemini] Discipline context provided:`, !!params.disciplineContext);
    console.log(`🔍 [Gemini] All disciplines context provided:`, !!params.allDisciplinesContext);
    
    if (params.disciplineContext) {
      console.log(`🔍 [Gemini] Discipline: ${params.disciplineContext.discipline.name} (${params.disciplineContext.discipline.id})`);
      console.log(`🔍 [Gemini] Discipline category: ${params.disciplineContext.discipline.category}`);
      console.log(`🔍 [Gemini] Existing modules: ${params.disciplineContext.existingModules.length}`);
      console.log(`🔍 [Gemini] Existing concepts: ${params.disciplineContext.existingConcepts.length}`);
      
      if (params.disciplineContext.existingModules.length > 0) {
        console.log(`🔍 [Gemini] Existing module details:`);
        params.disciplineContext.existingModules.forEach((module, index) => {
          console.log(`🔍 [Gemini]   ${index + 1}. "${module.title}" (slug: "${module.slug}")`);
          console.log(`🔍 [Gemini]      Concepts: [${module.concepts?.join(', ') || 'none'}]`);
          console.log(`🔍 [Gemini]      Tags: [${module.tags?.join(', ') || 'none'}]`);
        });
      } else {
        console.log(`🔍 [Gemini] No existing modules - will force create-new`);
      }
      
      if (params.disciplineContext.existingConcepts.length > 0) {
        console.log(`🔍 [Gemini] Existing concepts: [${params.disciplineContext.existingConcepts.join(', ')}]`);
      }
    } else if (params.allDisciplinesContext) {
      console.log(`🔍 [Gemini] Using allDisciplinesContext - total modules: ${params.allDisciplinesContext.allModules?.length || 0}`);
      if (params.allDisciplinesContext.allModules?.length > 0) {
        console.log(`🔍 [Gemini] Modules by discipline:`);
        const modulesByDiscipline = params.allDisciplinesContext.allModules.reduce((acc: any, m: any) => {
          acc[m.discipline] = (acc[m.discipline] || 0) + 1;
          return acc;
        }, {});
        Object.entries(modulesByDiscipline).forEach(([discipline, count]) => {
          console.log(`🔍 [Gemini]   ${discipline}: ${count} modules`);
        });
      }
    }

    const system = buildSystemPrompt();
    
    // Build user prompt with discipline context if available
    const userText = params.disciplineContext 
      ? buildUserPrompt(params.input, params.disciplineContext)
      : params.allDisciplinesContext
      ? buildUserPrompt(params.input, undefined, params.allDisciplinesContext)
      : buildUserPrompt(params.input);

    // Enhanced prompt analysis logging
    console.log(`🔍 [Gemini] ===== PROMPT ANALYSIS =====`);
    console.log(`🔍 [Gemini] System prompt length: ${system.length} characters`);
    console.log(`🔍 [Gemini] User prompt length: ${userText.length} characters`);
    console.log(`🔍 [Gemini] Total prompt size: ${(system.length + userText.length) / 1000}KB`);
    
    if (params.disciplineContext) {
      console.log(`🔍 [Gemini] User prompt contains discipline context:`, userText.includes('=== DISCIPLINE CONTEXT ==='));
      console.log(`🔍 [Gemini] User prompt contains existing modules:`, userText.includes('Existing Modules:'));
      console.log(`🔍 [Gemini] User prompt contains ALLOWED_MODULE_SLUGS:`, userText.includes('ALLOWED_MODULE_SLUGS'));
      
      // Log the actual existing modules section for debugging
      const existingModulesMatch = userText.match(/Existing Modules:([\s\S]*?)(?=\n\n|$)/);
      if (existingModulesMatch) {
        console.log(`🔍 [Gemini] Existing modules section:`, existingModulesMatch[1].trim());
      }
      
      // Log ALLOWED_MODULE_SLUGS section
      const allowedSlugsMatch = userText.match(/ALLOWED_MODULE_SLUGS: (\[.*?\])/);
      if (allowedSlugsMatch) {
        console.log(`🔍 [Gemini] ALLOWED_MODULE_SLUGS: ${allowedSlugsMatch[1]}`);
      }
      
      // Log decision tree section
      const decisionTreeMatch = userText.match(/=== DECISION TREE.*?===([\s\S]*?)(?=\n===|$)/);
      if (decisionTreeMatch) {
        console.log(`🔍 [Gemini] Decision tree section:`, decisionTreeMatch[1].trim());
      }
    }

    // Build Gemini API request format
    const contents: GeminiContent[] = [{
      parts: [{ text: `${system}\n\n${userText}` }]
    }];

    // Add images to the request
    for (const img of params.images) {
      const b64 = img.bytes.toString("base64");
      if (contents[0] && contents[0].parts) {
        contents[0].parts.push({
          inline_data: {
            mime_type: img.mimeType,
            data: b64
          }
        });
      }
    }

    const requestBody: GeminiRequestBody = {
      contents,
      generationConfig: {
        temperature,
        response_mime_type: "application/json",
        max_output_tokens: 8192
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

    const data = (await resp.json()) as GeminiResponse;
    
    // Enhanced response logging
    console.log(`🔍 [Gemini] ===== LLM RESPONSE =====`);
    console.log(`🔍 [Gemini] Response status: ${resp.status}`);
    console.log(`🔍 [Gemini] Usage: ${JSON.stringify(data.usageMetadata || {})}`);

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
    
    console.log(`🔍 [Gemini] Response length: ${rawText.length} characters`);
    console.log(`🔍 [Gemini] Raw response preview: ${rawText.substring(0, 200)}...`);

    // Parse and validate the response
    console.log(`🔍 [Gemini] ===== PARSING RESPONSE =====`);
    try {
      const parsed = validateModuleJson(rawText);
      console.log(`🔍 [Gemini] ✅ Successfully parsed module spec`);
      console.log(`🔍 [Gemini] Module title: "${parsed.title}"`);
      console.log(`🔍 [Gemini] Module slug: "${parsed.slug}"`);
      console.log(`🔍 [Gemini] Discipline: "${parsed.discipline}"`);
      console.log(`🔍 [Gemini] Consolidation action: "${parsed.consolidation?.action}"`);
      if (parsed.consolidation?.action === 'append-to') {
        console.log(`🔍 [Gemini] Target module slug: "${parsed.consolidation.targetModuleSlug}"`);
        console.log(`🔍 [Gemini] Consolidation reason: "${parsed.consolidation.reason}"`);
      }
      console.log(`🔍 [Gemini] Concepts: [${parsed.concepts?.join(', ') || 'none'}]`);
      console.log(`🔍 [Gemini] Exercise count: ${parsed.exercises?.length || 0}`);
      console.log(`🔍 [Gemini] Lesson count: ${parsed.lessons?.length || 0}`);
      console.log(`🔍 [Gemini] ===== MODULE BUILD COMPLETE =====`);
      return parsed;
    } catch (error) {
      console.error(`🔍 [Gemini] ❌ Failed to parse module spec:`, error);
      console.error(`🔍 [Gemini] Raw response:`, rawText);
      throw error;
    }
  }
}
