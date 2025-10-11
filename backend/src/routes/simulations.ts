// backend/src/routes/simulations.ts
// D3.js simulation routes - dynamic capability discovery system

import express, { type Request, type Response } from "express";
import { z } from "zod";
import type {
  D3ModuleInfo,
  D3Parameter,
  D3VisualizationSpec,
  D3GenerationRequest,
  D3GenerationResponse
} from "@local/shared";
import { AVAILABLE_D3_MODULES } from "@local/shared";
import { buildVisualizationSystemPrompt, buildVisualizationUserPrompt } from "../services/llm/prompts.js";

// Re-export for backwards compatibility with existing LLM imports
export type { D3ModuleInfo } from "@local/shared";

/**
 * D3.js Capability - What a D3.js module can visualize
 * Defined here since only backend needs these detailed definitions
 */
interface D3Capability {
  moduleName: string;        // Which D3.js module this capability comes from
  capabilityName: string;    // e.g., "venn-diagram", "tree-layout", "force-directed"
  description: string;       // Human-readable description of what it visualizes
  inputDataFormat: any;      // Schema for data this capability expects
  outputVisualization: string; // Type of visualization produced
  interactiveParameters: D3Parameter[]; // Parameters that can be manipulated
  examples: D3Example[];     // Example usage patterns
  educationalUseCases: string[]; // How this helps learning
}

/**
 * Example usage of D3.js capability
 * Backend-only type for capability discovery system
 */
interface D3Example {
  description: string;       // What this example demonstrates
  inputData: any;            // Sample input data
  configuration: any;        // D3.js configuration object
  expectedOutput: string;    // What the visualization should look like
}

/**
 * D3.js Capability Discovery - Dynamic system
 */
interface D3CapabilityDiscovery {
  availableModules: D3ModuleInfo[];     // D3.js modules in the system
  discoveredCapabilities: D3Capability[]; // Capabilities LLM has learned
  moduleUsagePatterns: Record<string, any>; // How modules are typically used
}

/**
 * Core D3.js Capabilities Available
 * These represent the main visualization types available in core D3.js
 */
const CORE_D3_CAPABILITIES = [
  "tree", "cluster", "treemap", "pack", "partition", // Hierarchy layouts
  "force", "force-directed", // Force simulations
  "line", "area", "bar", "pie", "scatter" // Basic shapes/charts
];

/**
 * Build D3.js Capability Discovery
 * Creates the capability discovery object from available modules and capabilities
 */
