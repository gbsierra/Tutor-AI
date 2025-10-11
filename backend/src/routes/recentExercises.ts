// backend/src/routes/recentExercises.ts
import express, { type Request, type Response } from "express";
import { authenticateUser } from "../middleware/auth.js";
import { RecentExercisesService } from "../services/recentExercisesService.js";
import { db } from "../services/database.js";

const router = express.Router();
const recentExercisesService = new RecentExercisesService(db);

/**
 * GET /api/recent-exercises
 * Get recent exercises for the authenticated user
 * Query params: moduleSlug (optional) - filter by module
 */
router.get("/", authenticateUser, async (req: Request, res: Response) => {
  try {
    const { moduleSlug } = req.query as { moduleSlug?: string };
    const userId = req.user!.id;

    const recentExercises = await recentExercisesService.getRecentExercises(userId, moduleSlug);

    res.json({
      ok: true,
      recentExercises
    });
  } catch (error) {
    console.error("Error fetching recent exercises:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch recent exercises"
    });
  }
});

/**
 * POST /api/recent-exercises
 * Add or update a recent exercise for the authenticated user
 * Body: { moduleSlug, exerciseSlug, exerciseTitle }
 */
router.post("/", authenticateUser, async (req: Request, res: Response) => {
  try {
    const { moduleSlug, exerciseSlug, exerciseTitle } = req.body;
    const userId = req.user!.id;

    if (!moduleSlug || !exerciseSlug || !exerciseTitle) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: moduleSlug, exerciseSlug, exerciseTitle"
      });
    }

    await recentExercisesService.addRecentExercise(userId, moduleSlug, exerciseSlug, exerciseTitle);

    res.json({
      ok: true,
      message: "Recent exercise added successfully"
    });
  } catch (error) {
    console.error("Error adding recent exercise:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to add recent exercise"
    });
  }
});

/**
 * DELETE /api/recent-exercises/:moduleSlug/:exerciseSlug
 * Remove a specific recent exercise for the authenticated user
 */
router.delete("/:moduleSlug/:exerciseSlug", authenticateUser, async (req: Request, res: Response) => {
  try {
    const { moduleSlug, exerciseSlug } = req.params;
    const userId = req.user!.id;

    await recentExercisesService.removeRecentExercise(userId, moduleSlug, exerciseSlug);

    res.json({
      ok: true,
      message: "Recent exercise removed successfully"
    });
  } catch (error) {
    console.error("Error removing recent exercise:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to remove recent exercise"
    });
  }
});

/**
 * DELETE /api/recent-exercises
 * Clear all recent exercises for the authenticated user
 */
router.delete("/", authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    await recentExercisesService.clearRecentExercises(userId);

    res.json({
      ok: true,
      message: "All recent exercises cleared successfully"
    });
  } catch (error) {
    console.error("Error clearing recent exercises:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to clear recent exercises"
    });
  }
});

export default router;
