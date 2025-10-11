// backend/src/routes/visualizations.ts
// API routes for lesson visualization persistence

import express, { type Request, type Response } from "express";
import { visualizationService, type LessonVisualization } from "../services/visualizationService.js";

export const visualizationsRouter = express.Router();

/**
 * POST /api/visualizations
 * Save a lesson visualization
 */
visualizationsRouter.post("/", async (req: Request, res: Response) => {
  try {
    console.log("💾 [POST /api/visualizations] Saving visualization");

    const {
      moduleSlug,
      lessonSlug,
      lessonTitle,
      visualizationType,
      visualizationData,
      userSessionId
    } = req.body;

    if (!moduleSlug || !lessonSlug || !visualizationData) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: moduleSlug, lessonSlug, visualizationData"
      });
    }

    const visualization: LessonVisualization = {
      moduleSlug,
      lessonSlug,
      lessonTitle: lessonTitle || "Untitled Lesson",
      visualizationType: visualizationType || "unknown",
      visualizationData,
      userSessionId
    };

    await visualizationService.saveVisualization(visualization);

    console.log("✅ [POST /api/visualizations] Visualization saved successfully");

    res.json({
      success: true,
      message: "Visualization saved successfully",
      data: {
        moduleSlug,
        lessonSlug,
        visualizationType
      }
    });

  } catch (error: any) {
    console.error("❌ [POST /api/visualizations] Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to save visualization"
    });
  }
});

/**
 * GET /api/visualizations/:moduleSlug/:lessonSlug
 * Get a lesson visualization
 */
visualizationsRouter.get("/:moduleSlug/:lessonSlug", async (req: Request, res: Response) => {
  try {
    const { moduleSlug, lessonSlug } = req.params;

    if (!moduleSlug || !lessonSlug) {
      return res.status(400).json({
        success: false,
        error: "Module slug and lesson slug are required"
      });
    }

    console.log(`🔍 [GET /api/visualizations] Loading visualization for ${moduleSlug}/${lessonSlug}`);

    const visualization = await visualizationService.getVisualization({
      moduleSlug,
      lessonSlug
    });

    if (!visualization) {
      return res.json({
        success: true,
        data: null,
        message: "No visualization found"
      });
    }

    // Parse the JSONB data
    let visualizationData;
    try {
      visualizationData = typeof visualization.visualization_data === 'string'
        ? JSON.parse(visualization.visualization_data)
        : visualization.visualization_data;
    } catch (parseError) {
      console.warn("⚠️ [GET /api/visualizations] Failed to parse visualization_data:", parseError);
      visualizationData = visualization.visualization_data;
    }

    console.log("✅ [GET /api/visualizations] Visualization loaded successfully");

    res.json({
      success: true,
      data: {
        id: visualization.id,
        moduleSlug: visualization.module_slug,
        lessonSlug: visualization.lesson_slug,
        lessonTitle: visualization.lesson_title,
        visualizationType: visualization.visualization_type,
        visualizationData,
        createdAt: visualization.created_at,
        updatedAt: visualization.updated_at
      }
    });

  } catch (error: any) {
    console.error("❌ [GET /api/visualizations] Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to load visualization"
    });
  }
});

/**
 * DELETE /api/visualizations/:moduleSlug/:lessonSlug
 * Delete a lesson visualization
 */
visualizationsRouter.delete("/:moduleSlug/:lessonSlug", async (req: Request, res: Response) => {
  try {
    const { moduleSlug, lessonSlug } = req.params;
    const { userSessionId } = req.query;

    if (!moduleSlug || !lessonSlug) {
      return res.status(400).json({
        success: false,
        error: "Module slug and lesson slug are required"
      });
    }

    console.log(`🗑️ [DELETE /api/visualizations] Deleting visualization for ${moduleSlug}/${lessonSlug}`);

    const deleted = await visualizationService.deleteVisualization(
      moduleSlug,
      lessonSlug,
      userSessionId as string
    );

    if (deleted) {
      console.log("✅ [DELETE /api/visualizations] Visualization deleted successfully");
      res.json({
        success: true,
        message: "Visualization deleted successfully"
      });
    } else {
      res.status(404).json({
        success: false,
        error: "Visualization not found"
      });
    }

  } catch (error: any) {
    console.error("❌ [DELETE /api/visualizations] Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete visualization"
    });
  }
});

/**
 * GET /api/visualizations/module/:moduleSlug
 * Get all visualizations for a module
 */
visualizationsRouter.get("/module/:moduleSlug", async (req: Request, res: Response) => {
  try {
    const { moduleSlug } = req.params;
    const { userSessionId } = req.query;

    if (!moduleSlug) {
      return res.status(400).json({
        success: false,
        error: "Module slug is required"
      });
    }

    console.log(`📊 [GET /api/visualizations/module] Loading visualizations for module ${moduleSlug}`);

    const visualizations = await visualizationService.getModuleVisualizations(
      moduleSlug,
      userSessionId as string
    );

    // Parse JSONB data for each visualization
    const processedVisualizations = visualizations.map(viz => ({
      id: viz.id,
      moduleSlug: viz.module_slug,
      lessonSlug: viz.lesson_slug,
      lessonTitle: viz.lesson_title,
      visualizationType: viz.visualization_type,
      visualizationData: typeof viz.visualization_data === 'string'
        ? JSON.parse(viz.visualization_data)
        : viz.visualization_data,
      createdAt: viz.created_at,
      updatedAt: viz.updated_at
    }));

    console.log(`✅ [GET /api/visualizations/module] Loaded ${processedVisualizations.length} visualizations`);

    res.json({
      success: true,
      data: processedVisualizations
    });

  } catch (error: any) {
    console.error("❌ [GET /api/visualizations/module] Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to load module visualizations"
    });
  }
});

/**
 * GET /api/visualizations/stats
 * Get visualization statistics (admin endpoint)
 */
visualizationsRouter.get("/stats", async (req: Request, res: Response) => {
  try {
    console.log("📈 [GET /api/visualizations/stats] Getting visualization statistics");

    const stats = await visualizationService.getVisualizationStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error("❌ [GET /api/visualizations/stats] Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get visualization statistics"
    });
  }
});

export default visualizationsRouter;