function buildD3CapabilityDiscovery(): D3CapabilityDiscovery {
  const discoveredCapabilities: D3Capability[] = [];

  // Build capabilities from core D3.js features
  CORE_D3_CAPABILITIES.forEach(capability => {
    console.log('🔧 [Capability Discovery] Processing capability:', capability);
    switch (capability) {
      case "tree":
        discoveredCapabilities.push({
          moduleName: "d3-core",
          capabilityName: "tree-diagram",
          description: "Visualize hierarchical relationships and decision trees using d3.tree()",
          inputDataFormat: {
            type: "object",
            properties: {
              name: { type: "string" },
              children: { type: "array" }
            }
          },
          outputVisualization: "hierarchical-tree",
          interactiveParameters: [
            {
              name: "nodeSize",
              type: "array",
              description: "Size of tree nodes",
              defaultValue: [20, 20]
            },
            {
              name: "separation",
              type: "function",
              description: "Node separation function",
              defaultValue: "(a, b) => a.parent == b.parent ? 1 : 2"
            }
          ],
          examples: [{
            description: "Simple decision tree",
            inputData: {
              name: "Decision Point",
              children: [
                {
                  name: "Option A",
                  children: [
                    { name: "Outcome A1", value: 0.3 },
                    { name: "Outcome A2", value: 0.7 }
                  ]
                },
                {
                  name: "Option B",
                  children: [
                    { name: "Outcome B1", value: 0.6 }
                  ]
                }
              ]
            },
            configuration: {
              width: 400,
              height: 300,
              margin: { top: 20, right: 120, bottom: 20, left: 120 }
            },
            expectedOutput: "Hierarchical tree layout with decision branches"
          }],
          educationalUseCases: [
            "Decision tree visualization",
            "Classification hierarchy",
            "Process flow representation",
            "Probability tree diagrams"
          ]
        });
        console.log('✅ [Capability Discovery] Added tree-diagram capability');
        break;

      case "force":
        discoveredCapabilities.push({
          moduleName: "d3-core",
          capabilityName: "force-directed-graph",
          description: "Visualize networks and relationships with physics-based layout using d3.forceSimulation()",
          inputDataFormat: {
            type: "object",
            properties: {
              nodes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" }
                  }
                }
              },
              links: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    source: { type: "string" },
                    target: { type: "string" }
                  }
                }
              }
            }
          },
          outputVisualization: "network-graph",
          interactiveParameters: [
            {
              name: "linkDistance",
              type: "number",
              description: "Distance between connected nodes",
              defaultValue: 50,
              range: [10, 200]
            },
            {
              name: "chargeStrength",
              type: "number",
              description: "Repulsion force between nodes",
              defaultValue: -300,
              range: [-1000, -50]
            }
          ],
          examples: [{
            description: "Simple concept network",
            inputData: {
              nodes: [
                { id: "A", name: "Statistics" },
                { id: "B", name: "Probability" },
                { id: "C", name: "Data Analysis" },
                { id: "D", name: "Machine Learning" }
              ],
              links: [
                { source: "A", target: "B" },
                { source: "A", target: "C" },
                { source: "C", target: "D" },
                { source: "B", target: "D" }
              ]
            },
            configuration: {
              width: 400,
              height: 300,
              centerForce: true
            },
            expectedOutput: "Interactive network with physics-based node positioning"
          }],
          educationalUseCases: [
            "Concept relationship mapping",
            "Dependency visualization",
            "Knowledge graph representation",
            "System architecture diagrams"
          ]
        });
        console.log('✅ [Capability Discovery] Added force-directed-graph capability');
        break;

      case "bar":
        discoveredCapabilities.push({
          moduleName: "d3-core",
          capabilityName: "bar-chart",
          description: "Create bar charts for comparing quantities using d3.scaleBand() and d3.scaleLinear()",
          inputDataFormat: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                value: { type: "number" }
              }
            }
          },
          outputVisualization: "bar-chart",
          interactiveParameters: [
            {
              name: "orientation",
              type: "string",
              description: "Vertical or horizontal bars",
              defaultValue: "vertical",
              options: ["vertical", "horizontal"]
            },
            {
              name: "colorScheme",
              type: "string",
              description: "Color palette for bars",
              defaultValue: "Blues",
              options: ["Blues", "Greens", "Reds", "Purples"]
            }
          ],
          examples: [{
            description: "Simple bar chart",
            inputData: [
              { label: "Category A", value: 23 },
              { label: "Category B", value: 45 },
              { label: "Category C", value: 31 },
              { label: "Category D", value: 67 }
            ],
            configuration: {
              width: 400,
              height: 300,
              margin: { top: 20, right: 20, bottom: 30, left: 40 },
              showValues: true
            },
            expectedOutput: "Bar chart with labeled categories and values"
          }],
          educationalUseCases: [
            "Data comparison visualization",
            "Frequency distribution representation",
            "Survey results display",
            "Performance metrics comparison"
          ]
        });
        console.log('✅ [Capability Discovery] Added bar-chart capability');
        break;

      case "line":
        discoveredCapabilities.push({
          moduleName: "d3-core",
          capabilityName: "line-chart",
          description: "Create line charts for trends and time series using d3.line() and d3.scaleLinear()",
          inputDataFormat: {
            type: "array",
            items: {
              type: "object",
              properties: {
                x: { type: "number" },
                y: { type: "number" },
                label: { type: "string" }
              }
            }
          },
          outputVisualization: "line-chart",
          interactiveParameters: [
            {
              name: "lineWidth",
              type: "number",
              description: "Width of the line",
              defaultValue: 2,
              range: [1, 10]
            },
            {
              name: "showPoints",
              type: "boolean",
              description: "Show data points on the line",
              defaultValue: true
            },
            {
              name: "interpolation",
              type: "string",
              description: "Line interpolation method",
              defaultValue: "linear",
              options: ["linear", "step", "basis", "cardinal"]
            }
          ],
          examples: [{
            description: "Simple line chart",
            inputData: [
              { x: 0, y: 10, label: "Jan" },
              { x: 1, y: 25, label: "Feb" },
              { x: 2, y: 18, label: "Mar" },
              { x: 3, y: 32, label: "Apr" },
              { x: 4, y: 28, label: "May" }
            ],
            configuration: {
              width: 400,
              height: 300,
              margin: { top: 20, right: 20, bottom: 30, left: 40 },
              xAxisLabel: "Time",
              yAxisLabel: "Value"
            },
            expectedOutput: "Line chart showing trend over time with data points"
          }],
          educationalUseCases: [
            "Time series analysis",
            "Trend visualization",
            "Growth patterns",
            "Comparative analysis over time"
          ]
        });
        console.log('✅ [Capability Discovery] Added line-chart capability');
        break;

      case "scatter":
        discoveredCapabilities.push({
          moduleName: "d3-core",
          capabilityName: "scatter-plot",
          description: "Create scatter plots for correlation analysis using d3.scaleLinear() and SVG circles",
          inputDataFormat: {
            type: "array",
            items: {
              type: "object",
              properties: {
                x: { type: "number" },
                y: { type: "number" },
                label: { type: "string" },
                category: { type: "string" }
              }
            }
          },
          outputVisualization: "scatter-plot",
          interactiveParameters: [
            {
              name: "pointSize",
              type: "number",
              description: "Size of data points",
              defaultValue: 5,
              range: [2, 20]
            },
            {
              name: "showLabels",
              type: "boolean",
              description: "Show labels on data points",
              defaultValue: false
            },
            {
              name: "colorByCategory",
              type: "boolean",
              description: "Color points by category",
              defaultValue: true
            }
          ],
          examples: [{
            description: "Simple scatter plot",
            inputData: [
              { x: 10, y: 20, label: "Point A", category: "Group 1" },
              { x: 25, y: 35, label: "Point B", category: "Group 1" },
              { x: 15, y: 45, label: "Point C", category: "Group 2" },
              { x: 30, y: 25, label: "Point D", category: "Group 2" }
            ],
            configuration: {
              width: 400,
              height: 300,
              margin: { top: 20, right: 20, bottom: 30, left: 40 },
              xAxisLabel: "X Variable",
              yAxisLabel: "Y Variable"
            },
            expectedOutput: "Scatter plot showing correlation between two variables"
          }],
          educationalUseCases: [
            "Correlation analysis",
            "Variable relationships",
            "Data distribution patterns",
            "Statistical analysis"
          ]
        });
        console.log('✅ [Capability Discovery] Added scatter-plot capability');
        break;

      case "pie":
        discoveredCapabilities.push({
          moduleName: "d3-core",
          capabilityName: "pie-chart",
          description: "Create pie charts for proportional data using d3.pie() and d3.arc()",
          inputDataFormat: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                value: { type: "number" },
                color: { type: "string" }
              }
            }
          },
          outputVisualization: "pie-chart",
          interactiveParameters: [
            {
              name: "innerRadius",
              type: "number",
              description: "Inner radius for donut chart (0 for pie)",
              defaultValue: 0,
              range: [0, 100]
            },
            {
              name: "showLabels",
              type: "boolean",
              description: "Show percentage labels",
              defaultValue: true
            },
            {
              name: "showLegend",
              type: "boolean",
              description: "Show legend with categories",
              defaultValue: true
            }
          ],
          examples: [{
            description: "Simple pie chart",
            inputData: [
              { label: "Category A", value: 30, color: "#ff6b6b" },
              { label: "Category B", value: 25, color: "#4ecdc4" },
              { label: "Category C", value: 20, color: "#45b7d1" },
              { label: "Category D", value: 15, color: "#96ceb4" },
              { label: "Category E", value: 10, color: "#ffeaa7" }
            ],
            configuration: {
              width: 400,
              height: 300,
              margin: { top: 20, right: 20, bottom: 20, left: 20 }
            },
            expectedOutput: "Pie chart showing proportional relationships"
          }],
          educationalUseCases: [
            "Proportion visualization",
            "Percentage breakdown",
            "Market share analysis",
            "Budget allocation display"
          ]
        });
        console.log('✅ [Capability Discovery] Added pie-chart capability');
        break;

      case "cluster":
        discoveredCapabilities.push({
          moduleName: "d3-core",
          capabilityName: "cluster-diagram",
          description: "Create clustered tree layouts using d3.cluster() for hierarchical data",
          inputDataFormat: {
            type: "object",
            properties: {
              name: { type: "string" },
              children: { type: "array" }
            }
          },
          outputVisualization: "cluster-tree",
          interactiveParameters: [
            {
              name: "nodeSize",
              type: "array",
              description: "Size of tree nodes",
              defaultValue: [15, 15]
            },
            {
              name: "linkStyle",
              type: "string",
              description: "Style of connecting links",
              defaultValue: "curve",
              options: ["straight", "curve", "step"]
            },
            {
              name: "orientation",
              type: "string",
              description: "Tree orientation",
              defaultValue: "horizontal",
              options: ["horizontal", "vertical"]
            }
          ],
          examples: [{
            description: "Simple cluster tree",
            inputData: {
              name: "Root",
              children: [
                {
                  name: "Branch A",
                  children: [
                    { name: "Leaf A1", value: 10 },
                    { name: "Leaf A2", value: 15 }
                  ]
                },
                {
                  name: "Branch B",
                  children: [
                    { name: "Leaf B1", value: 20 }
                  ]
                }
              ]
            },
            configuration: {
              width: 400,
              height: 300,
              margin: { top: 20, right: 120, bottom: 20, left: 120 }
            },
            expectedOutput: "Clustered tree layout with organized hierarchical structure"
          }],
          educationalUseCases: [
            "Taxonomy visualization",
            "Grouped hierarchies",
            "Relationship clustering",
            "Organized tree structures"
          ]
        });
        console.log('✅ [Capability Discovery] Added cluster-diagram capability');
        break;
    }
  });

  return {
    availableModules: AVAILABLE_D3_MODULES,
    discoveredCapabilities,
    moduleUsagePatterns: {} // Will be populated as LLM uses modules
  };
}

