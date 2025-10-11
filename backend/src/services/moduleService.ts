import { DatabaseService } from './database.js';
import type { TModuleSpec, TGenerationContext, TYouTubeVideoSpec } from '@local/shared/module';
import type { DatabaseModuleRow } from '../types/database.js';
import type { DisciplineContext, ConceptGroup } from '@local/shared';

export class ModuleService {
  constructor(private db: DatabaseService) {}

  /**
   * Get discipline context for LLM analysis
   */
  async getDisciplineContext(disciplineId: string): Promise<DisciplineContext> {
    console.log(`🔍 [getDisciplineContext] ===== BUILDING DISCIPLINE CONTEXT =====`);
    console.log(`🔍 [getDisciplineContext] Discipline ID: ${disciplineId}`);
    
    // Phase 1: Get discipline and validate (required before proceeding)
    const discipline = await this.db.query(
      'SELECT * FROM disciplines WHERE id = $1',
      [disciplineId]
    );

    if (discipline.length === 0) {
      console.error(`🔍 [getDisciplineContext] ❌ Discipline not found: ${disciplineId}`);
      throw new Error(`Discipline not found: ${disciplineId}`);
    }

    console.log(`🔍 [getDisciplineContext] Discipline found: "${discipline[0].name}" (${discipline[0].category})`);

    // Phase 2: Get modules and concepts in parallel (both are independent of each other)
    const [existingModules, existingConcepts] = await Promise.all([
      this.db.query(
        'SELECT slug, title, description, concepts, tags FROM modules WHERE discipline = $1 AND draft = false',
        [disciplineId]
      ),
      this.db.query(
        'SELECT name, description FROM concepts WHERE discipline_id = $1',
        [disciplineId]
      )
    ]);

    console.log(`🔍 [getDisciplineContext] Found ${existingModules.length} existing modules:`);
    if (existingModules.length > 0) {
      existingModules.forEach((module, index) => {
        console.log(`🔍 [getDisciplineContext]   ${index + 1}. "${module.title}" (slug: "${module.slug}")`);
        console.log(`🔍 [getDisciplineContext]      Concepts: [${module.concepts?.join(', ') || 'none'}]`);
        console.log(`🔍 [getDisciplineContext]      Tags: [${module.tags?.join(', ') || 'none'}]`);
      });
    } else {
      console.log(`🔍 [getDisciplineContext]   No existing modules - will force create-new`);
    }
    
    console.log(`🔍 [getDisciplineContext] Found ${existingConcepts.length} existing concepts:`);
    if (existingConcepts.length > 0) {
      console.log(`🔍 [getDisciplineContext]   [${existingConcepts.map(c => c.name).join(', ')}]`);
    } else {
      console.log(`🔍 [getDisciplineContext]   No existing concepts`);
    }

    const context = {
      discipline: discipline[0],
      existingModules: existingModules.map(m => ({
        slug: m.slug,
        title: m.title,
        description: m.description,
        concepts: m.concepts || [],
        tags: m.tags || []
      })),
      existingConcepts: existingConcepts.map(c => c.name)
    };

    console.log(`🔍 [getDisciplineContext] ===== DISCIPLINE CONTEXT BUILT =====`);
    console.log(`🔍 [getDisciplineContext] Returning context with ${context.existingModules.length} modules and ${context.existingConcepts.length} concepts`);
    console.log(`🔍 [getDisciplineContext] ALLOWED_MODULE_SLUGS will be: [${context.existingModules.map(m => m.slug).join(', ')}]`);
    return context;
  }

  /**
   * Get all disciplines context for LLM analysis when no specific discipline is provided
   */
  async getAllDisciplinesContext(): Promise<any> {
    // All three queries are independent - can be parallelized for better performance
    const [disciplines, allModules, allConcepts] = await Promise.all([
      this.db.query('SELECT * FROM disciplines ORDER BY category, name'),
      this.db.query('SELECT slug, title, description, concepts, tags, discipline FROM modules WHERE draft = false'),
      this.db.query('SELECT name, description, discipline_id FROM concepts')
    ]);
    
    return {
      disciplines: disciplines,
      allModules: allModules,
      allConcepts: allConcepts
    };
  }

