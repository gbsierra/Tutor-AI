// Re-export all shared types and schemas
export * from "./module.js";
export * from "./disciplines.js";
export * from "./problem.js";
export * from "./auth.js";
export * from "./photoUpload.js";
export * from "./d3/modules.js";
export * from "./d3/visualizations.js";
export * from "./d3/visualization-registry.js";
export * from "./apiClient.js";
export * from "./types.js";

// Concept-based learning system types
export interface DisciplineContext {
  discipline: {
    id: string;
    name: string;
    category: string;
    description: string;
  };
  existingModules: Array<{
    slug: string;
    title: string;
    description?: string;
    concepts: string[];
    tags: string[];
  }>;
  existingConcepts: string[];
}

export interface ConceptGroup {
  name: string;
  description?: string;
  modules: Array<{
    slug: string;
    title: string;
    description?: string;
    tags: string[];
  }>;
}
