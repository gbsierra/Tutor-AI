import { useState } from 'react';
import type { TYouTubeVideoSpec } from '@local/shared';
import YouTubeVideoPlayer from './YouTubeVideoPlayer';

interface LessonSummaryProps {
  summary: string;
  youtubeVideo?: TYouTubeVideoSpec;
  youtubeSearchQuery?: string;
  lessonSlug?: string;
  moduleSlug?: string;
}

export default function LessonSummary({ 
  summary, 
  youtubeVideo,
  youtubeSearchQuery,
  lessonSlug,
  moduleSlug
}: LessonSummaryProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<TYouTubeVideoSpec | undefined>(youtubeVideo);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const handleSelectVideo = async () => {
    if (currentVideo) {
      setShowVideo(!showVideo);
      return;
    }

    if (!lessonSlug || !moduleSlug) {
      setVideoError('Missing lesson or module information');
      return;
    }

    if (!youtubeSearchQuery || youtubeSearchQuery.trim() === '') {
      setVideoError('No search query available for this lesson');
      return;
    }

    setVideoLoading(true);
    setVideoError(null);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const fullUrl = `${apiBaseUrl}/api/youtube/attach-video/${moduleSlug}/${lessonSlug}`;
      
      console.log('🔍 [YouTube] API Base URL:', apiBaseUrl);
      console.log('🔍 [YouTube] Full URL:', fullUrl);
      console.log('🔍 [YouTube] Module Slug:', moduleSlug);
      console.log('🔍 [YouTube] Lesson Slug:', lessonSlug);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('🔍 [YouTube] Response status:', response.status);
      console.log('🔍 [YouTube] Response ok:', response.ok);
      
      if (!response.ok) {
        console.error('🔍 [YouTube] Error response status:', response.status);
        console.error('🔍 [YouTube] Error response statusText:', response.statusText);
        
        let errorData;
        try {
          errorData = await response.json();
          console.error('🔍 [YouTube] Error response body:', errorData);
        } catch (jsonError) {
          console.error('🔍 [YouTube] Failed to parse error response as JSON:', jsonError);
          const responseText = await response.text();
          console.error('🔍 [YouTube] Raw error response:', responseText);
          throw new Error(`HTTP ${response.status}: ${responseText}`);
        }
        
        throw new Error(errorData.details || errorData.error || 'Failed to load video');
      }

      const video = await response.json();
      console.log('🔍 [YouTube] Success! Video data:', video);
      setCurrentVideo(video);
      setShowVideo(true);
    } catch (error) {
      console.error('🔍 [YouTube] Failed to load YouTube video:', error);
      setVideoError(error instanceof Error ? error.message : 'Failed to load video');
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div className="mb-3 sm:mb-4 space-y-3 sm:space-y-4">
      {/* Key Takeaways */}
      <div className="p-2 sm:p-3 rounded-lg border-l-4" style={{ 
        backgroundColor: 'var(--bg)',
        borderLeftColor: 'var(--ok)',
        borderColor: 'var(--border)'
      }}>
        <div className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--ok)' }}></div>
          <div>
            <h3 className="text-xs sm:text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Key Takeaways</h3>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
              {summary}
            </p>
          </div>
        </div>
      </div>

      {/* Still Struggling Section - Only show if we have a valid search query OR existing video */}
      {(() => {
        // Only show if we have a valid search query OR an existing video
        const hasValidQuery = youtubeSearchQuery && youtubeSearchQuery.trim() !== '';
        const hasVideo = !!currentVideo;
        
        return hasValidQuery || hasVideo;
      })() && (
        <div className="space-y-3">
          {/* Still Struggling Text */}
          <button
            onClick={handleSelectVideo}
            disabled={videoLoading}
            className="text-sm hover:opacity-80 transition-opacity duration-200 disabled:opacity-50"
            style={{ color: 'var(--primary)' }}
          >
            {videoLoading ? 'Loading video...' : 'Still struggling? Watch a video explanation'}
          </button>

          {/* Error Message */}
          {videoError && (
            <div className="text-sm text-red-500">
              {videoError}
            </div>
          )}

          {/* YouTube Video */}
          {showVideo && currentVideo && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <YouTubeVideoPlayer
                videoId={currentVideo.videoId}
                title={currentVideo.title}
                startTime={currentVideo.startTime}
                endTime={currentVideo.endTime}
                thumbnail={currentVideo.thumbnail}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}