  /**
   * Save concepts for a module
   */
  async saveModuleConcepts(moduleSlug: string, conceptNames: string[]): Promise<void> {
    // First, ensure concepts exist in the concepts table
    for (const conceptName of conceptNames) {
      await this.db.query(`
        INSERT INTO concepts (name, discipline_id)
        VALUES ($1, (SELECT discipline FROM modules WHERE slug = $2))
        ON CONFLICT (name, discipline_id) DO NOTHING
      `, [conceptName, moduleSlug]);
    }

    // Then link modules to concepts
    for (const conceptName of conceptNames) {
      await this.db.query(`
        INSERT INTO module_concepts (module_id, concept_id)
        SELECT $1, id FROM concepts WHERE name = $2
        ON CONFLICT DO NOTHING
      `, [moduleSlug, conceptName]);
    }
  }

  /**
   * Get modules grouped by concept for a discipline
   */
  async getModulesByConcept(disciplineId: string): Promise<ConceptGroup[]> {
    const result = await this.db.query(`
      SELECT 
        c.name as concept_name,
        c.description as concept_description,
        m.slug,
        m.title,
        m.description,
        m.tags
      FROM concepts c
      LEFT JOIN module_concepts mc ON c.id = mc.concept_id
      LEFT JOIN modules m ON mc.module_id = m.slug
      WHERE c.discipline_id = $1 AND (m.draft = false OR m.draft IS NULL)
      ORDER BY c.name, m.created_at
    `, [disciplineId]);

    // Group by concept
    const conceptGroups: Record<string, ConceptGroup> = {};
    for (const row of result) {
      if (row.concept_name) {
        // Ensure concept group exists
        if (!conceptGroups[row.concept_name]) {
          conceptGroups[row.concept_name] = {
            name: row.concept_name,
            description: row.concept_description || undefined,
            modules: []
          };
        }
        
        // Add module if slug exists
        if (row.slug) {
          const conceptGroup = conceptGroups[row.concept_name];
          if (conceptGroup) {
            conceptGroup.modules.push({
              slug: row.slug,
              title: row.title,
              description: row.description,
              tags: row.tags || []
            });
          }
        }
      }
    }

    return Object.values(conceptGroups);
  }

  /**
   * Save a module to the database
   */
  async saveModule(module: TModuleSpec, generationContext?: TGenerationContext, userId?: string): Promise<TModuleSpec & { id: string; createdAt: Date; updatedAt: Date }> {
    console.log(`💾 [saveModule] Saving module: ${module.slug}`);
    console.log(`💾 [saveModule] Generation context provided:`, !!generationContext);
    console.log(`💾 [saveModule] Generation context type:`, typeof generationContext);
    console.log(`💾 [saveModule] Generation context value:`, generationContext);
    console.log(`💾 [saveModule] Generation context constructor:`, generationContext?.constructor?.name);
    
    // Debug: Check lessons and their youtubeSearchQuery
    console.log(`💾 [saveModule] Module has ${module.lessons?.length || 0} lessons`);
    if (module.lessons && module.lessons.length > 0) {
      module.lessons.forEach((lesson, index) => {
        console.log(`💾 [saveModule] Lesson ${index + 1}: "${lesson.title}"`);
        console.log(`💾 [saveModule]   - slug: ${lesson.slug}`);
        console.log(`💾 [saveModule]   - youtubeSearchQuery: ${lesson.youtubeSearchQuery || 'MISSING'}`);
        console.log(`💾 [saveModule]   - youtubeVideo: ${lesson.youtubeVideo ? 'EXISTS' : 'MISSING'}`);
      });
    }

    const query = `
      INSERT INTO modules (slug, title, description, lessons, exercises, tags, course, draft, version, generation_context, discipline, concepts, prerequisites, learning_outcomes, estimated_time, source_type, source_institution, contributor, original_photos, created_by, last_updated_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        lessons = EXCLUDED.lessons,
        exercises = EXCLUDED.exercises,
        tags = EXCLUDED.tags,
        course = EXCLUDED.course,
        draft = EXCLUDED.draft,
        generation_context = EXCLUDED.generation_context,
        discipline = EXCLUDED.discipline,
        concepts = EXCLUDED.concepts,
        prerequisites = EXCLUDED.prerequisites,
        learning_outcomes = EXCLUDED.learning_outcomes,
        estimated_time = EXCLUDED.estimated_time,
        source_type = EXCLUDED.source_type,
        source_institution = EXCLUDED.source_institution,
        contributor = EXCLUDED.contributor,
        original_photos = EXCLUDED.original_photos,
        last_updated_by = EXCLUDED.last_updated_by,
        updated_at = NOW()
      RETURNING id, slug, title, description, lessons, exercises, tags, course, draft, version, generation_context, discipline, concepts, prerequisites, learning_outcomes, estimated_time, source_type, source_institution, contributor, original_photos, created_by, last_updated_by, created_at, updated_at
    `;

    const generationContextJson = generationContext ? JSON.stringify(generationContext) : null;
    console.log(`💾 [saveModule] Generation context JSON:`, generationContextJson);

    const result = await this.db.query(query, [
      module.slug,
      module.title,
      module.description,
      JSON.stringify(module.lessons || []),
      JSON.stringify(module.exercises || []),
      module.tags || [],
      JSON.stringify(module.course || null),
      module.draft ?? true,
      module.version || 'v1',
      generationContextJson,
      module.discipline || null,
      module.concepts || [],
      module.prerequisites || [],
      module.learningOutcomes || [],
      module.estimatedTime || null,
      module.source?.type || 'user-upload',
      module.source?.institution || null,
      module.source?.contributor || null,
      JSON.stringify(module.originalPhotos || null),
      userId || null, // created_by
      userId || null  // last_updated_by
    ]);

    console.log(`💾 [saveModule] Module saved successfully: ${module.slug}`);

    // Return the saved module with the database-generated ID
    const savedModule = result[0];
    return {
      ...module,
      id: savedModule.id,
      createdAt: new Date(savedModule.created_at),
      updatedAt: new Date(savedModule.updated_at)
    };
  }

