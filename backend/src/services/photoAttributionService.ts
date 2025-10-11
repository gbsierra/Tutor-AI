import { DatabaseService } from './database.js';
import { 
  PhotoGroup, 
  Photo, 
  UserContribution, 
  PhotoAttribution,
  ModulePhotoAttribution,
  PhotoGroupSchema,
  PhotoSchema,
  UserContributionSchema,
  PhotoAttributionSchema,
  ModulePhotoAttributionSchema
} from '../../../shared/auth.js';

export class PhotoAttributionService {
  constructor(private db: DatabaseService) {}

  /**
   * Create a new photo group
   */
  async createPhotoGroup(
    title: string,
    description: string | undefined,
    disciplineId: string | undefined,
    createdBy: string
  ): Promise<PhotoGroup> {
    try {
      const result = await this.db.query(`
        INSERT INTO photo_groups (title, description, discipline_id, created_by)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [title, description, disciplineId, createdBy]);

      return PhotoGroupSchema.parse({
        id: result[0].id,
        title: result[0].title,
        description: result[0].description,
        disciplineId: result[0].discipline_id,
        createdBy: result[0].created_by,
        createdAt: new Date(result[0].created_at),
        updatedAt: new Date(result[0].updated_at)
      });
    } catch (error) {
      console.error('Error creating photo group:', error);
      throw new Error('Failed to create photo group');
    }
  }

  /**
   * Add photos to a photo group
   */
  async addPhotosToGroup(
    photoGroupId: string,
    photos: Array<{
      filename: string;
      fileSize?: number;
      mimeType?: string;
      url?: string;
    }>,
    uploadedBy: string
  ): Promise<Photo[]> {
    try {
      const photoPromises = photos.map(async (photo) => {
        const result = await this.db.query(`
          INSERT INTO photos (photo_group_id, uploaded_by, filename, file_size, mime_type, url)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [
          photoGroupId,
          uploadedBy,
          photo.filename,
          photo.fileSize,
          photo.mimeType,
          photo.url
        ]);

        return PhotoSchema.parse({
          id: result[0].id,
          photoGroupId: result[0].photo_group_id,
          uploadedBy: result[0].uploaded_by,
          filename: result[0].filename,
          fileSize: result[0].file_size,
          mimeType: result[0].mime_type,
          url: result[0].url || null,
          uploadedAt: new Date(result[0].uploaded_at)
        });
      });

