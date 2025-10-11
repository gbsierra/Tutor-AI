// shared/d3-modules.ts
// Minimal shared file containing only the basic D3.js module information needed by both frontend and backend

import { z } from "zod";

/**
 * D3.js Module Information
 * Basic module metadata shared between frontend and backend
 */
export interface D3ModuleInfo {
  name: string;              // e.g., "d3-core"
  version: string;           // D3.js module version
  description: string;       // What this D3.js module does
  mainExport: string;        // Main function/class exported by module
  documentation: string;     // Link to D3.js documentation
  npmPackage: string;        // NPM package name
}

/**
 * Available D3.js Modules
 * Static list of supported D3.js modules
 */
export const AVAILABLE_D3_MODULES: D3ModuleInfo[] = [
  {
    name: "d3-core",
    version: "7.x",
    description: "Core D3.js library with hierarchy, force, and shape modules",
    mainExport: "d3",
    documentation: "https://d3js.org/",
    npmPackage: "d3"
  }
];

/**
 * Zod schema for D3ModuleInfo validation
 */
export const D3ModuleInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string(),
  mainExport: z.string(),
  documentation: z.string(),
  npmPackage: z.string(),
});
