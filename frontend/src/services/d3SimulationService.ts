// frontend/src/services/d3SimulationService.ts
// D3.js simulation service - handles API communication for dynamic visualizations

// Import types from shared directory
import {
  type D3GenerationRequest,
  type D3GenerationResponse,
  AVAILABLE_D3_MODULES
} from "@shared/index.ts";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || ''}/api/simulations`;

/**
 * D3.js Simulation Service
 * Handles all communication with the D3.js backend APIs
 */
export class D3SimulationService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }



  /**
   * Generate D3.js visualizations for lesson content
   * LLM analyzes content and creates appropriate D3.js configurations
   */
  async generateD3Visualizations(
    content: string,
    context: any,
    subject: string,
    learningObjectives: string[],
    requestedVisualizationType?: string,
    structuredContent?: any
  ): Promise<D3GenerationResponse> {
    try {
      // Use static modules from shared directory - no API call needed
      const request: D3GenerationRequest = {
        content,
        context,
        subject,
        learningObjectives,
        availableModules: AVAILABLE_D3_MODULES,
        requestedVisualizationType, // Pass the requested type to backend
        structuredContent // Pass structured content for better visualization
      };

      const response = await fetch(`${this.baseUrl}/generate-d3`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to generate D3.js visualizations: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to generate D3.js visualizations");
      }

      return result.data;
    } catch (error) {
      console.error("D3SimulationService.generateD3Visualizations error:", error);
      throw error;
    }
  }

  /**
   * Health check for D3.js simulation system
   */
  async pingD3System(): Promise<{
    success: boolean;
    message: string;
    capabilities: number;
    timestamp: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/d3-ping`);

      if (!response.ok) {
        throw new Error(`D3.js system health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("D3SimulationService.pingD3System error:", error);
      throw error;
    }
  }


}

/**
 * Singleton instance for easy access
 */
export const d3SimulationService = new D3SimulationService();

/**
 * Utility function to check if D3.js system is ready
 */
export async function checkD3SystemHealth(): Promise<boolean> {
  try {
    const health = await d3SimulationService.pingD3System();
    return health.success;
  } catch (error) {
    console.error("D3.js system health check failed:", error);
    return false;
  }
}
