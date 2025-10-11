import { useState } from 'react';

interface YouTubeVideoPlayerProps {
  videoId: string;
  title: string;
  startTime?: number;
  endTime?: number;
  thumbnail?: string;
  className?: string;
}

export default function YouTubeVideoPlayer({
  videoId,
  title,
  startTime = 0,
  endTime,
  thumbnail,
  className = ''
}: YouTubeVideoPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Build YouTube embed URL with start/end times
  const buildEmbedUrl = () => {
    let url = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
    
    if (startTime > 0) {
      url += `&start=${startTime}`;
    }
    
    if (endTime && endTime > startTime) {
      url += `&end=${endTime}`;
    }
    
    return url;
  };


  // Validate video ID format
  const isValidVideoId = (id: string) => {
    return /^[a-zA-Z0-9_-]{11}$/.test(id);
  };

  if (!isValidVideoId(videoId)) {
    return (
      <div className={`p-4 rounded-lg border ${className}`} style={{ 
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)'
      }}>
        <div className="text-center text-sm" style={{ color: 'var(--muted-text)' }}>
          Invalid YouTube video ID
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`youtube-video-player ${className}`}
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative'
      }}
    >

      {/* Video Container */}
      <div 
        className="relative w-full"
        style={{ 
          aspectRatio: '16/9',
          backgroundColor: '#000'
        }}
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {thumbnail ? (
                <img 
                  src={thumbnail} 
                  alt={title}
                  className="w-full h-full object-cover opacity-50"
                />
              ) : (
                <div className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--surface)' }}>
                  <svg className="w-8 h-8" style={{ color: 'var(--muted-text)' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              )}
              <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
                Loading video...
              </p>
            </div>
          </div>
        )}
        
        <iframe
          src={buildEmbedUrl()}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          onLoad={() => setIsLoaded(true)}
          style={{ display: isLoaded ? 'block' : 'none' }}
        />
      </div>

      {/* Video Footer */}
      {(startTime > 0 || endTime) && (
        <div className="p-2 text-xs text-center" style={{ color: 'var(--muted-text)' }}>
          {startTime > 0 && `Starts at ${Math.floor(startTime / 60)}:${(startTime % 60).toString().padStart(2, '0')}`}
          {startTime > 0 && endTime && ' • '}
          {endTime && `Ends at ${Math.floor(endTime / 60)}:${(endTime % 60).toString().padStart(2, '0')}`}
        </div>
      )}
    </div>
  );
}
