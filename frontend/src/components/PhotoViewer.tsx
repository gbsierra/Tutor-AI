import { useState } from 'react';
import type { Photo, ModulePhotoAttribution } from '@shared/auth';

interface PhotoViewerProps {
  photos: (Photo | ModulePhotoAttribution)[];
  renderPhoto: (photo: Photo | ModulePhotoAttribution, onClick: () => void) => React.ReactNode;
}

export default function PhotoViewer({ photos, renderPhoto }: PhotoViewerProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | ModulePhotoAttribution | null>(null);

  const handlePhotoClick = (photo: Photo | ModulePhotoAttribution) => {
    setSelectedPhoto(photo);
  };

  const handleClosePhoto = () => {
    setSelectedPhoto(null);
  };

  const getPhotoKey = (photo: Photo | ModulePhotoAttribution): string => {
    // ModulePhotoAttribution has photoId, regular Photo has id
    return (photo as any).photoId || (photo as any).id;
  };

  const isModulePhoto = (photo: Photo | ModulePhotoAttribution): photo is ModulePhotoAttribution => {
    return 'photoId' in photo;
  };

  return (
    <>
      {/* Photo Grid */}
      {photos.map((photo) => (
        <div key={getPhotoKey(photo)}>
          {renderPhoto(photo, () => handlePhotoClick(photo))}
        </div>
      ))}

      {/* Full-screen Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0, 0, 0, 0.9)" }}
          onClick={handleClosePhoto}
        >
          <div className="relative max-w-full max-h-full">
            {/* Close button */}
            <button
              onClick={handleClosePhoto}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors text-2xl font-bold"
              style={{ zIndex: 51 }}
            >
              ✕
            </button>
            
            {/* Photo */}
            {selectedPhoto.url ? (
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.filename}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="max-w-full max-h-[90vh] flex items-center justify-center bg-gray-800 rounded-lg">
                <span className="text-white text-lg">No image available</span>
              </div>
            )}
            
            {/* Photo info overlay */}
            <div 
              className="absolute bottom-0 left-0 right-0 p-4 rounded-b-lg"
              style={{ 
                background: "linear-gradient(transparent, rgba(0, 0, 0, 0.8))",
                color: "white"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-1">{selectedPhoto.filename}</h3>
              <div className="text-sm opacity-90">
                <p>Size: {selectedPhoto.fileSize ? `${(selectedPhoto.fileSize / 1024).toFixed(1)} KB` : 'Unknown'}</p>
                <p>Uploaded: {new Date(selectedPhoto.uploadedAt).toLocaleDateString()}</p>
                {isModulePhoto(selectedPhoto) && (selectedPhoto.uploadedByDisplayName || selectedPhoto.uploadedByName) && (
                  <p>By: {selectedPhoto.uploadedByDisplayName || selectedPhoto.uploadedByName}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