// Initialize capability discovery
const d3CapabilityDiscovery = buildD3CapabilityDiscovery();
console.log('🔧 [Capability Discovery] Initialized with', d3CapabilityDiscovery.discoveredCapabilities.length, 'capabilities');
console.log('🔧 [Capability Discovery] Available:', d3CapabilityDiscovery.discoveredCapabilities.map(c => c.capabilityName));

// LLM wrapper (reuse from problems route)
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
      console.error("[simulations] failed to import services/llm/index.js:", e);
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
      "LLM service missing a compatible `json()` method."
    );
  })();
  return _llmPromise;
}

export const simulationsRouter = express.Router();


/**
 * POST /api/simulations/generate-d3
 * Generate D3.js visualizations based on lesson content
 */
simulationsRouter.post("/generate-d3", async (req: Request, res: Response) => {
  try {
    console.log("🔧 [simulations/generate-d3] Called with body:", req.body);

    const llm = await getLlm();

    const { content, context, subject, learningObjectives, requestedVisualizationType, structuredContent } = req.body;

    // Build D3.js learning prompt
    console.log('🤖 [AI Choice] Available capabilities:', d3CapabilityDiscovery.discoveredCapabilities.map(c => c.capabilityName));

    const systemPrompt = buildVisualizationSystemPrompt(d3CapabilityDiscovery.discoveredCapabilities);
    const userPrompt = buildVisualizationUserPrompt(
      content,
      subject,
      learningObjectives,
      context,
      structuredContent,
      requestedVisualizationType
    );

    const response = await llm.json<any>(
      z.any(), // We'll validate the structure
      {
        system: systemPrompt,
        user: userPrompt
      }
    );

    console.log("🔧 [simulations/generate-d3] LLM Response:", response);
    if (response.visualizations && response.visualizations[0]) {
      console.log("🤖 [AI Choice] LLM selected:", response.visualizations[0].selectedCapability);
      console.log("🤖 [AI Choice] Reasoning:", response.reasoning);
    }

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("🔧 [simulations/generate-d3] Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate D3.js visualizations",
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/simulations/d3-ping
 * Health check for D3.js simulation system
 */
simulationsRouter.get("/d3-ping", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "D3.js simulation system ready",
    capabilities: d3CapabilityDiscovery.availableModules.length,
    timestamp: new Date().toISOString()
  });
});

export default simulationsRouter;
