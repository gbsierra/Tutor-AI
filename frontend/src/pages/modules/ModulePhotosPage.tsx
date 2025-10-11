import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ModuleService } from "../../services/moduleService";
import type { ModulePhotoAttribution, PhotoAttribution, Photo } from '@shared/auth';
import PhotoViewer from "../../components/PhotoViewer";

export default function ModulePhotosPage() {
  const { moduleSlug } = useParams<{ moduleSlug: string }>();
  const [photoAttributions, setPhotoAttributions] = useState<ModulePhotoAttribution[]>([]);
  const [contributors, setContributors] = useState<PhotoAttribution[]>([]);
  const [totalPhotos, setTotalPhotos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isModulePhoto = (photo: Photo | ModulePhotoAttribution): photo is ModulePhotoAttribution => {
    return 'photoId' in photo;
  };

  useEffect(() => {
    if (!moduleSlug) return;

    const fetchPhotoAttributions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ModuleService.getModulePhotoAttributions(moduleSlug);
        setPhotoAttributions(data.photoAttributions);
        setContributors(data.contributors);
        setTotalPhotos(data.totalPhotos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load photos');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotoAttributions();
  }, [moduleSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-[var(--muted-text)]">Loading photos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-2">Error loading photos</div>
        <p className="text-sm text-[var(--muted-text)]">{error}</p>
      </div>
    );
  }

  if (totalPhotos === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📷</div>
        <h3 className="text-lg font-medium text-[var(--text)] mb-2">No Photos Yet</h3>
        <p className="text-sm text-[var(--muted-text)]">
          This module doesn't have any lecture photos yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-2">
          Lecture Photos
        </h2>
        <p className="text-sm text-[var(--muted-text)]">
          {totalPhotos} photo{totalPhotos !== 1 ? 's' : ''} contributed by {contributors.length} contributor{contributors.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Contributors Summary */}
      {contributors.length > 0 && (
        <div className="bg-[var(--surface)] rounded-lg p-4 border border-[var(--border)]">
          <h3 className="text-sm font-medium text-[var(--text)] mb-3">Contributors</h3>
          <div className="flex flex-wrap gap-2">
            {contributors.map((contributor) => (
              <div
                key={contributor.userId}
                className="flex items-center gap-2 bg-[var(--bg)] rounded-full px-3 py-1 text-xs"
              >
                <span className="text-[var(--text)]">
                  {contributor.displayName || contributor.name}
                </span>
                <span className="text-[var(--muted-text)]">
                  ({contributor.photoCount} photo{contributor.photoCount !== 1 ? 's' : ''})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <PhotoViewer
          photos={photoAttributions}
          renderPhoto={(photo, onClick) => (
            <div
              className="relative group bg-[var(--surface)] rounded-lg overflow-hidden border border-[var(--border)] hover:shadow-lg transition-shadow cursor-pointer"
              onClick={onClick}
            >
              {/* Photo */}
              <div className="aspect-square relative">
                {photo.url ? (
                  <img
                    src={photo.url}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--muted)] flex items-center justify-center">
                    <span className="text-sm text-[var(--muted-text)]">No preview</span>
                  </div>
                )}
                
                {/* Contributor Tag */}
                <div className="absolute top-2 right-2">
                  <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    {isModulePhoto(photo) ? (photo.uploadedByDisplayName || photo.uploadedByName) : 'Unknown'}
                  </div>
                </div>
              </div>

              {/* Photo Info */}
              <div className="p-3">
                <h4 className="text-sm font-medium text-[var(--text)] truncate mb-1">
                  {photo.filename}
                </h4>
                <p className="text-xs text-[var(--muted-text)]">
                  {new Date(photo.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