  /**
   * Get all published (non-draft) modules
   */
  async getPublishedModules(): Promise<TModuleSpec[]> {
    const rows = await this.db.query<DatabaseModuleRow>(`
      SELECT * FROM modules
      WHERE draft = false
      ORDER BY created_at DESC
    `);

    return rows.map(row => this.mapRowToModuleSpec(row));
  }

  /**
   * Get a module by slug
   */
  async getModuleBySlug(slug: string): Promise<TModuleSpec | null> {
    const rows = await this.db.query<DatabaseModuleRow>(
      'SELECT * FROM modules WHERE slug = $1',
      [slug]
    );

    if (rows.length > 0 && rows[0]) {
      const module = this.mapRowToModuleSpec(rows[0]);
      
      // Debug: Check what lessons are being retrieved
      console.log(`🔍 [getModuleBySlug] Retrieved module: ${module.slug}`);
      console.log(`🔍 [getModuleBySlug] Module has ${module.lessons?.length || 0} lessons`);
      if (module.lessons && module.lessons.length > 0) {
        module.lessons.forEach((lesson, index) => {
          console.log(`🔍 [getModuleBySlug] Lesson ${index + 1}: "${lesson.title}"`);
          console.log(`🔍 [getModuleBySlug]   - slug: ${lesson.slug}`);
          console.log(`🔍 [getModuleBySlug]   - youtubeSearchQuery: ${lesson.youtubeSearchQuery || 'MISSING'}`);
          console.log(`🔍 [getModuleBySlug]   - youtubeVideo: ${lesson.youtubeVideo ? 'EXISTS' : 'MISSING'}`);
        });
      }
      
      return module;
    }
    
    return null;
  }

