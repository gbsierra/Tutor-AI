import { Router } from 'express';
import { YouTubeService } from '../services/youtubeService.js';
import { ModuleService } from '../services/moduleService.js';
import { db } from '../services/database.js';

const router = Router();
const youtubeService = new YouTubeService();
const moduleService = new ModuleService(db);

/**
 * POST /api/youtube/attach-video/:moduleSlug/:lessonSlug
 * Attach a YouTube video to a lesson using its search query
 */
router.post('/attach-video/:moduleSlug/:lessonSlug', async (req, res) => {
  try {
    const { moduleSlug, lessonSlug } = req.params;
    
    // Get the module from database
    const module = await moduleService.getModuleBySlug(moduleSlug);
    if (!module) {
      return res.status(404).json({ 
        error: 'Module not found',
        details: `Module with slug ${moduleSlug} does not exist`
      });
    }

    // Find the lesson in the module
    const lesson = module.lessons?.find(l => l.slug === lessonSlug);
    if (!lesson) {
      return res.status(404).json({ 
        error: 'Lesson not found',
        details: `Lesson with slug ${lessonSlug} not found in module ${moduleSlug}`
      });
    }

    // Check if lesson already has a video
    if (lesson.youtubeVideo) {
      return res.json(lesson.youtubeVideo);
    }

    // Search and attach video using the lesson's search query
    const video = await youtubeService.searchAndAttachVideo(lesson);
    
    if (!video) {
      return res.status(404).json({ 
        error: 'No YouTube videos found',
        details: `No videos found for search query: "${lesson.youtubeSearchQuery}"`
      });
    }

    // Update the lesson with the video data using targeted update
    await moduleService.updateLessonVideo(moduleSlug, lessonSlug, video);

    res.json(video);

  } catch (error) {
    console.error('YouTube video attachment error:', error);
    res.status(500).json({ 
      error: 'Failed to attach YouTube video',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/youtube/search
 * Search YouTube for videos using a custom query
 */
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request',
        details: 'Query parameter is required and must be a string'
      });
    }

    const results = await youtubeService.searchYouTube(query);
    res.json({ results });

  } catch (error) {
    console.error('YouTube search error:', error);
    res.status(500).json({ 
      error: 'Failed to search YouTube',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/youtube/video/:videoId
 * Get details for a specific YouTube video
 */
router.get('/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    if (!videoId || typeof videoId !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request',
        details: 'Video ID parameter is required and must be a string'
      });
    }

    const video = await youtubeService.getVideoDetails(videoId);
    
    if (!video) {
      return res.status(404).json({ 
        error: 'Video not found',
        details: `Video with ID ${videoId} does not exist or is not accessible`
      });
    }

    res.json(video);

  } catch (error) {
    console.error('YouTube video details error:', error);
    res.status(500).json({ 
      error: 'Failed to get video details',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
