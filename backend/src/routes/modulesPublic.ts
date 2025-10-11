// backend/src/routes/modulesPublic.ts
// Public module creation routes (students can build + publish modules).
// Uses JSON body with base64 images (no multipart deps).

import express, { type Express, type Request, type Response } from "express";
import { getProvider, validateModuleJson } from "../services/llm/index.js";
import { ModuleService } from "../services/moduleService.js";
import { DatabaseService } from "../services/database.js";
import { ModulePhotoIntegrationService } from "../services/modulePhotoIntegration.js";
import { authenticateUser, optionalAuth } from "../middleware/auth.js";
import type { TModuleSpec, TModuleBuildInput, TGenerationContext } from "@local/shared/module";

// Initialize database and services
const db = new DatabaseService();
const moduleService = new ModuleService(db);
const modulePhotoIntegrationService = new ModulePhotoIntegrationService(db);

// Create routers for modules, disciplines, and search
export const modulesRouter = express.Router();
export const disciplinesRouter = express.Router();
export const searchRouter = express.Router();

// Route definitions
/**
 * POST /modules/build-public
 * Body: { input, images:[{filename, mimeType, base64}] }
 * Returns: { draft: ModuleSpec, provider: string }
 */
type BuildPublicBody = {
  input: TModuleBuildInput;
  images: Array<{
    filename?: string | null;
    mimeType?: string | null; // guard against missing fields from clients
    base64?: string | null;
  }>;
  temperature?: number;
  model?: string | null;
  disciplineId?: string; // New: discipline ID for concept analysis
};

