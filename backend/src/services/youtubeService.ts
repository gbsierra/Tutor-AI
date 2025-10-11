import { TYouTubeVideoSpec } from '@local/shared';

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channelName: string;
  description: string;
  thumbnail?: string;
}

export class YouTubeService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('YOUTUBE_API_KEY environment variable is required');
    }
  }

  /**
   * Search YouTube for videos using a search query
   */
  async searchYouTube(query: string): Promise<YouTubeSearchResult[]> {
    try {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&` +
        `q=${encodeURIComponent(query)}&` +
        `type=video&` +
        `videoDuration=medium&` +
        `maxResults=5&` +
        `key=${this.apiKey}`;

      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return [];
      }

      return data.items.map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelName: item.snippet.channelTitle,
        description: item.snippet.description?.substring(0, 200) || '',
        thumbnail: item.snippet.thumbnails?.medium?.url
      }));

    } catch (error) {
      console.error('YouTube search error:', error);
      throw new Error(`Failed to search YouTube: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search and attach a video to a lesson using its search query
   */
  async searchAndAttachVideo(lesson: any): Promise<TYouTubeVideoSpec | null> {
    if (!lesson.youtubeSearchQuery) {
      throw new Error('No YouTube search query provided for lesson');
    }

    try {
      const results = await this.searchYouTube(lesson.youtubeSearchQuery);
      
      if (results.length === 0) {
        return null;
      }

      // Pick the first (most relevant) result
      const video = results[0];
      
      return {
        videoId: video.videoId,
        title: video.title,
        channelName: video.channelName,
        description: video.description,
        thumbnail: video.thumbnail
      };

    } catch (error) {
      console.error('Failed to attach YouTube video:', error);
      throw new Error(`Failed to attach YouTube video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get video details for a specific video ID
   */
  async getVideoDetails(videoId: string): Promise<YouTubeSearchResult | null> {
    try {
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?` +
        `part=snippet&` +
        `id=${videoId}&` +
        `key=${this.apiKey}`;

      const response = await fetch(detailsUrl);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return null;
      }

      const item = data.items[0];
      return {
        videoId: item.id,
        title: item.snippet.title,
        channelName: item.snippet.channelTitle,
        description: item.snippet.description?.substring(0, 200) || '',
        thumbnail: item.snippet.thumbnails?.medium?.url
      };

    } catch (error) {
      console.error('YouTube video details error:', error);
      throw new Error(`Failed to get video details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
