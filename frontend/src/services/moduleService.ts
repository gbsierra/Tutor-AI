import type { TModuleSpec, TGenerationContext, TModuleBuildResponse } from "@shared/module";
import type { ModulePhotoAttribution, PhotoAttribution } from "@shared/auth";
import type { LocalImage, RecentModule, RecentModulesResponse } from "@shared/types";
import { getApiClient } from "@shared/apiClient";

/**
 * Photo data for API requests (simplified from LocalImage)
 */
interface PhotoRequestData {
  filename: string;
  mimeType: string;
  base64: string;
}

/**
 * Request body for module creation/publishing
 */
interface ModuleRequest {
  module: TModuleSpec;
  generationContext: TGenerationContext;
  photos?: PhotoRequestData[];
}

/**
 * Response from module creation/publishing
 */
interface ModuleResponse {
  ok: boolean;
  slug: string;
  module?: TModuleSpec;
}

export class ModuleService {
  static async buildDraft(
    images: LocalImage[],
    topic: string,
    audience: string,
    goals: string,
    constraints: string,
    disciplineId?: string,
    userId?: string
  ): Promise<TModuleBuildResponse> {
    if (images.length === 0) {
      throw new Error("Please upload some lecture photos first");
    }

    const body = {
      input: {
        topic: topic || undefined, // Make topic optional
        audience: audience || undefined,
        goals: goals.split(";").map((s) => s.trim()).filter(Boolean),
        constraints: constraints.split(";").map((s) => s.trim()).filter(Boolean),
        course: {},
      },
      images: images.map((img) => ({
        filename: img.file.name,
        mimeType: img.mimeType,
        base64: img.base64 || '', // Handle cases where base64 generation failed
      })),
      temperature: 0.2,
      ...(disciplineId ? { disciplineId } : {}),
    };

    try {
      const apiClient = getApiClient();
      // Use authenticated endpoint if user is logged in
      const endpoint = userId ? '/api/modules/build' : '/api/modules/build-public';
      
      const data = await apiClient.post<TModuleBuildResponse>(endpoint, body);
      
      return {
        module: data.module,
        generationContext: data.generationContext
      };
    } catch (error) {
      throw error;
    }
  }

  static async publishModule(
    module: TModuleSpec, 
    generationContext?: TGenerationContext,
    userId?: string,
    photos?: Array<{ filename: string; mimeType: string; base64: string }>
  ): Promise<TModuleSpec> {
    if (!module) throw new Error("No module to publish");

    try {
      const apiClient = getApiClient();
      // Use authenticated endpoint if user is logged in
      const endpoint = userId ? '/api/modules/publish' : '/api/modules';
      
      const body: ModuleRequest = {
        module,
        generationContext: generationContext!
      };

      // Include photos for authenticated requests
      if (userId && photos) {
        body.photos = photos;
      }

      const data = await apiClient.post<ModuleResponse>(endpoint, body);
      
      // Return the full module object instead of just the slug
      // The backend returns { ok: true, slug: publishedModule.slug }
      // But we need the full module for the frontend
      if (data.ok && data.slug) {
        // For new modules, construct the published module
        const publishedModule = { ...module, slug: data.slug, draft: false };
        return publishedModule;
      } else {
        throw new Error("Backend did not return a valid slug");
      }
    } catch (error) {
      // Fallback to direct fetch for public endpoint if API client fails
      if (!userId) {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/modules`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ module, generationContext }),
        });

        const data = await response.json();
        if (!response.ok) {
          console.error("Backend error response:", data);
          throw new Error(data?.error || `HTTP ${response.status}: ${JSON.stringify(data)}`);
        }
        
        if (data.ok && data.slug) {
          const publishedModule = { ...module, slug: data.slug, draft: false };
          return publishedModule;
        } else {
          throw new Error("Backend did not return a valid slug");
        }
      }
      throw error;
    }
  }

  static async regenerateModule(
    images: LocalImage[],
    moduleDraft: TModuleSpec,
    topic: string,
    audience: string,
    goals: string,
    constraints: string,
    _disciplineId?: string
  ): Promise<TModuleSpec> {
    // Update the module draft with current form values
    const updatedInput = {
      topic: topic || moduleDraft.title,
      audience: audience || "undergraduate students",
      goals: goals.split(";").map((s) => s.trim()).filter(Boolean),
      constraints: constraints.split(";").map((s) => s.trim()).filter(Boolean),
      course: moduleDraft.course || {},
    };

    const body = {
      input: updatedInput,
      images: images.map((img) => ({
        filename: img.file.name,
        mimeType: img.mimeType,
        base64: img.base64 || '',
      })),
      temperature: 0.2,
    };

    try {
      const apiClient = getApiClient();
      const data = await apiClient.post<TModuleBuildResponse>('/api/modules/build-public', body);
      return data.module;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get detailed photo attributions for a module
   */
  static async getModulePhotoAttributions(moduleSlug: string): Promise<{
    photoAttributions: ModulePhotoAttribution[];
    contributors: PhotoAttribution[];
    totalPhotos: number;
  }> {
    try {
      const apiClient = getApiClient();
      return await apiClient.get(`/api/modules/${moduleSlug}/photo-attributions-detailed`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * List all modules (public endpoint)
   */
  static async listModules(): Promise<TModuleSpec[]> {
    try {
      const apiClient = getApiClient();
      const data = await apiClient.get<{ modules: TModuleSpec[] }>('/api/modules');
      return data.modules ?? [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a specific module by slug (public endpoint)
   */
  static async getModule(slug: string): Promise<TModuleSpec> {
    try {
      const apiClient = getApiClient();
      return await apiClient.get<TModuleSpec>(`/api/modules/${encodeURIComponent(slug)}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get recent modules for landing page (public endpoint)
   */
  static async getRecentModules(limit: number = 8): Promise<RecentModule[]> {
    try {
      const apiClient = getApiClient();
      const data = await apiClient.get<RecentModulesResponse>(`/api/modules/recent?limit=${limit}`);
      return data.modules ?? [];
    } catch (error) {
      throw error;
    }
  }
}