// Route parameter type for /modules/:slug
interface ModuleParams {
  slug: string;
}

  /**
   * POST /api/modules/build-public
   * Body: { input, images:[{mimeType, base64, filename?}], temperature?, model? }
   * Returns: { draft: ModuleSpec, provider: string }
   */
  modulesRouter.post("/build-public", async (req: Request, res: Response) => {
    try {
      const body = req.body as BuildPublicBody;

      // Minimal validation - topic is now optional
      if (!body || !body.input) {
        return res.status(400).json({ error: "Missing input" });
      }
      if (!Array.isArray(body.images)) {
        return res.status(400).json({ error: "images must be an array" });
      }

      // Convert images (omit undefined props to satisfy exactOptionalPropertyTypes)
      const visionImages = body.images.map((img) => {
        const b64 = typeof img.base64 === "string" ? img.base64 : "";
        const mime =
          typeof img.mimeType === "string" && img.mimeType ? img.mimeType : "application/octet-stream";

        const base = {
          bytes: Buffer.from(b64, "base64"),
          mimeType: mime,
        } as { bytes: Buffer; mimeType: string; filename?: string };

        if (typeof img.filename === "string" && img.filename.length > 0) {
          base.filename = img.filename; // only include if defined (no undefined)
        }
        return base;
      });

      const provider = getProvider();

      // Get discipline context if disciplineId is provided, or all disciplines context if not
      let disciplineContext = null;
      let allDisciplinesContext = null;
      
      if (body.disciplineId) {
        console.log(`🔍 [build-public] Getting discipline context for: ${body.disciplineId}`);
        disciplineContext = await moduleService.getDisciplineContext(body.disciplineId);
        console.log(`🔍 [build-public] Discipline context:`, {
          discipline: disciplineContext?.discipline?.name,
          existingModules: disciplineContext?.existingModules?.length || 0,
          existingConcepts: disciplineContext?.existingConcepts?.length || 0
        });
        if (disciplineContext?.existingModules?.length > 0) {
          console.log(`🔍 [build-public] Existing modules:`, disciplineContext.existingModules.map(m => ({ slug: m.slug, title: m.title })));
        }
      } else {
        console.log(`🔍 [build-public] No disciplineId provided - getting all disciplines context`);
        allDisciplinesContext = await moduleService.getAllDisciplinesContext();
        console.log(`🔍 [build-public] All disciplines context:`, {
          disciplinesCount: allDisciplinesContext?.disciplines?.length || 0,
          allModulesCount: allDisciplinesContext?.allModules?.length || 0,
          allConceptsCount: allDisciplinesContext?.allConcepts?.length || 0
        });
      }

      // Transform input to match provider's expected types
      const { course: originalCourse, ...inputWithoutCourse } = body.input;
      const transformedInput = {
        ...inputWithoutCourse,
        ...(originalCourse ? {
          course: (() => {
            const { week: originalWeek, ...courseWithoutWeek } = originalCourse;
            return {
              ...courseWithoutWeek,
              ...(originalWeek !== undefined ? { week: String(originalWeek) } : {}),
            };
          })(),
        } : {}),
      };

      // Build params with discipline context
      const buildParams: Parameters<typeof provider.buildModuleFromImages>[0] = {
        input: transformedInput,
        images: visionImages,
        ...(typeof body.temperature === "number" ? { temperature: body.temperature } : {}),
        ...(typeof body.model === "string" && body.model.length > 0 ? { model: body.model } : {}),
        ...(disciplineContext ? { disciplineContext } : {}),
        ...(allDisciplinesContext ? { allDisciplinesContext } : {}),
      };

      console.log(`🔍 [build-public] Build params:`, {
        hasDisciplineContext: !!disciplineContext,
        disciplineContextKeys: disciplineContext ? Object.keys(disciplineContext) : [],
        inputTopic: transformedInput.topic,
        imageCount: visionImages.length
      });

      const draft = await provider.buildModuleFromImages(buildParams);

      // Extra safety: validate again
      const validated = validateModuleJson(JSON.stringify(draft));

      // Include generation context for later use in problem generation
      const generationContext = {
        topic: body.input.topic,
        audience: body.input.audience,
        goals: body.input.goals,
        constraints: body.input.constraints,
        imageCount: body.images.length,
        temperature: body.temperature,
        model: body.model,
        createdAt: new Date().toISOString()
      };

      // Add consolidation analysis to response
      const consolidationInfo = {
        action: validated.consolidation?.action || 'create-new',
        targetModuleSlug: validated.consolidation?.targetModuleSlug || null,
        reason: validated.consolidation?.reason || 'No consolidation reason provided',
        generatedSlug: validated.slug,
        title: validated.title
      };

      // Enhanced logging for consolidation decision
      console.log(`🔍 [build-public] ===== CONSOLIDATION ANALYSIS =====`);
      console.log(`🔍 [build-public] Action: ${consolidationInfo.action}`);
      console.log(`🔍 [build-public] Generated slug: "${consolidationInfo.generatedSlug}"`);
      console.log(`🔍 [build-public] Title: "${consolidationInfo.title}"`);
      if (consolidationInfo.action === 'append-to') {
        console.log(`🔍 [build-public] Target module: "${consolidationInfo.targetModuleSlug}"`);
      }
      console.log(`🔍 [build-public] Reason: "${consolidationInfo.reason}"`);
      console.log(`🔍 [build-public] ===== END CONSOLIDATION ANALYSIS =====`);

      return res.json({
        module: validated,
        provider: provider.name(),
        generationContext,
        consolidationInfo
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return res.status(500).json({ error: msg });
    }
  });

  /**
   * POST /api/modules
   * Body: ModuleSpec (validated). Publishes module (draft=false) to database.
   * Returns: { ok: true, slug }
   */
  modulesRouter.post("/", async (req: Request, res: Response) => {
    try {
      console.log("[POST /modules] Received request");

      const { module, generationContext } = req.body;

      const jsonText = JSON.stringify(module ?? {});
      const spec = validateModuleJson(jsonText); // throws on invalid
      console.log("[POST /modules] Validation successful, spec:", spec);
      console.log("[POST /modules] Discipline:", spec.discipline || 'none');
      console.log("[POST /modules] Generation context:", generationContext);

      // Validate that the module has a slug before publishing
      if (!spec.slug || spec.slug.trim() === '') {
        console.error("[POST /modules] Module missing slug:", spec);
        return res.status(400).json({ error: "Module is missing a slug. Please regenerate the module." });
      }

      // Validate consolidation logic
      if (spec.consolidation?.action === 'append-to' && !spec.consolidation.targetModuleSlug) {
        console.error("[POST /modules] Module set to append but missing targetModuleSlug:", spec);
        return res.status(400).json({ error: "Module is set to append but missing target module slug. Please regenerate the module." });
      }

      // Validate that target module exists if trying to append
      if (spec.consolidation?.action === 'append-to' && spec.consolidation.targetModuleSlug) {
        const targetModule = await moduleService.getModuleBySlug(spec.consolidation.targetModuleSlug);
        if (!targetModule) {
          console.error("[POST /modules] Module set to append to non-existent target:", spec.consolidation.targetModuleSlug);
          return res.status(400).json({ 
            error: `Cannot append to module "${spec.consolidation.targetModuleSlug}" - module does not exist. Please regenerate the module.` 
          });
        }
      }

      // Publish the module (set draft: false) with generation context
      const publishedModule = await moduleService.publishModule(spec, generationContext);
      console.log("[POST /modules] Module published:", publishedModule.slug);

      return res.json({ ok: true, slug: publishedModule.slug });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[POST /modules] Error:", msg);
      return res.status(400).json({ error: msg });
    }
  });

  /**
   * GET /api/modules
   * Returns list of published modules.
   */
  modulesRouter.get("/", async (_req: Request, res: Response) => {
    try {
      const modules = await moduleService.getPublishedModules();
      return res.json({ modules });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[GET /modules] Error:", msg);
      return res.status(500).json({ error: "Database error" });
    }
  });

  /**
   * GET /api/modules/recent
   * Returns recent modules for landing page (public, no auth required)
   * Query params: limit (default 8)
   */
  modulesRouter.get("/recent", async (req: Request, res: Response) => {
    try {
      const { limit = '8' } = req.query;
      const resultLimit = Math.min(parseInt(limit as string, 10) || 8, 20); // Cap at 20 results

      console.log(`[GET /modules/recent] Fetching ${resultLimit} recent modules`);

      // Get recent modules with discipline info
      const modules = await db.query(`
        SELECT 
          m.slug,
          m.title,
          m.description,
          m.discipline,
          m.created_at,
          m.updated_at,
          d.name as "disciplineName",
          d.category as "disciplineCategory"
        FROM modules m
        LEFT JOIN disciplines d ON m.discipline = d.id
        WHERE m.draft = false
        ORDER BY m.created_at DESC
        LIMIT $1
      `, [resultLimit]);

      console.log(`[GET /modules/recent] Found ${modules.length} recent modules`);

      res.json({ 
        modules: modules.map(module => ({
          slug: module.slug,
          title: module.title,
          description: module.description,
          discipline: module.discipline,
          disciplineName: module.disciplineName,
          disciplineCategory: module.disciplineCategory,
          createdAt: module.created_at,
          updatedAt: module.updated_at
        }))
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[GET /modules/recent] Error:", msg);
      return res.status(500).json({ error: "Database error" });
    }
  });

  /**
   * GET /api/modules/:slug
   * Returns one module or 404.
   */
  modulesRouter.get("/:slug", async (req: Request<ModuleParams>, res: Response) => {
    try {
      const { slug } = req.params;
      const module = await moduleService.getModuleBySlug(slug);
      if (!module) return res.status(404).json({ error: "Module not found" });
      return res.json(module);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[GET /modules/:slug] Error:", msg);
      return res.status(500).json({ error: "Database error" });
    }
  });

  /**
   * GET /api/disciplines
   * Returns all disciplines grouped by category
   */
  disciplinesRouter.get('/', async (req: Request, res: Response) => {
    try {
      const disciplines = await db.query('SELECT * FROM disciplines ORDER BY category, name');

      // Group by category for frontend
      const grouped = disciplines.reduce((acc: any, disc: any) => {
        if (!acc[disc.category]) acc[disc.category] = [];
        acc[disc.category].push(disc);
        return acc;
      }, {});

      res.json({ disciplines: grouped });
    } catch (error) {
      console.error('Failed to fetch disciplines:', error);
      res.status(500).json({ error: 'Failed to fetch disciplines' });
    }
  });

  /**
   * GET /api/disciplines/:id/context
   * Returns discipline context for LLM analysis
   */
  disciplinesRouter.get('/:id/context', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'Discipline ID is required' });
      }
      const context = await moduleService.getDisciplineContext(id);
      res.json({ context });
    } catch (error) {
      console.error('Failed to fetch discipline context:', error);
      res.status(500).json({ error: 'Failed to fetch discipline context' });
    }
  });

  /**
   * GET /api/disciplines/:id/concepts
   * Returns modules grouped by concept for a discipline
   */
  disciplinesRouter.get('/:id/concepts', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'Discipline ID is required' });
      }
      const concepts = await moduleService.getModulesByConcept(id);
      res.json({ concepts });
    } catch (error) {
      console.error('Failed to fetch concepts:', error);
      res.status(500).json({ error: 'Failed to fetch concepts' });
    }
  });

  /**
   * GET /api/disciplines/:id/modules
   * Returns modules for specific discipline
   */
  disciplinesRouter.get('/:id/modules', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      console.log(`[GET /api/disciplines/${id}/modules] Fetching modules for discipline: ${id}`);

      const modules = await db.query(
        'SELECT * FROM modules WHERE discipline = $1 AND draft = false ORDER BY created_at DESC',
        [id]
      );

      console.log(`[GET /api/disciplines/${id}/modules] Found ${modules.length} modules:`, modules.map(m => ({ slug: m.slug, discipline: m.discipline, draft: m.draft })));
      res.json({ modules });
    } catch (error) {
      console.error('Failed to fetch discipline modules:', error);
      res.status(500).json({ error: 'Failed to fetch discipline modules' });
    }
  });

  /**
   * GET /api/disciplines/:id
   * Returns discipline details
   */
  disciplinesRouter.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const disciplines = await db.query(
        'SELECT * FROM disciplines WHERE id = $1',
        [id]
      );

      if (disciplines.length === 0) {
        return res.status(404).json({ error: 'Discipline not found' });
      }

      res.json({ discipline: disciplines[0] });
    } catch (error) {
      console.error('Failed to fetch discipline:', error);
      res.status(500).json({ error: 'Failed to fetch discipline' });
    }
  });

  /**
   * GET /api/search
   * Search across disciplines and modules
   * Query params: q (search term), limit (max results, default 10)
   */
  searchRouter.get('/', async (req: Request, res: Response) => {
    try {
      const { q: query, limit = '10' } = req.query;
      
      if (!query || typeof query !== 'string' || query.trim().length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
      }

      const searchTerm = `%${query.trim().toLowerCase()}%`;
      const resultLimit = Math.min(parseInt(limit as string, 10) || 10, 20); // Cap at 20 results

      console.log(`[GET /search] Searching for: "${query}" (limit: ${resultLimit})`);

      // Search disciplines and modules in parallel with efficient queries
      const [disciplineResults, moduleResults] = await Promise.all([
        // Search disciplines
        db.query(`
          SELECT 
            'discipline' as type,
            id,
            name,
            description,
            category,
            module_count as "moduleCount"
          FROM disciplines 
          WHERE LOWER(name) LIKE $1 
             OR LOWER(description) LIKE $1 
             OR LOWER(category) LIKE $1
          ORDER BY 
            CASE WHEN LOWER(name) LIKE $2 THEN 1 ELSE 2 END,
            module_count DESC,
            name ASC
          LIMIT $3
        `, [searchTerm, `%${query.trim().toLowerCase()}%`, Math.ceil(resultLimit / 2)]),

        // Search modules with discipline info
        db.query(`
          SELECT 
            'module' as type,
            m.slug,
            m.title,
            m.description,
            m.discipline,
            d.name as "disciplineName",
            d.category as "disciplineCategory"
          FROM modules m
          LEFT JOIN disciplines d ON m.discipline = d.id
          WHERE m.draft = false 
            AND (LOWER(m.title) LIKE $1 
                 OR LOWER(m.description) LIKE $1
                 OR LOWER(m.discipline) LIKE $1)
          ORDER BY 
            CASE WHEN LOWER(m.title) LIKE $2 THEN 1 ELSE 2 END,
            m.created_at DESC
          LIMIT $3
        `, [searchTerm, `%${query.trim().toLowerCase()}%`, Math.ceil(resultLimit / 2)])
      ]);

      // Combine and limit results
      const allResults = [...disciplineResults, ...moduleResults];
      const limitedResults = allResults.slice(0, resultLimit);

      console.log(`[GET /search] Found ${disciplineResults.length} disciplines, ${moduleResults.length} modules`);

      res.json({
        results: limitedResults,
        total: allResults.length,
        query: query.trim(),
        disciplines: disciplineResults.length,
        modules: moduleResults.length
      });

    } catch (error) {
      console.error('Search failed:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  /**
   * POST /api/modules/build
   * Authenticated version of build-public that includes photo attribution
   * Body: { input, images:[{filename, mimeType, base64}], temperature?, model?, disciplineId? }
   * Returns: { draft: ModuleSpec, provider: string, generationContext }
   */
  modulesRouter.post("/build", authenticateUser, async (req: Request, res: Response) => {
    try {
      const body = req.body as BuildPublicBody;
      const userId = req.user!.id;

      // Minimal validation - topic is now optional
      if (!body || !body.input) {
        return res.status(400).json({ error: "Missing input" });
      }
      if (!Array.isArray(body.images)) {
        return res.status(400).json({ error: "images must be an array" });
      }

      console.log(`[build] User ${userId} building module with ${body.images.length} images`);

      // Convert images (omit undefined props to satisfy exactOptionalPropertyTypes)
      const visionImages = body.images.map((img) => {
        const b64 = typeof img.base64 === "string" ? img.base64 : "";
        const mime =
          typeof img.mimeType === "string" && img.mimeType ? img.mimeType : "application/octet-stream";

        const base = {
          bytes: Buffer.from(b64, "base64"),
          mimeType: mime,
        } as { bytes: Buffer; mimeType: string; filename?: string };

        if (typeof img.filename === "string" && img.filename.length > 0) {
          base.filename = img.filename; // only include if defined (no undefined)
        }
        return base;
      });

      const provider = getProvider();

      // Get discipline context if disciplineId is provided, or all disciplines context if not
      let disciplineContext = null;
      let allDisciplinesContext = null;
      
      if (body.disciplineId) {
        console.log(`🔍 [build] Getting discipline context for: ${body.disciplineId}`);
        disciplineContext = await moduleService.getDisciplineContext(body.disciplineId);
      } else {
        console.log(`🔍 [build] No disciplineId provided - getting all disciplines context`);
        allDisciplinesContext = await moduleService.getAllDisciplinesContext();
      }

      // Transform input to match provider's expected types
      const { course: originalCourse, ...inputWithoutCourse } = body.input;
      const transformedInput = {
        ...inputWithoutCourse,
        ...(originalCourse ? {
          course: (() => {
            const { week: originalWeek, ...courseWithoutWeek } = originalCourse;
            return {
              ...courseWithoutWeek,
              ...(originalWeek !== undefined ? { week: String(originalWeek) } : {}),
            };
          })(),
        } : {}),
      };

      // Build params with discipline context
      const buildParams: Parameters<typeof provider.buildModuleFromImages>[0] = {
        input: transformedInput,
        images: visionImages,
        ...(typeof body.temperature === "number" ? { temperature: body.temperature } : {}),
        ...(typeof body.model === "string" && body.model.length > 0 ? { model: body.model } : {}),
        ...(disciplineContext ? { disciplineContext } : {}),
        ...(allDisciplinesContext ? { allDisciplinesContext } : {}),
      };

      const draft = await provider.buildModuleFromImages(buildParams);

      // Extra safety: validate again
      const validated = validateModuleJson(JSON.stringify(draft));

      // Include generation context for later use in problem generation
      const generationContext = {
        topic: body.input.topic,
        audience: body.input.audience,
        goals: body.input.goals,
        constraints: body.input.constraints,
        imageCount: body.images.length,
        temperature: body.temperature,
        model: body.model,
        userId: userId,
        createdAt: new Date().toISOString()
      };

      console.log(`[build] Successfully built draft for user ${userId}: ${validated.slug}`);

      return res.json({
        module: validated,
        provider: provider.name(),
        generationContext
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[build] Error:`, msg);
      return res.status(500).json({ error: msg });
    }
  });

  /**
   * POST /api/modules/publish
   * Authenticated version of module publishing that includes photo attribution
   * Body: { module, generationContext, photos }
   * Returns: { ok: true, slug, photoGroup, photos }
   */
  modulesRouter.post("/publish", authenticateUser, async (req: Request, res: Response) => {
    try {
      console.log("[publish] Received request");
      const userId = req.user!.id;

      const { module, generationContext, photos } = req.body;

      const jsonText = JSON.stringify(module ?? {});
      const spec = validateModuleJson(jsonText); // throws on invalid
      console.log("[publish] Validation successful, spec:", spec);
      console.log("[publish] User:", userId);
      console.log("[publish] Photos:", photos?.length || 0);

      // Validate that the module has a slug before publishing
      if (!spec.slug || spec.slug.trim() === '') {
        console.error("[publish] Module missing slug:", spec);
        return res.status(400).json({ error: "Module is missing a slug. Please regenerate the module." });
      }

      // Validate consolidation logic
      if (spec.consolidation?.action === 'append-to' && !spec.consolidation.targetModuleSlug) {
        console.error("[publish] Module set to append but missing targetModuleSlug:", spec);
        return res.status(400).json({ error: "Module is set to append but missing target module slug. Please regenerate the module." });
      }

      // Validate that target module exists if trying to append
      if (spec.consolidation?.action === 'append-to' && spec.consolidation.targetModuleSlug) {
        const targetModule = await moduleService.getModuleBySlug(spec.consolidation.targetModuleSlug);
        if (!targetModule) {
          console.error("[publish] Module set to append to non-existent target:", spec.consolidation.targetModuleSlug);
          return res.status(400).json({ 
            error: `Cannot append to module "${spec.consolidation.targetModuleSlug}" - module does not exist. Please regenerate the module.` 
          });
        }
      }

      // Create module with photo attribution
      const result = await modulePhotoIntegrationService.createModuleWithPhotoAttribution(
        spec,
        generationContext,
        userId,
        photos || []
      );

      console.log("[publish] Module published with attribution:", result.module.slug);

      return res.json({ 
        ok: true, 
        slug: result.module.slug,
        photoGroup: result.photoGroup,
        photos: result.photos
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[publish] Error:", msg);
      return res.status(400).json({ error: msg });
    }
  });

// Export function to mount routers
export function attachPublicModuleRoutes(app: Express) {
  // Mount the routers with /api prefix
  app.use("/api/modules", modulesRouter);
  app.use("/api/disciplines", disciplinesRouter);
  app.use("/api/search", searchRouter);
}