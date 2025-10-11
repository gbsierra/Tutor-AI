import { useState, useCallback } from 'react';
import { PHOTO_UPLOAD_CONFIG } from '@local/shared';
import { ImageService } from '../services/imageService';
import type { LocalImage } from "@shared/types";

export function usePhotoUpload() {
  const [images, setImages] = useState<LocalImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const validateFileCount = useCallback((files: FileList): boolean => {
    if (files.length > PHOTO_UPLOAD_CONFIG.MAX_PHOTOS) {
      setMsg(`⚠️ Maximum ${PHOTO_UPLOAD_CONFIG.MAX_PHOTOS} photos allowed. Please select fewer photos.`);
      return false;
    }
    return true;
  }, []);

  const validateFileSize = useCallback((file: File): boolean => {
    if (file.size > PHOTO_UPLOAD_CONFIG.MAX_FILE_SIZE) {
      setMsg(`⚠️ ${file.name} is too large. Maximum file size is ${Math.round(PHOTO_UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024)}MB.`);
      return false;
    }
    return true;
  }, []);

  const processFile = useCallback(async (file: File): Promise<LocalImage | null> => {
    // Validate file
    if (!ImageService.validateFile(file)) {
      setMsg(`⚠️ ${file.name} is not a supported image format.`);
      return null;
    }

    if (!validateFileSize(file)) {
      return null;
    }

    // Handle HEIC files with proper MIME type
    let mime = file.type;
    if (file.name.toLowerCase().includes('.heic') && (!mime || mime === "application/octet-stream")) {
      mime = "image/heic";
    } else if (file.name.toLowerCase().includes('.heif') && (!mime || mime === "application/octet-stream")) {
      mime = "image/heif";
    } else if (!mime) {
      mime = "application/octet-stream";
    }

    // Handle HEIC conversion or regular file processing
    const isHeic = file.name.toLowerCase().includes('.heic') || file.name.toLowerCase().includes('.heif');

    let processedBlob: Blob;
    let finalMimeType: string;

    if (isHeic) {
      // Convert HEIC using robust multi-method approach
      try {
        console.log('Converting HEIC file:', file.name);
        setMsg(`Converting ${file.name}...`);

        processedBlob = await convertHeicRobust(file);
        finalMimeType = 'image/jpeg';

        console.log('HEIC conversion successful:', {
          originalName: file.name,
          convertedSize: processedBlob.size
        });

        // Clear the "Converting..." message after successful conversion
        setMsg('');

      } catch (conversionError) {
        console.warn('All HEIC conversion methods failed for', file.name, ':', conversionError);
        setMsg(`⚠️ ${file.name} couldn't be converted. Please convert it to JPEG manually first. Supported: JPEG, PNG, GIF, WebP.`);
        return null;
      }
    } else {
      // Regular image files
      processedBlob = file;
      finalMimeType = mime;
    }

    // Create preview URL from processed blob
    const previewUrl = URL.createObjectURL(processedBlob);

    // Generate base64 for the processed blob
    let base64Data: string;
    try {
      base64Data = await ImageService.blobToBase64(processedBlob);
    } catch (error) {
      console.warn('Failed to create base64 for', file.name, ':', error);
      base64Data = '';
    }

    return {
      file,
      convertedFile: processedBlob,
      mimeType: finalMimeType,
      previewUrl,
      base64: base64Data
    };
  }, [validateFileSize]);

  const onPickFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    
    if (!validateFileCount(files)) {
      return;
    }

    // Process all files in parallel for better performance
    const processingPromises = Array.from(files).map(processFile);
    const results = await Promise.all(processingPromises);
    const picked = results.filter((img): img is LocalImage => img !== null);
    
    setImages((prev) => [...prev, ...picked]);
  }, [validateFileCount, processFile]);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      const removedImage = newImages[index];
      if (removedImage) {
        URL.revokeObjectURL(removedImage.previewUrl);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  }, []);

  const clearImages = useCallback(() => {
    images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setMsg(null);
  }, [images]);

  const setImagesDirect = useCallback((newImages: LocalImage[] | ((prev: LocalImage[]) => LocalImage[])) => {
    if (typeof newImages === 'function') {
      setImages(newImages);
    } else {
      setImages(newImages);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    onPickFiles(files);
  }, [onPickFiles]);

  return {
    images,
    isDragOver,
    msg,
    setMsg,
    onPickFiles,
    removeImage,
    clearImages,
    setImages: setImagesDirect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    maxPhotos: PHOTO_UPLOAD_CONFIG.MAX_PHOTOS,
    acceptedTypes: PHOTO_UPLOAD_CONFIG.ACCEPTED_TYPES
  };
}

// HEIC conversion function (moved from CreateModule.tsx)
async function convertHeicRobust(file: File): Promise<Blob> {
  const isHeic = file.name.toLowerCase().includes('.heic') ||
                 file.name.toLowerCase().includes('.heif');

  if (!isHeic) {
    // Not a HEIC file, return as-is
    return file;
  }

  console.log('Converting HEIC file via Cloudinary:', file.name);

  try {
    const converted = await ImageService.convertHeicViaCloudinary(file);
    console.log('Cloudinary conversion successful');
    return converted;
  } catch (error) {
    console.warn('Cloudinary conversion failed:', error);
    throw new Error('Unable to convert HEIC file. Please try converting it to JPEG manually first.');
  }
}