  /**
   * Update a specific lesson's YouTube video data without affecting other module data
   */
  async updateLessonVideo(moduleSlug: string, lessonSlug: string, videoData: TYouTubeVideoSpec): Promise<void> {
    console.log(`🎥 [updateLessonVideo] Updating video for lesson ${lessonSlug} in module ${moduleSlug}`);
    
    // Find the lesson index first
    const module = await this.getModuleBySlug(moduleSlug);
    if (!module) {
      throw new Error(`Module with slug ${moduleSlug} not found`);
    }
    
    const lessonIndex = module.lessons.findIndex(l => l.slug === lessonSlug);
    if (lessonIndex === -1) {
      throw new Error(`Lesson with slug ${lessonSlug} not found in module ${moduleSlug}`);
    }
    
    console.log(`🎥 [updateLessonVideo] Found lesson at index ${lessonIndex}`);
    
    // Update just that lesson's youtubeVideo field using JSONB path
    const result = await this.db.query(`
      UPDATE modules 
      SET lessons = jsonb_set(lessons, $1, $2::jsonb),
          updated_at = NOW()
      WHERE slug = $3
    `, [
      `{${lessonIndex},youtubeVideo}`, // JSONB path to the specific lesson's youtubeVideo field
      JSON.stringify(videoData),       // Video data as JSON
      moduleSlug                       // Module slug for WHERE clause
    ]);
    
    console.log(`🎥 [updateLessonVideo] Updated ${(result as any).rowCount || 0} row(s)`);
  }

  /**
   * Get generation context for a module by slug
   */
  async getModuleGenerationContext(slug: string): Promise<TGenerationContext | null> {
    console.log(`🔍 [getModuleGenerationContext] Looking up context for slug: ${slug}`);

    const rows = await this.db.query(
      'SELECT generation_context FROM modules WHERE slug = $1',
      [slug]
    );

    console.log(`🔍 [getModuleGenerationContext] Found ${rows.length} rows`);
    console.log(`🔍 [getModuleGenerationContext] generation_context value:`, rows[0]?.generation_context);
    console.log(`🔍 [getModuleGenerationContext] generation_context type:`, typeof rows[0]?.generation_context);

    if (rows.length > 0 && rows[0]?.generation_context) {
      const rawValue = rows[0].generation_context;
      console.log(`🔍 [getModuleGenerationContext] Raw value:`, rawValue);
      console.log(`🔍 [getModuleGenerationContext] Raw value type:`, typeof rawValue);

      // JSONB columns are automatically parsed by PostgreSQL driver
      if (typeof rawValue === 'object' && rawValue !== null) {
        console.log(`🔍 [getModuleGenerationContext] Already parsed object:`, rawValue);
        return rawValue;
      }

      // Fallback for string values (if stored differently)
      try {
        const parsed = JSON.parse(rawValue);
        console.log(`🔍 [getModuleGenerationContext] Parsed context:`, parsed);
        return parsed;
      } catch (parseError) {
        console.error(`🔍 [getModuleGenerationContext] JSON parse error:`, parseError);
        console.error(`🔍 [getModuleGenerationContext] Failed to parse:`, rawValue);
        return null;
      }
    }

    console.log(`🔍 [getModuleGenerationContext] No generation context found`);
    return null;
  }

  /**
   * Get all modules (including drafts) - for admin purposes
   */
  async getAllModules(): Promise<TModuleSpec[]> {
    const rows = await this.db.query<DatabaseModuleRow>(`
      SELECT * FROM modules
      ORDER BY created_at DESC
    `);

    return rows.map(row => this.mapRowToModuleSpec(row));
  }

