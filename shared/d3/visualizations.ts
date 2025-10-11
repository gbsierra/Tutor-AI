// shared/d3-visualizations.ts
// Consolidated D3.js visualization types used by both frontend and backend

import { z } from "zod";

/**
 * Interactive Parameter for D3.js visualization
 */
export interface D3Parameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'object' | 'array' | 'function';
  description: string;
  defaultValue: any;
  range?: [number, number];
  options?: string[];
}

/**
 * D3.js Visualization Specification
 */
export interface D3VisualizationSpec {
  selectedCapability: string;
  d3Module: string;
  configuration: any;
  data: any;
  explanation: string;
  interactiveParameters: D3Parameter[];
}

/**
 * Request to generate D3.js visualization
 */
export interface D3GenerationRequest {
  content: string;
  context: any;
  subject: string;
  learningObjectives: string[];
  availableModules: import("./modules.js").D3ModuleInfo[];
  requestedVisualizationType?: string;
  structuredContent?: any; // Structured lesson content for better visualization
}

/**
 * Response with D3.js visualization specs
 */
export interface D3GenerationResponse {
  visualizations: D3VisualizationSpec[];
  reasoning: string;
  confidence: number;
  requiredModules: string[];
}

/**
 * Zod schemas for validation
 */
export const D3ParameterSchema = z.object({
  name: z.string(),
  type: z.enum(['number', 'string', 'boolean', 'object', 'array', 'function']),
  description: z.string(),
  defaultValue: z.any(),
  range: z.tuple([z.number(), z.number()]).optional(),
  options: z.array(z.string()).optional(),
});

export const D3VisualizationSpecSchema = z.object({
  selectedCapability: z.string(),
  d3Module: z.string(),
  configuration: z.any(),
  data: z.any(),
  explanation: z.string(),
  interactiveParameters: z.array(D3ParameterSchema),
});

export const D3GenerationRequestSchema = z.object({
  content: z.string(),
  context: z.any(),
  subject: z.string(),
  learningObjectives: z.array(z.string()),
  availableModules: z.array(z.any()), // Will be properly typed when imported
  requestedVisualizationType: z.string().optional(),
  structuredContent: z.any().optional(), // Structured lesson content for better visualization
});

export const D3GenerationResponseSchema = z.object({
  visualizations: z.array(D3VisualizationSpecSchema),
  reasoning: z.string(),
  confidence: z.number(),
  requiredModules: z.array(z.string()),
});
