// backend/src/services/modulePhotoIntegration.ts
// Clean integration service between module creation and photo attribution
// This service handles the coordination between ModuleService and PhotoAttributionService

import { DatabaseService } from './database.js';
import { PhotoAttributionService } from './photoAttributionService.js';
import { ModuleService } from './moduleService.js';
import type { TModuleSpec, TGenerationContext } from '@local/shared/module';
import type { PhotoGroup, Photo } from '@local/shared/auth.js';

export interface ModulePhotoIntegrationResult {
  module: TModuleSpec & { id: string; createdAt: Date; updatedAt: Date };
  photoGroup?: PhotoGroup;
  photos?: Photo[];
}

export class ModulePhotoIntegrationService {
  private photoAttributionService: PhotoAttributionService;
  private moduleService: ModuleService;

  constructor(private db: DatabaseService) {
    this.photoAttributionService = new PhotoAttributionService(db);
    this.moduleService = new ModuleService(db);
  }

  /**
   * Create a module with photo attribution
   * This is the main integration point that coordinates both services
   */
  async createModuleWithPhotoAttribution(
    moduleSpec: TModuleSpec,
    generationContext: TGenerationContext | undefined,
    userId: string,
    photos: Array<{
      filename: string;
      mimeType: string;
      base64: string;
    }>
  ): Promise<ModulePhotoIntegrationResult> {
    try {
      console.log(`[ModulePhotoIntegration] Creating module with photo attribution for user: ${userId}`);
      
      // Step 1: Create photo group and publish module in parallel (they're independent)
      const [photoGroup, publishedModule] = await Promise.all([
        this.createPhotoGroupForModule(moduleSpec, userId, photos),
        this.moduleService.publishModule(moduleSpec, generationContext, userId)
      ]);

      // Step 2: Link photo group to module and record module contribution in parallel
      await Promise.all([
        this.linkPhotoGroupToModule(publishedModule.slug, photoGroup.id),
        this.photoAttributionService.recordUserContribution(
          userId,
          'module',
          publishedModule.id,
          { 
            type: 'module_creation', 
            title: publishedModule.title,
            discipline: publishedModule.discipline,
            photoCount: photos.length
          }
        )
      ]);

      console.log(`[ModulePhotoIntegration] Successfully created module ${publishedModule.slug} with photo attribution`);

      // Step 3: Get user photos (can be async, doesn't affect response)
      const userPhotos = await this.photoAttributionService.getUserPhotos(userId);

      return {
        module: publishedModule,
        photoGroup,
        photos: userPhotos
      };
    } catch (error) {
      console.error('[ModulePhotoIntegration] Error creating module with photo attribution:', error);
      throw new Error(`Failed to create module with photo attribution: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create a photo group for a module being created
   */
  private async createPhotoGroupForModule(
    moduleSpec: TModuleSpec,
    userId: string,
    photos: Array<{
      filename: string;
      mimeType: string;
      base64: string;
    }>
  ): Promise<PhotoGroup> {
    try {
      // Create photo group with module title and description
      const photoGroup = await this.photoAttributionService.createPhotoGroup(
        moduleSpec.title,
        moduleSpec.description || `Photos for ${moduleSpec.title}`,
        moduleSpec.discipline,
        userId
      );

      // Record photo group creation contribution
      await this.photoAttributionService.recordUserContribution(
        userId,
        'photo',
        photoGroup.id,
        { 
          type: 'photo_group_creation', 
          title: moduleSpec.title,
          description: moduleSpec.description,
          moduleSlug: moduleSpec.slug
        }
      );

      // Add photos to the group
      const photoData = photos.map(photo => ({
        filename: photo.filename,
        mimeType: photo.mimeType,
        fileSize: Math.round(photo.base64.length * 0.75), // Approximate file size from base64
        url: `data:${photo.mimeType};base64,${photo.base64}` // Store base64 data for display
      }));

      const uploadedPhotos = await this.photoAttributionService.addPhotosToGroup(
        photoGroup.id,
        photoData,
        userId
      );

      // Record individual photo contributions in parallel
      const photoContributionPromises = uploadedPhotos.map(photo => 
        this.photoAttributionService.recordUserContribution(
          userId,
          'photo',
          photo.id,
          { 
            type: 'photo_upload', 
            filename: photo.filename,
            moduleSlug: moduleSpec.slug
          }
        )
      );
      await Promise.all(photoContributionPromises);

      console.log(`[ModulePhotoIntegration] Created photo group ${photoGroup.id} with ${uploadedPhotos.length} photos`);
      return photoGroup;
    } catch (error) {
      console.error('[ModulePhotoIntegration] Error creating photo group:', error);
      throw error;
    }
  }

  /**
   * Link a photo group to a module
   */
  private async linkPhotoGroupToModule(moduleSlug: string, photoGroupId: string): Promise<void> {
    try {
      // Update the module to reference the photo group
      await this.db.query(`
        UPDATE modules 
        SET photo_groups = COALESCE(photo_groups, '[]'::jsonb) || $1::jsonb,
            updated_at = NOW()
        WHERE slug = $2
      `, [JSON.stringify([photoGroupId]), moduleSlug]);

      console.log(`[ModulePhotoIntegration] Linked photo group ${photoGroupId} to module ${moduleSlug}`);
    } catch (error) {
      console.error('[ModulePhotoIntegration] Error linking photo group to module:', error);
      throw error;
    }
  }

  /**
   * Get modules with their photo attribution data
   */
  async getModuleWithPhotoAttribution(moduleSlug: string): Promise<{
    module: TModuleSpec;
    photoGroups: PhotoGroup[];
    photoAttributions: any[];
  }> {
    try {
      const module = await this.moduleService.getModuleBySlug(moduleSlug);
      if (!module) {
        throw new Error(`Module not found: ${moduleSlug}`);
      }

      // Get photo groups for this module
      const photoGroups = await this.getPhotoGroupsForModule(moduleSlug);
      
      // Get photo attributions
      const photoAttributions = await this.photoAttributionService.getModulePhotoAttributions(moduleSlug);

      return {
        module,
        photoGroups,
        photoAttributions
      };
    } catch (error) {
      console.error('[ModulePhotoIntegration] Error getting module with photo attribution:', error);
      throw error;
    }
  }

  /**
   * Get photo groups associated with a module
   */
  private async getPhotoGroupsForModule(moduleSlug: string): Promise<PhotoGroup[]> {
    try {
      const result = await this.db.query(`
        SELECT pg.*
        FROM photo_groups pg
        JOIN modules m ON pg.id = ANY(
          SELECT jsonb_array_elements_text(m.photo_groups)::uuid
        )
        WHERE m.slug = $1
        ORDER BY pg.created_at DESC
      `, [moduleSlug]);

      return result.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        disciplineId: row.discipline_id,
        createdBy: row.created_by,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      }));
    } catch (error) {
      console.error('[ModulePhotoIntegration] Error getting photo groups for module:', error);
      return [];
    }
  }
}
