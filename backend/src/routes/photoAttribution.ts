import { Router } from 'express';
import { DatabaseService } from '../services/database.js';
import { PhotoAttributionService } from '../services/photoAttributionService.js';
import { AuthUserSchema } from '../../../shared/auth.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();
const db = new DatabaseService();
const photoAttributionService = new PhotoAttributionService(db);

/**
 * GET /api/users/me/contributions
 * Get current user's contributions
 */
router.get('/users/me/contributions', authenticateUser, async (req, res) => {
  try {
    const contributions = await photoAttributionService.getUserContributions(req.user!.id);
    res.json({ contributions });
  } catch (error) {
    console.error('Error getting user contributions:', error);
    res.status(500).json({ error: 'Failed to get user contributions' });
  }
});

/**
 * GET /api/users/me/modules
 * Get modules contributed to by current user
 */
router.get('/users/me/modules', authenticateUser, async (req, res) => {
  try {
    const modules = await photoAttributionService.getUserModules(req.user!.id);
    res.json({ modules });
  } catch (error) {
    console.error('Error getting user modules:', error);
    res.status(500).json({ error: 'Failed to get user modules' });
  }
});

/**
 * GET /api/users/me/photos
 * Get photos uploaded by current user
 */
router.get('/users/me/photos', authenticateUser, async (req, res) => {
  try {
    const photos = await photoAttributionService.getUserPhotos(req.user!.id);
    res.json({ photos });
  } catch (error) {
    console.error('Error getting user photos:', error);
    res.status(500).json({ error: 'Failed to get user photos' });
  }
});

/**
 * PUT /api/users/me
 * Update current user's profile for attribution
 */
router.put('/users/me', authenticateUser, async (req, res) => {
  try {
    const { displayName } = req.body;

    await photoAttributionService.updateUserProfile(req.user!.id, displayName);
    
    // Get updated user data
    const updatedUser = await db.query('SELECT * FROM users WHERE id = $1', [req.user!.id]);
    const authUser = AuthUserSchema.parse({
      id: updatedUser[0].id,
      googleId: updatedUser[0].google_id,
      email: updatedUser[0].email,
      name: updatedUser[0].name,
      avatarUrl: updatedUser[0].avatar_url,
      displayName: updatedUser[0].display_name,
      createdAt: new Date(updatedUser[0].created_at),
      updatedAt: new Date(updatedUser[0].updated_at)
    });

    res.json({ user: authUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

/**
 * GET /api/modules/:slug/contributors
 * Get contributors for a module
 */
router.get('/modules/:slug/contributors', async (req, res) => {
  try {
    const { slug } = req.params;
    const attributions = await photoAttributionService.getModulePhotoAttributions(slug);
    res.json({ attributions });
  } catch (error) {
    console.error('Error getting module contributors:', error);
    res.status(500).json({ error: 'Failed to get module contributors' });
  }
});

/**
 * GET /api/modules/:slug/photo-attributions
 * Get photo attributions for a module (alias for contributors)
 */
router.get('/modules/:slug/photo-attributions', async (req, res) => {
  try {
    const { slug } = req.params;
    const attributions = await photoAttributionService.getModulePhotoAttributions(slug);
    res.json({ attributions });
  } catch (error) {
    console.error('Error getting module photo attributions:', error);
    res.status(500).json({ error: 'Failed to get module photo attributions' });
  }
});

/**
 * GET /api/modules/:slug/photo-attributions-detailed
 * Get detailed photo attributions for a module (for the module photo page)
 */
router.get('/modules/:slug/photo-attributions-detailed', async (req, res) => {
  try {
    const { slug } = req.params;
    const photoAttributions = await photoAttributionService.getModulePhotoAttributionsDetailed(slug);
    const contributors = await photoAttributionService.getModulePhotoAttributions(slug);
    
    res.json({ 
      photoAttributions,
      contributors,
      totalPhotos: photoAttributions.length
    });
  } catch (error) {
    console.error('Error getting detailed module photo attributions:', error);
    res.status(500).json({ error: 'Failed to get detailed module photo attributions' });
  }
});

/**
 * GET /api/photos/recent
 * Get recent photos for landing page carousel (public endpoint)
 */
router.get('/photos/recent', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 12, 20);
    
    console.log(`[GET /photos/recent] Fetching ${limit} recent photos`);
    
    // Get recent photos with module and discipline info
    const photos = await db.query(`
      SELECT 
        p.id,
        p.url,
        p.filename,
        p.uploaded_at,
        pg.title as "moduleTitle",
        pg.discipline_id as "discipline",
        d.name as "disciplineName",
        u.name as "uploadedBy"
      FROM photos p
      LEFT JOIN photo_groups pg ON p.photo_group_id = pg.id
      LEFT JOIN disciplines d ON pg.discipline_id = d.id
      LEFT JOIN users u ON p.uploaded_by = u.id
      WHERE p.url IS NOT NULL AND p.url != ''
      ORDER BY p.uploaded_at DESC
      LIMIT $1
    `, [limit]);
    
    console.log(`[GET /photos/recent] Found ${photos.length} recent photos`);
    
    res.json({ 
      photos: photos.map(photo => ({
        id: photo.id,
        url: photo.url,
        filename: photo.filename,
        moduleTitle: photo.moduleTitle,
        discipline: photo.discipline,
        disciplineName: photo.disciplineName,
        uploadedBy: photo.uploadedBy,
        uploadedAt: photo.uploaded_at
      }))
    });
  } catch (error) {
    console.error('[GET /photos/recent] Error:', error);
    res.status(500).json({ error: 'Failed to fetch recent photos' });
  }
});

/**
 * POST /api/photos/upload
 * Upload photos with user attribution
 */
router.post('/photos/upload', authenticateUser, async (req, res) => {
  try {
    const { 
      photoGroupId, 
      photos, 
      title, 
      description, 
      disciplineId 
    } = req.body;

    let groupId = photoGroupId;

    // Create photo group if not provided
    if (!groupId) {
      if (!title) {
        return res.status(400).json({ error: 'Photo group title is required' });
      }
      
      const photoGroup = await photoAttributionService.createPhotoGroup(
        title,
        description,
        disciplineId,
        req.user!.id
      );
      groupId = photoGroup.id;

      // Record contribution
      await photoAttributionService.recordUserContribution(
        req.user!.id,
        'photo',
        groupId,
        { type: 'photo_group_creation', title, description }
      );
    }

    // Add photos to group
    const uploadedPhotos = await photoAttributionService.addPhotosToGroup(
      groupId,
      photos,
      req.user!.id
    );

    // Record photo contributions
    for (const photo of uploadedPhotos) {
      await photoAttributionService.recordUserContribution(
        req.user!.id,
        'photo',
        photo.id,
        { type: 'photo_upload', filename: photo.filename }
      );
    }

    res.json({ 
      success: true, 
      photoGroupId: groupId, 
      photos: uploadedPhotos 
    });
  } catch (error) {
    console.error('Error uploading photos:', error);
    res.status(500).json({ error: 'Failed to upload photos' });
  }
});

export default router;
