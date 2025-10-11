import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PhotoService } from '../../services/photoService';
import { ModuleService } from '../../services/moduleService';
import type { RecentPhoto, RecentModule } from '@shared/types';

interface UnifiedContentCarouselProps {
  className?: string;
}

interface GroupedContent {
  module: RecentModule;
  photos: RecentPhoto[];
  uploadDate: string; // Most recent photo upload date
}

export default function UnifiedContentCarousel({ className = '' }: UnifiedContentCarouselProps) {
  const [groupedContent, setGroupedContent] = useState<GroupedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const { isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      loadUnifiedContent();
    }
  }, [authLoading]);

  // Auto-cycle through items
  useEffect(() => {
    if (groupedContent.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % groupedContent.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [groupedContent.length]);

  const loadUnifiedContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both photos and modules in parallel
      const [photos, modules] = await Promise.all([
        PhotoService.getRecentPhotos(20),
        ModuleService.getRecentModules(20)
      ]);

      // Group photos by module title
      const photosByModule = photos.reduce((acc, photo) => {
        if (!photo.moduleTitle) return acc; // Skip photos without module
        
        if (!acc[photo.moduleTitle]) {
          acc[photo.moduleTitle] = [];
        }
        acc[photo.moduleTitle].push(photo);
        return acc;
      }, {} as Record<string, RecentPhoto[]>);

      // Create grouped content
      const grouped: GroupedContent[] = [];
      
      // Process each module
      modules.forEach(module => {
        const modulePhotos = photosByModule[module.title] || [];
        if (modulePhotos.length > 0) {
          // Sort photos by upload date (most recent first)
          const sortedPhotos = modulePhotos.sort((a, b) => 
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          );
          
          grouped.push({
            module,
            photos: sortedPhotos.slice(0, 4), // Limit to 4 photos per module
            uploadDate: sortedPhotos[0].uploadedAt
          });
        }
      });

      // Sort by most recent upload date
      grouped.sort((a, b) => 
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );

      setGroupedContent(grouped);
    } catch (err) {
      console.error('Failed to load unified content:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleClick = (moduleSlug: string) => {
    navigate(`/modules/${moduleSlug}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Removed getDisciplineColor - using CSS classes instead

  if (loading) {
    return (
      <div className={`py-8 ${className}`}>
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-8 w-8 mx-auto border-2"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }}
          ></div>
          <p 
            className="mt-4 text-sm"
            style={{ color: 'var(--muted-text)' }}
          >
            Loading content...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`py-8 ${className}`}>
        <div className="text-center">
          <div 
            className="rounded-lg p-4 border"
            style={{ 
              backgroundColor: 'var(--surface)', 
              borderColor: 'var(--danger)' 
            }}
          >
            <p 
              className="text-sm"
              style={{ color: 'var(--danger)' }}
            >
              Error loading content: {error}
            </p>
            <button
              onClick={loadUnifiedContent}
              className="mt-2 px-3 py-1 text-xs rounded transition-colors"
              style={{ 
                backgroundColor: 'var(--danger)', 
                color: 'var(--on-primary)' 
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (groupedContent.length === 0) {
    return (
      <div className={`py-8 ${className}`}>
        <div className="text-center">
          <h3 
            className="text-xl font-semibold mb-2"
            style={{ color: 'var(--text)' }}
          >
            Recent Content
          </h3>
          <div 
            className="rounded-lg p-6 border"
            style={{ 
              backgroundColor: 'var(--surface)', 
              borderColor: 'var(--border)' 
            }}
          >
            <p 
              className="text-sm"
              style={{ color: 'var(--muted-text)' }}
            >
              No content available yet. Upload some photos to create modules!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Single Item Carousel */}
      <div className="flex justify-center">
        {groupedContent.length > 0 && (
          <div
            key={currentIndex}
            className="w-full max-w-sm md:max-w-lg lg:max-w-xl xl:max-w-2xl cursor-pointer group animate-fade-in"
            onClick={() => handleModuleClick(groupedContent[currentIndex].module.slug)}
          >
            <div 
              className="p-6 rounded-xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                borderWidth: '1px'
              }}
            >
              {/* Module Header */}
              <div className="mb-4">
                <h3 
                  className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-opacity-80 transition-colors"
                  style={{ color: 'var(--text)' }}
                  title={groupedContent[currentIndex].module.title}
                >
                  {groupedContent[currentIndex].module.title}
                </h3>
                {groupedContent[currentIndex].module.description && (
                  <p 
                    className="text-sm line-clamp-2 mb-3"
                    style={{ color: 'var(--muted-text)' }}
                    title={groupedContent[currentIndex].module.description}
                  >
                    {groupedContent[currentIndex].module.description}
                  </p>
                )}
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {groupedContent[currentIndex].photos.slice(0, 4).map((photo, photoIndex) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square rounded-lg overflow-hidden"
                  >
                    <img
                      src={photo.url}
                      alt={photo.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {photoIndex === 3 && groupedContent[currentIndex].photos.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          +{groupedContent[currentIndex].photos.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Module Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {groupedContent[currentIndex].module.disciplineName && (
                    <span 
                      className="px-3 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'var(--on-primary)'
                      }}
                    >
                      {groupedContent[currentIndex].module.disciplineName}
                    </span>
                  )}
                </div>
                <div 
                  className="text-xs"
                  style={{ color: 'var(--muted-text)' }}
                >
                  {formatDate(groupedContent[currentIndex].uploadDate)}
                </div>
              </div>

              {/* Hover indicator */}
              <div 
                className="mt-4 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--primary)' }}
              >
                View Module →
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dots indicator */}
      {groupedContent.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {groupedContent.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'opacity-100' : 'opacity-30'
              }`}
              style={{ 
                backgroundColor: index === currentIndex ? 'var(--primary)' : 'var(--border)'
              }}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