  /**
   * Publish a draft module
   */
  async publishModule(draftModule: TModuleSpec, generationContext?: TGenerationContext, userId?: string): Promise<TModuleSpec & { id: string; createdAt: Date; updatedAt: Date }> {
    console.log(`🚀 [publishModule] ===== PUBLISHING MODULE =====`);
    console.log(`🚀 [publishModule] Module title: "${draftModule.title}"`);
    console.log(`🚀 [publishModule] Module slug: "${draftModule.slug}"`);
    console.log(`🚀 [publishModule] Discipline: "${draftModule.discipline}"`);
    console.log(`🚀 [publishModule] Consolidation action: "${draftModule.consolidation?.action}"`);
    if (draftModule.consolidation?.action === 'append-to') {
      console.log(`🚀 [publishModule] Target module slug: "${draftModule.consolidation.targetModuleSlug}"`);
      console.log(`🚀 [publishModule] Consolidation reason: "${draftModule.consolidation.reason}"`);
    }
    console.log(`🚀 [publishModule] Exercise count: ${draftModule.exercises?.length || 0}`);
    console.log(`🚀 [publishModule] Lesson count: ${draftModule.lessons?.length || 0}`);
    
    // Ensure we have a valid slug for new modules
    if (!draftModule.slug || draftModule.slug.trim() === '') {
      if (draftModule.title) {
        draftModule.slug = this.generateSlugFromTitle(draftModule.title);
        console.log(`🔧 [publishModule] Generated missing slug: ${draftModule.slug} from title: ${draftModule.title}`);
      } else {
        throw new Error("Cannot publish module: missing both slug and title");
      }
    }
    
    if (draftModule.consolidation?.action === 'append-to') {
      if (!draftModule.consolidation.targetModuleSlug) {
        throw new Error("Cannot append: targetModuleSlug is missing from consolidation. Please regenerate the module.");
      }
      
      console.log(`🚀 [publishModule] Appending to existing module: ${draftModule.consolidation.targetModuleSlug}`);
      const mergedModule = await this.appendToExistingModule(draftModule, generationContext, userId);
      
      // Update the module count for the associated discipline
      if (mergedModule.discipline) {
        await this.updateDisciplineModuleCount(mergedModule.discipline);
      }
      
      return mergedModule;
    } else {
      console.log(`🚀 [publishModule] Creating new module`);
      const publishedModule = { ...draftModule, draft: false };
      const savedModule = await this.saveModule(publishedModule, generationContext, userId);

      // Update the module count for the associated discipline
      if (savedModule.discipline) {
        await this.updateDisciplineModuleCount(savedModule.discipline);
      }

      return savedModule;
    }
  }

  /**
   * Generate a slug from a title
   */
  private generateSlugFromTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Append new content to an existing module
   */
  private async appendToExistingModule(newContent: TModuleSpec, generationContext?: TGenerationContext, userId?: string): Promise<TModuleSpec & { id: string; createdAt: Date; updatedAt: Date }> {
    const targetSlug = newContent.consolidation?.targetModuleSlug;
    if (!targetSlug) {
      throw new Error(`Cannot append: targetModuleSlug is missing from consolidation`);
    }
    
    console.log(`📝 [appendToExistingModule] ===== APPENDING TO EXISTING MODULE =====`);
    console.log(`📝 [appendToExistingModule] Target module slug: "${targetSlug}"`);
    console.log(`📝 [appendToExistingModule] New content title: "${newContent.title}"`);
    console.log(`📝 [appendToExistingModule] New content concepts: [${newContent.concepts?.join(', ') || 'none'}]`);
    console.log(`📝 [appendToExistingModule] Consolidation reason: "${newContent.consolidation?.reason}"`);
    
    // Get the existing module
    const existingModule = await this.getModuleBySlug(targetSlug);
    if (!existingModule) {
      console.error(`📝 [appendToExistingModule] Target module not found: ${targetSlug}`);
      console.error(`📝 [appendToExistingModule] Available modules in discipline ${newContent.discipline}:`);
      
      // Debug: Show what modules actually exist in this discipline
      const availableModules = await this.db.query(
        'SELECT slug, title FROM modules WHERE discipline = $1 AND draft = false',
        [newContent.discipline]
      );
      console.error(`📝 [appendToExistingModule] Available modules:`, availableModules.map(m => ({ slug: m.slug, title: m.title })));
      
      throw new Error(`Target module not found: ${targetSlug}`);
    }
    
    console.log(`📝 [appendToExistingModule] Found existing module with ${existingModule.lessons?.length || 0} lessons and ${existingModule.exercises?.length || 0} exercises`);
    console.log(`📝 [appendToExistingModule] New content has ${newContent.lessons?.length || 0} lessons and ${newContent.exercises?.length || 0} exercises`);
    
    // Merge content: existing + new
    const mergedModule: TModuleSpec = {
      ...existingModule,
      // Keep existing title and description (no "extended" or "2")
      title: existingModule.title,
      slug: existingModule.slug, // Preserve the existing slug
      // Merge lessons and exercises
      lessons: [
        ...(existingModule.lessons || []),
        ...(newContent.lessons || [])
      ],
      exercises: [
        ...(existingModule.exercises || []),
        ...(newContent.exercises || [])
      ],
      // Update concepts if new ones are provided
      concepts: [
        ...(existingModule.concepts || []),
        ...(newContent.concepts || [])
      ].filter((concept, index, arr) => arr.indexOf(concept) === index), // Remove duplicates
      // Update other fields as needed
      learningOutcomes: [
        ...(existingModule.learningOutcomes || []),
        ...(newContent.learningOutcomes || [])
      ].filter((outcome, index, arr) => arr.indexOf(outcome) === index),
      estimatedTime: (existingModule.estimatedTime || 0) + (newContent.estimatedTime || 0),
      // Keep existing tags, add new ones
      tags: [
        ...(existingModule.tags || []),
        ...(newContent.tags || [])
      ].filter((tag, index, arr) => arr.indexOf(tag) === index),
      // Update generation context
      draft: false,
      // Ensure consolidation is set to create-new for merged modules
      consolidation: { action: 'create-new' }
    };
    
    console.log(`📝 [appendToExistingModule] Merged module now has ${mergedModule.lessons?.length || 0} lessons and ${mergedModule.exercises?.length || 0} exercises`);
    console.log(`📝 [appendToExistingModule] Breakdown: ${existingModule.lessons?.length || 0} existing + ${newContent.lessons?.length || 0} new = ${mergedModule.lessons?.length || 0} total lessons`);
    console.log(`📝 [appendToExistingModule] Breakdown: ${existingModule.exercises?.length || 0} existing + ${newContent.exercises?.length || 0} new = ${mergedModule.exercises?.length || 0} total exercises`);
    
    // Save the updated module
    const savedModule = await this.saveModule(mergedModule, generationContext, userId);
    
    return savedModule;
  }

