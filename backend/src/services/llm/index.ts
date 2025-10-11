// backend/src/services/llm/index.ts
// Main exports for backward compatibility

// Re-export types for backward compatibility
export type {
  VisionImage,
  BuildModuleParams,
  LLMProvider
} from "../../types/llm.js";

// Re-export functions and classes
export { getProvider, OpenAIProvider, GeminiProvider } from "./providers.js";
export { 
  buildSystemPrompt, 
  buildUserPrompt,
  buildVisualizationSystemPrompt,
  buildVisualizationUserPrompt,
  buildProblemGenerationSystemPrompt,
  buildProblemGenerationUserPrompt,
  buildGradingSystemPrompt,
  buildGradingUserPrompt
} from "./prompts.js";
export { validateModuleJson, json } from "./validation.js";

// Default export for routes that import like: import llm from "../services/llm.js"
import { json } from "./validation.js";
const defaultExport = { json };
export default defaultExport;