      return await Promise.all(photoPromises);
    } catch (error) {
      console.error('Error adding photos to group:', error);
      throw new Error('Failed to add photos to group');
    }
  }

  /**
   * Record a user contribution
   */
  async recordUserContribution(
    userId: string,
    contributionType: 'photo' | 'module' | 'edit',
    contributionId: string,
    contributionData?: Record<string, any>
  ): Promise<UserContribution> {
    try {
      const result = await this.db.query(`
        INSERT INTO user_contributions (user_id, contribution_type, contribution_id, contribution_data)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [userId, contributionType, contributionId, contributionData]);

      return UserContributionSchema.parse({
        id: result[0].id,
        userId: result[0].user_id,
        contributionType: result[0].contribution_type,
        contributionId: result[0].contribution_id,
        contributionData: result[0].contribution_data,
        createdAt: new Date(result[0].created_at)
      });
    } catch (error) {
      console.error('Error recording user contribution:', error);
      throw new Error('Failed to record user contribution');
    }
  }

  /**
   * Get user's contributions
   */
  async getUserContributions(userId: string): Promise<UserContribution[]> {
    try {
      const result = await this.db.query(`
        SELECT * FROM user_contributions 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `, [userId]);

      return result.map(row => UserContributionSchema.parse({
        id: row.id,
        userId: row.user_id,
        contributionType: row.contribution_type,
        contributionId: row.contribution_id,
        contributionData: row.contribution_data,
        createdAt: new Date(row.created_at)
      }));
    } catch (error) {
      console.error('Error getting user contributions:', error);
      throw new Error('Failed to get user contributions');
    }
  }

  /**
   * Get photo attributions for a module
   */
  async getModulePhotoAttributions(moduleSlug: string): Promise<PhotoAttribution[]> {
    try {
      console.log(`[PhotoAttributionService] Getting photo attributions for module: ${moduleSlug}`);
      
      // First, check if the module exists and has photo_groups
      const moduleCheck = await this.db.query(`
        SELECT slug, photo_groups FROM modules WHERE slug = $1
      `, [moduleSlug]);
      
      if (moduleCheck.length === 0) {
        console.log(`[PhotoAttributionService] Module not found: ${moduleSlug}`);
        return [];
      }
      
      const module = moduleCheck[0];
      
      // If no photo groups, return empty array
      if (!module.photo_groups || module.photo_groups.length === 0) {
        console.log(`[PhotoAttributionService] No photo groups for module: ${moduleSlug}`);
        return [];
      }
      
      const result = await this.db.query(`
        SELECT 
          u.id as user_id,
          u.name,
          COUNT(p.id) as photo_count
        FROM photos p
        JOIN photo_groups pg ON p.photo_group_id = pg.id
        JOIN users u ON p.uploaded_by = u.id
        WHERE pg.id = ANY($1::uuid[])
        GROUP BY u.id, u.name
        ORDER BY photo_count DESC
      `, [module.photo_groups]);

      console.log(`[PhotoAttributionService] Found ${result.length} contributors for module: ${moduleSlug}`);

      return result.map(row => PhotoAttributionSchema.parse({
        userId: row.user_id,
        displayName: row.name,
        name: row.name,
        photoCount: parseInt(row.photo_count)
      }));
    } catch (error) {
      console.error('Error getting module photo attributions:', error);
      throw new Error(`Failed to get module photo attributions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get detailed photo attributions for a module (for the module photo page)
   */
  async getModulePhotoAttributionsDetailed(moduleSlug: string): Promise<ModulePhotoAttribution[]> {
    try {
      console.log(`[PhotoAttributionService] Getting detailed photo attributions for module: ${moduleSlug}`);
      
      // First, check if the module exists and has photo_groups
      const moduleCheck = await this.db.query(`
        SELECT slug, photo_groups FROM modules WHERE slug = $1
      `, [moduleSlug]);
      
      if (moduleCheck.length === 0) {
        console.log(`[PhotoAttributionService] Module not found: ${moduleSlug}`);
        return [];
      }
      
      const module = moduleCheck[0];
      console.log(`[PhotoAttributionService] Module found, photo_groups:`, module.photo_groups);
      
      // If no photo groups, return empty array
      if (!module.photo_groups || module.photo_groups.length === 0) {
        console.log(`[PhotoAttributionService] No photo groups for module: ${moduleSlug}`);
        return [];
      }
      
      const result = await this.db.query(`
        SELECT 
          p.id as photo_id,
          p.filename,
          p.url,
          p.file_size,
          p.mime_type,
          p.uploaded_by,
          p.uploaded_at,
          p.photo_group_id,
          pg.title as photo_group_title,
          u.name as uploaded_by_name,
          u.name as uploaded_by_display_name
        FROM photos p
        JOIN photo_groups pg ON p.photo_group_id = pg.id
        JOIN users u ON p.uploaded_by = u.id
        WHERE pg.id = ANY($1::uuid[])
        ORDER BY p.uploaded_at DESC
      `, [module.photo_groups]);

      console.log(`[PhotoAttributionService] Found ${result.length} photos for module: ${moduleSlug}`);

      return result.map(row => ModulePhotoAttributionSchema.parse({
        id: row.photo_id, // Base PhotoSchema field
        photoId: row.photo_id, // ModulePhotoAttribution specific field
        filename: row.filename,
        url: row.url,
        uploadedBy: row.uploaded_by,
        uploadedAt: new Date(row.uploaded_at),
        photoGroupId: row.photo_group_id,
        fileSize: row.file_size,
        mimeType: row.mime_type,
        uploadedByName: row.uploaded_by_name,
        uploadedByDisplayName: row.uploaded_by_display_name,
        photoGroupTitle: row.photo_group_title
      }));
    } catch (error) {
      console.error('Error getting detailed module photo attributions:', error);
      console.error('Error details:', error);
      throw new Error(`Failed to get detailed module photo attributions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get photos uploaded by a user
   */
  async getUserPhotos(userId: string): Promise<Photo[]> {
    try {
      const result = await this.db.query(`
        SELECT * FROM photos 
        WHERE uploaded_by = $1 
        ORDER BY uploaded_at DESC
      `, [userId]);

      return result.map(row => PhotoSchema.parse({
        id: row.id,
        photoGroupId: row.photo_group_id,
        uploadedBy: row.uploaded_by,
        filename: row.filename,
        fileSize: row.file_size,
        mimeType: row.mime_type,
        url: row.url || null,
        uploadedAt: new Date(row.uploaded_at)
      }));
    } catch (error) {
      console.error('Error getting user photos:', error);
      throw new Error('Failed to get user photos');
    }
  }

  /**
   * Get modules contributed to by a user
   */
  async getUserModules(userId: string): Promise<any[]> {
    try {
      const result = await this.db.query(`
        SELECT DISTINCT m.id, m.slug, m.title, m.description, m.discipline, m.updated_at
        FROM modules m
        WHERE m.created_by = $1 OR m.last_updated_by = $1
        ORDER BY m.updated_at DESC
      `, [userId]);

      return result;
    } catch (error) {
      console.error('Error getting user modules:', error);
      throw new Error('Failed to get user modules');
    }
  }

  /**
   * Update user profile for attribution
   */
  async updateUserProfile(
    userId: string,
    displayName?: string
  ): Promise<void> {
    try {
      if (displayName === undefined) {
        return; // No updates to make
      }

      await this.db.query(`
        UPDATE users 
        SET display_name = $1, updated_at = NOW()
        WHERE id = $2
      `, [displayName, userId]);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }
}
