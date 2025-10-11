// backend/src/index.ts
import express, { type Request, type Response } from "express";
import cors from "cors";
import "dotenv/config";

import { attachPublicModuleRoutes } from "./routes/modulesPublic.js";
import problemsRouter from "./routes/problems.js";
import simulationsRouter from "./routes/simulations.js";
import { visualizationsRouter } from "./routes/visualizations.js";
import authRouter from "./routes/auth.js";
import photoAttributionRouter from "./routes/photoAttribution.js";
import recentExercisesRouter from "./routes/recentExercises.js";
import youtubeRouter from "./routes/youtube.js";
import { db } from "./services/database.js";

const app = express();

// Allow JSON bodies up to ~50MB (for multiple base64 images)
app.use(express.json({ limit: "50mb" }));

// Allow URL-encoded bodies up to ~50MB (for form data)
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS: allow frontend dev server and production
const allowedOrigins: (string | boolean)[] = [
  "http://localhost:5173", // Development
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: false,
  })
);

// Attach our public modules API routes
attachPublicModuleRoutes(app);

// NEW: Authentication API
app.use("/api/auth", authRouter);

// NEW: Photo Attribution API
app.use("/api", photoAttributionRouter);

// NEW: Recent Exercises API
app.use("/api/recent-exercises", recentExercisesRouter);

// NEW: LLM Problems API
app.use("/api/problems", problemsRouter);

// NEW: D3.js Simulations API
app.use("/api/simulations", simulationsRouter);

// NEW: Visualization Persistence API
app.use("/api/visualizations", visualizationsRouter);

// NEW: YouTube Video API
app.use("/api/youtube", youtubeRouter);

// Health check with database status
app.get("/healthz", async (_req: Request, res: Response) => {
  try {
    const dbHealthy = await db.healthCheck();
    const dbInfo = db.getConnectionInfo();

    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? "healthy" : "unhealthy",
        api: "healthy"
      },
      database: dbHealthy ? {
        status: "connected",
        connections: dbInfo
      } : {
        status: "disconnected"
      }
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      error: "Health check failed",
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`[backend] listening on http://localhost:${PORT}`);
});