  /**
   * Update the module count for a discipline
   */
  async updateDisciplineModuleCount(disciplineId: string): Promise<void> {
    const query = `
      UPDATE disciplines
      SET module_count = (
        SELECT COUNT(*) FROM modules
        WHERE discipline = $1 AND draft = false
      )
      WHERE id = $1
    `;
    await this.db.query(query, [disciplineId]);
  }

  /**
   * Update module counts for all disciplines
   */
  async updateAllDisciplineModuleCounts(): Promise<void> {
    const query = `
      UPDATE disciplines
      SET module_count = (
        SELECT COUNT(*) FROM modules
        WHERE modules.discipline = disciplines.id AND modules.draft = false
      )
    `;
    await this.db.query(query);
  }

  /**
   * Delete a module by slug
   */
  async deleteModule(slug: string): Promise<boolean> {
    // Get the discipline before deleting
    const existingModules = await this.db.query('SELECT discipline FROM modules WHERE slug = $1', [slug]);
    const disciplineId = existingModules.length > 0 ? existingModules[0].discipline : null;

    const result = await this.db.query(
      'DELETE FROM modules WHERE slug = $1',
      [slug]
    );

    // Update module count if module was deleted
    if ((result as any).rowCount > 0 && disciplineId) {
      await this.updateDisciplineModuleCount(disciplineId);
    }

    return (result as any).rowCount > 0;
  }

  /**
   * Convert database row to ModuleSpec
   */
  private mapRowToModuleSpec(row: DatabaseModuleRow): TModuleSpec {
    return {
      slug: row.slug,
      title: row.title,
      description: row.description,
      unlocked: true, // Default value as per shared/module.ts
      lessons: Array.isArray(row.lessons) ? row.lessons : [],
      exercises: Array.isArray(row.exercises) ? row.exercises as any : [],
      tags: Array.isArray(row.tags) ? row.tags : [],
      course: row.course || undefined,
      discipline: row.discipline || undefined,
      concepts: Array.isArray(row.concepts) ? row.concepts : [],
      prerequisites: Array.isArray(row.prerequisites) ? row.prerequisites : [],
      learningOutcomes: Array.isArray(row.learning_outcomes) ? row.learning_outcomes : [],
      estimatedTime: row.estimated_time || undefined,
      source: {
        type: (row.source_type as 'course-material' | 'user-upload') || 'user-upload',
        institution: row.source_institution || undefined,
        contributor: row.contributor || undefined,
      },
      originalPhotos: row.original_photos as any || undefined,
      draft: row.draft,
      version: row.version,
      consolidation: { action: 'create-new' } // Default value as per shared/module.ts
    };
  }
}
